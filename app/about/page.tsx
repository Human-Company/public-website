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
        scene.background = new THREE.Color('#F5F5F0');
        scene.fog = new THREE.FogExp2(0xF5F5F0, 0.025);

        // --- Camera (Isometric) ---
        // Orthographic is key for the "pixel art" / "simulation" look
        const aspect = window.innerWidth / window.innerHeight;
        const d = 35; // View size
        const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
        
        // Classic isometric angle: look from corner
        camera.position.set(50, 50, 50); 
        camera.lookAt(0, 0, 0);

        // --- Renderer ---
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        containerRef.current.appendChild(renderer.domElement);

        // --- Textures (High Res for crisp downscaling) ---
        const createCharTexture = (char: string) => {
            const canvas = document.createElement('canvas');
            canvas.width = 128; 
            canvas.height = 128;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, 128, 128);
                // Use a very heavy font to make the 0/1 readable when small
                ctx.font = '900 100px "Courier New", monospace';
                ctx.fillStyle = '#1A1A1A'; // Dark text directly
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(char, 64, 64);
            }
            return new THREE.CanvasTexture(canvas);
        };

        const tex0 = createCharTexture('0');
        const tex1 = createCharTexture('1');

        // --- Geometry Arrays ---
        const agentPos: number[] = [];
        const agentOffsets: number[] = []; // ID for movement
        const agentType: number[] = [];    // 0 or 1 for texture

        const staticPos: number[] = [];
        const staticType: number[] = [];   // 0 or 1

        // --- Voxel/Particle Helpers ---
        // Create a solid-ish block of particles
        const fillBlock = (
            cx: number, cy: number, cz: number, 
            wx: number, wy: number, wz: number, 
            density: number, 
            isAgent: boolean, 
            id: number = 0
        ) => {
            const count = Math.floor(wx * wy * wz * density);
            for(let i=0; i<count; i++) {
                const px = cx + (Math.random() - 0.5) * wx;
                const py = cy + (Math.random() - 0.5) * wy;
                const pz = cz + (Math.random() - 0.5) * wz;

                const type = Math.random() > 0.5 ? 1 : 0;
                
                if (isAgent) {
                    agentPos.push(px, py, pz);
                    agentOffsets.push(id);
                    agentType.push(type);
                } else {
                    staticPos.push(px, py, pz);
                    staticType.push(type);
                }
            }
        };

        // --- 1. Create Agents ("Thronglets") ---
        // Density must be high to define the shape
        const agentCount = 50;
        for (let i = 0; i < agentCount; i++) {
            const x = (Math.random() - 0.5) * 50;
            const z = (Math.random() - 0.5) * 50;
            
            // Head
            fillBlock(x, 2.8, z, 1.2, 1.0, 1.2, 8, true, i); 
            // Body
            fillBlock(x, 1.5, z, 1.0, 1.5, 1.0, 10, true, i);
            // Arms (scattered slightly out)
            fillBlock(x, 1.8, z, 2.0, 0.6, 0.6, 6, true, i);
        }

        // --- 2. Create Environment (Trees) ---
        const treeCount = 20;
        for (let i = 0; i < treeCount; i++) {
            const x = (Math.random() - 0.5) * 60;
            const z = (Math.random() - 0.5) * 60;
            // Clear center
            if (Math.abs(x) < 10 && Math.abs(z) < 10) continue;

            // Trunk (tall, thin)
            fillBlock(x, 2.0, z, 0.8, 4.0, 0.8, 15, false);
            
            // Leaves (Multiple layers of blocks for "voxel" tree look)
            fillBlock(x, 5.0, z, 4.0, 1.5, 4.0, 10, false); // Base
            fillBlock(x, 6.0, z, 3.0, 1.5, 3.0, 12, false); // Mid
            fillBlock(x, 7.0, z, 1.5, 1.0, 1.5, 15, false); // Top
        }

        // --- 3. Ground (Scattered Grid) ---
        // Instead of random, use a grid pattern with noise to look like terrain
        const gridSize = 80;
        const step = 1.5;
        for (let x = -gridSize/2; x < gridSize/2; x+=step) {
            for (let z = -gridSize/2; z < gridSize/2; z+=step) {
                // Noise-like patches
                if (Math.random() > 0.7) continue; 
                
                const type = Math.random() > 0.5 ? 1 : 0;
                staticPos.push(x, 0, z);
                staticType.push(type);
                
                // Add some "grass" height occasionally
                if (Math.random() > 0.9) {
                     staticPos.push(x, 0.5, z);
                     staticType.push(type);
                }
            }
        }

        // --- Build Buffers ---
        // We need to split into 0s and 1s for the textures
        const agentPos0: number[] = [], agentPos1: number[] = [];
        const agentOff0: number[] = [], agentOff1: number[] = [];
        const staticPos0: number[] = [], staticPos1: number[] = [];

        // Split Agents
        for(let i=0; i<agentPos.length; i+=3) {
             const idx = i/3;
             const t = agentType[idx];
             if (t === 1) {
                 agentPos1.push(agentPos[i], agentPos[i+1], agentPos[i+2]);
                 agentOff1.push(agentOffsets[idx]);
             } else {
                 agentPos0.push(agentPos[i], agentPos[i+1], agentPos[i+2]);
                 agentOff0.push(agentOffsets[idx]);
             }
        }
        // Split Static
        for(let i=0; i<staticPos.length; i+=3) {
             const idx = i/3;
             const t = staticType[idx];
             if (t === 1) staticPos1.push(staticPos[i], staticPos[i+1], staticPos[i+2]);
             else staticPos0.push(staticPos[i], staticPos[i+1], staticPos[i+2]);
        }

        const geoAgent0 = new THREE.BufferGeometry();
        geoAgent0.setAttribute('position', new THREE.Float32BufferAttribute(agentPos0, 3));
        geoAgent0.setAttribute('agentId', new THREE.Float32BufferAttribute(agentOff0, 1));

        const geoAgent1 = new THREE.BufferGeometry();
        geoAgent1.setAttribute('position', new THREE.Float32BufferAttribute(agentPos1, 3));
        geoAgent1.setAttribute('agentId', new THREE.Float32BufferAttribute(agentOff1, 1));

        const geoStatic0 = new THREE.BufferGeometry();
        geoStatic0.setAttribute('position', new THREE.Float32BufferAttribute(staticPos0, 3));
        
        const geoStatic1 = new THREE.BufferGeometry();
        geoStatic1.setAttribute('position', new THREE.Float32BufferAttribute(staticPos1, 3));


        // --- Materials ---
        // Small, sharp, opaque-ish particles
        const material = new THREE.PointsMaterial({
            size: 0.6, // Relative to ortho view
            transparent: true,
            opacity: 1.0,
            color: 0xFFFFFF, // Use texture color
            sizeAttenuation: false, // In Ortho this means pixel size?
            // Let's use sizeAttenuation: true and scale it appropriately.
        });
        
        // Actually, for crisp pixel art look, let's try sizeAttenuation: false (pixels)
        // and make them small but dense.
        material.size = 12; // 12 screen pixels
        material.sizeAttenuation = false;
        material.color = new THREE.Color(0xFFFFFF); 
        material.map = tex0;
        material.alphaTest = 0.5; // Sharp cutout

        // --- Shaders ---
        const injectStaticShader = (shader: any) => {
            shader.uniforms.uTime = { value: 0 };
            shader.vertexShader = `uniform float uTime;\n` + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace(
                '#include <begin_vertex>',
                `
                vec3 transformed = vec3(position);
                // Simple wind sway for trees
                if (position.y > 1.0) {
                    float sway = sin(uTime * 1.5 + position.x * 0.1) * 0.1 * (position.y - 1.0);
                    transformed.x += sway;
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
                
                // Coordinated movement based on ID
                float speed = 1.0;
                float angle = uTime * 0.2 + agentId * 12.34;
                float radius = 5.0;
                
                // Move in circles
                float walkX = cos(angle) * radius;
                float walkZ = sin(angle) * radius;
                
                transformed.x += walkX;
                transformed.z += walkZ;
                
                // Bobbing (walking animation)
                float bob = abs(sin(uTime * 5.0 + agentId)) * 0.3;
                transformed.y += bob;
                
                // Face direction? (Hard with points, but we can squash/stretch)
                `
            );
        };

        const matStat0 = material.clone(); matStat0.map = tex0;
        matStat0.onBeforeCompile = (s) => { injectStaticShader(s); (matStat0 as any).userData.shader = s; };
        
        const matStat1 = material.clone(); matStat1.map = tex1;
        matStat1.onBeforeCompile = (s) => { injectStaticShader(s); (matStat1 as any).userData.shader = s; };

        const matAg0 = material.clone(); matAg0.map = tex0;
        matAg0.onBeforeCompile = (s) => { injectAgentShader(s); (matAg0 as any).userData.shader = s; };

        const matAg1 = material.clone(); matAg1.map = tex1;
        matAg1.onBeforeCompile = (s) => { injectAgentShader(s); (matAg1 as any).userData.shader = s; };


        const group = new THREE.Group();
        group.add(new THREE.Points(geoStatic0, matStat0));
        group.add(new THREE.Points(geoStatic1, matStat1));
        group.add(new THREE.Points(geoAgent0, matAg0));
        group.add(new THREE.Points(geoAgent1, matAg1));
        
        // Center the scene
        group.position.y = -5;
        scene.add(group);


        // --- Render Loop ---
        const mouse = new THREE.Vector2();
        window.addEventListener('mousemove', (e) => {
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        const clock = new THREE.Clock();
        const animate = () => {
            const time = clock.getElapsedTime();
            [matStat0, matStat1, matAg0, matAg1].forEach((mat: any) => {
                if (mat.userData.shader) mat.userData.shader.uniforms.uTime.value = time;
            });
            
            // Isometric rotation control
            group.rotation.y = Math.PI / 4 + mouse.x * 0.1;

            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };
        animate();

        const handleResize = () => {
            const aspect = window.innerWidth / window.innerHeight;
            const d = 35;
            camera.left = -d * aspect; 
            camera.right = d * aspect;
            camera.top = d; 
            camera.bottom = -d;
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
