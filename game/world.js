// world.js - Level geometry, platforms, collectibles, obstacles
import * as THREE from 'three';

// ─── Materials ───────────────────────────────────────
const concreteMat = new THREE.MeshStandardMaterial({ color: 0x777777, roughness: 0.9 });
const brickMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.85 });
const metalMat = new THREE.MeshStandardMaterial({ color: 0x556677, roughness: 0.4, metalness: 0.6 });
const woodMat = new THREE.MeshStandardMaterial({ color: 0x8B6914, roughness: 0.8 });
const oilMat = new THREE.MeshStandardMaterial({
    color: 0x222222, roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.8,
});
const rustyMat = new THREE.MeshStandardMaterial({ color: 0x994422, roughness: 0.7, metalness: 0.5 });
const darkMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.9 });
const tireMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 });

// Edge highlight materials per platform type
const edgeColors = {
    concrete: 0x999999,
    metal: 0x88AACC,
    wood: 0xBB9944,
};

// ─── Level Data ──────────────────────────────────────
const PLATFORM_DATA = [
    // Section 1: Tutorial ground
    { x: 15, y: -0.25, w: 34, h: 0.5, type: 'concrete' },
    // Section 2: Workbench area
    { x: 36, y: -0.25, w: 8, h: 0.5, type: 'concrete' },
    { x: 35, y: 2.0, w: 4, h: 0.3, type: 'metal' },
    { x: 41, y: 3.2, w: 3, h: 0.3, type: 'metal' },
    { x: 47, y: -0.25, w: 6, h: 0.5, type: 'concrete' },
    { x: 47, y: 2.5, w: 3.5, h: 0.3, type: 'wood' },
    { x: 53, y: 1.8, w: 3, h: 0.3, type: 'metal' },
    { x: 58, y: -0.25, w: 8, h: 0.5, type: 'concrete' },
    { x: 58, y: 3.5, w: 3, h: 0.3, type: 'wood' },
    // Section 3: Shelf climbing
    { x: 67, y: -0.25, w: 6, h: 0.5, type: 'concrete' },
    { x: 72, y: 1.5, w: 3, h: 0.25, type: 'wood' },
    { x: 77, y: 3.0, w: 3, h: 0.25, type: 'wood' },
    { x: 82, y: 4.5, w: 3, h: 0.25, type: 'wood' },
    { x: 87, y: 3.0, w: 3, h: 0.25, type: 'metal' },
    { x: 92, y: 1.5, w: 4, h: 0.25, type: 'metal' },
    { x: 92, y: -0.25, w: 6, h: 0.5, type: 'concrete' },
    // Section 4: Hazard zone
    { x: 100, y: -0.25, w: 12, h: 0.5, type: 'concrete' },
    { x: 103, y: -0.01, w: 3, h: 0.02, type: 'oil' },
    { x: 110, y: 2.0, w: 3, h: 0.3, type: 'metal' },
    { x: 115, y: -0.25, w: 6, h: 0.5, type: 'concrete' },
    { x: 115, y: -0.01, w: 4, h: 0.02, type: 'oil' },
    { x: 121, y: 1.5, w: 3, h: 0.3, type: 'metal' },
    { x: 126, y: 3.0, w: 3, h: 0.25, type: 'wood' },
    { x: 130, y: -0.25, w: 6, h: 0.5, type: 'concrete' },
    // Section 5: Gauntlet
    { x: 137, y: -0.25, w: 8, h: 0.5, type: 'concrete' },
    { x: 137, y: -0.01, w: 3, h: 0.02, type: 'oil' },
    { x: 143, y: 2.0, w: 3, h: 0.3, type: 'metal' },
    { x: 148, y: 3.5, w: 3, h: 0.25, type: 'wood' },
    { x: 153, y: 2.0, w: 3, h: 0.3, type: 'metal' },
    { x: 158, y: -0.25, w: 10, h: 0.5, type: 'concrete' },
    // Section 6: Boss arena
    { x: 185, y: -0.25, w: 50, h: 0.5, type: 'concrete' },
];

