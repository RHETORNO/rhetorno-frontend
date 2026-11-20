"use client"

import type { RefObject } from "react"
import { Orb, type OrbState } from "@/components/bots/orb"
import type { VisionResult } from "@/hooks/useVisionTracker"

const rotulos: Record<OrbState, string> = {
  idle: 'Aguardando',
  listening: 'Escutando você',
  thinking: 'Analisando',
  speaking: 'Falando'
}

const gaze_ganho = 1.6
const gaze_vies_x = 0.5

const limitar = (v: number) => Math.max(-1, Math.min(1, v))

type Props = {
  state: OrbState
  visao: RefObject<VisionResult>
  nivelAudio: () => number
}

const PainelOrb = ({ state, visao, nivelAudio }: Props) => {
  const olharDoRosto = () => {
    const nariz = visao.current.face?.faceLandmarks[0]?.[1]
    if (!nariz) return null
    return {
      x: limitar((0.5 - nariz.x) * 2 * gaze_ganho + gaze_vies_x),
      y: limitar((nariz.y - 0.5) * 2 * gaze_ganho),
    }
  }

  return (
    <div className="flex min-h-0 flex-col items-center gap-4">
      <Orb
        state={state}
        active
        gaze={olharDoRosto}
        audioLevel={state === "listening" ? nivelAudio : undefined}
        className="w-[min(280px,65%)] md:w-[min(440px,85%)]"
      />
      <p
        aria-live="polite"
        className="text-sm text-[#42BFE8]/60 dark:text-orbe"
      >
        {rotulos[state]}
      </p>
    </div>
  )
}

export default PainelOrb
