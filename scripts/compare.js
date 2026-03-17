const { chromium } = require('playwright');
const fs = require('fs');

const PROD = 'https://tiago.sh';
const LOCAL = 'http://localhost:3000';
const SECTIONS = ['hero', 'journey', 'philosophy', 'resume'];
const OUT = '/tmp';

async function captureSection(page, sectionId, prefix) {
  const el = await page.locator(`#${sectionId}`);
  const path = `${OUT}/${prefix}-${sectionId}.png`;
  await el.scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await el.screenshot({ path });
  console.log(`  ✓ ${path}`);
  return path;
}

async function extractText(page, sectionId) {
  return page.locator(`#${sectionId}`).innerText();
}

(async () => {
  const browser = await chromium.launch();
  const report = [];

  // ---- Production ----
  console.log('📸 Production site...');
  const prodPage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await prodPage.goto(PROD, { waitUntil: 'networkidle' });
  await prodPage.waitForTimeout(2000);

  const prodTexts = {};
  const prodShots = {};
  for (const s of SECTIONS) {
    prodShots[s] = await captureSection(prodPage, s, 'prod');
    prodTexts[s] = await extractText(prodPage, s);
  }

  // ---- Local ----
  console.log('📸 Local dev site...');
  const localPage = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await localPage.goto(LOCAL, { waitUntil: 'networkidle' });
  await localPage.waitForTimeout(2000);

  const localTexts = {};
  const localShots = {};
  for (const s of SECTIONS) {
    localShots[s] = await captureSection(localPage, s, 'local');
    localTexts[s] = await extractText(localPage, s);
  }

  // ---- Nav comparison ----
  console.log('\n📋 Comparing nav...');
  const prodNav = await prodPage.locator('.fixed-nav').innerText();
  const localNav = await localPage.locator('.fixed-nav').innerText();
  report.push('=== NAV ===');
  report.push(`Prod:  ${prodNav.replace(/\n/g, ' | ')}`);
  report.push(`Local: ${localNav.replace(/\n/g, ' | ')}`);
  if (prodNav.trim() === localNav.trim()) {
    report.push('Result: IDENTICAL');
  } else {
    report.push('Result: DIFFERENT (expected — local has Blog tab)');
  }
  report.push('');

  // ---- Section comparisons ----
  for (const s of SECTIONS) {
    report.push(`=== ${s.toUpperCase()} ===`);

    // Image size comparison
    const prodBuf = fs.readFileSync(prodShots[s]);
    const localBuf = fs.readFileSync(localShots[s]);
    report.push(`Prod screenshot:  ${prodBuf.length} bytes`);
    report.push(`Local screenshot: ${localBuf.length} bytes`);

    // Text comparison
    const prodT = prodTexts[s].trim();
    const localT = localTexts[s].trim();

    if (prodT === localT) {
      report.push('Text content: IDENTICAL');
    } else {
      // Find differences
      const prodLines = prodT.split('\n').map(l => l.trim()).filter(Boolean);
      const localLines = localT.split('\n').map(l => l.trim()).filter(Boolean);

      const missingInLocal = prodLines.filter(l => !localLines.includes(l));
      const extraInLocal = localLines.filter(l => !prodLines.includes(l));

      report.push(`Text content: DIFFERENT`);
      report.push(`  Prod lines: ${prodLines.length}, Local lines: ${localLines.length}`);
      if (missingInLocal.length > 0) {
        report.push(`  MISSING in local (${missingInLocal.length}):`);
        missingInLocal.slice(0, 5).forEach(l => report.push(`    - "${l.substring(0, 100)}"`));
        if (missingInLocal.length > 5) report.push(`    ... and ${missingInLocal.length - 5} more`);
      }
      if (extraInLocal.length > 0) {
        report.push(`  EXTRA in local (${extraInLocal.length}):`);
        extraInLocal.slice(0, 5).forEach(l => report.push(`    + "${l.substring(0, 100)}"`));
        if (extraInLocal.length > 5) report.push(`    ... and ${extraInLocal.length - 5} more`);
      }
    }
    report.push('');
  }

  const reportText = report.join('\n');
  fs.writeFileSync(`${OUT}/comparison-report.txt`, reportText);
  console.log('\n' + reportText);
  console.log('\n✅ Report saved to /tmp/comparison-report.txt');

  await browser.close();
})();
