#!/usr/bin/env python3
"""
Resume PDF Generator - Clean rebuild
Generates a PDF resume from the markdown source at content/resume.md.
"""

import re
import requests
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.colors import HexColor
from reportlab.pdfgen import canvas
import argparse
import sys


class MarkdownParser:
    """Parse markdown resume into structured data"""

    # Separators allowed between company name and dates on the metadata line.
    # The canonical resume uses '·' (middle dot). '|' is kept for back-compat.
    COMPANY_DATES_SEPARATORS = ('·', '|')

    def __init__(self, markdown_text):
        self.markdown = markdown_text
        self.lines = markdown_text.split('\n')

        # Header data
        self.name = ''
        self.title = ''
        self.contact_line = ''

        # Body sections
        self.sections = []

    def parse(self):
        """Parse the markdown"""
        self._parse_header()
        self._parse_body()
        return self

    def _parse_header(self):
        """Parse header section (everything before first ---)"""
        in_frontmatter = False
        frontmatter_seen = False

        for line in self.lines:
            stripped = line.strip()

            # Skip Hugo frontmatter block (--- ... ---) at the very top
            if stripped == '---' and not frontmatter_seen:
                in_frontmatter = True
                frontmatter_seen = True
                continue
            if in_frontmatter:
                if stripped == '---':
                    in_frontmatter = False
                continue

            # After frontmatter: consume header until next ---
            if stripped == '---':
                break

            if not stripped:
                continue

            # H1 = Name
            if stripped.startswith('# '):
                self.name = stripped[2:].strip()
                continue

            # Bold line after name = Title/tagline
            if self.name and not self.title and stripped.startswith('**') and stripped.endswith('**'):
                self.title = stripped[2:-2].strip()
                continue

            # Line with links/pipes/middots = Contact info
            if self.name and ('|' in stripped or '·' in stripped or 'mailto:' in stripped or 'linkedin' in stripped.lower()):
                self.contact_line = stripped
                continue

    def _parse_company_dates(self, line):
        """Parse a '**Company** · *dates · location*' line.

        Returns (company, dates) or (None, None) if the line doesn't match.
        """
        if '**' not in line or '*' not in line:
            return None, None

        separator = None
        for candidate in self.COMPANY_DATES_SEPARATORS:
            if candidate in line:
                separator = candidate
                break
        if separator is None:
            return None, None

        parts = line.split(separator, 1)
        if len(parts) != 2:
            return None, None

        company_part = parts[0].strip()
        dates_part = parts[1].strip()

        if not (company_part.startswith('**') and company_part.endswith('**')):
            return None, None
        company = company_part[2:-2].strip()

        # Dates can be wrapped in single asterisks or may contain more
        # separator characters (e.g. "*Oct 2024 – Present · Seattle, WA*").
        if dates_part.startswith('*') and dates_part.endswith('*'):
            dates = dates_part[1:-1].strip()
        else:
            dates = dates_part

        return company, dates

    def _parse_body(self):
        """Parse body sections (after first ---)"""
        in_body = False
        in_frontmatter = False
        frontmatter_seen = False
        current_section = None
        current_job = None

        i = 0
        while i < len(self.lines):
            line = self.lines[i].strip()

            # Skip Hugo frontmatter at top of file
            if line == '---' and not frontmatter_seen:
                in_frontmatter = True
                frontmatter_seen = True
                i += 1
                continue
            if in_frontmatter:
                if line == '---':
                    in_frontmatter = False
                i += 1
                continue

            # Skip until we hit the first --- after the header
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
                # Save previous job if exists
                if current_job and current_section:
                    current_section['jobs'].append(current_job)
                    current_job = None

                # Save previous section if exists
                if current_section:
                    self.sections.append(current_section)

                # Start new section
                section_title = line[3:].strip()

                # Experience section contains job entries with bullets.
                # All other sections are prose (paragraphs with optional
                # markdown bullets).
                if section_title == 'Experience':
                    section_type = 'experience'
                else:
                    section_type = 'prose'

                current_section = {
                    'title': section_title,
                    'type': section_type,
                    'paragraphs': [],
                    'jobs': []
                }
                i += 1
                continue

            # Empty lines - skip
            if not line:
                i += 1
                continue

            # H3 = Job title in Experience section
            if line.startswith('### ') and current_section and current_section['type'] == 'experience':
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

            # If we're in a job, parse job details
            if current_job:
                # Company and dates line: **Company** · *dates · location*
                if not current_job['company']:
                    company, dates = self._parse_company_dates(line)
                    if company:
                        current_job['company'] = company
                        current_job['dates'] = dates or ''
                        i += 1
                        continue

                # Description (italic line after dates)
                if (line.startswith('*') and line.endswith('*')
                        and not line.startswith('**')
                        and current_job['dates']
                        and not current_job['description']):
                    current_job['description'] = line[1:-1].strip()
                    i += 1
                    continue

                # Bullet points — canonical is markdown '- ', legacy '→' kept
                if line.startswith('- '):
                    current_job['bullets'].append(line[2:].strip())
                    i += 1
                    continue
                if line.startswith('→'):
                    current_job['bullets'].append(line[1:].strip())
                    i += 1
                    continue

            # Collect paragraphs in prose sections
            if current_section and current_section['type'] == 'prose':
                current_section['paragraphs'].append(line)

            i += 1

        # Don't forget the last items
        if current_job and current_section:
            current_section['jobs'].append(current_job)
        if current_section:
            self.sections.append(current_section)


