"use client"

import React, { Suspense, useEffect, useRef, useState, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useGLTF, Html } from "@react-three/drei";
import { PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

// Website screen component - placed separately but positioned relative to model
function WebsiteScreen() {
  const [scale, setScale] = useState(1.6);
  const [isZoomed, setIsZoomed] = useState(false);

  const handleScaleClick = () => {
    if (isZoomed) {
      setScale(1.6);
    } else {
      setScale(4);
    }
    setIsZoomed(!isZoomed);
  };

  return (
    <Html
      transform
      position={[10, 6, 0]} // Exact position to match the monitor in the model
      rotation={[0, 4.8, 0]}
      scale={scale}
      distanceFactor={1}
      occlude={false}
      zIndexRange={[100, 101]} // Ensure it renders on top
      style={{
        pointerEvents: 'auto',
        transform: 'translate3d(0,0,0)' // Force hardware acceleration
      }}
    >
      <div style={{ position: 'relative', width: '1020px', height: '600px' }}>
        {/* Toggle Scale Button */}
        <button
          onClick={handleScaleClick}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            zIndex: 1000,
            background: isZoomed ? 'rgba(255, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            padding: '8px 12px',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = isZoomed ? 'rgba(255, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.9)';
            e.target.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = isZoomed ? 'rgba(255, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.7)';
            e.target.style.transform = 'scale(1)';
          }}
        >
          {isZoomed ? 'Normal' : 'Zoom'}
        </button>
        
        <iframe
          src="https://code-of-silence-unlocked-53719-03265.lovable.app/"
          style={{
            width: "1020px",
            height: "600px",
            border: "none",
            borderRadius: "20px",
            boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)',
            pointerEvents: 'auto'
          }}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </div>
    </Html>
  );
}

const LoadPaper = ({ position = [0,4.78,6],rotation=[0,0,0], scale = .05 }) => {
  const PaperRef = useRef();
  const { scene } = useGLTF("/model/pageFour.glb");

  if (!scene) return null;

  return (
    <primitive
      ref={PaperRef}
      object={scene}
      position={position}
      rotation={rotation}
      scale={scale}
    />
  );
}



const LoadModel = ({ position = [0, 0, 0], rotation = [0, 0, 0] }) => {
  const ModelRef = useRef();
  const { scene } = useGLTF("/model/RoomFourModel.glb")
 
  // Center the model and ensure proper positioning
  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });
    }
  }, [scene]);

  return (
    <group position={position} rotation={rotation} scale={1}>
      <primitive ref={ModelRef} object={scene} />
    </group>
  );
}

// Camera coordinates display component
function CameraCoordinates({ position }) {
  return (
    <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white p-3 rounded-lg font-mono text-sm z-10">
      <div>Player Position:</div>
      <div>X: {position[0].toFixed(2)}</div>
      <div>Y: {position[1].toFixed(2)}</div>
      <div>Z: {position[2].toFixed(2)}</div>
    </div>
  );
}

