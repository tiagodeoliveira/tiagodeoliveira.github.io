// main.js - Game initialization, loop, and state management
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

import { initInput, getInput } from './input.js';
import { initAudio, resumeAudio, playJump, playCollect, playThrow, playImpact,
    playHit, playEngine, playVictory, startAmbient, stopAmbient } from './audio.js';
import { createPlayer, updatePlayer, createWrench, updateWrench, resetPlayer,
    startDeathAnimation, updateDeathAnimation, resetDeathAnimation } from './player.js';
import { createWorld, updateWorld, checkCollectibles, checkFallingBlocks,
    checkOilSlick, getWeldingPositions, resetWorld } from './world.js';
import { createBoss, activateBoss, updateBoss, checkWrenchHit, checkColumnHit,
    hitBoss, resetBoss, isBossArea, BOSS_X } from './boss.js';
import { DustParticles, SparkSystem, WeldingSparks } from './effects.js';

// ─── Game State ──────────────────────────────────────
let scene, camera, renderer, composer;
let player, world, boss;
let dustParticles, sparkSystem, weldingSparks;
let wrenches = [];
let gameState = 'TITLE';
let score = 0;
let lives = 3;
let parts = 0;
const TOTAL_PARTS = 20;
let introTimer = 0;
let rendererType = 'WebGL';
let titleWrench = null;
let gameOverTimer = 0;
let winTimer = 0;
let comingSoonTimer = 0;
let screenShake = 0;       // remaining shake duration
let screenShakeIntensity = 0; // shake strength
let respawnState = 'NONE'; // NONE, DYING, FADE_OUT, REPOSITION, FADE_IN
let respawnTimer = 0;

// UI elements
const ui = {};

const clock = new THREE.Clock();

// ─── Initialization ──────────────────────────────────
async function init() {
    // Cache UI elements
    ui.titleScreen = document.getElementById('title-screen');
    ui.introScreen = document.getElementById('intro-screen');
    ui.hud = document.getElementById('hud');
    ui.gameOver = document.getElementById('game-over');
    ui.winScreen = document.getElementById('win-screen');
    ui.comingSoon = document.getElementById('coming-soon');
    ui.scoreEl = document.getElementById('score');
    ui.livesEl = document.getElementById('lives');
    ui.partsBar = document.getElementById('parts-fill');
    ui.partsText = document.getElementById('parts-text');
    ui.bossHealth = document.getElementById('boss-health');
    ui.bossHealthFill = document.getElementById('boss-health-fill');
    ui.rendererBadge = document.getElementById('renderer-badge');
    ui.damageFlash = document.getElementById('damage-flash');
    ui.respawnFade = document.getElementById('respawn-fade');

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1A1410);
    scene.fog = new THREE.Fog(0x1A1410, 15, 35);

    // Camera
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(3, 5, 18);
    camera.lookAt(3, 3, 0);

    // Renderer
    const canvas = document.getElementById('game-canvas');
    await initRenderer(canvas);

    // Post-processing (WebGL only)
    if (rendererType === 'WebGL') {
        try {
            composer = new EffectComposer(renderer);
            composer.addPass(new RenderPass(scene, camera));
            const bloomPass = new UnrealBloomPass(
                new THREE.Vector2(window.innerWidth, window.innerHeight),
                0.4, 0.4, 0.85
            );
            composer.addPass(bloomPass);
        } catch (e) {
            console.warn('Bloom post-processing failed:', e);
            composer = null;
        }
    }

    // Input & Audio
    initInput();
    initAudio();

    // Create game objects
    world = createWorld(scene);
    player = createPlayer(scene);
    boss = createBoss(scene);

    // Particles
    dustParticles = new DustParticles(scene);
    sparkSystem = new SparkSystem(scene, 300);
    weldingSparks = new WeldingSparks(scene, sparkSystem);
    for (const wp of getWeldingPositions()) {
        weldingSparks.addEmitter(wp.x, wp.y);
    }

    // Title screen 3D wrench
    createTitleWrench();

    // Resize handler
    window.addEventListener('resize', onResize);
    onResize();

    // Start game loop
    clock.start();
    gameLoop();
}