const COLLECTIBLE_DATA = [
    { x: 8, y: 1.5, type: 'wrench' },
    { x: 12, y: 1.5, type: 'gear' },
    { x: 18, y: 1.5, type: 'wrench' },
    { x: 24, y: 2.5, type: 'engine_part' },
    { x: 28, y: 1.5, type: 'gear' },
    { x: 35, y: 3.2, type: 'wrench' },
    { x: 41, y: 4.5, type: 'engine_part' },
    { x: 47, y: 3.8, type: 'gear' },
    { x: 53, y: 3.0, type: 'wrench' },
    { x: 58, y: 4.8, type: 'engine_part' },
    { x: 72, y: 2.8, type: 'gear' },
    { x: 77, y: 4.3, type: 'wrench' },
    { x: 82, y: 5.8, type: 'engine_part' },
    { x: 87, y: 4.3, type: 'gear' },
    { x: 100, y: 1.5, type: 'wrench' },
    { x: 110, y: 3.3, type: 'engine_part' },
    { x: 121, y: 2.8, type: 'gear' },
    { x: 126, y: 4.3, type: 'wrench' },
    { x: 143, y: 3.3, type: 'engine_part' },
    { x: 148, y: 4.8, type: 'gear' },
];

const OBSTACLE_DATA = [
    { x: 45, y: 10, type: 'engine_block', interval: 4, timer: 2 },
    { x: 80, y: 12, type: 'engine_block', interval: 3, timer: 1 },
    { x: 108, y: 11, type: 'engine_block', interval: 3.5, timer: 0 },
    { x: 120, y: 10, type: 'engine_block', interval: 2.5, timer: 1.5 },
    { x: 140, y: 11, type: 'engine_block', interval: 2, timer: 0 },
    { x: 150, y: 10, type: 'engine_block', interval: 2.5, timer: 1 },
];

const WELDING_POSITIONS = [
    { x: 55, y: 6 },
    { x: 90, y: 6 },
    { x: 118, y: 5 },
    { x: 145, y: 6 },
];

