import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

const CUBE_COUNT = 1000
const GRID_SIZE = 10
const SPACING = 4

interface RotationSpeed {
  x: number
  y: number 
  z: number
}

function InstancedCubes(): JSX.Element {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const tempMatrix = useMemo(() => new THREE.Matrix4(), [])
  const tempPosition = useMemo(() => new THREE.Vector3(), [])
  const tempRotation = useMemo(() => new THREE.Euler(), [])
  const tempQuaternion = useMemo(() => new THREE.Quaternion(), [])
  const tempScale = useMemo(() => new THREE.Vector3(1, 1, 1), [])

  const [matrices, colors, rotationSpeeds] = useMemo<[THREE.Matrix4[], THREE.Color[], RotationSpeed[]]>(() => {
    const tempMatrices: THREE.Matrix4[] = []
    const tempColors: THREE.Color[] = []
    const tempRotationSpeeds: RotationSpeed[] = []
    let index = 0

    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        for (let z = 0; z < GRID_SIZE; z++) {
          const matrix = new THREE.Matrix4()
          matrix.setPosition(
            (x - GRID_SIZE / 2) * SPACING,
            (y - GRID_SIZE / 2) * SPACING,
            (z - GRID_SIZE / 2) * SPACING
          )
          tempMatrices.push(matrix)
          
          const color = new THREE.Color(
            Math.random(),
            Math.random(),
            Math.random()
          )
          tempColors.push(color)

          tempRotationSpeeds.push({
            x: Math.random() * 0.5 + 0.1,
            y: Math.random() * 0.5 + 0.1,
            z: Math.random() * 0.5 + 0.1
          })
          index++
        }
      }
    }
    return [tempMatrices, tempColors, tempRotationSpeeds]
  }, [])

  useFrame((state) => {
    const { clock } = state
    const time = clock.getElapsedTime()

    if (!meshRef.current) return

    let index = 0
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        for (let z = 0; z < GRID_SIZE; z++) {
          tempPosition.set(
            (x - GRID_SIZE / 2) * SPACING,
            (y - GRID_SIZE / 2) * SPACING,
            (z - GRID_SIZE / 2) * SPACING
          )

          const speed = rotationSpeeds[index]
          tempRotation.set(
            time * speed.x,
            time * speed.y,
            time * speed.z
          )
          tempQuaternion.setFromEuler(tempRotation)

          tempMatrix.compose(tempPosition, tempQuaternion, tempScale)
          meshRef.current.setMatrixAt(index, tempMatrix)
          index++
        }
      }
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, CUBE_COUNT]}>
      <boxGeometry args={[1, 1, 1]}>
        <instancedBufferAttribute
          attach="attributes-color"
          args={[Float32Array.from(colors.flatMap(c => [c.r, c.g, c.b])), 3]}
        />
      </boxGeometry>
      <meshPhongMaterial vertexColors shininess={60} />
    </instancedMesh>
  )
}

export default function Scene(): JSX.Element {
  return (
    <div className="h-screen w-full">
      <Canvas
        camera={{ position: [20, 20, 20], fov: 75 }}
        style={{ width: '100%', height: '100vh' }}
        className="h-full w-full"
      >
        <color attach="background" args={['#000000']} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 10]} intensity={0.5} />
        <InstancedCubes />
        <OrbitControls />
      </Canvas>
    </div>
  )
}