async function initRenderer(canvas) {
    // Try WebGPU
    if (navigator.gpu) {
        try {
            const adapter = await navigator.gpu.requestAdapter();
            if (adapter) {
                const { default: WebGPURenderer } = await import(
                    'three/addons/renderers/webgpu/WebGPURenderer.js'
                );
                renderer = new WebGPURenderer({ canvas, antialias: true });
                await renderer.init();
                rendererType = 'WebGPU';
                console.log('Using WebGPU renderer');
            }
        } catch (e) {
            console.warn('WebGPU renderer failed, using WebGL:', e);
        }
    }

    if (!renderer) {
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        rendererType = 'WebGL';
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    ui.rendererBadge.textContent = rendererType;
    ui.rendererBadge.classList.add(rendererType === 'WebGPU' ? 'webgpu' : 'webgl');
}

function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    if (composer) composer.setSize(w, h);
}

function createTitleWrench() {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({
        color: 0xAABBCC, metalness: 0.8, roughness: 0.3,
        emissive: 0x334455, emissiveIntensity: 0.3,
    });
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.5, 0.3), mat);
    group.add(handle);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 0.3), mat);
    head.position.y = 1.3;
    group.add(head);
    const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.6, 0.3), mat);
    jaw.position.set(0, 1.6, 0);
    group.add(jaw);

    group.position.set(3, 5, 0);
    group.scale.set(1.5, 1.5, 1.5);
    scene.add(group);
    titleWrench = group;
}

// ─── Game Loop ───────────────────────────────────────
function gameLoop() {
    requestAnimationFrame(gameLoop);
    const dt = Math.min(clock.getDelta(), 0.05); // Cap delta time
    const input = getInput();

    switch (gameState) {
        case 'TITLE': updateTitle(input, dt); break;
        case 'INTRO': updateIntro(input, dt); break;
        case 'PLAYING': updatePlaying(input, dt); break;
        case 'BOSS': updateBossFight(input, dt); break;
        case 'WIN': updateWin(input, dt); break;
        case 'GAMEOVER': updateGameOver(input, dt); break;
        case 'COMING_SOON': updateComingSoon(input, dt); break;
    }

    // Always update particles
    dustParticles.update(dt);
    sparkSystem.update(dt);

    // Render
    if (composer) {
        composer.render();
    } else {
        renderer.render(scene, camera);
    }
}

// ─── State: TITLE ────────────────────────────────────
function updateTitle(input, dt) {
    ui.titleScreen.style.display = 'flex';
    ui.hud.style.display = 'none';
    ui.introScreen.style.display = 'none';
    ui.gameOver.style.display = 'none';
    ui.winScreen.style.display = 'none';
    ui.bossHealth.style.display = 'none';
    ui.comingSoon.style.display = 'none';

    // Rotate title wrench
    if (titleWrench) {
        titleWrench.visible = true;
        titleWrench.rotation.z += dt * 1.5;
        titleWrench.rotation.y += dt * 0.5;
        titleWrench.position.y = 5 + Math.sin(Date.now() * 0.002) * 0.5;
    }

    // Camera for title
    camera.position.set(3, 6, 16);
    camera.lookAt(3, 4, 0);

    player.mesh.visible = false;

    if (input.enterPressed) {
        resumeAudio();
        startGame();
    }
}

function startGame() {
    gameState = 'INTRO';
    introTimer = 3;
    score = 0;
    lives = 3;
    parts = 0;

    // Reset everything
    resetPlayer(player);
    resetWorld(world, scene);
    resetBoss(boss);

    // Clear wrenches
    for (const w of wrenches) scene.remove(w.mesh);
    wrenches = [];

    if (titleWrench) titleWrench.visible = false;
    player.mesh.visible = true;

    startAmbient();
}

// ─── State: INTRO ────────────────────────────────────
function updateIntro(input, dt) {
    ui.titleScreen.style.display = 'none';
    ui.introScreen.style.display = 'flex';
    ui.hud.style.display = 'none';

    introTimer -= dt;
    camera.position.set(3, 5, 18);
    camera.lookAt(3, 3, 0);

    if (introTimer <= 0 || input.enterPressed) {
        gameState = 'PLAYING';
    }
}

