// player.js - Voxel player character with physics and animation
import * as THREE from 'three';

const MOVE_SPEED = 7;
const JUMP_VEL = 12;
const GRAVITY = -32;
const MAX_FALL = -18;
const PLAYER_HALF_W = 0.3;
const PLAYER_HEIGHT = 1.7;   // feet (y=0) to top of hair
const COYOTE_TIME = 0.08;    // seconds of grace after leaving platform
const JUMP_BUFFER_TIME = 0.1; // seconds of pre-landing jump buffer
const VARIABLE_JUMP_MULT = 0.5; // multiplier when releasing jump early

export function createPlayer(scene) {
    const group = new THREE.Group();

    const skinMat = new THREE.MeshStandardMaterial({ color: 0xD4956A, roughness: 0.8 });
    const overallMat = new THREE.MeshStandardMaterial({ color: 0x2255AA, roughness: 0.7 });
    const darkOverallMat = new THREE.MeshStandardMaterial({ color: 0x1A3D7A, roughness: 0.7 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x2A1A0A, roughness: 0.9 });
    const bootMat = new THREE.MeshStandardMaterial({ color: 0x3A2A1A, roughness: 0.9 });
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0x111111 });

    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), skinMat);
    head.position.y = 1.35;
    head.castShadow = true;
    group.add(head);

    // Hair
    const hair = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.18, 0.52), hairMat);
    hair.position.y = 1.64;
    group.add(hair);

    // Eyes
    const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.05), eyeMat);
    leftEye.position.set(-0.12, 1.38, 0.26);
    group.add(leftEye);
    const rightEye = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.05), eyeMat);
    rightEye.position.set(0.12, 1.38, 0.26);
    group.add(rightEye);

    // Body (overalls)
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.65, 0.4), overallMat);
    body.position.y = 0.78;
    body.castShadow = true;
    group.add(body);

    // Overall straps
    const strapMat = new THREE.MeshStandardMaterial({ color: 0x1A3D7A });
    const leftStrap = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.2, 0.42), strapMat);
    leftStrap.position.set(-0.2, 1.05, 0);
    group.add(leftStrap);
    const rightStrap = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.2, 0.42), strapMat);
    rightStrap.position.set(0.2, 1.05, 0);
    group.add(rightStrap);

    // Arms (pivot at top)
    const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.5, 0.18), skinMat);
    leftArm.geometry.translate(0, -0.25, 0);
    leftArm.position.set(-0.39, 1.0, 0);
    leftArm.castShadow = true;
    group.add(leftArm);

    const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.5, 0.18), skinMat);
    rightArm.geometry.translate(0, -0.25, 0);
    rightArm.position.set(0.39, 1.0, 0);
    rightArm.castShadow = true;
    group.add(rightArm);

    // Legs (pivot at top)
    const leftLeg = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.45, 0.24), darkOverallMat);
    leftLeg.geometry.translate(0, -0.225, 0);
    leftLeg.position.set(-0.14, 0.45, 0);
    leftLeg.castShadow = true;
    group.add(leftLeg);

    const rightLeg = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.45, 0.24), darkOverallMat);
    rightLeg.geometry.translate(0, -0.225, 0);
    rightLeg.position.set(0.14, 0.45, 0);
    rightLeg.castShadow = true;
    group.add(rightLeg);

    // Boots
    const leftBoot = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.3), bootMat);
    leftBoot.position.set(-0.14, 0.06, 0.03);
    group.add(leftBoot);
    const rightBoot = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.3), bootMat);
    rightBoot.position.set(0.14, 0.06, 0.03);
    group.add(rightBoot);

    group.position.set(3, 1, 0);
    scene.add(group);

    return {
        mesh: group,
        parts: { leftArm, rightArm, leftLeg, rightLeg, head, body },
        vx: 0, vy: 0,
        onGround: false,
        facing: 1,
        walkTime: 0,
        invincible: 0,
        throwCooldown: 0,
        alive: true,
        coyoteTimer: 0,        // time since last on ground
        jumpBufferTimer: 0,    // time since jump was pressed
        holdingJump: false,    // is the player holding jump
        wasOnGround: false,    // was on ground last frame
        landingSquash: 0,      // squash animation timer
        dying: false,          // death animation in progress
        deathTimer: 0,         // death animation elapsed
        deathParts: [],        // scattered part data
    };
}

