const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const CONTENT_DIR = path.join(ROOT, 'content');
const POSTS_DIR = path.join(ROOT, 'posts');
const TEMPLATES_DIR = path.join(ROOT, 'templates');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    ensureDir(dest);
    for (const child of fs.readdirSync(src)) {
      copyRecursive(path.join(src, child), path.join(dest, child));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

// ---------------------------------------------------------------------------
// Markdown rendering with custom transforms
// ---------------------------------------------------------------------------

function createRenderer() {
  const renderer = new marked.Renderer();
  let isFirstH1 = true;
  let isFirstParagraph = true;
  let insideResumeRole = false;
  let currentSection = null;

  renderer._setSection = function (section) {
    currentSection = section;
    isFirstH1 = true;
    isFirstParagraph = true;
    insideResumeRole = false;
  };

  // H1 → section-title
  const origHeading = renderer.heading;
  renderer.heading = function ({ tokens, depth, text: rawText }) {
    const text = this.parser.parseInline(tokens);
    if (depth === 1) {
      isFirstH1 = false;
      return `<h1 class="section-title">${text}</h1>\n`;
    }

    if (depth === 2) {
      // Year tag extraction: ## Title (1994-2013)
      const yearMatch = text.match(/^(.+?)\s*\((\d{4}[\u2013\-–]\d{4}|[\d\-–\u2013\s,]+present)\)$/i);
      if (yearMatch) {
        return `<h2>${yearMatch[1]} <span class="year-tag">${yearMatch[2]}</span></h2>\n`;
      }
      return `<h2>${text}</h2>\n`;
    }

    if (depth === 3 && currentSection === 'resume') {
      // Close previous resume-role if open
      let prefix = '';
      if (insideResumeRole) {
        prefix = '</div>\n';
      }
      insideResumeRole = true;
      return `${prefix}<div class="resume-role">\n<h3>${text}</h3>\n`;
    }

    return `<h${depth}>${text}</h${depth}>\n`;
  };

  // Paragraphs — detect lead paragraph + resume-specific patterns
  renderer.paragraph = function ({ tokens }) {
    const text = this.parser.parseInline(tokens);

    // Resume: detect role-meta pattern: **Company** | *dates | location*  or  **Company** · *dates*
    if (currentSection === 'resume') {
      // Pattern: starts with <strong> and contains <em> with date-like content and pipe/dot separators
      if (text.match(/^<strong>.+<\/strong>\s*[\|·]/) && text.match(/<em>/)) {
        return `<p class="role-meta">${text}</p>\n`;
      }
      // Pattern: italic-only line right after h3 (role description)
      if (text.match(/^<em>.+<\/em>$/)) {
        return `<p><em>${text.replace(/<\/?em>/g, '')}</em></p>\n`;
      }
      // Resume headline
      if (text.match(/^<strong>Principal Engineer/) || text.match(/^<strong>.*[·|].*Scale<\/strong>$/)) {
        return `<p class="resume-headline">${text}</p>\n`;
      }
      // Resume contact line
      if (text.match(/tiago@tiago\.sh/)) {
        return `<p class="resume-contact">${text}</p>\n`;
      }
    }

    // First real paragraph after the title → section-lead (for journey)
    if (currentSection === 'journey' && isFirstParagraph && !isFirstH1) {
      isFirstParagraph = false;
      return `<p class="section-lead">${text}</p>\n`;
    }

    isFirstParagraph = false;
    return `<p>${text}</p>\n`;
  };

  // Links — open in new tab for blog posts (except internal navigation)
  renderer.link = function ({ href, title, tokens }) {
    const text = this.parser.parseInline(tokens);
    const titleAttr = title ? ` title="${title}"` : '';
    if (currentSection === 'post') {
      return `<a href="${href}"${titleAttr} target="_blank" rel="noopener">${text}</a>`;
    }
    return `<a href="${href}"${titleAttr}>${text}</a>`;
  };

  // Images — wrap in link to open full-size in new tab for blog posts
  renderer.image = function ({ href, title, text }) {
    const titleAttr = title ? ` title="${title}"` : '';
    const alt = text || '';
    if (currentSection === 'post') {
      return `<a href="${href}" target="_blank" rel="noopener"><img src="${href}" alt="${alt}"${titleAttr} /></a>`;
    }
    return `<img src="${href}" alt="${alt}"${titleAttr} />`;
  };

  // HR — close resume-role if open before rendering the rule
  renderer.hr = function () {
    let prefix = '';
    if (currentSection === 'resume' && insideResumeRole) {
      prefix = '</div>\n';
      insideResumeRole = false;
    }
    return `${prefix}<hr>\n`;
  };

  return renderer;
}

function renderMarkdown(mdContent, section) {
  const renderer = createRenderer();
  renderer._setSection(section);

  let html = marked(mdContent, { renderer });

  // Close any open resume-role div
  if (section === 'resume') {
    // Check if we have an unclosed resume-role
    const opens = (html.match(/<div class="resume-role">/g) || []).length;
    const closes = (html.match(/<\/div>/g) || []).length;
    if (opens > closes) {
      html += '</div>\n';
    }
  }

  return html;
}

// ---------------------------------------------------------------------------
// Shared base template
// ---------------------------------------------------------------------------

const BASE_TEMPLATE = fs.readFileSync(path.join(TEMPLATES_DIR, 'base.html'), 'utf-8');

function wrapInBase({ title, meta, nav, body }) {
  return BASE_TEMPLATE
    .replace('<!-- INJECT:title -->', title)
    .replace('<!-- INJECT:meta -->', meta || '')
    .replace('<!-- INJECT:nav -->', nav)
    .replace('<!-- INJECT:body -->', body);
}

const INDEX_NAV = `<nav class="fixed-nav" id="fixedNav">
    <a href="#hero" class="nav-link active" data-section="hero">Home</a>
    <a href="#journey" class="nav-link" data-section="journey">Journey</a>
    <a href="#philosophy" class="nav-link" data-section="philosophy">Philosophy</a>
    <a href="#resume" class="nav-link" data-section="resume">Resume</a>
    <a href="/blog/" class="nav-link">Blog</a>
  </nav>`;

const BLOG_NAV = `<nav class="fixed-nav scrolled" id="fixedNav">
    <a href="/" class="nav-link">Home</a>
    <a href="/#journey" class="nav-link">Journey</a>
    <a href="/#philosophy" class="nav-link">Philosophy</a>
    <a href="/#resume" class="nav-link">Resume</a>
    <a href="/blog/" class="nav-link active">Blog</a>
  </nav>`;

// ---------------------------------------------------------------------------
// Build index page
// ---------------------------------------------------------------------------

function buildIndex() {
  let bodyTemplate = fs.readFileSync(path.join(TEMPLATES_DIR, 'index.html'), 'utf-8');

  // Read and render each content file
  const contentFiles = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));
  for (const file of contentFiles) {
    const raw = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
    const { data, content } = matter(raw);
    const section = data.section || path.basename(file, '.md');
    const html = renderMarkdown(content, section);
    bodyTemplate = bodyTemplate.replace(`<!-- INJECT:${section} -->`, html);
  }

  const meta = `<meta name="description" content="Tiago Oliveira - Principal Solutions Architect at AWS. From truck mechanic to cloud architect. 30 years of systems thinking." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://tiago.sh/" />
  <meta property="og:title" content="Tiago Oliveira" />
  <meta property="og:description" content="Principal Solutions Architect at AWS. From truck mechanic to cloud architect. 30 years of systems thinking." />
  <meta property="twitter:card" content="summary" />
  <meta property="twitter:url" content="https://tiago.sh/" />
  <meta property="twitter:title" content="Tiago Oliveira" />
  <meta property="twitter:description" content="Principal Solutions Architect at AWS. From truck mechanic to cloud architect. 30 years of systems thinking." />
  <link rel="canonical" href="https://tiago.sh/" />`;

  const page = wrapInBase({
    title: 'Tiago Oliveira',
    meta,
    nav: INDEX_NAV,
    body: bodyTemplate,
  });

  ensureDir(DIST);
  fs.writeFileSync(path.join(DIST, 'index.html'), page);
  console.log('✓ Built index.html');
}

