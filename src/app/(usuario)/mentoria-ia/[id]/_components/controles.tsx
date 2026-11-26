"use client" 

import
{
  Mic,
  MicOff,
  Video, 
  VideoOff
} from "lucide-react"
import type { StatusEntrevista } from "@/hooks/useEntrevista"

type Props = {
  micLigado: boolean
  camLigada: boolean
  entrevista: StatusEntrevista
  onIniciar: () => void
  onMic: () => void
  onCam: () => void
  onEncerrar: () => void
}

const redondo =
  'grid size-12 place-items-center rounded-full border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orbe'
const ligado = 
  'border-sala-linha bg-sala-superficie text-sala-texto hover:border-orbe/60'
const desligado =
  'border-sala-texto bg-sala-texto text-sala-noite'
const botaoLigacao =
  "ml-3 h-12 rounded-full bg-sala-texto px-6 text-sm font-medium text-sala-noite transition-colors hover:bg-black/25 dark:hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orbe disabled:opacity-60"
const rotuloBotao: Record<StatusEntrevista, string> = {
  parada: "Começar entrevista",
  conectando: "Conectando...",
  conectada: "Encerrar entrevista",
  erro: "Tentar de novo"
}

const Controles = ({ micLigado, camLigada, onMic, onCam, onEncerrar, entrevista, onIniciar }: Props) => {
  return (
    <footer className="flex items-center justify-center gap-3">
      <button
        type="button"
        onClick={onMic}
        aria-label={micLigado ? "Desligar microfone" : "Ligar microfone"}
        className={`${redondo} ${micLigado ? ligado : desligado}`}>
          {micLigado ? <Mic className="size-5 text-black/60 dark:text-sala-texto" /> : <MicOff className="size-5 text-black/60 dark:text-sala-texto" />}
      </button>

      <button
        type="button"
        onClick={onCam}
        aria-label={camLigada ? "Desliga câmera" : "Ligar câmera"}
        className={`${redondo} ${camLigada ? ligado : desligado}`}
      >
        {camLigada ? <Video className="size-5 text-black/60 dark:text-sala-texto" /> : <VideoOff className="size-5 text-black/60 dark:text-sala-texto" />}
      </button>
      
      <button
        type="button"
        onClick={entrevista === "conectada" ? onEncerrar : onIniciar}
        disabled={entrevista === "conectando"}
        className={botaoLigacao}
      >
        {rotuloBotao[entrevista]}
      </button>
      
    </footer>
  )
}


export default Controles