export function updatePlayer(player, input, dt, platforms) {
    if (!player.alive) return;

    // ── Horizontal movement ────────────────────────
    player.vx = 0;
    if (input.left) { player.vx = -MOVE_SPEED; player.facing = -1; }
    if (input.right) { player.vx = MOVE_SPEED; player.facing = 1; }

    // ── Coyote time & jump buffer ──────────────────
    if (player.onGround) {
        player.coyoteTimer = COYOTE_TIME;
    } else {
        player.coyoteTimer -= dt;
    }

    if (input.jumpPressed) {
        player.jumpBufferTimer = JUMP_BUFFER_TIME;
    } else {
        player.jumpBufferTimer -= dt;
    }

    // ── Jump execution ─────────────────────────────
    let jumped = false;
    const canJump = player.coyoteTimer > 0;
    const wantsJump = player.jumpBufferTimer > 0;

    if (canJump && wantsJump) {
        player.vy = JUMP_VEL;
        player.onGround = false;
        player.coyoteTimer = 0;
        player.jumpBufferTimer = 0;
        player.holdingJump = true;
        jumped = true;
    }

    // Variable jump height — cut velocity when releasing jump
    if (player.holdingJump && !input.jump && player.vy > 0) {
        player.vy *= VARIABLE_JUMP_MULT;
        player.holdingJump = false;
    }
    if (player.vy <= 0) player.holdingJump = false;

    // ── Gravity ────────────────────────────────────
    player.vy += GRAVITY * dt;
    if (player.vy < MAX_FALL) player.vy = MAX_FALL;

    const pos = player.mesh.position;

    // ── X movement + collision ─────────────────────
    pos.x += player.vx * dt;

    // Left world boundary
    if (pos.x < 0.5) pos.x = 0.5;

    // Side collision with thick platforms (h > 0.3)
    for (const p of platforms) {
        if (p.type === 'oil') continue;
        if (p.h <= 0.3) continue; // skip thin shelves — one-way only
        const platLeft = p.x - p.w / 2;
        const platRight = p.x + p.w / 2;
        const platTop = p.y + p.h / 2;
        const platBottom = p.y - p.h / 2;

        // Player AABB: x ± PLAYER_HALF_W, y to y + PLAYER_HEIGHT
        if (pos.x + PLAYER_HALF_W > platLeft && pos.x - PLAYER_HALF_W < platRight &&
            pos.y < platTop && pos.y + PLAYER_HEIGHT > platBottom) {
            // Resolve by pushing out in X
            const overlapLeft = (pos.x + PLAYER_HALF_W) - platLeft;
            const overlapRight = platRight - (pos.x - PLAYER_HALF_W);
            if (overlapLeft < overlapRight) {
                pos.x = platLeft - PLAYER_HALF_W;
            } else {
                pos.x = platRight + PLAYER_HALF_W;
            }
            player.vx = 0;
        }
    }

    // ── Y movement + collision ─────────────────────
    pos.y += player.vy * dt;

    player.wasOnGround = player.onGround;
    player.onGround = false;

    for (const p of platforms) {
        const platLeft = p.x - p.w / 2;
        const platRight = p.x + p.w / 2;
        const platTop = p.y + p.h / 2;
        const platBottom = p.y - p.h / 2;

        // Must overlap in X
        if (pos.x + PLAYER_HALF_W <= platLeft || pos.x - PLAYER_HALF_W >= platRight) continue;

        if (p.type === 'oil') {
            // Oil slicks just apply speed boost, don't block
            if (player.vy <= 0 && pos.y <= platTop + 0.1 && pos.y >= platTop - 0.3) {
                if (Math.abs(player.vx) > 0.1) player.vx *= 1.5;
            }
            continue;
        }

        // Landing on top (falling down)
        if (player.vy <= 0 && pos.y <= platTop && pos.y >= platTop - Math.abs(player.vy * dt) - 0.05) {
            pos.y = platTop;
            player.vy = 0;
            player.onGround = true;
            continue;
        }

        // Ceiling collision (only for thick platforms, jumping up)
        if (p.h > 0.3 && player.vy > 0 &&
            pos.y + PLAYER_HEIGHT >= platBottom && pos.y + PLAYER_HEIGHT <= platBottom + player.vy * dt + 0.1 &&
            pos.y < platBottom) {
            pos.y = platBottom - PLAYER_HEIGHT;
            player.vy = 0;
        }
    }

    // ── Landing detection ──────────────────────────
    if (player.onGround && !player.wasOnGround && player.landingSquash <= 0) {
        player.landingSquash = 0.15; // landing animation duration
    }

    // ── Animations ─────────────────────────────────
    // Landing squash effect
    if (player.landingSquash > 0) {
        player.landingSquash -= dt;
        const t = player.landingSquash / 0.15;
        const squashY = 1 - t * 0.15;
        const squashX = 1 + t * 0.1;
        player.mesh.scale.set(squashX, squashY, squashX);
    } else {
        player.mesh.scale.set(1, 1, 1);
    }

    // Walk animation
    if (Math.abs(player.vx) > 0.1 && player.onGround) {
        player.walkTime += dt * 12;
        const swing = Math.sin(player.walkTime) * 0.6;
        player.parts.leftLeg.rotation.x = swing;
        player.parts.rightLeg.rotation.x = -swing;
        player.parts.leftArm.rotation.x = -swing * 0.5;
        player.parts.rightArm.rotation.x = swing * 0.5;
        player.parts.body.position.y = 0.78 + Math.abs(Math.sin(player.walkTime)) * 0.03;
    } else if (!player.onGround) {
        // Airborne pose
        const airLerp = 0.15;
        player.parts.leftArm.rotation.x += (-0.8 - player.parts.leftArm.rotation.x) * airLerp;
        player.parts.rightArm.rotation.x += (-0.8 - player.parts.rightArm.rotation.x) * airLerp;
        player.parts.leftLeg.rotation.x += (0.3 - player.parts.leftLeg.rotation.x) * airLerp;
        player.parts.rightLeg.rotation.x += (-0.3 - player.parts.rightLeg.rotation.x) * airLerp;
    } else {
        // Idle — lerp limbs back to neutral
        player.parts.leftLeg.rotation.x *= 0.85;
        player.parts.rightLeg.rotation.x *= 0.85;
        player.parts.leftArm.rotation.x *= 0.85;
        player.parts.rightArm.rotation.x *= 0.85;
        player.parts.body.position.y = 0.78;
    }

    player.mesh.rotation.y = player.facing > 0 ? 0 : Math.PI;

    if (player.invincible > 0) {
        player.invincible -= dt;
        player.mesh.visible = Math.sin(player.invincible * 20) > 0;
    } else {
        player.mesh.visible = true;
    }

    if (player.throwCooldown > 0) player.throwCooldown -= dt;

    return { jumped };
}

