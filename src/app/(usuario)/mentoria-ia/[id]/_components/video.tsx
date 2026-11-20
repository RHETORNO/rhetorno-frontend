"use client"

import type { RefObject } from "react"
import type { VisionStatus } from "@/hooks/useVisionTracker"

type Props = {
  videoRef: RefObject<HTMLVideoElement | null>
  status: VisionStatus
  fps: number
  camLigada: boolean
}

const Video = ({ videoRef, status, fps, camLigada }: Props) => {
  return (
    <figure className="relative aspect-4/3 max-h-full w-full self-center overflow-hidden rounded-2xl">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`absolute inset-0 h-full w-full -scale-x-100 object-cover transition-opacity duration-300 ${camLigada ? "opacity-100" : "opacity-0"}`}
      />

    

      {status === "loading" && (
        <div className="absolute inset-0 grid place-items-center px-8 text-center text-sm text-sala-texto/70">
          Ligando a câmera e os modelos de IA...
        </div>
      )}
      {status === "error" && (
        <p className="absolute inset-0 grid place-items-center px-8 text-sm text-sala-texto">
          Não conseguimos acessar sua câmera. Libere o acesso no cadeado da barra de endereço e recarregue a página.
      </p>
      )}
      {status === "ready" && !camLigada && (
        <p className="absolute inset-0 grid place-items-center px-8 text-sm text-[#C5D3E9] dark:text-sala-texto">
          Câmera desligada
        </p>
      )}

      <figcaption className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-4 text-sm">
        <span className="font-medium text-[#C5D3E9] dark:text-sala-texto"> Você </span>

        {status === "ready" && camLigada && (
          <span className="flex items-center gap-2 text-sinal"> 
            <span
              aria-hidden>
            {/* pa aparecer so para devs */}
              {process.env.NODE_ENV === "development" && ( 
                <span className="tabular-nums text-sala-texto/50"> {fps} Hz </span>
              )}
            </span>
          </span>
        )}
      </figcaption>
    </figure>
  )
}

export default Video
