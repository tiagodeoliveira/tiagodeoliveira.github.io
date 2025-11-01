#!/usr/bin/env python3
"""
Resume PDF Generator - Clean rebuild
Starting with header only
"""

import re
import requests
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.colors import HexColor
import argparse
import sys


class MarkdownParser:
    """Parse markdown resume into structured data"""

    def __init__(self, markdown_text):
        self.markdown = markdown_text
        self.lines = markdown_text.split('\n')

        # Header data
        self.name = ''
        self.title = ''
        self.contact_line = ''

        # Body sections (we'll add this later)
        self.sections = []

    def parse(self):
        """Parse the markdown"""
        self._parse_header()
        self._parse_body()
        return self

    def _parse_header(self):
        """Parse header section (everything before first ---)"""
        in_header = True

        for line in self.lines:
            line = line.strip()

            # Header ends at first ---
            if line == '---':
                in_header = False
                break

            if not in_header or not line:
                continue

            # H1 = Name
            if line.startswith('# '):
                self.name = line[2:].strip()
                continue

            # Bold line after name = Title/tagline
            if self.name and not self.title and line.startswith('**') and line.endswith('**'):
                self.title = line[2:-2].strip()
                continue

            # Line with links/pipes = Contact info
            if self.name and ('|' in line or 'mailto:' in line or 'linkedin' in line.lower()):
                self.contact_line = line
                continue

    def _parse_body(self):
        """Parse body sections (after first ---)"""
        in_body = False
        current_section = None
        current_job = None
        current_subsection = None

        i = 0
        while i < len(self.lines):
            line = self.lines[i].strip()

            # Skip until we hit the first ---
            if not in_body:
                if line == '---':
                    in_body = True
                i += 1
                continue

            # Section separators (---) - just skip them
            if line == '---':
                i += 1
                continue

            # H2 = Section header
            if line.startswith('## '):
                # Save previous subsection if exists
                if current_subsection and current_section:
                    current_section['subsections'].append(current_subsection)
                    current_subsection = None

                # Save previous job if exists
                if current_job and current_section:
                    current_section['jobs'].append(current_job)
                    current_job = None

                # Save previous section if exists
                if current_section:
                    self.sections.append(current_section)

                # Start new section
                section_title = line[3:].strip()

                # Determine section type
                if section_title == 'Experience':
                    section_type = 'experience'
                elif section_title == 'What I Build':
                    section_type = 'subsections'
                else:
                    section_type = 'prose'

                current_section = {
                    'title': section_title,
                    'type': section_type,
                    'paragraphs': [],
                    'jobs': [],
                    'subsections': []
                }
                i += 1
                continue

            # Empty lines - skip
            if not line:
                i += 1
                continue

            # H3 handling - depends on section type
            if line.startswith('### ') and current_section:
                # In Experience section = Job title
                if current_section['type'] == 'experience':
                    # Save previous job if exists
                    if current_job:
                        current_section['jobs'].append(current_job)

                    # Parse job title
                    job_title_line = line[4:].strip()
                    if '|' in job_title_line:
                        parts = job_title_line.split('|', 1)
                        job_title = parts[0].strip()
                        job_subtitle = parts[1].strip()
                    else:
                        job_title = job_title_line
                        job_subtitle = ''

                    current_job = {
                        'title': job_title,
                        'subtitle': job_subtitle,
                        'company': '',
                        'dates': '',
                        'description': '',
                        'bullets': []
                    }
                    i += 1
                    continue

                # In subsections section = Subsection header
                elif current_section['type'] == 'subsections':
                    # Save previous subsection if exists
                    if current_subsection:
                        current_section['subsections'].append(current_subsection)

                    # Start new subsection
                    current_subsection = {
                        'title': line[4:].strip(),
                        'paragraphs': []
                    }
                    i += 1
                    continue

            # If we're in a job, parse job details
            if current_job:
                # Company name (bold line)
                if line.startswith('**') and line.endswith('**') and not current_job['company']:
                    current_job['company'] = line[2:-2].strip()
                    i += 1
                    continue

                # Dates (italic line)
                if line.startswith('*') and line.endswith('*') and not current_job['dates']:
                    current_job['dates'] = line[1:-1].strip()
                    i += 1
                    continue

                # Description (bold line after dates)
                if line.startswith('**') and line.endswith('**') and current_job['dates'] and not current_job['description']:
                    current_job['description'] = line[2:-2].strip()
                    i += 1
                    continue

                # Bullet points
                if line.startswith('→'):
                    current_job['bullets'].append(line[1:].strip())
                    i += 1
                    continue

            # Collect paragraphs based on context
            if current_section:
                # If in a subsection, add to subsection paragraphs
                if current_subsection:
                    current_subsection['paragraphs'].append(line)
                # If in prose section, add to section paragraphs
                elif current_section['type'] == 'prose':
                    current_section['paragraphs'].append(line)

            i += 1

        # Don't forget the last items
        if current_subsection and current_section:
            current_section['subsections'].append(current_subsection)
        if current_job and current_section:
            current_section['jobs'].append(current_job)
        if current_section:
            self.sections.append(current_section)