export function createWrench(scene, x, y, direction) {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({
        color: 0x888899, metalness: 0.8, roughness: 0.3,
    });

    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 0.08), mat);
    group.add(handle);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.08), mat);
    head.position.y = 0.25;
    group.add(head);
    const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.15, 0.08), mat);
    jaw.position.set(0, 0.32, 0);
    group.add(jaw);

    group.position.set(x, y, 0);
    group.scale.set(0.8, 0.8, 0.8);
    scene.add(group);

    return {
        mesh: group,
        x, y,
        vx: direction * 18,
        vy: 2,
        age: 0,
        alive: true,
    };
}

export function updateWrench(wrench, dt) {
    wrench.age += dt;
    wrench.x += wrench.vx * dt;
    wrench.y += wrench.vy * dt;
    wrench.vy -= 15 * dt;
    wrench.mesh.position.set(wrench.x, wrench.y, 0);
    wrench.mesh.rotation.z += dt * 15 * Math.sign(wrench.vx);
    if (wrench.age > 2) wrench.alive = false;
}

// Death animation — scatter player parts outward
export function startDeathAnimation(player) {
    player.deathTimer = 0;
    player.dying = true;
    // Store part scatter velocities
    player.deathParts = [];
    const partNames = ['leftArm', 'rightArm', 'leftLeg', 'rightLeg', 'head', 'body'];
    for (const name of partNames) {
        const part = player.parts[name];
        if (part) {
            player.deathParts.push({
                mesh: part,
                origPos: part.position.clone(),
                origRot: part.rotation.clone(),
                vx: (Math.random() - 0.5) * 6,
                vy: 3 + Math.random() * 5,
                vz: (Math.random() - 0.5) * 4,
                vr: (Math.random() - 0.5) * 10,
            });
        }
    }
}

export function updateDeathAnimation(player, dt) {
    if (!player.dying) return false;
    player.deathTimer += dt;

    for (const dp of player.deathParts) {
        dp.vy -= 20 * dt;
        dp.mesh.position.x += dp.vx * dt;
        dp.mesh.position.y += dp.vy * dt;
        dp.mesh.position.z += dp.vz * dt;
        dp.mesh.rotation.x += dp.vr * dt;
        dp.mesh.rotation.z += dp.vr * 0.7 * dt;
    }

    // Fade out over time
    const fade = Math.max(0, 1 - player.deathTimer / 0.8);
    player.mesh.traverse((child) => {
        if (child.isMesh && child.material) {
            child.material.transparent = true;
            child.material.opacity = fade;
        }
    });

    return player.deathTimer >= 0.8; // animation complete
}

export function resetDeathAnimation(player) {
    player.dying = false;
    player.deathTimer = 0;
    // Restore part positions and opacity
    if (player.deathParts) {
        for (const dp of player.deathParts) {
            dp.mesh.position.copy(dp.origPos);
            dp.mesh.rotation.copy(dp.origRot);
        }
        player.deathParts = [];
    }
    player.mesh.traverse((child) => {
        if (child.isMesh && child.material) {
            child.material.transparent = false;
            child.material.opacity = 1;
        }
    });
}

export function resetPlayer(player) {
    player.mesh.position.set(3, 1, 0);
    player.vx = 0;
    player.vy = 0;
    player.onGround = false;
    player.facing = 1;
    player.walkTime = 0;
    player.invincible = 2;
    player.throwCooldown = 0;
    player.alive = true;
    player.mesh.visible = true;
    player.mesh.rotation.y = 0;
    player.mesh.scale.set(1, 1, 1);
    player.coyoteTimer = 0;
    player.jumpBufferTimer = 0;
    player.holdingJump = false;
    player.wasOnGround = false;
    player.landingSquash = 0;
    player.dying = false;
    player.deathTimer = 0;
    player.deathParts = [];
}
