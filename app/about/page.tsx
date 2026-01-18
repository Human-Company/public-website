"use client";

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import * as THREE from 'three';

export default function AboutPage() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // --- Setup Scene ---
        const scene = new THREE.Scene();
        scene.background = new THREE.Color('#F5F5F0'); // Matching the site bg
        // Add subtle fog for depth
        scene.fog = new THREE.FogExp2(0xF5F5F0, 0.035);

        // --- Camera ---
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
        camera.position.set(0, 0, 18);

        // --- Renderer ---
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        containerRef.current.appendChild(renderer.domElement);

        // --- Textures (Data Characters) ---
        const createCharTexture = (char: string) => {
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = 'transparent'; // Transparent bg
                ctx.clearRect(0, 0, 64, 64);
                ctx.font = 'bold 48px "Courier New", monospace'; // Monospace for "code" look
                ctx.fillStyle = '#1A1A1A'; // Dark gray text
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(char, 32, 32);
            }
            const texture = new THREE.CanvasTexture(canvas);
            return texture;
        };

        const tex0 = createCharTexture('0');
        const tex1 = createCharTexture('1');

        // --- Geometry: Jellyfish Bell ---
        const bellParticles0 = new THREE.BufferGeometry();
        const bellParticles1 = new THREE.BufferGeometry();

        const bellCount = 2500;
        const bellPos0: number[] = [];
        const bellPos1: number[] = [];

        const pushBellPoint = (x: number, y: number, z: number) => {
            if (Math.random() > 0.5) {
                bellPos1.push(x, y, z);
            } else {
                bellPos0.push(x, y, z);
            }
        };

        for (let i = 0; i < bellCount; i++) {
            const t = i / bellCount;
            const inclination = Math.acos(1 - 2 * t);
            const azimuth = 2 * Math.PI * 12 * t;

            let y = Math.cos(inclination) * 3;
            if (y < -1) continue;

            let r = Math.sqrt(1 - (y / 3) ** 2) * 4;
            r += (Math.random() - 0.5) * 0.15;

            const x = r * Math.cos(azimuth);
            const z = r * Math.sin(azimuth);

            pushBellPoint(x, y, z);
        }

        bellParticles0.setAttribute('position', new THREE.Float32BufferAttribute(bellPos0, 3));
        bellParticles1.setAttribute('position', new THREE.Float32BufferAttribute(bellPos1, 3));

        // --- Geometry: Tentacles ---
        const tentacleParticles0 = new THREE.BufferGeometry();
        const tentacleParticles1 = new THREE.BufferGeometry();
        const tenPos0: number[] = [];
        const tenPos1: number[] = [];

        const tentacleCount = 25;
        const particlesPerTentacle = 50;

        for (let t = 0; t < tentacleCount; t++) {
            const angle = (t / tentacleCount) * Math.PI * 2;
            const radius = 3.6 + (Math.random() * 0.4);
            const startX = Math.cos(angle) * radius;
            const startZ = Math.sin(angle) * radius;
            const startY = -0.8;

            for (let i = 0; i < particlesPerTentacle; i++) {
                const y = startY - (i * 0.25);
                const curveX = Math.sin(i * 0.1) * 0.5;
                const x = startX + curveX + (Math.random() - 0.5) * 0.3;
                const z = startZ + (Math.random() - 0.5) * 0.3;

                if (Math.random() > 0.5) {
                    tenPos1.push(x, y, z);
                } else {
                    tenPos0.push(x, y, z);
                }
            }
        }

        tentacleParticles0.setAttribute('position', new THREE.Float32BufferAttribute(tenPos0, 3));
        tentacleParticles1.setAttribute('position', new THREE.Float32BufferAttribute(tenPos1, 3));

        const addInitPos = (geo: THREE.BufferGeometry) => {
            const pos = geo.attributes.position.array;
            geo.setAttribute('initialPosition', new THREE.Float32BufferAttribute(pos, 3));
            const offsets = new Float32Array(geo.attributes.position.count);
            for (let i = 0; i < offsets.length; i++) offsets[i] = Math.random() * 10;
            geo.setAttribute('randomOffset', new THREE.BufferAttribute(offsets, 1));
        };
        addInitPos(bellParticles0);
        addInitPos(bellParticles1);
        addInitPos(tentacleParticles0);
        addInitPos(tentacleParticles1);

        // --- Materials ---
        const material0 = new THREE.PointsMaterial({
            size: 0.25,
            map: tex0,
            transparent: true,
            opacity: 0.9,
            color: 0x1A1A1A,
            sizeAttenuation: true,
            depthWrite: false,
        });

        const material1 = new THREE.PointsMaterial({
            size: 0.25,
            map: tex1,
            transparent: true,
            opacity: 0.9,
            color: 0x1A1A1A,
            sizeAttenuation: true,
            depthWrite: false,
        });

        const injectShader = (shader: any) => {
            shader.uniforms.uTime = { value: 0 };
            shader.uniforms.uMouse = { value: new THREE.Vector2(0, 0) };
            shader.vertexShader = `
            uniform float uTime;
            uniform vec2 uMouse;
            attribute vec3 initialPosition;
            attribute float randomOffset;
            ${shader.vertexShader}
        `.replace(
                '#include <begin_vertex>',
                `
            vec3 transformed = initialPosition;
            
            // 1. BREATHING
            float pulse = sin(uTime * 2.0 + transformed.y) * 0.15;
            // Only pulse mostly the bell
            if (transformed.y > -2.0) {
                 transformed += normalize(transformed) * pulse * 0.3; 
            }
            
            // 2. TENTACLE SWAY
            float swayStrength = smoothstep(0.0, -8.0, transformed.y); 
            float wave0 = sin(uTime * 1.5 + transformed.y * 0.5 + randomOffset) * 0.4;
            float wave1 = cos(uTime * 1.2 + transformed.y * 0.3) * 0.4;
            
            transformed.x += wave0 * swayStrength;
            transformed.z += wave1 * swayStrength;
            
            // 3. MOUSE INFLUENCE
            float rotX = -uMouse.y * 0.3; 
            float rotZ = uMouse.x * 0.3;
            
            float ty = transformed.y;
            float tz = transformed.z;
            transformed.y = ty * cos(rotX) - tz * sin(rotX);
            transformed.z = ty * sin(rotX) + tz * cos(rotX);
            
            float tx = transformed.x;
            ty = transformed.y;
            transformed.x = tx * cos(rotZ) - ty * sin(rotZ);
            transformed.y = tx * sin(rotZ) + ty * cos(rotZ);
            `
            );
        };

        const matBell0 = material0.clone();
        matBell0.onBeforeCompile = (shader) => { injectShader(shader); (matBell0 as any).userData.shader = shader; };
        const matBell1 = material1.clone();
        matBell1.onBeforeCompile = (shader) => { injectShader(shader); (matBell1 as any).userData.shader = shader; };

        const sysBell0 = new THREE.Points(bellParticles0, matBell0);
        const sysBell1 = new THREE.Points(bellParticles1, matBell1);
        const sysTen0 = new THREE.Points(tentacleParticles0, matBell0);
        const sysTen1 = new THREE.Points(tentacleParticles1, matBell1);

        const group = new THREE.Group();
        group.add(sysBell0, sysBell1, sysTen0, sysTen1);
        scene.add(group);

        const mouse = new THREE.Vector2();
        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener('mousemove', handleMouseMove);

        const clock = new THREE.Clock();

        const animate = () => {
            const time = clock.getElapsedTime();

            [matBell0, matBell1].forEach((mat: any) => {
                const shader = mat.userData.shader;
                if (shader) {
                    shader.uniforms.uTime.value = time;
                    shader.uniforms.uMouse.value.lerp(mouse, 0.05);
                }
            });

            group.rotation.y = time * 0.1;

            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };
        animate();

        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            if (containerRef.current) {
                containerRef.current.innerHTML = '';
            }
            renderer.dispose();
        };
    }, []);

    return (
        <div className="relative w-full h-screen overflow-hidden bg-[#F5F5F0]">
            <div className="absolute top-8 left-8 z-10">
                <Link href="/" className="font-semibold text-[15px] text-[#1a1a1a] hover:opacity-60 transition-opacity">
                    ← Human Company
                </Link>
            </div>

            <div ref={containerRef} className="w-full h-full" />
        </div>
    );
}
