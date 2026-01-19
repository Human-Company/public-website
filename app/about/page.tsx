"use client";

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import * as THREE from 'three';

// --- Minimal Simplex Noise Implementation (Re-added for organic coastlines) ---
class SimplexNoise {
    private perm: number[];
    constructor() {
        this.perm = new Array(512);
        const p = new Array(256).fill(0).map((_, i) => i);
        for (let i = 255; i > 0; i--) {
            const r = Math.floor(Math.random() * (i + 1));
            [p[i], p[r]] = [p[r], p[i]];
        }
        for (let i = 0; i < 512; i++) this.perm[i] = p[i & 255];
    }
    dot(g: number[], x: number, y: number, z: number) {
        return g[0] * x + g[1] * y + g[2] * z;
    }
    noise3D(xin: number, yin: number, zin: number) {
        const grad3 = [[1, 1, 0], [-1, 1, 0], [1, -1, 0], [-1, -1, 0], [1, 0, 1], [-1, 0, 1], [1, 0, -1], [-1, 0, -1], [0, 1, 1], [0, -1, 1], [0, 1, -1], [0, -1, -1]];
        let n0, n1, n2, n3;
        const F3 = 1.0 / 3.0;
        const s = (xin + yin + zin) * F3;
        const i = Math.floor(xin + s);
        const j = Math.floor(yin + s);
        const k = Math.floor(zin + s);
        const G3 = 1.0 / 6.0;
        const t = (i + j + k) * G3;
        const X0 = i - t;
        const Y0 = j - t;
        const Z0 = k - t;
        const x0 = xin - X0;
        const y0 = yin - Y0;
        const z0 = zin - Z0;
        let i1, j1, k1;
        let i2, j2, k2;
        if (x0 >= y0) {
            if (y0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
            else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1; }
            else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1; }
        } else {
            if (y0 < z0) { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1; }
            else if (x0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1; }
            else { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
        }
        const x1 = x0 - i1 + G3;
        const y1 = y0 - j1 + G3;
        const z1 = z0 - k1 + G3;
        const x2 = x0 - i2 + 2.0 * G3;
        const y2 = y0 - j2 + 2.0 * G3;
        const z2 = z0 - k2 + 2.0 * G3;
        const x3 = x0 - 1.0 + 3.0 * G3;
        const y3 = y0 - 1.0 + 3.0 * G3;
        const z3 = z0 - 1.0 + 3.0 * G3;
        const ii = i & 255;
        const jj = j & 255;
        const kk = k & 255;
        const gi0 = this.perm[ii + this.perm[jj + this.perm[kk]]] % 12;
        const gi1 = this.perm[ii + i1 + this.perm[jj + j1 + this.perm[kk + k1]]] % 12;
        const gi2 = this.perm[ii + i2 + this.perm[jj + j2 + this.perm[kk + k2]]] % 12;
        const gi3 = this.perm[ii + 1 + this.perm[jj + 1 + this.perm[kk + 1]]] % 12;
        let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
        if (t0 < 0) n0 = 0.0; else { t0 *= t0; n0 = t0 * t0 * this.dot(grad3[gi0], x0, y0, z0); }
        let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
        if (t1 < 0) n1 = 0.0; else { t1 *= t1; n1 = t1 * t1 * this.dot(grad3[gi1], x1, y1, z1); }
        let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
        if (t2 < 0) n2 = 0.0; else { t2 *= t2; n2 = t2 * t2 * this.dot(grad3[gi2], x2, y2, z2); }
        let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
        if (t3 < 0) n3 = 0.0; else { t3 *= t3; n3 = t3 * t3 * this.dot(grad3[gi3], x3, y3, z3); }
        return 32.0 * (n0 + n1 + n2 + n3);
    }
}