// ─── Create World ────────────────────────────────────
export function createWorld(scene) {
    const world = {
        platforms: [],
        collectibles: [],
        obstacles: [],
        fallingBlocks: [],
        decorations: [],
        lights: [],
    };

    // Back wall
    const wall = new THREE.Mesh(new THREE.BoxGeometry(220, 15, 0.5), brickMat);
    wall.position.set(100, 7, -4);
    wall.receiveShadow = true;
    scene.add(wall);

    // Ceiling
    const ceil = new THREE.Mesh(new THREE.BoxGeometry(220, 0.3, 10), darkMat);
    ceil.position.set(100, 14, 0);
    scene.add(ceil);

    // Ceiling beams
    for (let x = 0; x < 210; x += 8) {
        const beam = new THREE.Mesh(new THREE.BoxGeometry(0.4, 1.5, 10), metalMat);
        beam.position.set(x, 13.5, 0);
        scene.add(beam);
    }

    // ─── Platforms ───────────────────────────────
    for (const pd of PLATFORM_DATA) {
        const mat = pd.type === 'concrete' ? concreteMat
            : pd.type === 'metal' ? metalMat
            : pd.type === 'wood' ? woodMat
            : pd.type === 'oil' ? oilMat
            : concreteMat;

        const mesh = new THREE.Mesh(new THREE.BoxGeometry(pd.w, pd.h, 2), mat);
        mesh.position.set(pd.x, pd.y, 0);
        mesh.receiveShadow = true;
        mesh.castShadow = pd.type !== 'oil';
        scene.add(mesh);

        // Workbench legs
        if (pd.type === 'metal' && pd.y > 0.5) {
            const legGeo = new THREE.BoxGeometry(0.15, pd.y - 0.1, 0.15);
            for (const offset of [-pd.w / 2 + 0.2, pd.w / 2 - 0.2]) {
                const leg = new THREE.Mesh(legGeo, metalMat);
                leg.position.set(pd.x + offset, (pd.y - 0.1) / 2, 0.5);
                leg.castShadow = true;
                scene.add(leg);
            }
        }

        // Shelf brackets
        if (pd.type === 'wood' && pd.y > 0.5) {
            const bracketGeo = new THREE.BoxGeometry(0.1, 0.6, 0.1);
            for (const offset of [-pd.w / 2 + 0.3, pd.w / 2 - 0.3]) {
                const b = new THREE.Mesh(bracketGeo, metalMat);
                b.position.set(pd.x + offset, pd.y - 0.2, -1.8);
                scene.add(b);
            }
        }

        // Oil slick reflective surface
        if (pd.type === 'oil') {
            const sheenMat = new THREE.MeshStandardMaterial({
                color: 0x443355, roughness: 0.05, metalness: 0.9,
                transparent: true, opacity: 0.3,
            });
            const sheen = new THREE.Mesh(new THREE.PlaneGeometry(pd.w, 2), sheenMat);
            sheen.rotation.x = -Math.PI / 2;
            sheen.position.set(pd.x, 0.01, 0);
            scene.add(sheen);
        }

        // Top edge highlight line
        if (pd.type !== 'oil' && edgeColors[pd.type]) {
            const edgeMat = new THREE.MeshStandardMaterial({
                color: edgeColors[pd.type],
                emissive: edgeColors[pd.type],
                emissiveIntensity: 0.3,
            });
            const edgeStrip = new THREE.Mesh(
                new THREE.BoxGeometry(pd.w + 0.04, 0.04, 2.04),
                edgeMat
            );
            edgeStrip.position.set(pd.x, pd.y + pd.h / 2 + 0.02, 0);
            scene.add(edgeStrip);
        }

        world.platforms.push({ x: pd.x, y: pd.y, w: pd.w, h: pd.h, type: pd.type });
    }

    // ─── Collectibles ────────────────────────────
    for (const cd of COLLECTIBLE_DATA) {
        const group = new THREE.Group();
        const glowMat = new THREE.MeshStandardMaterial({
            color: cd.type === 'wrench' ? 0xCCCCDD : cd.type === 'gear' ? 0xFFAA33 : 0xFF4444,
            metalness: 0.7, roughness: 0.3,
            emissive: cd.type === 'wrench' ? 0x4444FF : cd.type === 'gear' ? 0xFF8800 : 0xFF2222,
            emissiveIntensity: 0.5,
        });

        if (cd.type === 'wrench') {
            const handle = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.4, 0.06), glowMat);
            group.add(handle);
            const head = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.08, 0.06), glowMat);
            head.position.y = 0.2;
            group.add(head);
        } else if (cd.type === 'gear') {
            const ring = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.05, 6, 8), glowMat);
            group.add(ring);
            const center = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.06), glowMat);
            group.add(center);
        } else {
            const block = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.25, 0.2), glowMat);
            group.add(block);
            const detail = new THREE.Mesh(
                new THREE.BoxGeometry(0.1, 0.1, 0.22),
                new THREE.MeshStandardMaterial({ color: 0x333333 })
            );
            detail.position.y = 0.1;
            group.add(detail);
        }

        group.position.set(cd.x, cd.y, 0);
        scene.add(group);

        const light = new THREE.PointLight(
            cd.type === 'wrench' ? 0x6666FF : cd.type === 'gear' ? 0xFF8800 : 0xFF4444,
            0.5, 3
        );
        light.position.set(cd.x, cd.y, 0.5);
        scene.add(light);

        world.collectibles.push({
            mesh: group, light,
            x: cd.x, y: cd.y, type: cd.type,
            collected: false, baseY: cd.y,
        });
    }

    // ─── Obstacles ───────────────────────────────
    for (const od of OBSTACLE_DATA) {
        world.obstacles.push({
            x: od.x, spawnY: od.y, type: od.type,
            interval: od.interval, timer: od.timer,
        });
    }

    // ─── Decorations ─────────────────────────────
    // Tool pegboards
    for (let x = 5; x < 200; x += 25) {
        const board = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 0.1), woodMat);
        board.position.set(x, 5, -3.5);
        scene.add(board);
        for (let i = 0; i < 5; i++) {
            const tool = new THREE.Mesh(
                new THREE.BoxGeometry(0.08, 0.5 + Math.random() * 0.3, 0.08), metalMat
            );
            tool.position.set(x - 1.5 + i * 0.7, 5 + (Math.random() - 0.5) * 1.5, -3.4);
            tool.rotation.z = (Math.random() - 0.5) * 0.3;
            scene.add(tool);
        }
    }

    // Tire stacks
    for (const tx of [10, 42, 65, 105, 155]) {
        for (let stack = 0; stack < 3; stack++) {
            const tire = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.25, 8, 12), tireMat);
            tire.position.set(tx, 0.5 + stack * 0.55, -2.5);
            tire.rotation.x = Math.PI / 2;
            scene.add(tire);
        }
    }

    // Background trucks
    for (const [tx, tz] of [[20, -3], [70, -3.5], [130, -3]]) {
        createBackgroundTruck(scene, tx, tz);
    }

    // ─── Lighting ────────────────────────────────
    scene.add(new THREE.AmbientLight(0xFFEEDD, 1.2));
    scene.add(new THREE.HemisphereLight(0xFFEECC, 0x886644, 0.8));

    const shadowLights = new Set([50, 110, 185]); // Only 3 lights cast shadows
    for (const lx of [5, 20, 35, 50, 65, 80, 95, 110, 125, 140, 155, 170, 185, 200]) {
        const light = new THREE.PointLight(0xFFCC88, 3.0, 30);
        light.position.set(lx, 11, 2);
        if (shadowLights.has(lx)) {
            light.castShadow = true;
            light.shadow.mapSize.width = 512;
            light.shadow.mapSize.height = 512;
            light.shadow.camera.near = 0.5;
            light.shadow.camera.far = 20;
        }
        scene.add(light);
        world.lights.push(light);

        const fixture = new THREE.Mesh(
            new THREE.BoxGeometry(1.5, 0.15, 0.4),
            new THREE.MeshStandardMaterial({
                color: 0xFFFFFF, emissive: 0xFFCC88, emissiveIntensity: 2.0,
            })
        );
        fixture.position.set(lx, 13, 2);
        scene.add(fixture);

        const chain = new THREE.Mesh(new THREE.BoxGeometry(0.03, 1.5, 0.03), metalMat);
        chain.position.set(lx, 12.5, 2);
        scene.add(chain);
    }

    const dirLight = new THREE.DirectionalLight(0xFFEEDD, 1.0);
    dirLight.position.set(10, 15, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    return world;
}

