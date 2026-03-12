// boss.js - Ford F-600 "Queixo Duro" boss fight
import * as THREE from 'three';

const BOSS_X = 185;
const BOSS_HITS_NEEDED = 8;

export function createBoss(scene) {
    const group = new THREE.Group();
    group.visible = false;

    // ─── Truck body ──────────────────────────────
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x3366AA, roughness: 0.6 });
    const rustyMat = new THREE.MeshStandardMaterial({ color: 0x886644, roughness: 0.7, metalness: 0.4 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xCCCCCC, roughness: 0.2, metalness: 0.9 });
    const glassMat = new THREE.MeshStandardMaterial({
        color: 0x88BBDD, roughness: 0.1, metalness: 0.3, transparent: true, opacity: 0.5,
    });
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9 });

    // Cab
    const cab = new THREE.Mesh(new THREE.BoxGeometry(3.5, 3.2, 3.5), bodyMat);
    cab.position.set(0, 2.2, 0);
    cab.castShadow = true;
    group.add(cab);

    // Hood
    const hood = new THREE.Mesh(new THREE.BoxGeometry(4, 1.8, 3.3), bodyMat);
    hood.position.set(-3.5, 1.2, 0);
    hood.castShadow = true;
    group.add(hood);

    // Engine area (target - glows when boss active)
    const engineMat = new THREE.MeshStandardMaterial({
        color: 0x444444,
        roughness: 0.5,
        metalness: 0.7,
        emissive: 0xFF4400,
        emissiveIntensity: 0,
    });
    const engine = new THREE.Mesh(new THREE.BoxGeometry(3.5, 1.2, 2.8), engineMat);
    engine.position.set(-3.5, 1.5, 0);
    group.add(engine);

    // Windshield
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.5, 0.08), glassMat);
    windshield.position.set(-1.2, 3.0, 0);
    windshield.rotation.y = 0;
    group.add(windshield);

    // Grille
    const grille = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.2, 2.8), chromeMat);
    grille.position.set(-5.5, 1.2, 0);
    group.add(grille);

    // Grille bars
    for (let i = -4; i <= 4; i++) {
        const bar = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.06, 0.06), chromeMat);
        bar.position.set(-5.55, 1.2 + i * 0.13, 0);
        group.add(bar);
    }

    // Bumper
    const bumper = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 3.8), chromeMat);
    bumper.position.set(-5.6, 0.4, 0);
    group.add(bumper);

    // Cargo bed
    const bed = new THREE.Mesh(new THREE.BoxGeometry(6, 0.2, 3.5), rustyMat);
    bed.position.set(3.5, 1.5, 0);
    group.add(bed);

    // Bed sides
    const bedSide1 = new THREE.Mesh(new THREE.BoxGeometry(6, 1.0, 0.15), rustyMat);
    bedSide1.position.set(3.5, 2.1, 1.7);
    group.add(bedSide1);
    const bedSide2 = new THREE.Mesh(new THREE.BoxGeometry(6, 1.0, 0.15), rustyMat);
    bedSide2.position.set(3.5, 2.1, -1.7);
    group.add(bedSide2);

    // Wheels
    const wheelPositions = [{ x: -4.5, z: 2 }, { x: -4.5, z: -2 }, { x: -1, z: 2 }, { x: -1, z: -2 },
        { x: 2, z: 2 }, { x: 2, z: -2 }, { x: 5, z: 2 }, { x: 5, z: -2 }];
    for (const wp of wheelPositions) {
        const wheel = new THREE.Mesh(
            new THREE.CylinderGeometry(0.6, 0.6, 0.4, 10),
            tireMat
        );
        wheel.rotation.x = Math.PI / 2;
        wheel.position.set(wp.x, 0.6, wp.z);
        group.add(wheel);
        // Hub cap
        const hub = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.2, 0.42, 6),
            chromeMat
        );
        hub.rotation.x = Math.PI / 2;
        hub.position.set(wp.x, 0.6, wp.z);
        group.add(hub);
    }

    // Headlights (SpotLights - off initially)
    const headlightLeft = new THREE.SpotLight(0xFFFFAA, 0, 15, Math.PI / 6, 0.5);
    headlightLeft.position.set(-5.7, 1.8, 0.8);
    headlightLeft.target.position.set(-10, 0, 0.8);
    group.add(headlightLeft);
    group.add(headlightLeft.target);

    const headlightRight = new THREE.SpotLight(0xFFFFAA, 0, 15, Math.PI / 6, 0.5);
    headlightRight.position.set(-5.7, 1.8, -0.8);
    headlightRight.target.position.set(-10, 0, -0.8);
    group.add(headlightRight);
    group.add(headlightRight.target);

    // Headlight lenses
    const lensMat = new THREE.MeshStandardMaterial({
        color: 0xFFFF99, emissive: 0xFFFF44, emissiveIntensity: 0,
    });
    const lensL = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.3, 0.3), lensMat);
    lensL.position.set(-5.7, 1.8, 0.8);
    group.add(lensL);
    const lensR = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.3, 0.3), lensMat);
    lensR.position.set(-5.7, 1.8, -0.8);
    group.add(lensR);

    // Steering column (attack weapon)
    const columnGroup = new THREE.Group();
    const column = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 4, 0.15),
        new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.8, roughness: 0.3 })
    );
    column.position.y = -2;
    columnGroup.add(column);

    // Steering wheel at end
    const steeringWheel = new THREE.Mesh(
        new THREE.TorusGeometry(0.4, 0.08, 6, 12),
        new THREE.MeshStandardMaterial({ color: 0x222222 })
    );
    steeringWheel.position.y = -4;
    steeringWheel.rotation.x = Math.PI / 2;
    columnGroup.add(steeringWheel);

    columnGroup.position.set(-2, 4, 0);
    group.add(columnGroup);

    // Exhaust stacks (dual stacks for imposing look)
    const exhaustMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.7, roughness: 0.4 });
    for (const ez of [1.2, -1.2]) {
        const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.15, 3, 8), exhaustMat);
        stack.position.set(1, 3.5, ez);
        group.add(stack);
        // Stack cap
        const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.18, 0.15, 8), chromeMat);
        cap.position.set(1, 5, ez);
        group.add(cap);
    }

    // Rust patches (darker overlays on body)
    const rustPatchMat = new THREE.MeshStandardMaterial({
        color: 0x774422, roughness: 0.9, metalness: 0.2,
        transparent: true, opacity: 0.6,
    });
    for (const [rx, ry, rz, rw, rh] of [
        [-2, 1.5, 1.76, 1.5, 0.8], [3, 1.8, 1.76, 2, 0.5],
        [-4, 0.8, 1.66, 1, 0.6], [5, 2.2, 1.76, 1.2, 0.4],
    ]) {
        const patch = new THREE.Mesh(new THREE.BoxGeometry(rw, rh, 0.02), rustPatchMat);
        patch.position.set(rx, ry, rz);
        group.add(patch);
    }

    // Hood ornament / logo area (menacing)
    const logoMat = new THREE.MeshStandardMaterial({
        color: 0xFFCC00, roughness: 0.3, metalness: 0.8,
        emissive: 0xFF8800, emissiveIntensity: 0,
    });
    const logo = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.1), logoMat);
    logo.position.set(-5.55, 2.0, 0);
    group.add(logo);

    // Dents (small inset boxes)
    const dentMat = new THREE.MeshStandardMaterial({ color: 0x2A5588, roughness: 0.7 });
    for (const [dx, dy, dz] of [[-3, 2.8, 1.76], [1, 1.0, 1.76], [-1, 0.8, 1.76]]) {
        const dent = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.05), dentMat);
        dent.position.set(dx, dy, dz);
        group.add(dent);
    }

    // Position the entire truck
    group.position.set(BOSS_X, 0, 0);
    scene.add(group);

    return {
        mesh: group,
        engine,
        engineMat,
        columnGroup,
        headlightLeft,
        headlightRight,
        lensMat,
        logoMat,
        health: BOSS_HITS_NEEDED,
        state: 'IDLE', // IDLE, ACTIVE, FIXED
        attackTimer: 0,
        attackPhase: 0, // 0=idle, 1=swinging
        swingAngle: 0,
        shakeTimer: 0,
        fixedTimer: 0,
        driveX: 0,
    };
}