const FirstPersonControls = ({ onPositionUpdate }) => {
  const { camera, gl } = useThree();
  const moveState = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });
  
  const velocity = useRef(new THREE.Vector3());
  const direction = useRef(new THREE.Vector3());
  
  // Define the quadrilateral boundary coordinates
  const boundary = {
    points: [
      new THREE.Vector3(6.22, 6, 7.08),   // Point 1
      new THREE.Vector3(-1.97, 6, 5.33),  // Point 2
      new THREE.Vector3(-5.54, 6, -6.15), // Point 3
      new THREE.Vector3(6.73, 6, -5.75)   // Point 4
    ],
    y: 6 // Increased camera height
  };
  
  // Camera state (first person position) - starting at [0, 3.4, 0]
  const [cameraPosition, setCameraPosition] = useState([0, 6, 0]);
  
  // Mouse look controls
  const [isMouseLooking, setIsMouseLooking] = useState(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  
  // Movement parameters - increased by 30%
  const moveSpeed = 0.029484; // Increased from 0.02268 by 30%
  const damping = 0.8;
  const mouseSensitivity = 0.002;

  // Refs for useFrame
  const cameraPosRef = useRef(new THREE.Vector3(0, 6, 0));

  // Function to check if point is inside quadrilateral
  const isPointInQuadrilateral = useCallback((point, quadPoints) => {
    // Convert to 2D coordinates (ignore Y since we're on a flat plane)
    const p = new THREE.Vector2(point.x, point.z);
    const a = new THREE.Vector2(quadPoints[0].x, quadPoints[0].z);
    const b = new THREE.Vector2(quadPoints[1].x, quadPoints[1].z);
    const c = new THREE.Vector2(quadPoints[2].x, quadPoints[2].z);
    const d = new THREE.Vector2(quadPoints[3].x, quadPoints[3].z);

    // Check if point is inside using triangle decomposition method
    // Split quadrilateral into two triangles and check each
    const isPointInTriangle = (p, a, b, c) => {
      const area = (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y)) / 2;
      const s = 1 / (2 * area) * (a.y * c.x - a.x * c.y + (c.y - a.y) * p.x + (a.x - c.x) * p.y);
      const t = 1 / (2 * area) * (a.x * b.y - a.y * b.x + (a.y - b.y) * p.x + (b.x - a.x) * p.y);
      return s > 0 && t > 0 && (1 - s - t) > 0;
    };

    // Check both possible triangle decompositions
    return isPointInTriangle(p, a, b, c) || isPointInTriangle(p, a, c, d);
  }, []);

  // Function to clamp position within quadrilateral boundaries
  const clampPosition = useCallback((position) => {
    const clampedPosition = position.clone();
    
    // Check if the position is inside the quadrilateral
    if (!isPointInQuadrilateral(clampedPosition, boundary.points)) {
      // If outside, keep the previous valid position
      return cameraPosRef.current.clone();
    }
    
    // Keep Y fixed at 3.40
    clampedPosition.y = boundary.y;
    
    return clampedPosition;
  }, [boundary, isPointInQuadrilateral]);

  // Handle keyboard input
  const handleKeyDown = useCallback((e) => {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        moveState.current.forward = true;
        break;
      case 'KeyS':
      case 'ArrowDown':
        moveState.current.backward = true;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        moveState.current.left = true;
        break;
      case 'KeyD':
      case 'ArrowRight':
        moveState.current.right = true;
        break;
    }
  }, []);

  const handleKeyUp = useCallback((e) => {
    switch (e.code) {
      case 'KeyW':
      case 'ArrowUp':
        moveState.current.forward = false;
        break;
      case 'KeyS':
      case 'ArrowDown':
        moveState.current.backward = false;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        moveState.current.left = false;
        break;
      case 'KeyD':
      case 'ArrowRight':
        moveState.current.right = false;
        break;
    }
  }, []);

  // Mouse look controls - WITHOUT pointer lock
  const handleMouseDown = useCallback((e) => {
    if (e.button === 0) { // Left mouse button
      setIsMouseLooking(true);
      previousMousePosition.current = {
        x: e.clientX,
        y: e.clientY
      };
      gl.domElement.style.cursor = 'none'; // Hide cursor only while looking
    }
  }, [gl]);

  const handleMouseUp = useCallback((e) => {
    if (e.button === 0) { // Left mouse button
      setIsMouseLooking(false);
      gl.domElement.style.cursor = 'default'; // Show cursor again
    }
  }, [gl]);

  const handleMouseMove = useCallback((e) => {
    if (!isMouseLooking) return;

    const deltaX = e.clientX - previousMousePosition.current.x;
    const deltaY = e.clientY - previousMousePosition.current.y;

    // Update camera rotation based on mouse movement - ONLY Y rotation (horizontal)
    camera.rotation.y -= deltaX * mouseSensitivity;

    // Lock the X rotation (vertical look) to prevent up/down movement
    camera.rotation.x = 0; // Always keep horizontal view
    camera.rotation.z = 0; // Prevent any roll

    // Update previous mouse position
    previousMousePosition.current = {
      x: e.clientX,
      y: e.clientY
    };
  }, [camera, isMouseLooking, mouseSensitivity]);

  // Handle mouse leaving the canvas
  const handleMouseLeave = useCallback(() => {
    setIsMouseLooking(false);
    gl.domElement.style.cursor = 'default'; // Show cursor again
  }, [gl]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    gl.domElement.addEventListener('mousedown', handleMouseDown);
    gl.domElement.addEventListener('mouseup', handleMouseUp);
    gl.domElement.addEventListener('mousemove', handleMouseMove);
    gl.domElement.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      gl.domElement.removeEventListener('mousedown', handleMouseDown);
      gl.domElement.removeEventListener('mouseup', handleMouseUp);
      gl.domElement.removeEventListener('mousemove', handleMouseMove);
      gl.domElement.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleKeyDown, handleKeyUp, handleMouseDown, handleMouseUp, handleMouseMove, handleMouseLeave, gl]);

  useFrame(() => {
    // Reset velocity
    velocity.current.set(0, 0, 0);

    // Calculate movement direction based on camera orientation
    direction.current.set(0, 0, 0);

    if (moveState.current.forward) direction.current.z -= 1;
    if (moveState.current.backward) direction.current.z += 1;
    if (moveState.current.left) direction.current.x -= 1;
    if (moveState.current.right) direction.current.x += 1;

    // Normalize direction if moving diagonally
    if (direction.current.length() > 0) {
      direction.current.normalize();
    }

    // Apply camera rotation to movement direction
    const cameraEuler = new THREE.Euler(0, camera.rotation.y, 0, 'XYZ');
    direction.current.applyEuler(cameraEuler);

    // Apply movement speed (30% increased)
    velocity.current.addScaledVector(direction.current, moveSpeed);

    // Apply damping for smoother movement
    velocity.current.multiplyScalar(damping);

    // Update camera position temporarily
    const tempPosition = cameraPosRef.current.clone().add(velocity.current);
    
    // Clamp the position to stay within quadrilateral boundaries
    const clampedPosition = clampPosition(tempPosition);
    
    // Apply the clamped position
    cameraPosRef.current.copy(clampedPosition);
    camera.position.copy(clampedPosition);

    // Update state
    const newPosition = [clampedPosition.x, clampedPosition.y, clampedPosition.z];
    setCameraPosition(newPosition);
    
    // Notify parent component of position update
    if (onPositionUpdate) {
      onPositionUpdate(newPosition);
    }
  });

  return null; // No character to render in first-person view
}