class PDFGenerator:
    """Generate PDF from parsed markdown"""

    def __init__(self, parser):
        self.parser = parser
        self.styles = self._create_styles()

    def _create_styles(self):
        """Create paragraph styles"""
        styles = {}

        # Name - big and bold
        styles['Name'] = ParagraphStyle(
            'Name',
            fontName='Helvetica-Bold',
            fontSize=16,
            alignment=TA_CENTER,
            textColor=HexColor('#000000'),
            spaceBefore=0,
            spaceAfter=0,
            leading=18  # Line height
        )

        # Title/tagline - smaller, centered
        styles['Title'] = ParagraphStyle(
            'Title',
            fontName='Helvetica',
            fontSize=11,
            alignment=TA_CENTER,
            textColor=HexColor('#333333'),
            spaceBefore=6,
            spaceAfter=6,
            leading=13
        )

        # Contact line - small, centered
        styles['Contact'] = ParagraphStyle(
            'Contact',
            fontName='Helvetica',
            fontSize=9,
            alignment=TA_CENTER,
            textColor=HexColor('#555555'),
            spaceBefore=0,
            spaceAfter=16,
            leading=11
        )

        # Section headers (H2)
        styles['SectionHeader'] = ParagraphStyle(
            'SectionHeader',
            fontName='Helvetica-Bold',
            fontSize=12,
            alignment=TA_LEFT,
            textColor=HexColor('#000000'),
            spaceBefore=8,
            spaceAfter=8,
            leading=14
        )

        # Subsection headers (H3 in non-Experience sections)
        styles['SubsectionHeader'] = ParagraphStyle(
            'SubsectionHeader',
            fontName='Helvetica-Bold',
            fontSize=10,
            alignment=TA_LEFT,
            textColor=HexColor('#000000'),
            spaceBefore=6,
            spaceAfter=4,
            leading=12
        )

        # Body text / paragraphs - SMALLER FONT, TIGHTER SPACING
        styles['Body'] = ParagraphStyle(
            'Body',
            fontName='Helvetica',
            fontSize=9,
            alignment=TA_LEFT,
            textColor=HexColor('#333333'),
            spaceBefore=0,
            spaceAfter=4,
            leading=12
        )

        # Job title
        styles['JobTitle'] = ParagraphStyle(
            'JobTitle',
            fontName='Helvetica-Bold',
            fontSize=11,
            alignment=TA_LEFT,
            textColor=HexColor('#000000'),
            spaceBefore=8,
            spaceAfter=2,
            leading=13
        )

        # Company name
        styles['Company'] = ParagraphStyle(
            'Company',
            fontName='Helvetica-Bold',
            fontSize=10,
            alignment=TA_LEFT,
            textColor=HexColor('#333333'),
            spaceBefore=0,
            spaceAfter=1,
            leading=12
        )

        # Dates
        styles['Dates'] = ParagraphStyle(
            'Dates',
            fontName='Helvetica-Oblique',
            fontSize=9,
            alignment=TA_LEFT,
            textColor=HexColor('#666666'),
            spaceBefore=0,
            spaceAfter=4,
            leading=11
        )

        # Job description (bold summary) - SMALLER FONT
        styles['JobDescription'] = ParagraphStyle(
            'JobDescription',
            fontName='Helvetica-Bold',
            fontSize=9,
            alignment=TA_LEFT,
            textColor=HexColor('#000000'),
            spaceBefore=0,
            spaceAfter=4,
            leading=11
        )

        # Bullet points - SMALLER FONT
        styles['Bullet'] = ParagraphStyle(
            'Bullet',
            fontName='Helvetica',
            fontSize=9,
            alignment=TA_LEFT,
            textColor=HexColor('#333333'),
            spaceBefore=0,
            spaceAfter=3,
            leading=12,
            leftIndent=10,
            firstLineIndent=0
        )

        return styles

    def _format_contact_line(self, line):
        """Convert markdown links to HTML for contact line"""
        # Convert [text](url) to clickable links
        # Pattern: [Text](URL)
        line = re.sub(
            r'\[([^\]]+)\]\(([^\)]+)\)',
            r'<a href="\2" color="blue">\1</a>',
            line
        )

        # Handle plain URLs if any
        return line

    def _format_text(self, text):
        """Convert markdown formatting to HTML"""
        # Escape special HTML characters first
        text = text.replace('&', '&amp;')
        text = text.replace('<', '&lt;')
        text = text.replace('>', '&gt;')

        # Convert **bold** to <b>bold</b>
        text = re.sub(r'\*\*([^\*]+)\*\*', r'<b>\1</b>', text)

        return text

    def generate_pdf(self, filename='resume.pdf'):
        """Generate PDF"""

        # Create document
        doc = SimpleDocTemplate(
            filename,
            pagesize=letter,
            rightMargin=0.75*inch,
            leftMargin=0.75*inch,
            topMargin=0.6*inch,
            bottomMargin=0.6*inch,
            title="Resume",
            author=self.parser.name
        )

        story = []

        # Add name
        if self.parser.name:
            story.append(Paragraph(self.parser.name, self.styles['Name']))

        # Add title
        if self.parser.title:
            story.append(Paragraph(self.parser.title, self.styles['Title']))

        # Add contact line
        if self.parser.contact_line:
            contact_html = self._format_contact_line(self.parser.contact_line)
            story.append(Paragraph(contact_html, self.styles['Contact']))

        # Add all sections
        for section in self.parser.sections:
            # Section header
            story.append(Paragraph(section['title'], self.styles['SectionHeader']))

            # Render based on section type
            if section['type'] == 'prose':
                # Render paragraphs
                for paragraph in section['paragraphs']:
                    formatted_text = self._format_text(paragraph)
                    story.append(Paragraph(formatted_text, self.styles['Body']))

            elif section['type'] == 'experience':
                # Render job entries
                for job in section['jobs']:
                    # Job title (with subtitle if exists)
                    if job['subtitle']:
                        title_text = f"{job['title']} | {job['subtitle']}"
                    else:
                        title_text = job['title']
                    story.append(Paragraph(title_text, self.styles['JobTitle']))

                    # Company
                    if job['company']:
                        story.append(Paragraph(job['company'], self.styles['Company']))

                    # Dates
                    if job['dates']:
                        story.append(Paragraph(job['dates'], self.styles['Dates']))

                    # Job description
                    if job['description']:
                        story.append(Paragraph(job['description'], self.styles['JobDescription']))

                    # Bullets
                    for bullet in job['bullets']:
                        bullet_text = f"→ {self._format_text(bullet)}"
                        story.append(Paragraph(bullet_text, self.styles['Bullet']))

            elif section['type'] == 'subsections':
                # Render subsections
                for subsection in section['subsections']:
                    # Subsection header
                    story.append(Paragraph(subsection['title'], self.styles['SubsectionHeader']))

                    # Subsection paragraphs
                    for paragraph in subsection['paragraphs']:
                        formatted_text = self._format_text(paragraph)
                        story.append(Paragraph(formatted_text, self.styles['Body']))

        # Build PDF
        doc.build(story)
        return filename


