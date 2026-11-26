"use client"

import { useState } from "react"
import PixelCard from "@/components/PixelCard"
import { Check } from "lucide-react"
import Link from "next/link"
import { planos } from "../_lib/planos"

const Precos = () => {
 
    const [cardAtivo, setCardAtivo] = useState<string | null>(null)

    return (
        <section className="justify-center text-center py-12 bg-background px-6 md:py-16">
            <div className="revelar flex flex-col gap-3 py-4">
                <h2 className="text-3xl sm:text-4xl"> Comece grátis e evolua no seu ritmo </h2>
                <p className="text-balance text-base text-foreground/70 max-w-3xl mx-auto sm:text-lg"> A versão gratuita permite experimentar a plataforma. Os planos pagos liberam o histórico, as simulações de entrevista com ia e o hub de mentores humanos, podendo-se utilizar uma versão mais intensa. </p>
            </div>
            <div
                className="revelar mx-auto mt-10 grid max-w-screen-2xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
                onPointerLeave={() => setCardAtivo(null)}
                onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setCardAtivo(null)
                }}
            >
                {planos.map((p) => (
                <div
                    key={p.nome}
                    id={`plano-${p.nome.toLowerCase()}`}
                    className="h-full scroll-mt-24"
                    onPointerEnter={() => setCardAtivo(p.nome)}
                    onFocus={() => setCardAtivo(p.nome)}
                >
                <PixelCard
                    colors={["#c7d6ff", "#5f8bff", "#3d6af0"]}
                    glowColor="#5f8bff"
                    shape="circle"
                    origin="center"
                    gap={6}
                    pixelSize={1.5}
                    speed={20}
                    revealDuration={700}
                    spotlight={0.5}
                    glow={0.5}
                    opacity={p.destaque ? 0.5 : 0.35}
                    fade={0.6}
                    trigger={p.destaque && (cardAtivo === null || cardAtivo === p.nome) ? "always" : "hover"}
                    radius={24}
                    clickPulse
                    intro={p.destaque}
                    theme="light"
                    className="h-full! w-full! place-items-stretch dark:bg-none dark:bg-card transition-[translate,box-shadow] duration-700 ease-out hover:-translate-y-1 hover:shadow-[0_18px_40px_-14px_rgba(95,139,255,0.45)]! dark:hover:shadow-[0_18px_40px_-14px_rgba(95,139,255,0.35)]! motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                 <div className="relative flex h-full flex-col gap-4 p-5 text-left xl:p-6">
                    {p.selo && (
                        <span className={`absolute right-0 top-0 rounded-bl-2xl px-4 py-1.5 text-xs font-medium ${p.destaque ? "bg-[#0b1437] text-white dark:bg-blue-500" : "bg-foreground text-background"}`}>
                            {p.selo}
                        </span>
                    )}
                    <h3 className="text-lg font-semibold"> {p.nome} </h3>
                    <p className="text-3xl font-semibold xl:text-4xl">
                        {p.preco}
                        <span className="ml-1 text-base font-normal text-foreground/50">/mês</span>
                    </p>
                    <p className="text-foreground/60"> {p.descricao} </p>
                    <ul className="flex flex-col gap-3 text-sm text-foreground/80">
                        {p.beneficios.map((b) => (
                            <li key={b} className="flex items-start gap-3">
                                <Check className="mt-0.5 size-4 shrink-0 text-[#5f8bff]"/>
                                {b}
                            </li>
                        ))}
                    </ul>
                    <div className="mt-auto pt-6">
                        <Link
                            href="/"
                            className={`flex w-full items-center justify-center rounded-full border py-3 text-sm font-medium transition duration-200 active:scale-95 motion-reduce:active:scale-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5f8bff] ${(cardAtivo === null ? p.destaque : cardAtivo === p.nome) ? "border-transparent bg-[#0b1437] text-white hover:bg-[#1c2d5c] hover:shadow-[0_4px_12px_-2px_rgba(15,27,61,0.25)] dark:bg-blue-500 dark:hover:bg-blue-600" : "border-foreground/20 hover:border-foreground/40"}`}
                        >
                            {p.botao}
                        </Link>
                    </div>
                 </div>
                </PixelCard>
                </div>
                ))}
            </div>
        </section>
    )
}

export default Precos