export default function RoomFourModel() {
  const [cameraPosition, setCameraPosition] = useState([0, 6, 0]);

  const handleCameraPositionUpdate = useCallback((newPosition) => {
    setCameraPosition(newPosition);
  }, []);

  return (
    <div className="h-screen w-screen bg-black-500 relative">
      {/* Camera coordinates display */}
      <CameraCoordinates position={cameraPosition} />
      
      <Canvas
        gl={{
          antialias: true,
          alpha: true
        }}
        camera={{ position: [0, 4.4, 0], fov: 75 }} // Increased initial camera height
      >
        <PerspectiveCamera
          makeDefault
          position={[0, 0, 0]} // New initial position at center
          fov={75}
          near={0.1}
          far={1000}
        />
        
        {/* Lighting setup */}
        <ambientLight intensity={0.09} />
        <directionalLight 
          position={[2, 5, 1]} 
          intensity={0.1}
          color="#8da6ce"
          castShadow
        />
        <pointLight
          position={[0.99, 2, -2]}
          intensity={5}
          color="#be6500ff"
          distance={10}
          decay={2}
        />
        <spotLight
          color={"#00ff6eff"}
          intensity={2}
          position={[0.99, 3, -3.2]}
          distance={4}
          decay={2}
          rotateX={90}
          castShadow
        />
        
        <fog 
          attach="fog" 
          args={['#1a2332', 5, 15]}
        />
        
        <Suspense fallback={null}>
          {/* Load the room model */}
          <LoadModel position={[0, 2, 0]} rotation={[0, 0, 0]} />
          <LoadPaper />
          {/* Website screen - positioned independently but in the same space */}
          <WebsiteScreen />
          
          {/* Controls */}
          <FirstPersonControls onPositionUpdate={handleCameraPositionUpdate} />
        </Suspense>
      </Canvas>
    </div>
  );
}