// ─── State: PLAYING ──────────────────────────────────
function updatePlaying(input, dt) {
    ui.introScreen.style.display = 'none';
    ui.hud.style.display = 'flex';
    ui.bossHealth.style.display = 'none';

    // Update player
    const playerResult = updatePlayer(player, input, dt, world.platforms);

    if (playerResult && playerResult.jumped) {
        playJump();
    }

    // Throw wrench
    if (input.throwPressed && player.throwCooldown <= 0) {
        player.throwCooldown = 0.35;
        const w = createWrench(
            scene,
            player.mesh.position.x + player.facing * 0.5,
            player.mesh.position.y + 0.9,
            player.facing
        );
        wrenches.push(w);
        playThrow();
    }

    // Update wrenches
    for (let i = wrenches.length - 1; i >= 0; i--) {
        updateWrench(wrenches[i], dt);
        if (!wrenches[i].alive) {
            scene.remove(wrenches[i].mesh);
            wrenches.splice(i, 1);
        }
    }

    // Update world
    updateWorld(world, player.mesh.position.x, dt, scene);
    weldingSparks.update(dt, player.mesh.position.x);

    // Check collectibles
    const collected = checkCollectibles(world, player.mesh.position.x, player.mesh.position.y, scene);
    for (const c of collected) {
        score += c.type === 'engine_part' ? 100 : c.type === 'gear' ? 50 : 25;
        parts++;
        playCollect();
        // Spark burst at collection point
        sparkSystem.emit(c.x, c.mesh ? c.mesh.position.y : c.y, 0, 15,
            { r: 1, g: 1, b: 0.5 }, 3, -5);
    }

    // Check hazards
    if (player.invincible <= 0) {
        // Falling blocks
        if (checkFallingBlocks(world, player.mesh.position.x, player.mesh.position.y)) {
            takeDamage();
        }

        // Welding spark zones (near emitters)
        for (const wp of getWeldingPositions()) {
            const dx = Math.abs(wp.x - player.mesh.position.x);
            const dy = Math.abs(wp.y - (player.mesh.position.y + 0.8));
            if (dx < 0.8 && dy < 1.5) {
                takeDamage();
                break;
            }
        }
    }

    // Respawn sequence
    updateRespawn(dt);

    // Fall death
    if (player.mesh.position.y < -4 && respawnState === 'NONE' && player.alive) {
        takeDamage();
    }

    // Check boss area
    if (isBossArea(player.mesh.position.x) && respawnState === 'NONE') {
        gameState = 'BOSS';
        activateBoss(boss);
    }

    // Update camera
    updateCamera(dt);
    updateHUD();
}

// ─── State: BOSS ─────────────────────────────────────
function updateBossFight(input, dt) {
    ui.hud.style.display = 'flex';
    ui.bossHealth.style.display = 'block';

    // Update player
    const playerResult = updatePlayer(player, input, dt, world.platforms);
    if (playerResult && playerResult.jumped) playJump();

    // Throw wrench
    if (input.throwPressed && player.throwCooldown <= 0) {
        player.throwCooldown = 0.35;
        const w = createWrench(
            scene,
            player.mesh.position.x + player.facing * 0.5,
            player.mesh.position.y + 0.9,
            player.facing
        );
        wrenches.push(w);
        playThrow();
    }

    // Update wrenches and check boss hit
    for (let i = wrenches.length - 1; i >= 0; i--) {
        updateWrench(wrenches[i], dt);
        if (wrenches[i].alive && checkWrenchHit(boss, wrenches[i].x, wrenches[i].y)) {
            // Hit the engine!
            sparkSystem.emit(wrenches[i].x, wrenches[i].y, 0, 25,
                { r: 1, g: 0.6, b: 0.1 }, 6, -8);
            playImpact();
            screenShake = 0.2;
            screenShakeIntensity = 0.25;
            wrenches[i].alive = false;
            scene.remove(wrenches[i].mesh);
            wrenches.splice(i, 1);

            const defeated = hitBoss(boss);
            if (defeated) {
                gameState = 'WIN';
                winTimer = 0;
                playEngine();
                playVictory();
                stopAmbient();
            }
            continue;
        }
        if (!wrenches[i].alive) {
            scene.remove(wrenches[i].mesh);
            wrenches.splice(i, 1);
        }
    }

    // Boss update
    updateBoss(boss, player.mesh.position.x, player.mesh.position.y, dt);

    // Check steering column hit
    if (player.invincible <= 0 && checkColumnHit(boss, player.mesh.position.x, player.mesh.position.y)) {
        takeDamage();
    }

    // Respawn sequence
    updateRespawn(dt);

    // Fall death
    if (player.mesh.position.y < -4 && respawnState === 'NONE' && player.alive) {
        takeDamage();
    }

    // Clamp player in boss arena
    if (player.mesh.position.x > BOSS_X + 8) {
        player.mesh.position.x = BOSS_X + 8;
    }

    // Boss exhaust particles
    if (boss.state === 'ACTIVE') {
        sparkSystem.emit(
            BOSS_X + 6.5, 3.5, 1.2, 1,
            { r: 0.3, g: 0.3, b: 0.3 }, 2, 3
        );
    }

    updateCamera(dt);
    updateHUD();
    updateBossHUD();
}

