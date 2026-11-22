"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { OrbState } from "@/components/bots/orb"
import useVisionTracker from "@/hooks/useVisionTracker"
import PainelOrb from "./orb"
import Video from "./video"
import Controles from "./controles"
import { SplitText } from "@/components/ui/split-text"
import useEntrevista from "@/hooks/useEntrevista"
import Legendas from "./legenda"
import useComportamento from "@/hooks/useComportamento"

const estadosTeste: OrbState[] = ['idle', 'listening', 'thinking', 'speaking']

const formatarTempo = (s: number) => 
  `${String(Math.floor(s / 60)).padStart(2, "0")} : ${String(s % 60).padStart(2, "0")}`


const Sala = () => {
  const router = useRouter()
  const [orbState, setOrbState] = useState<OrbState>('idle')
  const [micLigado, setMicLigado] = useState(true)
  const [camLigada, setCamLigada] = useState(true)
  const [segundos, setSegundos] = useState(0)
  
  const { videoRef, resultRef, status, fps, getAudioLevel, setMicrofone, setCamera } =
  useVisionTracker()

  const entrevista = useEntrevista()
  const comportamento = useComportamento(resultRef, {
    ativo: () => entrevista.status === "conectada",
    quemFala: entrevista.getQuemFala
  })

  const estadoOrb: OrbState =
    entrevista.status === "conectada" ? (entrevista.falando ? "speaking" : "listening")
      : entrevista.status === "conectando" ? "thinking" 
        : orbState

  const nivelOrb =
    estadoOrb === "speaking" ? entrevista.getNivelFala
      : micLigado ? getAudioLevel
      : () => 0

  useEffect(() => {
    const id = setInterval(() => setSegundos((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const alternarMic = () => {
    setMicrofone(!micLigado)
    entrevista.setMicrofone(!micLigado)
    setMicLigado(!micLigado)
  }

  const alternarCam = () => {
    setCamera(!camLigada)
    setCamLigada(!camLigada)
  }
  
  return (
    <main className="flex h-dvh w-full flex-col gap-6 overflow-hidden p-4 text-[#8CA9D2] dark:text-sala-texto md:p-8">
      <header className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-5">
          <span className="text-[#8CA9D2] dark:text-sala-texto/60">
          </span>
        </div>
        <time
          aria-label="Tempo de entrevista"
          className="tabular-nums text-[#8CA9D2] dark:text-sala-texto/80">
          {formatarTempo(segundos)}
        </time>
      </header>

      <section className="grid min-h-0 flex-1 grid-cols-1 items-center gap-6 md:grid-cols-[1.2fr_1fr] md:gap-12">
        <PainelOrb
          state={estadoOrb}
          visao={resultRef}
          nivelAudio={nivelOrb}
        />
        <Video videoRef={videoRef} visao={resultRef} status={status} fps={fps} camLigada={camLigada} />
      </section>

      <div className="flex flex-col items-center gap-6 md:gap-8">
        <h1 className="max-w-3xl text-balance text-center text-xl font-light leading-snug tracking-tight text-[#2B7FA8] dark:text-sala-texto md:text-3xl">
          {entrevista.status === "conectada"
            ? <Legendas texto={entrevista.fala} progresso={entrevista.getProgresso} />
            : <SplitText text="Quando estiver pronto, comece a entrevista." by="word" immediate stagger={0.06} duration={0.7} />
          }
        </h1>

        <Controles
          micLigado={micLigado}
          camLigada={camLigada}
          onMic={alternarMic}
          onCam={alternarCam}
          entrevista={entrevista.status}
          onIniciar={entrevista.iniciar}
          onEncerrar={() => {
            console.log("[resumo]", comportamento.getResumo())
            entrevista.encerrar()
            router.push("/mentoria-ia")
          }}
        />
      </div>

      {/* odeio esse comentario, mas esse modo é so pra dev */}
      {process.env.NODE_ENV === "development" && (
        <div className="flex justify-center gap-2 text-xs">
          {estadosTeste.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setOrbState(s)}
              aria-pressed={orbState === s}
              className="rounded-full border border-sala-linha px-3 py-1 text-[#8CA9D2] dark:text-sala-texto aria-pressed:border-orbe aria-pressed:text-orbe">
              {s}
            </button>
          ))}
          <button
            type="button"
            className="rounded-full border border-sala-linha px-3 py-1 text-[#8CA9D2] dark:text-sala-texto/60">
            Próxima pergunta
          </button>
        </div>
      )}
    </main>
  )
}

export default Sala
 