export function activateBoss(boss) {
    boss.mesh.visible = true;
    boss.state = 'ACTIVE';
    boss.engineMat.emissiveIntensity = 0.3;
    // Engine glow pulses
}

export function updateBoss(boss, playerX, playerY, dt) {
    if (boss.state === 'IDLE') return;

    const time = Date.now() * 0.001;

    if (boss.state === 'ACTIVE') {
        // Engine glow pulse — intensifies as boss takes damage
        const damageFactor = 1 + (BOSS_HITS_NEEDED - boss.health) / BOSS_HITS_NEEDED;
        boss.engineMat.emissiveIntensity = (0.3 + Math.sin(time * 3) * 0.2) * damageFactor;
        // Logo pulse
        boss.logoMat.emissiveIntensity = 0.3 + Math.sin(time * 5) * 0.3;

        // Steering column attack
        boss.attackTimer += dt;

        // Swing pattern: swing out, hold, retract, pause
        const cycleTime = 3.0; // seconds per attack cycle
        const phase = (boss.attackTimer % cycleTime) / cycleTime;

        if (phase < 0.2) {
            // Swing out
            boss.swingAngle = THREE.MathUtils.lerp(0, Math.PI * 0.6, phase / 0.2);
        } else if (phase < 0.4) {
            // Hold
            boss.swingAngle = Math.PI * 0.6;
        } else if (phase < 0.6) {
            // Retract
            boss.swingAngle = THREE.MathUtils.lerp(Math.PI * 0.6, 0, (phase - 0.4) / 0.2);
        } else {
            // Pause
            boss.swingAngle = 0;
        }

        boss.columnGroup.rotation.z = boss.swingAngle;

        // Shake effect when hit
        if (boss.shakeTimer > 0) {
            boss.shakeTimer -= dt;
            boss.mesh.position.x = BOSS_X + (Math.random() - 0.5) * 0.3;
            boss.mesh.position.y = (Math.random() - 0.5) * 0.1;
        } else {
            boss.mesh.position.x = BOSS_X;
            boss.mesh.position.y = 0;
        }
    }

    if (boss.state === 'FIXED') {
        boss.fixedTimer += dt;

        // Turn on headlights
        boss.headlightLeft.intensity = 3;
        boss.headlightRight.intensity = 3;
        boss.lensMat.emissiveIntensity = 2;
        boss.engineMat.emissiveIntensity = 0;

        // Shake/rev for first 2 seconds
        if (boss.fixedTimer < 2) {
            boss.mesh.position.x = BOSS_X + (Math.random() - 0.5) * 0.15;
            boss.mesh.position.y = (Math.random() - 0.5) * 0.05;
        } else {
            // Drive away to the right
            boss.driveX += dt * 8;
            boss.mesh.position.x = BOSS_X + boss.driveX;
            boss.mesh.position.y = 0;
        }

        // Reset steering column
        boss.columnGroup.rotation.z *= 0.9;
    }
}

