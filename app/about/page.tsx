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
        scene.fog = new THREE.FogExp2(0xF5F5F0, 0.015);

        // --- Camera ---
        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(35, 35, 35);
        camera.lookAt(0, 0, 0);

        // --- Renderer ---
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        containerRef.current.appendChild(renderer.domElement);

        // --- Textures (Data Characters) ---
        const createCharTexture = (char: string) => {
            const canvas = document.createElement('canvas');
            canvas.width = 128;
            canvas.height = 128;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, 128, 128);
                ctx.font = 'bold 96px "Courier New", monospace';
                ctx.fillStyle = '#FFFFFF';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(char, 64, 64);
            }
            return new THREE.CanvasTexture(canvas);
        };

        const tex0 = createCharTexture('0');
        const tex1 = createCharTexture('1');

        // --- Geometry Construction ---
        const agentGeo0 = new THREE.BufferGeometry();
        const agentGeo1 = new THREE.BufferGeometry();
        const staticGeo0 = new THREE.BufferGeometry();
        const staticGeo1 = new THREE.BufferGeometry();

        const agentPos0: number[] = [];
        const agentPos1: number[] = [];
        const staticPos0: number[] = [];
        const staticPos1: number[] = [];
        const agentOffsets0: number[] = [];
        const agentOffsets1: number[] = [];

        // 1. Create Agents
        const createAgent = (x: number, z: number, id: number) => {
            const particleCount = 12; 
            for (let i = 0; i < particleCount; i++) {
                const px = x + (Math.random() - 0.5) * 1.5;
                const py = Math.random() * 2.5;
                const pz = z + (Math.random() - 0.5) * 1.5;

                if (Math.random() > 0.5) {
                    agentPos1.push(px, py, pz);
                    agentOffsets1.push(id);
                } else {
                    agentPos0.push(px, py, pz);
                    agentOffsets0.push(id);
                }
            }
        };

        for (let i = 0; i < 80; i++) {
            createAgent((Math.random() - 0.5) * 50, (Math.random() - 0.5) * 50, i);
        }

        // 2. Create Trees
        const createTree = (x: number, z: number) => {
            for(let y=0; y<4; y+=0.6) {
                 if (Math.random() > 0.5) staticPos1.push(x, y, z);
                 else staticPos0.push(x, y, z);
            }
            const leafCount = 40;
            for(let i=0; i<leafCount; i++) {
                const r = 2.5 * Math.pow(Math.random(), 0.5);
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                const lx = x + r * Math.sin(phi) * Math.cos(theta);
                const ly = 5.0 + r * Math.sin(phi) * Math.sin(theta);
                const lz = z + r * Math.cos(phi);
                if (Math.random() > 0.5) staticPos1.push(lx, ly, lz);
                else staticPos0.push(lx, ly, lz);
            }
        };

        for (let i = 0; i < 30; i++) {
             const x = (Math.random() - 0.5) * 60;
             const z = (Math.random() - 0.5) * 60;
             if (Math.abs(x) < 8 && Math.abs(z) < 8) continue;
             createTree(x, z);
        }

        agentGeo0.setAttribute('position', new THREE.Float32BufferAttribute(agentPos0, 3));
        agentGeo0.setAttribute('agentId', new THREE.Float32BufferAttribute(agentOffsets0, 1));
        agentGeo1.setAttribute('position', new THREE.Float32BufferAttribute(agentPos1, 3));
        agentGeo1.setAttribute('agentId', new THREE.Float32BufferAttribute(agentOffsets1, 1));
        staticGeo0.setAttribute('position', new THREE.Float32BufferAttribute(staticPos0, 3));
        staticGeo1.setAttribute('position', new THREE.Float32BufferAttribute(staticPos1, 3));

        // --- Materials ---
        const baseMaterial = new THREE.PointsMaterial({
            size: 1.2,
            transparent: true,
            opacity: 0.9,
            color: 0x1A1A1A,
            sizeAttenuation: true,
            depthWrite: false,
            alphaTest: 0.05,
        });

        const injectStaticShader = (shader: any) => {
            shader.uniforms.uTime = { value: 0 };
            shader.vertexShader = `uniform float uTime;\n` + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace(
                '#include <begin_vertex>',
                `
                vec3 transformed = vec3(position);
                float wind = sin(uTime * 1.0 + position.x * 0.2 + position.z * 0.2) * 0.3;
                if (position.y > 1.0) {
                    transformed.x += wind * (position.y - 1.0);
                }
                `
            );
        };

        const injectAgentShader = (shader: any) => {
            shader.uniforms.uTime = { value: 0 };
            shader.vertexShader = `uniform float uTime;\nattribute float agentId;\n` + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace(
                '#include <begin_vertex>',
                `
                vec3 transformed = vec3(position);
                float angle = uTime * 0.4 + agentId * 45.67;
                float walkRadius = 6.0;
                transformed.x += cos(angle) * walkRadius;
                transformed.z += sin(angle) * walkRadius;
                transformed.y += abs(sin(uTime * 3.0 + agentId)) * 0.4;
                `
            );
        };

        const matStatic0 = baseMaterial.clone(); matStatic0.map = tex0;
        matStatic0.onBeforeCompile = (s) => { injectStaticShader(s); (matStatic0 as any).userData.shader = s; };
        const matStatic1 = baseMaterial.clone(); matStatic1.map = tex1;
        matStatic1.onBeforeCompile = (s) => { injectStaticShader(s); (matStatic1 as any).userData.shader = s; };
        const matAgent0 = baseMaterial.clone(); matAgent0.map = tex0;
        matAgent0.onBeforeCompile = (s) => { injectAgentShader(s); (matAgent0 as any).userData.shader = s; };
        const matAgent1 = baseMaterial.clone(); matAgent1.map = tex1;
        matAgent1.onBeforeCompile = (s) => { injectAgentShader(s); (matAgent1 as any).userData.shader = s; };

        const group = new THREE.Group();
        group.add(new THREE.Points(staticGeo0, matStatic0));
        group.add(new THREE.Points(staticGeo1, matStatic1));
        group.add(new THREE.Points(agentGeo0, matAgent0));
        group.add(new THREE.Points(agentGeo1, matAgent1));
        scene.add(group);

        const mouse = new THREE.Vector2();
        window.addEventListener('mousemove', (e) => {
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        const clock = new THREE.Clock();
        const animate = () => {
            const time = clock.getElapsedTime();
            [matStatic0, matStatic1, matAgent0, matAgent1].forEach((mat: any) => {
                if (mat.userData.shader) mat.userData.shader.uniforms.uTime.value = time;
            });
            group.rotation.y = mouse.x * 0.1;
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
            window.removeEventListener('resize', handleResize);
            if (containerRef.current) containerRef.current.innerHTML = '';
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