function createBackgroundTruck(scene, x, z) {
    const group = new THREE.Group();
    const cabMat = new THREE.MeshStandardMaterial({ color: 0x994422, roughness: 0.7 });
    const glassMat = new THREE.MeshStandardMaterial({
        color: 0x88BBDD, roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.6,
    });

    const cab = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.5, 2.5), cabMat);
    cab.position.set(0, 1.8, 0);
    group.add(cab);

    const windshield = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.2, 0.05), glassMat);
    windshield.position.set(0, 2.2, 1.28);
    group.add(windshield);

    const bed = new THREE.Mesh(new THREE.BoxGeometry(5, 1.2, 2.5), rustyMat);
    bed.position.set(-3, 1.2, 0);
    group.add(bed);

    for (const wx of [-4.5, -1.5, 1]) {
        const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.3, 8), tireMat);
        wheel.rotation.x = Math.PI / 2;
        wheel.position.set(wx, 0.5, 1.4);
        group.add(wheel);
    }

    group.position.set(x, 0, z);
    group.scale.set(0.8, 0.8, 0.8);
    scene.add(group);
}

// Shared geometry/material for falling blocks (avoid per-frame allocation)
const fallingBlockGeo = new THREE.BoxGeometry(0.8, 0.8, 0.8);
const fallingBlockMat = new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.6, metalness: 0.5 });