// ---------------------------------------------------------------------------
// Build blog index (placeholder for now)
// ---------------------------------------------------------------------------

function buildBlog() {
  const blogDir = path.join(DIST, 'blog');
  ensureDir(blogDir);

  // Collect posts
  const posts = [];
  if (fs.existsSync(POSTS_DIR)) {
    const postFiles = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));
    for (const file of postFiles) {
      const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8');
      const { data, content } = matter(raw);
      // Only treat files with a date field as blog posts
      if (!data.date) continue;
      const slug = file.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '');
      // Format date as readable string
      if (data.date instanceof Date) {
        data.date = data.date.toISOString().split('T')[0]; // YYYY-MM-DD
        const [y, m, d] = data.date.split('-');
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        data.date = `${months[parseInt(m)-1]} ${parseInt(d)}, ${y}`;
      }
      posts.push({ ...data, slug, content });
    }
    // Sort by date descending
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Build individual post pages
    for (const post of posts) {
      const postHtml = renderMarkdown(post.content, 'post');
      const page = buildPostPage(post, postHtml);
      fs.writeFileSync(path.join(blogDir, `${post.slug}.html`), page);
      console.log(`✓ Built blog/${post.slug}.html`);
    }
  }

  // Build blog index
  const blogIndex = buildBlogIndex(posts);
  fs.writeFileSync(path.join(blogDir, 'index.html'), blogIndex);
  console.log('✓ Built blog/index.html');
}