// ─── State: WIN ──────────────────────────────────────
function updateWin(input, dt) {
    ui.winScreen.style.display = 'flex';
    ui.bossHealth.style.display = 'none';

    winTimer += dt;

    // Boss drives away
    updateBoss(boss, player.mesh.position.x, player.mesh.position.y, dt);

    // Exhaust particles from driving truck
    if (boss.state === 'FIXED' && boss.fixedTimer > 2) {
        sparkSystem.emit(
            boss.mesh.position.x + 6.5, 1, 1.2, 3,
            { r: 0.4, g: 0.4, b: 0.4 }, 4, 5
        );
    }

    updateCamera(dt);

    if (winTimer > 5 && input.enterPressed) {
        gameState = 'COMING_SOON';
        comingSoonTimer = 0;
    }
}

// ─── State: GAMEOVER ─────────────────────────────────
function updateGameOver(input, dt) {
    ui.gameOver.style.display = 'flex';
    ui.hud.style.display = 'none';
    ui.bossHealth.style.display = 'none';

    gameOverTimer += dt;

    if (gameOverTimer > 2 && input.enterPressed) {
        gameState = 'TITLE';
        stopAmbient();
    }
}

// ─── State: COMING_SOON ─────────────────────────────
function updateComingSoon(input, dt) {
    ui.winScreen.style.display = 'none';
    ui.comingSoon.style.display = 'flex';
    ui.hud.style.display = 'none';
    ui.bossHealth.style.display = 'none';

    comingSoonTimer += dt;

    if (comingSoonTimer > 1 && input.enterPressed) {
        gameState = 'TITLE';
        stopAmbient();
    }
}

// ─── Helpers ─────────────────────────────────────────
function takeDamage() {
    if (player.invincible > 0 || respawnState !== 'NONE') return;
    lives--;
    playHit();
    sparkSystem.emit(player.mesh.position.x, player.mesh.position.y + 0.8, 0, 20,
        { r: 1, g: 0.2, b: 0.1 }, 4, -8);

    // Screen shake on damage
    screenShake = 0.3;
    screenShakeIntensity = 0.4;

    // Red damage flash
    if (ui.damageFlash) {
        ui.damageFlash.classList.add('active');
        setTimeout(() => ui.damageFlash.classList.remove('active'), 50);
    }

    if (lives <= 0) {
        // Final death — start death animation then go to game over
        player.alive = false;
        startDeathAnimation(player);
        respawnState = 'DYING';
        respawnTimer = 0;
        screenShake = 0.5;
        screenShakeIntensity = 0.6;
    } else {
        // Start death + respawn sequence
        player.alive = false;
        startDeathAnimation(player);
        respawnState = 'DYING';
        respawnTimer = 0;
    }
}