// ─── Update World ────────────────────────────────────
export function updateWorld(world, playerX, dt, scene) {
    const time = Date.now() * 0.001;

    // Animate collectibles (bob, rotate, pulse glow)
    for (const c of world.collectibles) {
        if (c.collected) continue;
        c.mesh.position.y = c.baseY + Math.sin(time * 2 + c.x) * 0.15;
        c.mesh.rotation.y += dt * 2;
        // Pulsing scale for visual pop
        const pulse = 1 + Math.sin(time * 4 + c.x * 0.5) * 0.08;
        c.mesh.scale.set(pulse, pulse, pulse);
        // Pulsing light intensity
        if (c.light) c.light.intensity = 0.4 + Math.sin(time * 3 + c.x) * 0.2;
    }

    // Spawn falling engine blocks
    for (const obs of world.obstacles) {
        if (Math.abs(obs.x - playerX) > 20) continue;
        obs.timer -= dt;
        if (obs.timer <= 0) {
            obs.timer = obs.interval;
            const block = new THREE.Mesh(fallingBlockGeo, fallingBlockMat);
            block.position.set(obs.x + (Math.random() - 0.5) * 2, obs.spawnY, 0);
            block.castShadow = true;
            scene.add(block);
            world.fallingBlocks.push({ mesh: block, vy: 0, age: 0 });
        }
    }

    // Update falling blocks
    for (let i = world.fallingBlocks.length - 1; i >= 0; i--) {
        const fb = world.fallingBlocks[i];
        fb.vy -= 15 * dt;
        fb.mesh.position.y += fb.vy * dt;
        fb.mesh.rotation.x += dt * 3;
        fb.mesh.rotation.z += dt * 2;
        fb.age += dt;
        if (fb.mesh.position.y < -2 || fb.age > 5) {
            scene.remove(fb.mesh);
            world.fallingBlocks.splice(i, 1);
        }
    }

    return world;
}

export function checkCollectibles(world, playerX, playerY, scene) {
    const collected = [];
    for (const c of world.collectibles) {
        if (c.collected) continue;
        const dx = Math.abs(c.mesh.position.x - playerX);
        const dy = Math.abs(c.mesh.position.y - (playerY + 0.85));
        // Generous pickup radius (1.0 units) — feels fair
        if (dx < 1.0 && dy < 1.0) {
            c.collected = true;
            scene.remove(c.mesh);
            scene.remove(c.light);
            collected.push(c);
        }
    }
    return collected;
}

export function checkFallingBlocks(world, playerX, playerY) {
    for (const fb of world.fallingBlocks) {
        const dx = Math.abs(fb.mesh.position.x - playerX);
        const dy = Math.abs(fb.mesh.position.y - (playerY + 0.8));
        if (dx < 0.6 && dy < 0.8) return true;
    }
    return false;
}

export function checkOilSlick(world, playerX, playerY) {
    for (const p of world.platforms) {
        if (p.type !== 'oil') continue;
        if (playerX > p.x - p.w / 2 && playerX < p.x + p.w / 2 && playerY < 0.5) return true;
    }
    return false;
}

export function getWeldingPositions() {
    return WELDING_POSITIONS;
}

export function resetWorld(world, scene) {
    for (const fb of world.fallingBlocks) {
        scene.remove(fb.mesh);
    }
    world.fallingBlocks = [];
    for (const obs of world.obstacles) {
        obs.timer = obs.interval * Math.random();
    }
    for (const c of world.collectibles) {
        if (c.collected) {
            c.collected = false;
            scene.add(c.mesh);
            scene.add(c.light);
        }
    }
}