function buildBlogIndex(posts) {
  const postList = posts.length === 0
    ? '<p class="section-lead">Coming soon.</p>'
    : posts.map(p => `
      <article class="blog-post-card">
        <h2><a href="/blog/${p.slug}.html">${p.title}</a></h2>
        <p class="post-date">${p.date || ''}</p>
        ${p.description ? `<p>${p.description}</p>` : ''}
      </article>`).join('\n');

  const body = `
  <section class="parallax-section">
    <div class="section-content" style="padding-top: 120px;">
      <div class="content-wrapper visible">
        <h1 class="section-title">Blog</h1>
        ${postList}
      </div>
    </div>
  </section>`;

  const meta = `<meta name="description" content="Blog - Tiago Oliveira" />
  <meta property="og:title" content="Blog - Tiago Oliveira" />
  <meta property="og:description" content="Thoughts on AI, distributed systems, and systems thinking." />`;

  return wrapInBase({
    title: 'Blog - Tiago Oliveira',
    meta,
    nav: BLOG_NAV,
    body,
  });
}

function buildPostPage(post, contentHtml) {
  const body = `
  <section class="parallax-section">
    <div class="section-content" style="padding-top: 120px;">
      <div class="content-wrapper visible">
        <p class="role-meta"><a href="/blog/">← Back to blog</a> · ${post.date || ''}</p>
        ${contentHtml}
      </div>
    </div>
  </section>`;

  const desc = (post.description || '').replace(/"/g, '&quot;');
  const title = (post.title || '').replace(/"/g, '&quot;');

  const meta = `<meta name="description" content="${desc}" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://tiago.sh/blog/${post.slug}.html" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${desc}" />
  <meta property="twitter:card" content="summary" />
  <meta property="twitter:title" content="${title}" />
  <meta property="twitter:description" content="${desc}" />`;

  return wrapInBase({
    title: `${post.title || 'Blog'} - Tiago Oliveira`,
    meta,
    nav: BLOG_NAV,
    body,
  });
}

// ---------------------------------------------------------------------------
// Copy static assets
// ---------------------------------------------------------------------------

function copyStatic() {
  ensureDir(DIST);
  const assets = ['styles.css', 'favicon.ico', 'CNAME', 'images'];
  for (const asset of assets) {
    const src = path.join(ROOT, asset);
    if (fs.existsSync(src)) {
      copyRecursive(src, path.join(DIST, asset));
    }
  }
  console.log('✓ Copied static assets');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

// Clean dist
if (fs.existsSync(DIST)) {
  fs.rmSync(DIST, { recursive: true });
}

copyStatic();
buildIndex();
buildBlog();

console.log('\nDone! Output in dist/');
