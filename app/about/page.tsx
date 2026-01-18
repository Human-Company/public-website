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
        scene.fog = new THREE.FogExp2(0xF5F5F0, 0.02);

        // --- Camera (Isometric-ish) ---
        const aspect = window.innerWidth / window.innerHeight;
        const d = 20;
        const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
        
        camera.position.set(20, 20, 20); // Isometric angle
        camera.lookAt(scene.position);

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
                ctx.fillStyle = 'transparent';
                ctx.clearRect(0, 0, 64, 64);
                ctx.font = 'bold 48px "Courier New", monospace';
                ctx.fillStyle = '#1A1A1A';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(char, 32, 32);
            }
            return new THREE.CanvasTexture(canvas);
        };

        const tex0 = createCharTexture('0');
        const tex1 = createCharTexture('1');

        // --- Helpers for Geometry Construction ---
        // We want to build "agents" and "environment" out of 0s and 1s.
        
        const agentGeo0 = new THREE.BufferGeometry();
        const agentGeo1 = new THREE.BufferGeometry();
        const staticGeo0 = new THREE.BufferGeometry();
        const staticGeo1 = new THREE.BufferGeometry();

        const agentPos0: number[] = [];
        const agentPos1: number[] = [];
        const staticPos0: number[] = [];
        const staticPos1: number[] = [];
        
        // Agent "offsets" for animation (ID to offset movement)
        const agentOffsets0: number[] = [];
        const agentOffsets1: number[] = [];

        // 1. Create Agents (The "Thronglets")
        // Simple shape: A small stack of 0s and 1s roughly forming a body
        const createAgent = (x: number, z: number, id: number) => {
            // Body dimensions (approx)
            const height = 1.5;
            const width = 0.8;
            
            // Fill a small volume with binary dust
            const particleCount = 12; 
            for (let i = 0; i < particleCount; i++) {
                const px = x + (Math.random() - 0.5) * width;
                const py = (Math.random() * height); // On the ground
                const pz = z + (Math.random() - 0.5) * width;

                // Randomly assign to 0 or 1 texture list
                if (Math.random() > 0.5) {
                    agentPos1.push(px, py, pz);
                    agentOffsets1.push(id); // Assign agent ID for unified movement
                } else {
                    agentPos0.push(px, py, pz);
                    agentOffsets0.push(id);
                }
            }
        };

        const agentCount = 40;
        for (let i = 0; i < agentCount; i++) {
            // Scatter agents on the ground
            const x = (Math.random() - 0.5) * 30;
            const z = (Math.random() - 0.5) * 30;
            createAgent(x, z, i);
        }

        // 2. Create Environment (Trees/Buildings)
        const createTree = (x: number, z: number) => {
            // Trunk
            for(let y=0; y<2; y+=0.4) {
                 if (Math.random() > 0.5) staticPos1.push(x, y, z);
                 else staticPos0.push(x, y, z);
            }
            // Leaves (Sphere-ish cloud of numbers)
            const leafCount = 30;
            for(let i=0; i<leafCount; i++) {
                const r = 1.5 * Math.pow(Math.random(), 0.3); // Cluster near center
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);
                
                const lx = x + r * Math.sin(phi) * Math.cos(theta);
                const ly = 2.5 + r * Math.sin(phi) * Math.sin(theta); // Elevated
                const lz = z + r * Math.cos(phi);

                if (Math.random() > 0.5) staticPos1.push(lx, ly, lz);
                else staticPos0.push(lx, ly, lz);
            }
        };

        const treeCount = 15;
        for (let i = 0; i < treeCount; i++) {
             const x = (Math.random() - 0.5) * 35;
             const z = (Math.random() - 0.5) * 35;
             // Don't place too close to center (keep some clearing)
             if (Math.abs(x) < 5 && Math.abs(z) < 5) continue;
             createTree(x, z);
        }

        // 3. Ground Plane (Scattered bits)
        const groundCount = 200;
        for (let i = 0; i < groundCount; i++) {
            const x = (Math.random() - 0.5) * 40;
            const z = (Math.random() - 0.5) * 40;
            const y = 0;
            if (Math.random() > 0.5) staticPos1.push(x, y, z);
            else staticPos0.push(x, y, z);
        }


        // Build Geometries
        agentGeo0.setAttribute('position', new THREE.Float32BufferAttribute(agentPos0, 3));
        agentGeo0.setAttribute('agentId', new THREE.Float32BufferAttribute(agentOffsets0, 1));
        
        agentGeo1.setAttribute('position', new THREE.Float32BufferAttribute(agentPos1, 3));
        agentGeo1.setAttribute('agentId', new THREE.Float32BufferAttribute(agentOffsets1, 1));

        staticGeo0.setAttribute('position', new THREE.Float32BufferAttribute(staticPos0, 3));
        staticGeo1.setAttribute('position', new THREE.Float32BufferAttribute(staticPos1, 3));

        // --- Materials & Shaders ---
        
        const baseMaterial = new THREE.PointsMaterial({
            size: 0.4,
            transparent: true,
            opacity: 0.8,
            color: 0x1A1A1A,
            sizeAttenuation: true,
            depthWrite: false,
        });

        // 1. Static Shader (Trees/Ground - just slight waver)
        const injectStaticShader = (shader: any, map: THREE.Texture) => {
            shader.uniforms.uTime = { value: 0 };
            shader.uniforms.map = { value: map };
            shader.vertexShader = `
                uniform float uTime;
                ${shader.vertexShader}
            `.replace(
                '#include <begin_vertex>',
                `
                vec3 transformed = position;
                // Subtle wind effect for trees (points higher up move more)
                float wind = sin(uTime * 1.0 + transformed.x * 0.5 + transformed.z * 0.5) * 0.1;
                if (transformed.y > 1.0) {
                    transformed.x += wind * (transformed.y - 1.0) * 0.1;
                }
                `
            );
        };

        // 2. Agent Shader (Walking/Bobbing/Moving)
        const injectAgentShader = (shader: any, map: THREE.Texture) => {
            shader.uniforms.uTime = { value: 0 };
            shader.uniforms.map = { value: map };
            shader.vertexShader = `
                uniform float uTime;
                attribute float agentId;
                ${shader.vertexShader}
            `.replace(
                '#include <begin_vertex>',
                `
                vec3 transformed = position;
                
                // Agents wander in little circles/paths based on ID
                float angle = uTime * 0.5 + agentId * 100.0;
                float walkRadius = 2.0;
                
                float moveX = cos(angle) * walkRadius;
                float moveZ = sin(angle) * walkRadius;
                
                transformed.x += moveX;
                transformed.z += moveZ;
                
                // Bobbing motion (walking)
                float bob = abs(sin(uTime * 4.0 + agentId));
                transformed.y += bob * 0.2;
                `
            );
        };

        // Create Materials
        const matStatic0 = baseMaterial.clone();
        matStatic0.map = tex0;
        matStatic0.onBeforeCompile = (s) => { injectStaticShader(s, tex0); (matStatic0 as any).userData.shader = s; };

        const matStatic1 = baseMaterial.clone();
        matStatic1.map = tex1;
        matStatic1.onBeforeCompile = (s) => { injectStaticShader(s, tex1); (matStatic1 as any).userData.shader = s; };

        const matAgent0 = baseMaterial.clone();
        matAgent0.map = tex0;
        matAgent0.onBeforeCompile = (s) => { injectAgentShader(s, tex0); (matAgent0 as any).userData.shader = s; };

        const matAgent1 = baseMaterial.clone();
        matAgent1.map = tex1;
        matAgent1.onBeforeCompile = (s) => { injectAgentShader(s, tex1); (matAgent1 as any).userData.shader = s; };


        // Add to Scene
        const sysStatic0 = new THREE.Points(staticGeo0, matStatic0);
        const sysStatic1 = new THREE.Points(staticGeo1, matStatic1);
        const sysAgent0 = new THREE.Points(agentGeo0, matAgent0);
        const sysAgent1 = new THREE.Points(agentGeo1, matAgent1);

        const group = new THREE.Group();
        group.add(sysStatic0, sysStatic1, sysAgent0, sysAgent1);
        scene.add(group);


        // --- Interaction (Mouse Rotation) ---
        const mouse = new THREE.Vector2();
        const handleMouseMove = (e: MouseEvent) => {
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener('mousemove', handleMouseMove);

        // --- Animation Loop ---
        const clock = new THREE.Clock();

        const animate = () => {
            const time = clock.getElapsedTime();

            [matStatic0, matStatic1, matAgent0, matAgent1].forEach((mat: any) => {
                const shader = mat.userData.shader;
                if (shader) {
                    shader.uniforms.uTime.value = time;
                }
            });

            // Slight camera rotation based on mouse
            group.rotation.y = mouse.x * 0.1;
            group.rotation.x = mouse.y * 0.1;

            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };
        animate();

        // --- Resize Handler ---
        const handleResize = () => {
             // Update frustum for ortho camera
            const aspect = window.innerWidth / window.innerHeight;
            const d = 20;
            camera.left = -d * aspect;
            camera.right = d * aspect;
            camera.top = d;
            camera.bottom = -d;
            
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
            {/* Navigation Overlay */}
            <div className="absolute top-8 left-8 z-10">
                <Link href="/" className="font-semibold text-[15px] text-[#1a1a1a] hover:opacity-60 transition-opacity">
                    ← Human Company
                </Link>
            </div>

            <div ref={containerRef} className="w-full h-full" />
        </div>
    );
}