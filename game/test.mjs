// test.mjs — Playwright smoke tests for The Journey game
import { chromium } from 'playwright';
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const PORT = 3987;

const MIME = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.mjs': 'text/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.json': 'application/json',
    '.ico': 'image/x-icon',
};

function startServer(dir) {
    return new Promise((resolve) => {
        const server = createServer(async (req, res) => {
            let url = req.url.split('?')[0];
            if (url === '/') url = '/index.html';
            try {
                const data = await readFile(join(dir, url));
                const ext = extname(url);
                res.writeHead(200, {
                    'Content-Type': MIME[ext] || 'application/octet-stream',
                    'Cache-Control': 'no-store',
                });
                res.end(data);
            } catch {
                res.writeHead(404);
                res.end('Not Found');
            }
        });
        server.listen(PORT, () => resolve(server));
    });
}

async function run() {
    const server = await startServer(__dirname);
    console.log(`Server running on http://localhost:${PORT}`);

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 720 },
    });
    const page = await context.newPage();

    const consoleErrors = [];
    const pageErrors = [];
    page.on('console', (msg) => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => pageErrors.push(err.message));

    let passed = 0;
    let failed = 0;

    function check(ok, name) {
        if (ok) {
            console.log(`  PASS  ${name}`);
            passed++;
        } else {
            console.log(`  FAIL  ${name}`);
            failed++;
        }
    }

    try {
        console.log('\n=== The Journey — Smoke Tests ===\n');

        // Load game
        await page.goto(`http://localhost:${PORT}/`, {
            waitUntil: 'networkidle',
            timeout: 30000,
        });
        // Wait for Three.js to initialize
        await page.waitForTimeout(3000);

        // 1. Canvas exists
        const canvas = await page.$('canvas#game-canvas');
        check(canvas !== null, 'Canvas element exists');

        // 2. Canvas has dimensions
        const canvasBox = canvas ? await canvas.boundingBox() : null;
        check(canvasBox && canvasBox.width > 0 && canvasBox.height > 0, 'Canvas has non-zero size');

        // 3. No critical JS errors (allow WebGPU/adapter warnings)
        const critical = [...consoleErrors, ...pageErrors].filter(
            (e) => !e.includes('WebGPU') && !e.includes('adapter') &&
                   !e.includes('deprecat') && !e.includes('THREE.WebGLRenderer')
        );
        check(critical.length === 0,
            `No critical errors (${critical.length} found${critical.length ? ': ' + critical[0].slice(0, 80) : ''})`);

        // 4. Title screen visible
        const titleDisplay = await page.$eval('#title-screen', (el) =>
            window.getComputedStyle(el).display
        );
        check(titleDisplay === 'flex', 'Title screen is visible');

        // 5. Title text
        const titleText = await page.$eval('#title-screen h1', (el) => el.textContent);
        check(titleText === 'THE JOURNEY', 'Title text is "THE JOURNEY"');

        // 6. Renderer badge
        const badgeText = await page.$eval('#renderer-badge', (el) => el.textContent);
        check(
            badgeText === 'WebGPU' || badgeText === 'WebGL',
            `Renderer badge shows "${badgeText}"`
        );

        // 7. Press Enter to start, then skip intro
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1500);
        // Press Enter again to skip intro (delta cap makes intro slow in headless)
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000);

        // 8. HUD is visible
        const hudDisplay = await page.$eval('#hud', (el) =>
            window.getComputedStyle(el).display
        );
        check(hudDisplay === 'flex', 'HUD visible after starting');

        // 9. Score starts at 0
        const score = await page.$eval('#score', (el) => el.textContent);
        check(score === '0', 'Score starts at 0');

        // 10. Lives displayed
        const lives = await page.$eval('#lives', (el) => el.textContent);
        check(lives.includes('\u2764'), 'Lives display shows hearts');

        // 11. Parts bar exists
        const partsBar = await page.$('#parts-fill');
        check(partsBar !== null, 'Truck fix progress bar exists');

        // 12. Move right
        await page.keyboard.down('ArrowRight');
        await page.waitForTimeout(1500);
        await page.keyboard.up('ArrowRight');

        // 13. Jump
        await page.keyboard.press('Space');
        await page.waitForTimeout(500);

        // 14. Throw wrench
        await page.keyboard.press('KeyX');
        await page.waitForTimeout(300);

        // 15. Take screenshot
        const screenshotPath = join(__dirname, 'screenshot.png');
        await page.screenshot({ path: screenshotPath });
        check(true, `Screenshot saved to ${screenshotPath}`);

        // 16. Coming Soon screen exists in DOM
        const comingSoon = await page.$('#coming-soon');
        check(comingSoon !== null, 'Coming Soon element exists in DOM');

        // 17. Touch controls exist
        const touchDpad = await page.$('.touch-controls');
        check(touchDpad !== null, 'Mobile touch controls exist');

        console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
    } catch (err) {
        console.error('Test error:', err.message);
        failed++;
    } finally {
        await browser.close();
        server.close();
    }

    process.exit(failed > 0 ? 1 : 0);
}

run();
