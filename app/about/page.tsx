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
        // Very light fog to fade out distant grid points
        scene.fog = new THREE.FogExp2(0xF5F5F0, 0.002);

        // --- Camera (Isometric Ortho) ---
        const aspect = window.innerWidth / window.innerHeight;
        const d = 40; // View size
        const camera = new THREE.OrthographicCamera(-d * aspect, d * aspect, d, -d, 1, 1000);
        
        // Classic isometric look
        camera.position.set(100, 100, 100); 
        camera.lookAt(0, 0, 0);

        // --- Renderer ---
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        containerRef.current.appendChild(renderer.domElement);

        // --- Textures ---
        const createCharTexture = (char: string) => {
            const canvas = document.createElement('canvas');
            canvas.width = 128; 
            canvas.height = 128;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, 128, 128);
                // Heavy monospaced font
                ctx.font = 'bold 90px "Courier New", monospace';
                ctx.fillStyle = '#FFFFFF'; 
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(char, 64, 64);
            }
            return new THREE.CanvasTexture(canvas);
        };

        const tex0 = createCharTexture('0');
        const tex1 = createCharTexture('1');

        // --- Voxel Config ---
        const VOXEL_GAP = 1.2; // Spacing between characters
        
        // Geometry Arrays
        const pos0: number[] = [], pos1: number[] = [];
        const color0: number[] = [], color1: number[] = [];
        const id0: number[] = [], id1: number[] = []; 

        // Helper: Add a voxel to the arrays
        const addVoxel = (
            gx: number, gy: number, gz: number, // Grid Coords
            groupId: number, 
            shade: number // 0.0 to 1.0 intensity
        ) => {
            const worldX = gx * VOXEL_GAP;
            const worldY = gy * VOXEL_GAP;
            const worldZ = gz * VOXEL_GAP;

            // Randomly choose '0' or '1'
            const isOne = Math.random() > 0.5;
            
            // Calculate tint (Reference uses opacity/intensity for shading)
            // We use vertex colors. 
            // shade=1.0 -> Full Color
            // shade=0.2 -> Dark/Faint
            
            if (isOne) {
                pos1.push(worldX, worldY, worldZ);
                color1.push(shade, shade, shade); 
                id1.push(groupId);
            } else {
                pos0.push(worldX, worldY, worldZ);
                color0.push(shade, shade, shade);
                id0.push(groupId);
            }
        };

        // --- 1. Agents (The "Sims") ---
        const generateAgent = (gx: number, gz: number, id: number) => {
            // Legs
            addVoxel(gx, 0, gz, id, 0.3);
            addVoxel(gx+1, 0, gz, id, 0.3);
            
            // Body (Block)
            for(let y=1; y<=2; y++) {
                for(let x=0; x<=1; x++) {
                    // Front face brighter
                    const s = (x===0) ? 0.9 : 0.6; 
                    addVoxel(gx+x, y, gz, id, s);
                }
            }
            // Head
            addVoxel(gx, 3, gz, id, 1.0); 
            addVoxel(gx+1, 3, gz, id, 0.8);
        };

        for(let i=0; i<45; i++) {
            const gx = Math.floor((Math.random() - 0.5) * 50);
            const gz = Math.floor((Math.random() - 0.5) * 50);
            generateAgent(gx, gz, i);
        }

        // --- 2. Trees (Voxel Structure) ---
        const generateTree = (gx: number, gz: number) => {
            // Trunk
            for(let y=0; y<5; y++) {
                addVoxel(gx, y, gz, -1, 0.2); // Dark trunk
            }
            
            // Canopy
            const centerY = 6;
            const r = 3;
            for(let x = -r; x <= r; x++) {
                for(let y = -r; y <= r; y++) {
                    for(let z = -r; z <= r; z++) {
                        if (x*x + y*y + z*z <= r*r) {
                            // Gradient shading: Top is lighter
                            const h = (y + r) / (2*r); // 0 to 1
                            const s = 0.3 + h * 0.7;
                            addVoxel(gx+x, centerY+y, gz+z, -1, s);
                        }
                    }
                }
            }
        };

        for(let i=0; i<15; i++) {
            const gx = Math.floor((Math.random() - 0.5) * 60);
            const gz = Math.floor((Math.random() - 0.5) * 60);
            if (Math.abs(gx) < 10 && Math.abs(gz) < 10) continue;
            generateTree(gx, gz);
        }

        // --- 3. Ground (Sparse Grid) ---
        const groundSize = 80;
        for(let x = -groundSize/2; x < groundSize/2; x+=2) {
            for(let z = -groundSize/2; z < groundSize/2; z+=2) {
                // Random patches
                if (Math.random() > 0.85) {
                    addVoxel(x, -1, z, -1, 0.4);
                }
            }
        }

        // --- Build Geometry ---
        const geo0 = new THREE.BufferGeometry();
        geo0.setAttribute('position', new THREE.Float32BufferAttribute(pos0, 3));
        geo0.setAttribute('color', new THREE.Float32BufferAttribute(color0, 3));
        geo0.setAttribute('agentId', new THREE.Float32BufferAttribute(id0, 1));

        const geo1 = new THREE.BufferGeometry();
        geo1.setAttribute('position', new THREE.Float32BufferAttribute(pos1, 3));
        geo1.setAttribute('color', new THREE.Float32BufferAttribute(color1, 3));
        geo1.setAttribute('agentId', new THREE.Float32BufferAttribute(id1, 1));

        // --- Material ---
        // Use a deep blue tint to match the "Whale" reference
        const material = new THREE.PointsMaterial({
            size: 18, // Pixel size (Ortho)
            map: tex0,
            transparent: true,
            opacity: 1.0,
            vertexColors: true,
            color: new THREE.Color('#2A4A7C'), // Deep Tech Blue
            sizeAttenuation: false, // Constant screen size
            alphaTest: 0.1,
            depthWrite: false, // Clean composition
        });

        const mat0 = material.clone(); mat0.map = tex0;
        const mat1 = material.clone(); mat1.map = tex1;

        // --- Shader (Subtle Animation) ---
        const injectShader = (shader: any) => {
            shader.uniforms.uTime = { value: 0 };
            shader.vertexShader = `uniform float uTime;\nattribute float agentId;\n` + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace(
                '#include <begin_vertex>',
                `
                vec3 transformed = vec3(position);
                
                if (agentId >= 0.0) {
                    // Bobbing in place (grid aligned mostly)
                    float bob = sin(uTime * 4.0 + agentId) * 0.1;
                    transformed.y += abs(bob);
                }
                `
            );
        };

        mat0.onBeforeCompile = (s) => { injectShader(s); (mat0 as any).userData.shader = s; };
        mat1.onBeforeCompile = (s) => { injectShader(s); (mat1 as any).userData.shader = s; };

        const group = new THREE.Group();
        group.add(new THREE.Points(geo0, mat0));
        group.add(new THREE.Points(geo1, mat1));
        
        // Center vertically
        group.position.y = -10;
        scene.add(group);

        // --- Loop ---
        const mouse = new THREE.Vector2();
        window.addEventListener('mousemove', (e) => {
            mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        });

        const clock = new THREE.Clock();
        const animate = () => {
            const time = clock.getElapsedTime();
            [mat0, mat1].forEach((mat: any) => {
                if (mat.userData.shader) mat.userData.shader.uniforms.uTime.value = time;
            });
            
            group.rotation.y = Math.PI / 4 + mouse.x * 0.05; // Isometric angle
            
            renderer.render(scene, camera);
            requestAnimationFrame(animate);
        };
        animate();

        const handleResize = () => {
            const aspect = window.innerWidth / window.innerHeight;
            const d = 40;
            camera.left = -d * aspect; camera.right = d * aspect;
            camera.top = d; camera.bottom = -d;
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