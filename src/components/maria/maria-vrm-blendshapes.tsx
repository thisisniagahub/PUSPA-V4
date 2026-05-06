"use client"

import { useEffect, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { useGLTF, OrbitControls } from "@react-three/drei"
import { VRMLoaderPlugin, VRMUtils } from "@pixiv/three-vrm"

function VRMScene({ state }: { state: string }) {
  const { scene } = useGLTF("/models/maria.vrm")
  const vrmRef = useRef<any>(null)
  const [vrmLoaded, setVrmLoaded] = useState(false)

  useEffect(() => {
    const plugin = scene.userData.gltfExtensions?.VRMC_vrm
    if (plugin) {
      vrmRef.current = plugin
      VRMUtils.removeUnnecessaryVertices(scene)
      setVrmLoaded(true)
    }
  }, [scene])

  useFrame(() => {
    if (!vrmLoaded || !vrmRef.current) return
    const { expressionManager } = vrmRef.current
    const isTalking = state === "talking"
    const isThinking = state === "thinking"

    expressionManager.setValue("aa", isTalking ? 0.75 : 0, true)
    expressionManager.setValue("blink", isTalking ? 0.05 : 0.4, true)
    expressionManager.setValue("relaxed", isThinking ? 0.6 : 0, true)
  })

  return <primitive object={scene} dispose={null} />
}

export function VRMController({ state, className }: { state: string; className?: string }) {
  return (
    <Canvas className={className} camera={{ position: [0, 0, 2.5], fov: 30 }}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 2, 2]} />
      <VRMScene state={state} />
      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  )
}
