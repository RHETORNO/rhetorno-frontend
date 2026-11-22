"use client"

import {
  useEffect,
  useRef,
  useState
} from "react"
import type { Quem } from "@/lib/comportamento"

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

const audioParaBase64 = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer)
  let texto = ""
  for (let i = 0; i < bytes.length; i++) texto += String.fromCharCode(bytes[i])
  return btoa(texto)
}

const useEntrevista = () => {
  const wsRef = useRef<WebSocket | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const micCtxRef = useRef<AudioContext | null>(null)
  const micRef = useRef<MediaStream | null>(null)
  const analisadorRef = useRef<{ analyser: AnalyserNode; dados: Float32Array<ArrayBuffer> } | null>(null)
  const fontesRef = useRef(new Set<AudioBufferSourceNode>())
  const proximoRef = useRef(0)
  const inicioFalaRef = useRef<number | null>(null)
  const duracaoFalaRef = useRef(0)
  const voceFalandoRef = useRef(false)
  const [fala, setFala] = useState("")
  const [status, setStatus] = useState<StatusEntrevista>("parada")
  const [falando, setFalando] = useState(false)

  const tocar = (base64: string) => {
    const ctx = ctxRef.current
    const analisador = analisadorRef.current
    if (!ctx || !analisador) return

    const amostras = base64ParaAudio(base64)
    const buffer = ctx.createBuffer(1, amostras.length, taxa)
    buffer.copyToChannel(amostras, 0)

    const fonte = ctx.createBufferSource()
    fonte.buffer = buffer
    fonte.connect(analisador.analyser)
    proximoRef.current = Math.max(proximoRef.current, ctx.currentTime)
    if (inicioFalaRef.current === null) inicioFalaRef.current = proximoRef.current
    fonte.start(proximoRef.current)
    proximoRef.current += buffer.duration
    duracaoFalaRef.current += buffer.duration

    fontesRef.current.add(fonte)
    fonte.onended = () => {
      fontesRef.current.delete(fonte)
      if (fontesRef.current.size === 0) setFalando(false)
    }
    setFalando(true)
  }

  const calar = () => {
    for (const fonte of fontesRef.current) fonte.stop()
    fontesRef.current.clear()
    proximoRef.current = 0
    setFalando(false)
  }

  const encerrar = () => {
    wsRef.current?.close(1000)
    wsRef.current = null
    micRef.current?.getTracks().forEach((t) => t.stop())
    micRef.current = null
    micCtxRef.current?.close()
    micCtxRef.current = null
    ctxRef.current?.close()
    ctxRef.current = null
    analisadorRef.current = null
    fontesRef.current.clear()
    setFalando(false)
    setStatus("parada")
    setFala("")
    voceFalandoRef.current = false
  }

  const iniciar = async () => {
    if (wsRef.current) return
    setStatus("conectando")

    try {
      const ctx = new AudioContext({ sampleRate: taxa })
      const micCtx = new AudioContext()
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 512
      analyser.connect(ctx.destination)
      ctxRef.current = ctx
      micCtxRef.current = micCtx
      analisadorRef.current = { analyser, dados: new Float32Array(analyser.fftSize) }
      proximoRef.current = 0

      const [resposta, mic] = await Promise.all([
        fetch("/api/voz/token", { method: "POST" }),
        navigator.mediaDevices.getUserMedia({
         audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true}
        }),
        micCtx.audioWorklet.addModule("/worklets/microfone.js")
      ])
      micRef.current = mic
      if (!resposta.ok) throw new Error(`token falhou (${resposta.status})`)
      const { token } = await resposta.json()

      const url = `wss://${recurso}.services.ai.azure.com/api/projects/${projeto}`
        + `/agents/${agente}/endpoint/protocols/voice`
        + `?api-version=v1`
        + `&authorization=${encodeURIComponent("Bearer " + token)}`

      const ws = new WebSocket(url)
      wsRef.current = ws 

      const fonteMic = micCtx.createMediaStreamSource(mic)
      const gravador = new AudioWorkletNode(micCtx, "microfone")
      fonteMic.connect(gravador)
      gravador.connect(micCtx.destination)
      gravador.port.onmessage = (e: MessageEvent<ArrayBuffer>) => {
        if (ws.readyState !== WebSocket.OPEN) return
        ws.send(JSON.stringify({ type: "input_audio_buffer.append", audio: audioParaBase64(e.data) }))
      }
  
      ws.onopen = () => {
        setStatus("conectada")
        ws.send(JSON.stringify({ type: "session.update", session: { type: "realtime" } }))
      }

      ws.onmessage = (e) => {
        const m = JSON.parse(e.data)
        if (m.type === "response.output_audio.delta") tocar(m.delta)
        else if (m.type === "response.created") {
          setFala("")
          inicioFalaRef.current = null
          duracaoFalaRef.current = 0
        }
          else if (m.type === "response.output_audio_transcript.delta") setFala((f) => f + m.delta)
          else if (m.type === "input_audio_buffer.speech_started") {
            voceFalandoRef.current = true
            calar()
          }
          else if (m.type === "input_audio_buffer.speech_stopped") voceFalandoRef.current = false
          else if (m.type === "error") console.error("[entrevista]", m.error?.message ?? m.error)
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
      micCtxRef.current?.close()
      micRef.current?.getTracks().forEach((t) => t.stop())
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

  const getProgresso = () => {
    const ctx = ctxRef.current
    const inicio = inicioFalaRef.current
    if (!ctx || inicio === null || duracaoFalaRef.current === 0) return 0
    return Math.max(0, Math.min(1, (ctx.currentTime - inicio) / duracaoFalaRef.current))
  }

  const setMicrofone = (ligado: boolean) => 
    micRef.current?.getAudioTracks().forEach((t) => { t.enabled = ligado })

  const getQuemFala = (): Quem =>
    fontesRef.current.size > 0 ? "ia" : voceFalandoRef.current ? "voce" : null

  return { status, falando, fala, iniciar, encerrar, getNivelFala, getProgresso, getQuemFala, setMicrofone }
  
}

export default useEntrevista