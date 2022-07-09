import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import img from "../public/assets/pngegg.png";
import { Suspense, useCallback, useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useMemo } from "react";

export default function Home() {
  return (
    <div className={styles.container}>
      <AnimationCanvas />
    </div>
  );
}

const AnimationCanvas = () => {
  return (
    <Canvas camera={{ position: [100, 10, 0], fov: 75 }}>
      <Suspense fallback={null}>
        <OrbitControls />
        <axesHelper args={[100]} />
        <Points />
      </Suspense>
    </Canvas>
  );
};

const Points = () => {
  const imgTex = useLoader(THREE.TextureLoader, img.src);
  const bufferRef = useRef();
  let phaseShift = 0;
  const frequency = 0.002;
  let amplitude = 3;
  const count = 100;
  let separation = 1;

  const graph = useCallback(
    (x, z) => {
      // return Math.sin(x + z);
      return Math.sin(frequency*(x ** 2 + z ** 2 + phaseShift) * amplitude);
    },
    [phaseShift, amplitude, frequency]
  );

  let positions = useMemo(() => {
    let points = [];
    for (let xi = 0; xi < count; xi++) {
      for (let zi = 0; zi < count; zi++) {
        let x = separation * (xi - count / 2);
        let z = separation * (zi - count / 2);
        let y = graph(x, z);
        points.push(x, y, z);
      }
    }

    // const points2 = [1,2,1,2,1,2,2,3,3];

    return new Float32Array(points);
  }, [count, separation, graph]);
  // console.log("I", img);
  // console.log("IT", imgTex);

  useFrame(() => {
    phaseShift -= 15;
    // separation += 1
    const newPositions = bufferRef.current.array;
    let i = 0;
    for (let xi = 0; xi < count; xi++) {
      for (let zi = 0; zi < count; zi++) {
        let x = separation * (xi - count / 2);
        let z = separation * (zi - count / 2);
        // let y = graph(x,z);
        // points.push(x,y,z)
        newPositions[i + 1] = -graph(x, z);
        i += 3;
      }
    }
    bufferRef.current.needsUpdate = true
  });

  return (
    <points>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          ref={bufferRef}
          // attachObject={["attributes", "positions"]}
          attach="attributes-position"
          array={positions}
          itemSize={3}
          count={positions.length / 3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.5}
        sizeAttenuation
        transparent={false}
        alphaTest={0.5}
        opacity={1}
        attach="material"
        map={imgTex}
        color={0x00aaff}
      />
    </points>
  );
};
