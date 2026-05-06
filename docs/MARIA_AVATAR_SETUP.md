# 🎭 Maria Avatar Setup Guide

## ✅ Files Created

1. **`src/components/maria/MariaAvatarUnified.tsx`** - Unified avatar component dengan 3 modes
2. **`src/components/maria/maria-vrm-blendshapes.tsx`** - VRM blendshapes controller
3. **`src/stores/maria-character-store.ts`** - Zustand store untuk avatar state
4. **`public/assets/README.md`** - Asset placement guide

## 🚀 Cara Guna

### 1. Install Dependencies

```bash
bun add framer-motion @lottiefiles/react-lottie-player @react-three/fiber @react-three/drei @pixiv/three-vrm three
```

### 2. Sediakan Assets

Letakkan files berikut:

```
public/
├── assets/
│   ├── maria-idle.json
│   ├── maria-talking.json
│   └── maria-thinking.json
├── models/
│   └── maria.vrm
└── maria-avatar.png
```

### 3. Guna di Dashboard

```tsx
import { MariaAvatarUnified } from "@/components/maria/MariaAvatarUnified"

// Pilih mode ikut keperluan
<MariaAvatarUnified mode="framer" className="w-20 h-20" />
{/* atau */}
<MariaAvatarUnified mode="vrm" className="w-20 h-20" />
{/* atau */}
<MariaAvatarUnified mode="lottie" className="w-20 h-20" />
```

### 4. Wire ke TTS/Stream

```tsx
import { useMariaCharacterStore } from "@/stores/maria-character-store"

// Sebelum play TTS
useMariaCharacterStore.getState().setState("talking")
useMariaCharacterStore.getState().setStreaming(true)

// Selepas TTS habis / stream selesai
audio.onended = () => {
  useMariaCharacterStore.getState().setState("idle")
  useMariaCharacterStore.getState().setStreaming(false)
}
```

## 📊 Mode Comparison

| Mode | Performance | Quality | Use Case |
|------|-------------|---------|----------|
| **framer** | ⭐⭐⭐ 60fps, zero GPU | ⭐⭐ Simple animation | Default, low-end devices |
| **vrm** | ⭐⭐ Real 3D, moderate GPU | ⭐⭐⭐ Full 3D with blendshapes | High-end, immersive experience |
| **lottie** | ⭐⭐ Medium, preload JSON | ⭐⭐⭐ Professional design | Balanced performance & quality |

## 🎯 State Management

Avatar states:
- `idle` - Menunggu input
- `talking` - Sedang bercakap (TTS active)
- `thinking` - Memproses AI response
- `listening` - Mendengar user input

## 🔧 Troubleshooting

### VRM tidak load?
- Pastikan `/models/maria.vrm` wujud
- Check console untuk GLTF loading errors
- Verify CORS headers untuk model files

### Lottie animation tidak play?
- Pastikan JSON files valid
- Check path: `/assets/maria-{state}.json`
- Preload animations untuk better UX

### Store state reset on refresh?
- Tambah `persist` middleware jika perlu:
```ts
import { persist } from "zustand/middleware"

export const useMariaCharacterStore = create(
  persist((set) => ({...}), { name: "maria-state" })
)
```

## 📝 Next Steps

1. ✅ Create avatar assets (Lottie JSONs, VRM model, PNG)
2. ✅ Test each mode di development
3. ✅ Integrate dengan TTS engine sedia ada
4. ✅ Add lip-sync synchronization
5. ✅ Optimize untuk mobile devices

---

**Status:** ✅ Ready for integration  
**Performance Target:** 60fps (framer), 30fps (vrm), 60fps (lottie)