def main():
    """Main function"""
    parser = argparse.ArgumentParser(description='Generate PDF resume from Markdown')
    parser.add_argument(
        '--output', '-o',
        default='resume.pdf',
        help='Output PDF filename (default: resume.pdf)'
    )
    parser.add_argument(
        '--local', '-l',
        help='Use local markdown file instead of fetching from GitHub'
    )

    args = parser.parse_args()

    # Get markdown content
    if args.local:
        print(f"Reading local file: {args.local}")
        try:
            with open(args.local, 'r', encoding='utf-8') as f:
                markdown_content = f.read()
        except FileNotFoundError:
            print(f"Error: File not found: {args.local}")
            sys.exit(1)
    else:
        print("Error: Please provide a local file with --local")
        sys.exit(1)

    # Parse markdown
    print("Parsing markdown...")
    md_parser = MarkdownParser(markdown_content)
    md_parser.parse()

    # Show what we found
    print(f"  Name: {md_parser.name}")
    print(f"  Title: {md_parser.title}")
    print(f"  Contact: {md_parser.contact_line}")
    print(f"  Sections: {len(md_parser.sections)}")

    # Generate PDF
    print("Generating PDF...")
    generator = PDFGenerator(md_parser)
    generator.generate_pdf(args.output)

    print(f"\nSuccess! PDF generated: {args.output}")


if __name__ == '__main__':
    main()
