// input.js - Keyboard and touch input handling
const keys = {};
const prevKeys = {};
const touches = { left: false, right: false, jump: false, throw: false };

export function initInput() {
    window.addEventListener('keydown', (e) => {
        if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
            e.preventDefault();
        }
        keys[e.code] = true;
    });
    window.addEventListener('keyup', (e) => {
        keys[e.code] = false;
    });

    // Tap anywhere on screen acts as Enter (for title/menu screens)
    const canvas = document.querySelector('canvas');
    const tapTargets = [canvas, document.getElementById('title-screen'), document.getElementById('game-over'), document.getElementById('win-screen'), document.getElementById('coming-soon')];
    tapTargets.forEach((el) => {
        if (!el) return;
        el.addEventListener('click', () => { keys['Enter'] = true; requestAnimationFrame(() => { keys['Enter'] = false; }); });
        el.addEventListener('touchstart', (e) => { keys['Enter'] = true; requestAnimationFrame(() => { keys['Enter'] = false; }); }, { passive: true });
    });

    const touchBtns = document.querySelectorAll('.touch-btn');
    touchBtns.forEach((btn) => {
        const action = btn.dataset.action;
        if (!action) return;
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            touches[action] = true;
        });
        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            touches[action] = false;
        });
        btn.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            touches[action] = false;
        });
    });
}

export function getInput() {
    const input = {
        left: keys['ArrowLeft'] || keys['KeyA'] || touches.left,
        right: keys['ArrowRight'] || keys['KeyD'] || touches.right,
        jump: keys['Space'] || keys['ArrowUp'] || keys['KeyW'] || touches.jump,
        throw: keys['KeyX'] || keys['KeyK'] || touches.throw,
        enter: keys['Enter'] || keys['Space'],
        jumpPressed: false,
        throwPressed: false,
        enterPressed: false,
    };

    input.jumpPressed = input.jump && !prevKeys['jump'];
    input.throwPressed = input.throw && !prevKeys['throw'];
    input.enterPressed = input.enter && !prevKeys['enter'];

    prevKeys['jump'] = input.jump;
    prevKeys['throw'] = input.throw;
    prevKeys['enter'] = input.enter;

    return input;
}