export default function AboutPage() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // --- Color Palette ---
        const COLORS = {
            background: '#FFFFFF',
            ocean: new THREE.Color('#4A7C3F').multiplyScalar(0.2), // Dark dim green
            land: new THREE.Color('#2D5A27'),
            highlight: new THREE.Color('#E8B84A'),
        };

        // --- Scene Setup ---
        const scene = new THREE.Scene();
        // scene.background = null; // Transparent to let CSS show
        scene.fog = new THREE.FogExp2(COLORS.background, 0.025);

        // --- Camera ---
        const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 1000);
        // Smaller globe: move camera back
        camera.position.set(0, 0, 42);

        // --- Renderer ---
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        containerRef.current.appendChild(renderer.domElement);

        // --- High-Res Glyph Textures ---
        const createGlyphTexture = (char: string): THREE.CanvasTexture => {
            const size = 256;
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d')!;
            ctx.clearRect(0, 0, size, size);
            ctx.font = `900 ${size * 0.8}px "Courier New", monospace`;
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(char, size / 2, size / 2);
            const texture = new THREE.CanvasTexture(canvas);
            texture.minFilter = THREE.LinearMipmapLinearFilter;
            texture.magFilter = THREE.LinearFilter;
            return texture;
        };

        const tex0 = createGlyphTexture('0');
        const tex1 = createGlyphTexture('1');

        // --- Organic Continent Logic ---
        const simplex = new SimplexNoise();

        // Refined continent layout for Earth-like shape
        const continents = [
            // North America
            { lat: 50, lon: -100, r: 24 }, { lat: 35, lon: -90, r: 14 }, { lat: 60, lon: -120, r: 16 }, { lat: 40, lon: -120, r: 10 },
            // South America
            { lat: -15, lon: -60, r: 22 }, { lat: -35, lon: -65, r: 12 }, { lat: 0, lon: -55, r: 12 },
            // Africa
            { lat: 5, lon: 20, r: 30 }, { lat: -25, lon: 25, r: 16 }, { lat: 25, lon: 10, r: 18 },
            // Europe
            { lat: 50, lon: 15, r: 16 }, { lat: 45, lon: 35, r: 12 },
            // Asia
            { lat: 50, lon: 100, r: 35 }, { lat: 25, lon: 100, r: 25 }, { lat: 35, lon: 70, r: 22 }, { lat: 65, lon: 120, r: 20 }, { lat: 15, lon: 110, r: 15 },
            // Australia
            { lat: -25, lon: 135, r: 16 }, { lat: -20, lon: 145, r: 8 },
            // Antarctica
            { lat: -85, lon: 0, r: 25 }, { lat: -80, lon: 90, r: 15 },
            // Greenland / Misc
            { lat: 75, lon: -40, r: 12 }, { lat: 0, lon: 100, r: 8 }
        ];

        const isPointOnLand = (x: number, y: number, z: number): boolean => {
            for (const c of continents) {
                const cLat = c.lat * (Math.PI / 180);
                const cLon = c.lon * (Math.PI / 180);
                const cx = Math.cos(cLat) * Math.sin(cLon);
                const cy = Math.sin(cLat);
                const cz = Math.cos(cLat) * Math.cos(cLon);

                const dot = (x * cx + y * cy + z * cz);
                const angle = Math.acos(Math.max(-1, Math.min(1, dot))) * (180 / Math.PI);

                if (angle < c.r) {
                    const noise = simplex.noise3D(x * 3.0, y * 3.0, z * 3.0) * 8;
                    if (angle < c.r + noise) return true;
                }
            }
            return false;
        };

        // --- Generate Globe Particles ---
        const positions: number[] = [];
        const colors: number[] = [];
        const sizes: number[] = [];
        const opacities: number[] = [];
        const randoms: number[] = [];

        const particleCount = 60000;
        const globeRadius = 7.5; // Smaller radius
        const phi = Math.PI * (3 - Math.sqrt(5));

        for (let i = 0; i < particleCount; i++) {
            const y = 1 - (i / (particleCount - 1)) * 2;
            const radiusAtY = Math.sqrt(1 - y * y);
            const theta = phi * i;

            const x = Math.sin(theta) * radiusAtY;
            const z = Math.cos(theta) * radiusAtY;

            const onLand = isPointOnLand(x, y, z);
            const r = globeRadius + (onLand ? 0.08 : 0);

            positions.push(x * r, y * r, z * r);

            let col, size, alpha;
            if (onLand) {
                const isCity = Math.random() > 0.96;
                col = isCity ? COLORS.highlight : COLORS.land;
                size = isCity ? 0.48 : 0.42; // Larger digits
                alpha = 0.98;
                if (!isCity) col = col.clone().offsetHSL(0, 0, (Math.random() - 0.5) * 0.1);
            } else {
                col = COLORS.ocean;
                size = 0.32;
                alpha = 0.15;
            }

            colors.push(col.r, col.g, col.b);
            sizes.push(size);
            opacities.push(alpha);
            randoms.push(Math.random());
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
        geometry.setAttribute('opacity', new THREE.Float32BufferAttribute(opacities, 1));
        geometry.setAttribute('random', new THREE.Float32BufferAttribute(randoms, 1));

        const shaderMaterial = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uTex0: { value: tex0 },
                uTex1: { value: tex1 },
                uPixelRatio: { value: renderer.getPixelRatio() },
                uFogColor: { value: new THREE.Color(COLORS.background) },
                uFogDensity: { value: 0.02 }
            },
            vertexShader: `
                uniform float uTime;
                uniform float uPixelRatio;
                attribute float size;
                attribute float opacity;
                attribute float random;
                varying vec3 vColor;
                varying float vOpacity;
                varying float vRandom;
                varying float vFogDepth;

                void main() {
                    vColor = color;
                    vOpacity = opacity;
                    vRandom = random;
                    vec3 pos = position;
                    if (vOpacity > 0.5) {
                        float pulse = sin(uTime * 1.0 + random * 5.0) * 0.03;
                        pos += normalize(pos) * pulse;
                    }
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    vFogDepth = -mvPosition.z;
                    gl_Position = projectionMatrix * mvPosition;
                    gl_PointSize = size * (550.0 / -mvPosition.z) * uPixelRatio;
                }
            `,
            fragmentShader: `
                uniform sampler2D uTex0;
                uniform sampler2D uTex1;
                uniform vec3 uFogColor;
                uniform float uFogDensity;
                varying vec3 vColor;
                varying float vOpacity;
                varying float vRandom;
                varying float vFogDepth;
                void main() {
                    vec4 texColor;
                    if (mod(vRandom * 10.0, 2.0) < 1.0) {
                        texColor = texture2D(uTex0, gl_PointCoord);
                    } else {
                        texColor = texture2D(uTex1, gl_PointCoord);
                    }
                    if (texColor.a < 0.4) discard;
                    vec3 finalColor = vColor * texColor.rgb;
                    float fogFactor = 1.0 - exp(-uFogDensity * uFogDensity * vFogDepth * vFogDepth);
                    finalColor = mix(finalColor, uFogColor, clamp(fogFactor, 0.0, 1.0));
                    gl_FragColor = vec4(finalColor, texColor.a * vOpacity);
                }
            `,
            transparent: true,
            blending: THREE.NormalBlending,
            depthWrite: false,
            vertexColors: true
        });

        const points = new THREE.Points(geometry, shaderMaterial);
        scene.add(points);

        const mouse = new THREE.Vector2();
        const targetRot = new THREE.Vector2();
        const onMouseMove = (e: MouseEvent) => {
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
            targetRot.x = mouse.y * 0.3;
            targetRot.y = mouse.x * 0.3;
        };
        window.addEventListener('mousemove', onMouseMove);

        const clock = new THREE.Clock();
        const animate = () => {
            const time = clock.getElapsedTime();
            shaderMaterial.uniforms.uTime.value = time;
            points.rotation.y = time * 0.06 + targetRot.y - 1.0;
            points.rotation.x = targetRot.x * 0.5 + 0.2;
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };
        animate();

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
            shaderMaterial.uniforms.uPixelRatio.value = renderer.getPixelRatio();
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('resize', handleResize);
            if (containerRef.current) containerRef.current.innerHTML = '';
            geometry.dispose();
            shaderMaterial.dispose();
            renderer.dispose();
        };
    }, []);

    return (
        <div className="relative w-full h-screen overflow-hidden bg-[#FFFFFF]">
            <div className="absolute top-8 left-8 z-10">
                <Link href="/" className="font-semibold text-[15px] text-[#0D0D52] hover:opacity-60 transition-opacity">
                    ← Human Company
                </Link>
            </div>
            <div ref={containerRef} className="w-full h-full" />
        </div>
    );
}