// Check if wrench hit the engine
export function checkWrenchHit(boss, wrenchX, wrenchY) {
    if (boss.state !== 'ACTIVE') return false;

    const engineWorldX = BOSS_X - 3.5;
    const engineWorldY = 1.5;

    const dx = Math.abs(wrenchX - engineWorldX);
    const dy = Math.abs(wrenchY - engineWorldY);

    return dx < 2.5 && dy < 1.5;
}

// Check if steering column hits player
export function checkColumnHit(boss, playerX, playerY) {
    if (boss.state !== 'ACTIVE') return false;
    if (boss.swingAngle < 0.3) return false;

    // Column tip position (approximate)
    const columnBaseX = BOSS_X - 2;
    const columnBaseY = 4;
    const columnLength = 4;
    const tipX = columnBaseX - Math.sin(boss.swingAngle) * columnLength;
    const tipY = columnBaseY - Math.cos(boss.swingAngle) * columnLength;

    // Check along the column line
    for (let t = 0.3; t <= 1; t += 0.1) {
        const cx = columnBaseX + (tipX - columnBaseX) * t;
        const cy = columnBaseY + (tipY - columnBaseY) * t;
        const dx = Math.abs(cx - playerX);
        const dy = Math.abs(cy - (playerY + 0.8));
        if (dx < 0.6 && dy < 0.8) return true;
    }
    return false;
}

export function hitBoss(boss) {
    boss.health--;
    boss.shakeTimer = 0.3;

    if (boss.health <= 0) {
        boss.state = 'FIXED';
        boss.fixedTimer = 0;
        return true; // Boss defeated
    }
    return false;
}

export function resetBoss(boss) {
    boss.health = BOSS_HITS_NEEDED;
    boss.state = 'IDLE';
    boss.attackTimer = 0;
    boss.swingAngle = 0;
    boss.shakeTimer = 0;
    boss.fixedTimer = 0;
    boss.driveX = 0;
    boss.mesh.visible = false;
    boss.mesh.position.set(BOSS_X, 0, 0);
    boss.headlightLeft.intensity = 0;
    boss.headlightRight.intensity = 0;
    boss.lensMat.emissiveIntensity = 0;
    boss.engineMat.emissiveIntensity = 0;
    boss.logoMat.emissiveIntensity = 0;
    boss.columnGroup.rotation.z = 0;
}

export function isBossArea(playerX) {
    return playerX > 168;
}

export { BOSS_X };