function updateRespawn(dt) {
    if (respawnState === 'NONE') return;

    respawnTimer += dt;

    if (respawnState === 'DYING') {
        const done = updateDeathAnimation(player, dt);
        if (done || respawnTimer > 1.0) {
            if (lives <= 0) {
                // Game over
                resetDeathAnimation(player);
                gameState = 'GAMEOVER';
                gameOverTimer = 0;
                respawnState = 'NONE';
                stopAmbient();
                return;
            }
            // Start fade out
            respawnState = 'FADE_OUT';
            respawnTimer = 0;
            if (ui.respawnFade) {
                ui.respawnFade.classList.remove('fade-in');
                ui.respawnFade.classList.add('fade-out');
            }
        }
    } else if (respawnState === 'FADE_OUT') {
        if (respawnTimer > 0.35) {
            // Reposition player while screen is black
            respawnState = 'REPOSITION';
            respawnTimer = 0;
            resetDeathAnimation(player);
            repositionPlayer();
            player.alive = true;
            player.invincible = 2.5;
            player.mesh.visible = true;
        }
    } else if (respawnState === 'REPOSITION') {
        if (respawnTimer > 0.2) {
            // Start fade in
            respawnState = 'FADE_IN';
            respawnTimer = 0;
            if (ui.respawnFade) {
                ui.respawnFade.classList.remove('fade-out');
                ui.respawnFade.classList.add('fade-in');
            }
        }
    } else if (respawnState === 'FADE_IN') {
        if (respawnTimer > 0.5) {
            respawnState = 'NONE';
            if (ui.respawnFade) {
                ui.respawnFade.classList.remove('fade-in');
            }
        }
    }
}

function repositionPlayer() {
    const px = player.mesh.position.x;
    // Find nearest platform behind player
    let bestPlat = world.platforms[0];
    let bestDist = Infinity;
    for (const p of world.platforms) {
        if (p.type === 'oil') continue;
        const platRight = p.x + p.w / 2;
        const platLeft = p.x - p.w / 2;
        if (px >= platLeft - 5 && px <= platRight + 5) {
            const dist = Math.abs(p.x - px);
            if (dist < bestDist) {
                bestDist = dist;
                bestPlat = p;
            }
        }
    }
    player.mesh.position.x = Math.max(bestPlat.x, px - 3);
    player.mesh.position.y = bestPlat.y + bestPlat.h / 2 + 2;
    player.vy = 0;
    player.vx = 0;
}

function updateCamera(dt) {
    const px = player.mesh.position.x;
    const py = player.mesh.position.y;

    // Look-ahead based on facing direction and velocity
    const lookAhead = player.facing * 3 + player.vx * 0.15;
    const targetCamX = px + lookAhead;
    const targetCamY = Math.max(py + 4, 4);

    // Smooth follow with different speeds for X (faster) and Y (gentler)
    const smoothX = 1 - Math.pow(0.05, dt); // ~4-5x per second
    const smoothY = 1 - Math.pow(0.1, dt);  // ~3x per second
    camera.position.x += (targetCamX - camera.position.x) * smoothX;
    camera.position.y += (targetCamY - camera.position.y) * smoothY;
    camera.position.z = 18;

    // Screen shake
    let shakeX = 0, shakeY = 0;
    if (screenShake > 0) {
        screenShake -= dt;
        const t = Math.max(0, screenShake);
        const intensity = screenShakeIntensity * (t / 0.3); // decay
        shakeX = (Math.random() - 0.5) * intensity;
        shakeY = (Math.random() - 0.5) * intensity;
    }

    camera.lookAt(
        camera.position.x + shakeX,
        camera.position.y - 2 + shakeY,
        0
    );
}

function updateHUD() {
    ui.scoreEl.textContent = score;
    ui.livesEl.textContent = '❤'.repeat(Math.max(0, lives)) + '🖤'.repeat(Math.max(0, 3 - lives));
    const pct = Math.min(100, (parts / TOTAL_PARTS) * 100);
    ui.partsBar.style.width = pct + '%';
    ui.partsText.textContent = `${parts}/${TOTAL_PARTS}`;
}

function updateBossHUD() {
    const pct = ((8 - boss.health) / 8) * 100;
    ui.bossHealthFill.style.width = pct + '%';
}

// ─── Start ───────────────────────────────────────────
init().catch(console.error);
