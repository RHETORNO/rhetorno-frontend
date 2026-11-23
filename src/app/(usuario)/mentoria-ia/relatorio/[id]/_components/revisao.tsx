"use client"

import { useEffect, useRef, useState } from "react"
import { Pause, Play } from "lucide-react"
import { Orb, type OrbState } from "@/components/bots/orb"
import { cn } from "@/lib/utils"
import { grupos, maiuscula, relogio } from "./grupos"

type Trecho = { quem: "ia" | "voce"; de: number; ate: number }

export type LinhaDoTempo = {
    falas: Trecho[]
    eventos: Record<string, number[]>
}

export type Resposta = {
    pergunta: string
    inicio: number
    resumo: string
    funcionou: string
    faltou: string
    exemplo: string
}

type RevisaoProps = {
    duracao: number
    linha: LinhaDoTempo | null
    rotulos: Record<string, string>
    respostas: Resposta[]
}

const velocidade = 4

const estados: Record<OrbState, string> = {
    idle: "Silêncio",
    listening: "Você está falando",
    speaking: "A mentora está falando",
    thinking: "",
}

const Revisao = ({ duracao, linha, rotulos, respostas }: RevisaoProps) => {
    const [tempo, setTempo] = useState(0)
    const [tocando, setTocando] = useState(false)
    const palcoRef = useRef<HTMLDivElement>(null)
    const tempoRef = useRef(0)

    useEffect(() => {
        tempoRef.current = tempo
    }, [tempo])

    useEffect(() => {
        if (!tocando) return
        let id = 0
        let antes = performance.now()
        const passo = (agora: number) => {
            const dt = (agora - antes) / 1000
            antes = agora
            const proximo = Math.min(tempoRef.current + dt * velocidade, duracao)
            tempoRef.current = proximo
            setTempo(proximo)
            if (proximo >= duracao) setTocando(false)
            else id = requestAnimationFrame(passo)
        }
        id = requestAnimationFrame(passo)
        return () => cancelAnimationFrame(id)
    }, [tocando, duracao])

    const irPara = (segundos: number) => {
        setTocando(false)
        setTempo(Math.min(Math.max(segundos, 0), duracao))
        palcoRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
    }

    const alternar = () => {
        if (!tocando && tempo >= duracao) setTempo(0)
        setTocando((t) => !t)
    }

    const temLinha = linha && duracao > 0
    const pos = (t: number) => `${(Math.min(t, duracao) / duracao) * 100}%`

    const trechoAtual = linha?.falas.find((f) => tempo >= f.de && tempo <= f.ate)
    const estado: OrbState = trechoAtual?.quem === "ia" ? "speaking" : trechoAtual?.quem === "voce" ? "listening" : "idle"

    const agora = linha
        ? Object.entries(linha.eventos)
              .filter(([, momentos]) => momentos.some((m) => m <= tempo && tempo - m < 1.5))
              .map(([nome]) => rotulos[nome])
              .filter(Boolean)
              .slice(0, 3)
        : []

    const faixas = grupos
        .map((g) => ({
            titulo: g.titulo,
            marcas: g.nomes.flatMap((nome) => (linha?.eventos[nome] ?? []).map((t) => ({ t, nome }))),
        }))
        .filter((f) => f.marcas.length > 0)

    return (
        <>
            {temLinha && (
                <section aria-labelledby="revisao" className="flex flex-col gap-5 pt-4">
                    <div className="flex flex-col gap-1">
                        <h2 id="revisao" className="text-2xl font-semibold tracking-tight">
                            Reveja a entrevista
                        </h2>
                        <p className="max-w-prose text-sm text-muted-foreground">
                            Arraste a agulha ou aperte play para ver quem falava e o que a câmera registrou em cada momento.
                        </p>
                    </div>

                    <div
                        ref={palcoRef}
                        className="grid grid-cols-1 gap-6 rounded-3xl bg-sala-noite p-5 text-sala-texto md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] md:p-8"
                    >
                        <div className="flex flex-col items-center justify-center gap-3">
                            <Orb
                                state={estado}
                                interactive={false}
                                label={`Mentora de IA: ${estados[estado].toLowerCase()}`}
                                className="w-36 md:w-full"
                            />
                            <div aria-live="polite" className="flex min-h-16 flex-col items-center gap-1 text-center">
                                <span className="text-sm text-orbe">{estados[estado]}</span>
                                {agora.map((r) => (
                                    <span key={r} className="text-xs text-sala-texto/70">
                                        {maiuscula(r)}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex min-w-0 flex-col gap-4">
                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={alternar}
                                    aria-label={tocando ? "Pausar" : "Reproduzir"}
                                    className="grid size-10 shrink-0 place-items-center rounded-full bg-orbe text-sala-noite transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orbe focus-visible:ring-offset-2 focus-visible:ring-offset-sala-noite"
                                >
                                    {tocando ? <Pause className="size-4" fill="currentColor" /> : <Play className="size-4 translate-x-px" fill="currentColor" />}
                                </button>
                                <span className="text-sm tabular-nums">
                                    {relogio(tempo)}
                                    <span className="text-sala-texto/50"> de {relogio(duracao)}</span>
                                </span>
                            </div>

                            <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-3 gap-y-2 text-xs">
                                <span className="self-center text-sala-texto/60">Perguntas</span>
                                <div className="relative h-6">
                                    {respostas.map((r, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => irPara(r.inicio)}
                                            aria-label={`Ir para a pergunta: ${r.pergunta}`}
                                            title={r.pergunta}
                                            style={{ left: pos(r.inicio) }}
                                            className="group absolute inset-y-0 flex w-3 -translate-x-1/2 justify-center focus-visible:outline-none"
                                        >
                                            <span className="h-full w-0.5 rounded-full bg-sala-texto/40 transition-colors group-hover:bg-orbe group-focus-visible:bg-orbe" />
                                        </button>
                                    ))}
                                </div>

                                <span className="self-center text-sala-texto/60">Conversa</span>
                                <div className="relative h-5 overflow-hidden rounded-full bg-sala-linha/40">
                                    {linha.falas.map((f, i) => (
                                        <span
                                            key={i}
                                            className={cn("absolute inset-y-0", f.quem === "ia" ? "bg-orbe/70" : "bg-sala-texto/85")}
                                            style={{ left: pos(f.de), width: `max(2px, ${((f.ate - f.de) / duracao) * 100}%)` }}
                                        />
                                    ))}
                                    <span aria-hidden className="absolute inset-y-0 w-px bg-orbe" style={{ left: pos(tempo) }} />
                                </div>

                                {faixas.map((f) => (
                                    <div key={f.titulo} className="contents">
                                        <span className="self-center text-sala-texto/60">{f.titulo}</span>
                                        <div className="relative h-5 border-b border-sala-linha/60">
                                            {f.marcas.map((m, i) => {
                                                const perto = m.t <= tempo && tempo - m.t < 1.5
                                                return (
                                                    <span
                                                        key={i}
                                                        title={`${maiuscula(rotulos[m.nome] ?? m.nome)} aos ${relogio(m.t)}`}
                                                        className={cn(
                                                            "absolute bottom-0 w-0.5 -translate-x-1/2 rounded-full transition-[height,background-color] duration-150",
                                                            perto ? "h-5 bg-orbe" : "h-3 bg-sala-texto/45"
                                                        )}
                                                        style={{ left: pos(m.t) }}
                                                    />
                                                )
                                            })}
                                            <span aria-hidden className="absolute inset-y-0 w-px bg-orbe" style={{ left: pos(tempo) }} />
                                        </div>
                                    </div>
                                ))}

                                <span aria-hidden />
                                <div className="relative">
                                    <input
                                        type="range"
                                        min={0}
                                        max={duracao}
                                        step={0.1}
                                        value={tempo}
                                        onChange={(e) => {
                                            setTocando(false)
                                            setTempo(Number(e.target.value))
                                        }}
                                        aria-label="Momento da entrevista"
                                        aria-valuetext={relogio(tempo)}
                                        className="w-full cursor-pointer accent-orbe"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-x-5 gap-y-1 pl-[5.25rem] text-xs text-sala-texto/60">
                                <span className="flex items-center gap-1.5">
                                    <span className="size-2.5 rounded-full bg-orbe/70" /> Mentora
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <span className="size-2.5 rounded-full bg-sala-texto/85" /> Você
                                </span>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {respostas.length > 0 && (
                <section aria-labelledby="respostas" className="flex flex-col gap-5 pt-4">
                    <div className="flex flex-col gap-1">
                        <h2 id="respostas" className="text-2xl font-semibold tracking-tight">
                            Resposta por resposta
                        </h2>
                        <p className="max-w-prose text-sm text-muted-foreground">
                            O que funcionou em cada resposta, o que faltou e um jeito mais forte de dizer a mesma coisa.
                        </p>
                    </div>

                    <ol className="flex flex-col gap-4">
                        {respostas.map((r, i) => (
                            <li key={i} className="rounded-2xl border p-5 md:p-6">
                                <div className="flex min-w-0 flex-col gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <h3 className="text-lg font-medium leading-snug text-balance">{r.pergunta}</h3>
                                        <p className="max-w-prose text-sm text-muted-foreground">{r.resumo}</p>
                                        {temLinha && (
                                            <button
                                                type="button"
                                                onClick={() => irPara(r.inicio)}
                                                className="self-start text-sm font-medium text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 dark:text-blue-300"
                                            >
                                                Rever este trecho ({relogio(r.inicio)})
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-medium text-emerald-700 dark:text-emerald-400">O que funcionou</span>
                                            <p className="leading-snug text-foreground/85">{r.funcionou}</p>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <span className="font-medium text-orange-700 dark:text-orange-400">O que faltou</span>
                                            <p className="leading-snug text-foreground/85">{r.faltou}</p>
                                        </div>
                                    </div>

                                    <figure className="flex flex-col gap-2 rounded-xl bg-blue-600/6 p-4 dark:bg-blue-400/8">
                                        <figcaption className="text-sm font-medium">Uma resposta mais forte</figcaption>
                                        <blockquote className="max-w-prose text-sm leading-relaxed text-foreground/90">
                                            <Exemplo texto={r.exemplo} />
                                        </blockquote>
                                    </figure>
                                </div>
                            </li>
                        ))}
                    </ol>
                </section>
            )}
        </>
    )
}

const Exemplo = ({ texto }: { texto: string }) => (
    <>
        {texto.split(/(\[[^\]]+\])/g).map((parte, i) =>
            parte.startsWith("[") ? (
                <span
                    key={i}
                    className="rounded-md border border-dashed border-blue-600/40 px-1 text-blue-700 dark:border-blue-400/40 dark:text-blue-300"
                >
                    {parte.slice(1, -1)}
                </span>
            ) : (
                parte
            )
        )}
    </>
)

export default Revisao
