"use client"

import {
  useEffect,
  useRef,
  useState
} from "react"

const recurso = "rhetorno-mentoria-resource"
const projeto = "rhetorno-mentoria"
const agente = "affable-agent-541mxrncsr"
const taxa = 24000

export type StatusEntrevista = "parada" | "conectando" | "conectada" | "erro"

const base64ParaAudio = (base64: string) => {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
  const pcm = new Int16Array(bytes.buffer)
  const amostras = new Float32Array(pcm.length)
  for (let i = 0; i < pcm.length; i++) amostras[i] = pcm[i] / 32768
  return amostras
}

const useEntrevista = () => {
  const wsRef = useRef<WebSocket | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const analisadorRef = useRef<{ analyser: AnalyserNode; dados: Float32Array<ArrayBuffer> } | null>(null)
  const proximoRef = useRef(0)
  const [status, setStatus] = useState<StatusEntrevista>("parada")
  const [falando, setFalando] = useState(false)

  const tocar = (base64: string) => {
    const ctx = ctxRef.current
    const analisador = analisadorRef.current
    if (!ctx || !analisador) return

    const amostras = base64ParaAudio(base64)
    const buffer = ctx.createBuffer(1, amostras.length, taxa)
    buffer.copyToChannel(amostras, 0)

    const font = ctx.createBufferSource()
    font.buffer = buffer
    font.connect(analisador.analyser)
    proximoRef.current = Math.max(proximoRef.current, ctx.currentTime)
    font.start(proximoRef.current)
    proximoRef.current += buffer.duration

    font.onended = () => {
      if (ctx.currentTime >= proximoRef.current - 0.05) setFalando(false)
    }
    setFalando(true)
  }

  const encerrar = () => {
    wsRef.current?.close(1000)
    wsRef.current = null
    ctxRef.current?.close()
    ctxRef.current = null
    analisadorRef.current = null
    setFalando(false)
    setStatus("parada")
  }

  const iniciar = async () => {
    if (wsRef.current) return
    setStatus("conectando")

    try {
      const ctx = new AudioContext({ sampleRate: taxa })
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 512
      analyser.connect(ctx.destination)
      ctxRef.current = ctx
      analisadorRef.current = { analyser, dados: new Float32Array(analyser.fftSize) }
      proximoRef.current = 0

      const resposta = await fetch("api/voz/token", { method: "POST" }) 
      if (!resposta.ok) throw new Error(`token falhou (${resposta.status})`)
      const { token } = await resposta.json()

      const url = `wss://${recurso}.services.ai.azure.com/api/projects/${projeto}`
        + `/agents/${agente}/endpoint/protocols/voice`
        + `?api-version=v1`
        + `&authorization=${encodeURIComponent("Bearer " + token)}`

      const ws = new WebSocket(url)
      wsRef.current = ws 
      ws.onopen = () => {
        setStatus("conectada")
        ws.send(JSON.stringify({ type: "session.update", seassion: { type: "realtime" } }))
      }

      ws.onmessage = (e) => {
        const m = JSON.parse(e.data)
        if (m.type === "response.output_audio:delta") tocar(m.delta)
          else if (m.type === "error") console.error("[entrevista]", m.error)
      }

      ws.onclose = (e) => {
        if (wsRef.current !== ws) return
        console.warn("[entrevista] conexão fechou", e.code, e.reason)
        encerrar()
        if (e.code !== 1000) setStatus("erro")
      }
    } catch (erro) {
      console.error("[entrevista]", erro)
      encerrar()
      setStatus("erro")
    }
  }


  useEffect(() => {
    return () => {
      wsRef.current?.close(1000)
      ctxRef.current?.close()
    }
  }, [])

  const getNivelFala = () => {
    const a = analisadorRef.current

    if (!a) return 0
    a.analyser.getFloatTimeDomainData(a.dados)
    let soma = 0
    for (const v of a.dados) soma += v * v
    const volume = Math.sqrt(soma / a.dados.length)
    return Math.max(0, Math.min(1, (volume - 0.01) * 6))
  }

  return { status, falando, iniciar, encerrar, getNivelFala }
  
}

export default useEntrevista