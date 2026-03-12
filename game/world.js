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
const darkBrickMat = new THREE.MeshStandardMaterial({ color: 0x5A3010, roughness: 0.9 });
const pipeMat = new THREE.MeshStandardMaterial({ color: 0x667788, roughness: 0.4, metalness: 0.7 });

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
        parallaxLayers: [], // { group, factor } — lower factor = farther back
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

    // ─── Parallax Background Layers ─────────────
    // Layer 0 (far): distant back wall with window shapes and posters
    const farLayer = new THREE.Group();
    farLayer.position.z = -8;
    for (let x = -10; x < 220; x += 12) {
        // Brick pillar columns on the far wall
        const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.8, 14, 0.3), darkBrickMat);
        pillar.position.set(x, 7, 0);
        farLayer.add(pillar);
        // Faded window/vent shapes
        if (x % 24 === 0) {
            const windowFrame = new THREE.Mesh(
                new THREE.BoxGeometry(3, 2, 0.1),
                new THREE.MeshStandardMaterial({ color: 0x445566, roughness: 0.6, metalness: 0.3 })
            );
            windowFrame.position.set(x + 6, 9, 0.2);
            farLayer.add(windowFrame);
            // Dirty glass
            const glass = new THREE.Mesh(
                new THREE.BoxGeometry(2.6, 1.6, 0.05),
                new THREE.MeshStandardMaterial({
                    color: 0x334455, roughness: 0.2, metalness: 0.1,
                    transparent: true, opacity: 0.4,
                    emissive: 0x223344, emissiveIntensity: 0.2,
                })
            );
            glass.position.set(x + 6, 9, 0.25);
            farLayer.add(glass);
        }
    }
    scene.add(farLayer);
    world.parallaxLayers.push({ group: farLayer, factor: 0.15 });

    // Layer 1 (mid): shelving units and cabinets along back wall
    const midLayer = new THREE.Group();
    midLayer.position.z = -5.5;
    for (let x = 2; x < 210; x += 18) {
        // Metal shelving unit
        const shelfUnit = new THREE.Group();
        const shelfH = 5 + Math.random() * 2;
        // Uprights
        for (const sx of [-1.2, 1.2]) {
            const upright = new THREE.Mesh(new THREE.BoxGeometry(0.1, shelfH, 0.4), metalMat);
            upright.position.set(sx, shelfH / 2, 0);
            shelfUnit.add(upright);
        }
        // Shelf boards
        const shelfCount = Math.floor(shelfH / 1.2);
        for (let s = 0; s < shelfCount; s++) {
            const shelf = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.08, 0.5), woodMat);
            shelf.position.set(0, 0.8 + s * 1.2, 0);
            shelfUnit.add(shelf);
            // Random items on shelves
            const itemCount = Math.floor(Math.random() * 3) + 1;
            for (let it = 0; it < itemCount; it++) {
                const itemH = 0.15 + Math.random() * 0.4;
                const itemW = 0.15 + Math.random() * 0.3;
                const itemColor = [0x884422, 0x666666, 0x996633, 0x445566, 0xAA4444][Math.floor(Math.random() * 5)];
                const item = new THREE.Mesh(
                    new THREE.BoxGeometry(itemW, itemH, 0.2),
                    new THREE.MeshStandardMaterial({ color: itemColor, roughness: 0.8 })
                );
                item.position.set(-0.8 + it * 0.7 + Math.random() * 0.3, 0.8 + s * 1.2 + itemH / 2 + 0.04, 0.1);
                shelfUnit.add(item);
            }
        }
        shelfUnit.position.set(x + Math.random() * 5, 0, 0);
        midLayer.add(shelfUnit);
    }
    // Oil drums in mid-ground
    for (let x = 8; x < 200; x += 30 + Math.random() * 15) {
        const drumGroup = new THREE.Group();
        const drumCount = Math.floor(Math.random() * 3) + 1;
        for (let d = 0; d < drumCount; d++) {
            const drum = new THREE.Mesh(
                new THREE.CylinderGeometry(0.4, 0.4, 1.0, 8),
                new THREE.MeshStandardMaterial({
                    color: [0xCC3333, 0x3366AA, 0x448844][d % 3],
                    roughness: 0.6, metalness: 0.3,
                })
            );
            drum.position.set(d * 0.9, 0.5, 0);
            drumGroup.add(drum);
        }
        drumGroup.position.set(x, 0, 0);
        midLayer.add(drumGroup);
    }
    scene.add(midLayer);
    world.parallaxLayers.push({ group: midLayer, factor: 0.35 });

    // Layer 2 (near foreground): pipes and conduits running along ceiling/walls
    const nearLayer = new THREE.Group();
    nearLayer.position.z = 3;
    // Horizontal pipes along the top
    for (const pipeY of [10, 11.5]) {
        const pipe = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12, 0.12, 220, 6),
            pipeMat
        );
        pipe.rotation.z = Math.PI / 2;
        pipe.position.set(100, pipeY, 0);
        nearLayer.add(pipe);
        // Pipe brackets
        for (let x = 0; x < 210; x += 10) {
            const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.3, 0.06), metalMat);
            bracket.position.set(x, pipeY + 0.15, 0);
            nearLayer.add(bracket);
        }
    }
    // Vertical pipe drops
    for (let x = 15; x < 200; x += 35) {
        const drop = new THREE.Mesh(
            new THREE.CylinderGeometry(0.1, 0.1, 4, 6),
            pipeMat
        );
        drop.position.set(x, 12, 0);
        nearLayer.add(drop);
        // Valve wheel
        const valve = new THREE.Mesh(
            new THREE.TorusGeometry(0.2, 0.04, 6, 8),
            new THREE.MeshStandardMaterial({ color: 0xCC3333, roughness: 0.5, metalness: 0.4 })
        );
        valve.position.set(x, 10.5, 0.15);
        nearLayer.add(valve);
    }
    scene.add(nearLayer);
    world.parallaxLayers.push({ group: nearLayer, factor: -0.1 }); // negative = foreground parallax

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
    // Tool pegboards with varied tools (wrenches, screwdrivers, hammers)
    for (let x = 5; x < 200; x += 25) {
        const board = new THREE.Mesh(new THREE.BoxGeometry(4, 3, 0.15), woodMat);
        board.position.set(x, 5, -3.5);
        scene.add(board);
        // Board frame
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x5A4010, roughness: 0.8 });
        for (const [fw, fh, fx, fy] of [[4.1, 0.1, 0, 1.5], [4.1, 0.1, 0, -1.5], [0.1, 3, -2, 0], [0.1, 3, 2, 0]]) {
            const frame = new THREE.Mesh(new THREE.BoxGeometry(fw, fh, 0.2), frameMat);
            frame.position.set(x + fx, 5 + fy, -3.42);
            scene.add(frame);
        }
        // Tool silhouettes — varied shapes
        const toolShapes = [
            { w: 0.06, h: 0.6, headW: 0.2, headH: 0.1 }, // wrench
            { w: 0.05, h: 0.5, headW: 0.15, headH: 0.15 }, // screwdriver
            { w: 0.08, h: 0.4, headW: 0.25, headH: 0.2 }, // hammer
            { w: 0.06, h: 0.55, headW: 0.18, headH: 0.08 }, // ratchet
        ];
        for (let i = 0; i < 6; i++) {
            const shape = toolShapes[i % toolShapes.length];
            const toolGrp = new THREE.Group();
            const handle = new THREE.Mesh(new THREE.BoxGeometry(shape.w, shape.h, 0.05), metalMat);
            toolGrp.add(handle);
            const head = new THREE.Mesh(new THREE.BoxGeometry(shape.headW, shape.headH, 0.06), metalMat);
            head.position.y = shape.h / 2;
            toolGrp.add(head);
            toolGrp.position.set(x - 1.5 + i * 0.6, 5 + (Math.random() - 0.5) * 1.2, -3.38);
            toolGrp.rotation.z = (Math.random() - 0.5) * 0.2;
            scene.add(toolGrp);
        }
    }

    // Tire stacks with varied sizes
    for (const tx of [10, 42, 65, 105, 155]) {
        const stackHeight = 2 + Math.floor(Math.random() * 2);
        for (let stack = 0; stack < stackHeight; stack++) {
            const tireSize = 0.4 + Math.random() * 0.2;
            const tire = new THREE.Mesh(new THREE.TorusGeometry(tireSize, 0.2, 8, 12), tireMat);
            tire.position.set(tx + (Math.random() - 0.5) * 0.1, 0.4 + stack * 0.45, -2.5);
            tire.rotation.x = Math.PI / 2;
            scene.add(tire);
        }
    }

    // Workbench clutter on metal platforms
    for (const pd of PLATFORM_DATA) {
        if (pd.type !== 'metal' || pd.y <= 0.5) continue;
        // Random items on workbenches
        const itemCount = Math.floor(Math.random() * 4) + 2;
        for (let i = 0; i < itemCount; i++) {
            const ix = pd.x - pd.w / 2 + 0.3 + Math.random() * (pd.w - 0.6);
            const iy = pd.y + pd.h / 2;
            const itemType = Math.floor(Math.random() * 4);
            if (itemType === 0) {
                // Small box
                const box = new THREE.Mesh(
                    new THREE.BoxGeometry(0.2 + Math.random() * 0.15, 0.15 + Math.random() * 0.1, 0.15),
                    new THREE.MeshStandardMaterial({ color: [0x884422, 0x666655, 0x445566][Math.floor(Math.random() * 3)], roughness: 0.8 })
                );
                box.position.set(ix, iy + 0.1, 0.3);
                scene.add(box);
            } else if (itemType === 1) {
                // Can/bottle
                const can = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.06, 0.06, 0.2, 6),
                    new THREE.MeshStandardMaterial({ color: [0xCC3333, 0x336699, 0x339933][Math.floor(Math.random() * 3)], roughness: 0.5, metalness: 0.3 })
                );
                can.position.set(ix, iy + 0.12, 0.2);
                scene.add(can);
            } else if (itemType === 2) {
                // Rag/cloth
                const rag = new THREE.Mesh(
                    new THREE.BoxGeometry(0.25, 0.03, 0.2),
                    new THREE.MeshStandardMaterial({ color: 0x998877, roughness: 0.95 })
                );
                rag.position.set(ix, iy + 0.02, 0.1);
                rag.rotation.y = Math.random() * Math.PI;
                scene.add(rag);
            }
        }
    }

    // Floor grime patches (dark spots on concrete)
    for (let x = 2; x < 200; x += 8 + Math.random() * 10) {
        const grime = new THREE.Mesh(
            new THREE.PlaneGeometry(1.5 + Math.random() * 2, 1 + Math.random()),
            new THREE.MeshStandardMaterial({
                color: 0x1A1510, roughness: 0.95,
                transparent: true, opacity: 0.3,
            })
        );
        grime.rotation.x = -Math.PI / 2;
        grime.rotation.z = Math.random() * Math.PI;
        grime.position.set(x, 0.01, Math.random() * 2 - 1);
        scene.add(grime);
    }

    // Background trucks
    for (const [tx, tz] of [[20, -3], [70, -3.5], [130, -3]]) {
        createBackgroundTruck(scene, tx, tz);
    }

    // ─── Lighting ────────────────────────────────
    // Dim ambient for contrast — let spotlights create pools of light
    scene.add(new THREE.AmbientLight(0x8B7755, 0.6));
    scene.add(new THREE.HemisphereLight(0xFFDDBB, 0x443322, 0.5));

    const shadowLights = new Set([50, 110, 185]); // Only 3 lights cast shadows
    for (const lx of [5, 20, 35, 50, 65, 80, 95, 110, 125, 140, 155, 170, 185, 200]) {
        // Main hanging lamp — warm pool of light
        const light = new THREE.PointLight(0xFFCC88, 4.0, 25);
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

        // Downward-facing spot for focused light pool on ground
        const spot = new THREE.SpotLight(0xFFDD99, 2.5, 18, Math.PI / 5, 0.6, 1.5);
        spot.position.set(lx, 12, 2);
        spot.target.position.set(lx, 0, 1);
        scene.add(spot);
        scene.add(spot.target);

        // Light fixture mesh (industrial pendant lamp)
        const fixtureGroup = new THREE.Group();
        // Shade (cone shape via box approximation)
        const shade = new THREE.Mesh(
            new THREE.CylinderGeometry(0.2, 0.8, 0.4, 8),
            new THREE.MeshStandardMaterial({ color: 0x445544, roughness: 0.7, metalness: 0.5 })
        );
        shade.position.y = 0;
        fixtureGroup.add(shade);
        // Bulb glow
        const bulb = new THREE.Mesh(
            new THREE.SphereGeometry(0.15, 6, 6),
            new THREE.MeshStandardMaterial({
                color: 0xFFFFFF, emissive: 0xFFCC88, emissiveIntensity: 3.0,
            })
        );
        bulb.position.y = -0.15;
        fixtureGroup.add(bulb);
        fixtureGroup.position.set(lx, 13, 2);
        scene.add(fixtureGroup);

        const chain = new THREE.Mesh(new THREE.BoxGeometry(0.03, 1.2, 0.03), metalMat);
        chain.position.set(lx, 13.7, 2);
        scene.add(chain);
    }

    // Spot lights on workbench/important areas for dramatic focus
    for (const wx of [35, 58, 100, 130]) {
        const workLight = new THREE.SpotLight(0xFFEECC, 1.5, 12, Math.PI / 8, 0.4, 1.8);
        workLight.position.set(wx, 8, 3);
        workLight.target.position.set(wx, 0, 0);
        scene.add(workLight);
        scene.add(workLight.target);
    }

    // Boss arena dramatic lighting — red/orange accent
    const bossSpot1 = new THREE.SpotLight(0xFF6633, 3, 25, Math.PI / 6, 0.5, 1.2);
    bossSpot1.position.set(185, 12, 4);
    bossSpot1.target.position.set(185, 0, 0);
    scene.add(bossSpot1);
    scene.add(bossSpot1.target);

    const bossSpot2 = new THREE.SpotLight(0xFF4411, 2, 20, Math.PI / 5, 0.5, 1.5);
    bossSpot2.position.set(180, 10, -2);
    bossSpot2.target.position.set(185, 1, 0);
    scene.add(bossSpot2);
    scene.add(bossSpot2.target);

    const dirLight = new THREE.DirectionalLight(0xFFEEDD, 0.6);
    dirLight.position.set(10, 15, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Initialize falling block pool
    initBlockPool(scene);

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

// ─── Falling Block Pool ─────────────────────────
const BLOCK_POOL_SIZE = 20;
const blockPool = [];
let blockPoolScene = null;

function initBlockPool(scene) {
    blockPoolScene = scene;
    for (let i = 0; i < BLOCK_POOL_SIZE; i++) {
        const mesh = new THREE.Mesh(fallingBlockGeo, fallingBlockMat);
        mesh.castShadow = true;
        mesh.visible = false;
        scene.add(mesh);
        blockPool.push(mesh);
    }
}

function acquireBlock() {
    for (const mesh of blockPool) {
        if (!mesh.visible) {
            mesh.visible = true;
            mesh.rotation.set(0, 0, 0);
            return mesh;
        }
    }
    // Pool exhausted — reuse oldest visible (first in pool)
    return null;
}

function releaseBlock(mesh) {
    mesh.visible = false;
    mesh.position.y = -100;
}

// ─── Update World ────────────────────────────────────
export function updateWorld(world, playerX, dt, scene) {
    const time = Date.now() * 0.001;

    // Parallax scrolling — shift each layer relative to player position
    for (const layer of world.parallaxLayers) {
        layer.group.position.x = -playerX * layer.factor;
    }

    // Animate collectibles (bob, rotate, pulse glow) — skip if far from player
    const CULL_DIST = 25;
    for (const c of world.collectibles) {
        if (c.collected) continue;
        if (Math.abs(c.x - playerX) > CULL_DIST) {
            if (c.light) c.light.intensity = 0;
            continue;
        }
        c.mesh.position.y = c.baseY + Math.sin(time * 2 + c.x) * 0.15;
        c.mesh.rotation.y += dt * 2;
        // Pulsing scale for visual pop
        const pulse = 1 + Math.sin(time * 4 + c.x * 0.5) * 0.08;
        c.mesh.scale.set(pulse, pulse, pulse);
        // Pulsing light intensity
        if (c.light) c.light.intensity = 0.4 + Math.sin(time * 3 + c.x) * 0.2;
    }

    // Spawn falling engine blocks (skip if far from player)
    for (const obs of world.obstacles) {
        if (Math.abs(obs.x - playerX) > 20) continue;
        obs.timer -= dt;
        if (obs.timer <= 0) {
            obs.timer = obs.interval;
            const block = acquireBlock();
            if (block) {
                block.position.set(obs.x + (Math.random() - 0.5) * 2, obs.spawnY, 0);
                world.fallingBlocks.push({ mesh: block, vy: 0, age: 0 });
            }
        }
    }

    // Update falling blocks (swap-and-pop removal)
    let fbi = 0;
    while (fbi < world.fallingBlocks.length) {
        const fb = world.fallingBlocks[fbi];
        fb.vy -= 15 * dt;
        fb.mesh.position.y += fb.vy * dt;
        fb.mesh.rotation.x += dt * 3;
        fb.mesh.rotation.z += dt * 2;
        fb.age += dt;
        if (fb.mesh.position.y < -2 || fb.age > 5) {
            releaseBlock(fb.mesh);
            world.fallingBlocks[fbi] = world.fallingBlocks[world.fallingBlocks.length - 1];
            world.fallingBlocks.pop();
            continue;
        }
        fbi++;
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
        releaseBlock(fb.mesh);
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
