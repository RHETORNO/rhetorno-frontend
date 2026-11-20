"use client"

import { useEffect, useRef, type RefObject } from "react"
import type { VisionResult } from "@/hooks/useVisionTracker"

const contornos = {
  oval: [
    10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
    397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
    172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109
  ],
  olhoDireito: [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7],
  olhoEsquerdo: [263, 466, 388, 387, 386, 385, 384, 398, 362, 382, 381, 380, 374, 373, 390, 249],
  boca: [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146]
}
const nomes = Object.keys(contornos) as (keyof typeof contornos)[]
const pontas = [4, 8, 12, 16, 20]
const cor = "159, 232, 255"

type Ponto = { x: number; y: number }

type Props = {
  videoRef: RefObject<HTMLVideoElement | null>
  visao: RefObject<VisionResult>
}

const seguir = (atual: Ponto[], alvo: Ponto[], k: number) => {
  if (atual.length !== alvo.length) return alvo.map((p) => ({ ...p }))
  atual.forEach((p, i) => {
    p.x += (alvo[i].x - p.x) * k
    p.y += (alvo[i].y - p.y) * k
  })
  return atual
}

const Overlay = ({ videoRef, visao }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const calmo = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const dpr = Math.min(window.devicePixelRatio, 2)

    const ajustar = () => {
      canvas.width = canvas.clientWidth * dpr
      canvas.height = canvas.clientHeight * dpr
    }
    const observador = new ResizeObserver(ajustar)
    observador.observe(canvas)

    const rosto: Partial<Record<keyof typeof contornos, Ponto[]>> = {}
    let ombros: Ponto[] = []
    let dedos: Ponto[] = []
    let alfa = 0
    let antes = performance.now()
    let id = 0

    const bolinha = (p: Ponto, raio: number, opacidade: number) => {
      ctx.fillStyle = `rgba(${cor}, ${opacidade})`
      ctx.beginPath()
      ctx.arc(p.x, p.y, raio * dpr, 0, Math.PI * 2)
      ctx.fill()
    }

    const contornar = (pontos: Ponto[]) => {
      const n = pontos.length
      const meio = (a: Ponto, b: Ponto) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 })
      const inicio = meio(pontos[n - 1], pontos[0])
      ctx.moveTo(inicio.x, inicio.y)
      pontos.forEach((p, i) => {
        const m = meio(p, pontos[(i + 1) % n])
        ctx.quadraticCurveTo(p.x, p.y, m.x, m.y)
      })
      ctx.closePath()
    }

    const desenhar = (agora: number) => {
      id = requestAnimationFrame(desenhar)
      const dt = Math.min((agora - antes) / 1000, 0.1)
      antes = agora
      const t = calmo ? 0 : agora / 1000
      const k = 1 - Math.exp(-dt * 14)

      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      const video = videoRef.current
      if (!video || !video.videoWidth) return

      const escala = Math.max(w / video.videoWidth, h / video.videoHeight)
      const dx = (w - video.videoWidth * escala) / 2
      const dy = (h - video.videoHeight * escala) / 2
      const tela = (p: Ponto) => ({
        x: dx + p.x * video.videoWidth * escala,
        y: dy + p.y * video.videoHeight * escala
      })

      const { face, pose, gesture } = visao.current
      const cara = face?.faceLandmarks[0]
      alfa += ((cara ? 1 : 0) - alfa) * (1 - Math.exp(-dt * 6))
      if (alfa < 0.01) return

      if (cara) {
        for (const nome of nomes) {
          rosto[nome] = seguir(rosto[nome] ?? [], contornos[nome].map((i) => tela(cara[i])), k)
        }
      }

      const corpo = pose?.landmarks[0]
      const ombrosVisiveis = corpo && (corpo[11].visibility ?? 0) > 0.5 && (corpo[12].visibility ?? 0) > 0.5
      ombros = seguir(ombros, ombrosVisiveis ? [tela(corpo[11]), tela(corpo[12])] : [], k)

      const mao = gesture?.landmarks[0]
      dedos = seguir(dedos, mao ? pontas.map((i) => tela(mao[i])) : [], k)

      ctx.globalAlpha = alfa

      ctx.save()
      ctx.lineCap = "round"
      ctx.shadowColor = `rgba(${cor}, 0.8)`
      ctx.shadowBlur = 6 * dpr

      for (const nome of nomes) {
        const pontos = rosto[nome]
        if (!pontos || pontos.length < 3) continue
        const ehOval = nome === "oval"

        ctx.beginPath()
        contornar(pontos)
        ctx.lineWidth = (ehOval ? 2.5 : 2) * dpr
        ctx.strokeStyle = `rgba(${cor}, ${ehOval ? 0.9 : 0.75})`
        ctx.setLineDash([0.1, (ehOval ? 7 : 4.5) * dpr])
        ctx.lineDashOffset = -t * (ehOval ? 12 : 6) * dpr
        ctx.stroke()
      }

      ctx.restore()

      if (ombros.length === 2) {
        const [a, b] = ombros
        ctx.strokeStyle = `rgba(${cor}, 0.5)`
        ctx.lineWidth = dpr
        ctx.setLineDash([2 * dpr, 6 * dpr])
        ctx.lineDashOffset = -t * 20 * dpr
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
        ctx.setLineDash([])

        const fase = (t * 0.8) % 1
        for (const p of ombros) {
          bolinha(p, 3, 1)
          ctx.strokeStyle = `rgba(${cor}, ${1 - fase})`
          ctx.beginPath()
          ctx.arc(p.x, p.y, (4 + fase * 10) * dpr, 0, Math.PI * 2)
          ctx.stroke()
        }
      }

      dedos.forEach((p, i) => {
        const brilho = 0.5 + 0.5 * Math.sin(t * 4 + i)
        bolinha(p, 2.5, 0.4 + brilho * 0.6)
      })

      ctx.globalAlpha = 1
    }
    id = requestAnimationFrame(desenhar)

    return () => {
      cancelAnimationFrame(id)
      observador.disconnect()
    }
  }, [videoRef, visao])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full -scale-x-100"
    />
  )
}

export default Overlay
