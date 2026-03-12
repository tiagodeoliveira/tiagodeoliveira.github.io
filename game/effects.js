// effects.js - Particle systems for dust, sparks, exhaust, impacts
import * as THREE from 'three';

const dustTexture = createCircleTexture();

function createCircleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const c = canvas.getContext('2d');
    const gradient = c.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.5, 'rgba(255,255,255,0.5)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = gradient;
    c.fillRect(0, 0, 32, 32);
    const tex = new THREE.CanvasTexture(canvas);
    return tex;
}

// ─── Dust Motes ──────────────────────────────────────
export class DustParticles {
    constructor(scene, count = 300) {
        this.count = count;
        const geo = new THREE.BufferGeometry();
        this.positions = new Float32Array(count * 3);
        this.velocities = new Float32Array(count * 3);
        this.basePositions = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            this.positions[i3] = Math.random() * 200 - 5;
            this.positions[i3 + 1] = Math.random() * 12;
            this.positions[i3 + 2] = Math.random() * 8 - 4;
            this.basePositions[i3] = this.positions[i3];
            this.basePositions[i3 + 1] = this.positions[i3 + 1];
            this.basePositions[i3 + 2] = this.positions[i3 + 2];
            this.velocities[i3] = (Math.random() - 0.5) * 0.3;
            this.velocities[i3 + 1] = Math.random() * 0.2;
            this.velocities[i3 + 2] = (Math.random() - 0.5) * 0.2;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));

        const mat = new THREE.PointsMaterial({
            size: 0.08,
            map: dustTexture,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            color: 0xFFDDAA,
        });

        this.points = new THREE.Points(geo, mat);
        scene.add(this.points);
    }

    update(dt) {
        for (let i = 0; i < this.count; i++) {
            const i3 = i * 3;
            this.positions[i3] += this.velocities[i3] * dt;
            this.positions[i3 + 1] += this.velocities[i3 + 1] * dt;
            this.positions[i3 + 2] += this.velocities[i3 + 2] * dt;
            this.positions[i3] += (this.basePositions[i3] - this.positions[i3]) * 0.01;
            this.positions[i3 + 1] += (this.basePositions[i3 + 1] - this.positions[i3 + 1]) * 0.01;
            this.positions[i3 + 2] += (this.basePositions[i3 + 2] - this.positions[i3 + 2]) * 0.01;
            this.positions[i3 + 1] += Math.sin(Date.now() * 0.001 + i) * 0.002;
        }
        this.points.geometry.attributes.position.needsUpdate = true;
    }
}

// ─── Spark Burst ─────────────────────────────────────
export class SparkSystem {
    constructor(scene, maxParticles = 200) {
        this.scene = scene;
        this.maxParticles = maxParticles;
        this.particles = [];

        const geo = new THREE.BufferGeometry();
        this.positions = new Float32Array(maxParticles * 3);
        this.colors = new Float32Array(maxParticles * 3);
        this.sizes = new Float32Array(maxParticles);

        geo.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
        geo.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));
        geo.setAttribute('size', new THREE.BufferAttribute(this.sizes, 1));

        const mat = new THREE.PointsMaterial({
            size: 0.15,
            map: dustTexture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            vertexColors: true,
            sizeAttenuation: true,
        });

        this.points = new THREE.Points(geo, mat);
        scene.add(this.points);
    }

    emit(x, y, z, count, color = { r: 1, g: 0.8, b: 0.3 }, speed = 5, gravity = -10) {
        for (let i = 0; i < count && this.particles.length < this.maxParticles; i++) {
            const angle = Math.random() * Math.PI * 2;
            const upAngle = Math.random() * Math.PI * 0.6 + Math.PI * 0.2;
            const spd = speed * (0.5 + Math.random() * 0.5);
            this.particles.push({
                x, y, z,
                vx: Math.cos(angle) * Math.sin(upAngle) * spd,
                vy: Math.cos(upAngle) * spd + 2,
                vz: Math.sin(angle) * Math.sin(upAngle) * spd * 0.3,
                age: 0,
                maxAge: 0.3 + Math.random() * 0.7,
                r: color.r, g: color.g, b: color.b,
                gravity,
            });
        }
    }

    update(dt) {
        // Swap-and-pop removal for O(1) instead of O(n) splice
        let i = 0;
        while (i < this.particles.length) {
            const p = this.particles[i];
            p.age += dt;
            if (p.age >= p.maxAge) {
                // Swap with last element and pop
                this.particles[i] = this.particles[this.particles.length - 1];
                this.particles.pop();
                continue;
            }
            p.vy += p.gravity * dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.z += p.vz * dt;
            i++;
        }

        for (let i = 0; i < this.maxParticles; i++) {
            const i3 = i * 3;
            if (i < this.particles.length) {
                const p = this.particles[i];
                const life = 1 - p.age / p.maxAge;
                this.positions[i3] = p.x;
                this.positions[i3 + 1] = p.y;
                this.positions[i3 + 2] = p.z;
                this.colors[i3] = p.r * life;
                this.colors[i3 + 1] = p.g * life;
                this.colors[i3 + 2] = p.b * life;
                this.sizes[i] = life * 0.2;
            } else {
                this.positions[i3] = 0;
                this.positions[i3 + 1] = -100;
                this.positions[i3 + 2] = 0;
                this.sizes[i] = 0;
            }
        }

        this.points.geometry.attributes.position.needsUpdate = true;
        this.points.geometry.attributes.color.needsUpdate = true;
    }
}

// ─── Welding Spark Emitter ───────────────────────────
export class WeldingSparks {
    constructor(scene, sparkSystem) {
        this.sparkSystem = sparkSystem;
        this.emitters = [];
    }

    addEmitter(x, y) {
        this.emitters.push({ x, y, timer: 0, interval: 0.05 });
    }

    update(dt, cameraX) {
        for (const e of this.emitters) {
            if (Math.abs(e.x - cameraX) > 25) continue;
            e.timer -= dt;
            if (e.timer <= 0) {
                e.timer = e.interval;
                this.sparkSystem.emit(
                    e.x + (Math.random() - 0.5) * 0.5,
                    e.y, (Math.random() - 0.5) * 0.5,
                    2, { r: 1, g: 0.9, b: 0.5 }, 3, -8
                );
            }
        }
    }
}