class PDFGenerator:
    """Generate PDF from parsed markdown"""

    # Visual bullet character used in the rendered PDF. Decoupled from the
    # markdown source so the .md can stay ATS-friendly with '- ' bullets while
    # the PDF renders a proper typographic bullet.
    BULLET_CHAR = '•'

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
            fontSize=12,
            alignment=TA_CENTER,
            textColor=HexColor('#000000'),
            spaceBefore=0,
            spaceAfter=0,
            leading=15
        )

        # Title/tagline - smaller, centered
        styles['Title'] = ParagraphStyle(
            'Title',
            fontName='Helvetica',
            fontSize=8,
            alignment=TA_CENTER,
            textColor=HexColor('#333333'),
            spaceBefore=1,
            spaceAfter=1,
            leading=10
        )

        # Contact line - small, centered
        styles['Contact'] = ParagraphStyle(
            'Contact',
            fontName='Helvetica',
            fontSize=6,
            alignment=TA_CENTER,
            textColor=HexColor('#555555'),
            spaceBefore=0,
            spaceAfter=5,
            leading=6
        )

        # Section headers (H2)
        styles['SectionHeader'] = ParagraphStyle(
            'SectionHeader',
            fontName='Helvetica-Bold',
            fontSize=11,
            alignment=TA_LEFT,
            textColor=HexColor('#000000'),
            spaceBefore=8,
            spaceAfter=8,
            leading=13
        )

        # Body text / prose paragraphs
        styles['Body'] = ParagraphStyle(
            'Body',
            fontName='Helvetica',
            fontSize=8,
            alignment=TA_LEFT,
            textColor=HexColor('#333333'),
            spaceBefore=0,
            spaceAfter=4,
            leading=11
        )

        # Job title
        styles['JobTitle'] = ParagraphStyle(
            'JobTitle',
            fontName='Helvetica-Bold',
            fontSize=9,
            alignment=TA_LEFT,
            textColor=HexColor('#000000'),
            spaceBefore=8,
            spaceAfter=2,
            leading=12
        )

        # Company name
        styles['Company'] = ParagraphStyle(
            'Company',
            fontName='Helvetica-Bold',
            fontSize=8,
            alignment=TA_LEFT,
            textColor=HexColor('#333333'),
            spaceBefore=0,
            spaceAfter=1,
            leading=11
        )

        # Dates
        styles['Dates'] = ParagraphStyle(
            'Dates',
            fontName='Helvetica-Oblique',
            fontSize=8,
            alignment=TA_LEFT,
            textColor=HexColor('#666666'),
            spaceBefore=0,
            spaceAfter=4,
            leading=10
        )

        # Job description (italic summary)
        styles['JobDescription'] = ParagraphStyle(
            'JobDescription',
            fontName='Helvetica-Oblique',
            fontSize=8,
            alignment=TA_LEFT,
            textColor=HexColor('#000000'),
            spaceBefore=0,
            spaceAfter=4,
            leading=10
        )

        # Bullet points
        styles['Bullet'] = ParagraphStyle(
            'Bullet',
            fontName='Helvetica',
            fontSize=8,
            alignment=TA_LEFT,
            textColor=HexColor('#333333'),
            spaceBefore=0,
            spaceAfter=3,
            leading=11,
            leftIndent=10,
            firstLineIndent=0
        )

        # Skills / Education-style prose bullets get slightly less indent
        # so they align nicely with surrounding body text.
        styles['ProseBullet'] = ParagraphStyle(
            'ProseBullet',
            fontName='Helvetica',
            fontSize=8,
            alignment=TA_LEFT,
            textColor=HexColor('#333333'),
            spaceBefore=0,
            spaceAfter=3,
            leading=11,
            leftIndent=10,
            firstLineIndent=0
        )

        return styles

    def _format_contact_line(self, line):
        """Convert markdown links to HTML for contact line"""
        line = re.sub(
            r'\[([^\]]+)\]\(([^\)]+)\)',
            r'<a href="\2" color="blue">\1</a>',
            line
        )
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

    def _add_page_number(self, canvas_obj, doc):
        """Add page number at bottom right corner"""
        page_num = canvas_obj.getPageNumber()
        text = str(page_num)
        canvas_obj.setFont('Helvetica', 8)
        canvas_obj.setFillColor(HexColor('#666666'))
        canvas_obj.drawRightString(
            letter[0] - 0.4 * inch,
            0.3 * inch,
            text
        )

    def generate_pdf(self, filename='resume.pdf'):
        """Generate PDF"""

        doc = SimpleDocTemplate(
            filename,
            pagesize=letter,
            rightMargin=0.4*inch,
            leftMargin=0.4*inch,
            topMargin=0.3*inch,
            bottomMargin=0.4*inch,
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
            story.append(Paragraph(section['title'], self.styles['SectionHeader']))

            if section['type'] == 'prose':
                for paragraph in section['paragraphs']:
                    # Markdown bullets in prose sections (e.g. Education, Skills)
                    # render as proper bullets rather than literal '- ' text.
                    if paragraph.startswith('- '):
                        text = paragraph[2:].strip()
                        bullet_text = f"{self.BULLET_CHAR}&nbsp;&nbsp;{self._format_text(text)}"
                        story.append(Paragraph(bullet_text, self.styles['ProseBullet']))
                    else:
                        formatted_text = self._format_text(paragraph)
                        story.append(Paragraph(formatted_text, self.styles['Body']))

            elif section['type'] == 'experience':
                for job in section['jobs']:
                    if job['subtitle']:
                        title_text = f"{job['title']} | {job['subtitle']}"
                    else:
                        title_text = job['title']
                    story.append(Paragraph(title_text, self.styles['JobTitle']))

                    if job['company'] or job['dates']:
                        company_dates_parts = []
                        if job['company']:
                            company_dates_parts.append(f"<b>{job['company']}</b>")
                        if job['dates']:
                            company_dates_parts.append(
                                f'<i><font color="#666666">{job["dates"]}</font></i>'
                            )
                        company_dates_text = " &nbsp;·&nbsp; ".join(company_dates_parts)
                        story.append(Paragraph(company_dates_text, self.styles['Company']))

                    if job['description']:
                        story.append(Paragraph(job['description'], self.styles['JobDescription']))

                    for bullet in job['bullets']:
                        bullet_text = f"{self.BULLET_CHAR}&nbsp;&nbsp;{self._format_text(bullet)}"
                        story.append(Paragraph(bullet_text, self.styles['Bullet']))

        doc.build(story, onFirstPage=self._add_page_number, onLaterPages=self._add_page_number)
        return filename


def main():
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
    parser.add_argument(
        '--phone', '-p',
        help='Phone number to inject into the PDF contact line (kept out of '
             'the markdown source so it never gets committed)'
    )

    args = parser.parse_args()

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

    print("Parsing markdown...")
    md_parser = MarkdownParser(markdown_content)
    md_parser.parse()

    if args.phone and md_parser.contact_line:
        parts = md_parser.contact_line.split(' · ', 1)
        if len(parts) == 2:
            md_parser.contact_line = f"{parts[0]} · {args.phone} · {parts[1]}"
        else:
            md_parser.contact_line = f"{md_parser.contact_line} · {args.phone}"

    print(f"  Name: {md_parser.name}")
    print(f"  Title: {md_parser.title}")
    print(f"  Contact: {md_parser.contact_line}")
    print(f"  Sections: {len(md_parser.sections)}")
    for section in md_parser.sections:
        if section['type'] == 'experience':
            print(f"    - {section['title']} ({len(section['jobs'])} jobs)")
        else:
            print(f"    - {section['title']} ({len(section['paragraphs'])} paragraphs)")

    print("Generating PDF...")
    generator = PDFGenerator(md_parser)
    generator.generate_pdf(args.output)

    print(f"\nSuccess! PDF generated: {args.output}")


if __name__ == '__main__':
    main()
