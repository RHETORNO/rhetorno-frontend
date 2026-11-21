"use client"

import Link from "next/link"
import { useState } from "react"
import { useTheme } from "next-themes"
import { Menu, Monitor, Moon, Sun } from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { opcoes } from "./menu-entrar"

export type Solucao = {
    titulo: string
    descricao: string
    href: string
}

type MenuMobileProps = {
    solucoes: Solucao[]
    textoClaro: boolean
}

const temas = [
    { valor: "light", nome: "Claro", Icone: Sun },
    { valor: "dark", nome: "Escuro", Icone: Moon },
    { valor: "system", nome: "Sistema", Icone: Monitor },
]

const linkMenu =
    "rounded-xl px-3 py-3 text-lg transition-colors hover:bg-foreground/5 focus-visible:bg-foreground/5 focus-visible:outline-none"

// menu de navegação que só aparece em telas pequenas (celular e tablet em pé)
const MenuMobile = ({ solucoes, textoClaro }: MenuMobileProps) => {
    const [aberto, setAberto] = useState(false)
    const { theme, setTheme } = useTheme()

    const fechar = () => setAberto(false)

    return (
        <Sheet open={aberto} onOpenChange={setAberto}>
            <SheetTrigger
                aria-label="Abrir menu"
                className={`grid size-10 place-items-center rounded-xl transition-colors hover:cursor-pointer hover:bg-foreground/10 focus-visible:ring-2 focus-visible:ring-foreground/40 focus-visible:outline-none lg:hidden ${
                    textoClaro ? "text-white/90" : "text-foreground"
                }`}
            >
                <Menu className="size-6" />
            </SheetTrigger>

            <SheetContent side="right" className="w-[85%] max-w-sm gap-0 overflow-y-auto border-foreground/10 bg-background/45! p-0 shadow-2xl backdrop-blur-2xl backdrop-saturate-150">
                <div className="border-b px-5 pt-5 pb-4">
                    <SheetTitle className="font-titulo text-xl">RHETORNO</SheetTitle>
                    <SheetDescription>Navegue pelo site</SheetDescription>
                </div>

                <nav aria-label="Menu do celular" className="flex flex-col gap-1 px-3 py-4">
                    <Link href="/#candidatos" onClick={fechar} className={linkMenu}>
                        Candidato
                    </Link>
                    <Link href="/como-funciona" onClick={fechar} className={linkMenu}>
                        Como funciona
                    </Link>
                    <Link href="/sobre" onClick={fechar} className={linkMenu}>
                        Sobre
                    </Link>

                    <p className="px-3 pt-5 pb-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Soluções
                    </p>
                    {solucoes.map((s) => (
                        <Link
                            key={s.titulo}
                            href={s.href}
                            onClick={fechar}
                            className="rounded-xl px-3 py-2.5 transition-colors hover:bg-foreground/5 focus-visible:bg-foreground/5 focus-visible:outline-none"
                        >
                            <span className="block font-medium">{s.titulo}</span>
                            <span className="block text-sm text-muted-foreground">{s.descricao}</span>
                        </Link>
                    ))}

                    <p className="px-3 pt-5 pb-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Entrar como
                    </p>
                    <div className="grid grid-cols-2 gap-2 px-1">
                        {opcoes.map(({ href, titulo, Icone }) => (
                            <Link
                                key={href}
                                href={href}
                                onClick={fechar}
                                className="flex items-center justify-center gap-2 rounded-2xl border border-foreground/70 px-3 py-2.5 font-medium transition-colors hover:bg-foreground/5"
                            >
                                <Icone className="size-4" />
                                {titulo}
                            </Link>
                        ))}
                    </div>
                </nav>

                <div className="mt-auto border-t px-5 py-4">
                    <p className="pb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        Tema
                    </p>
                    <div className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
                        {temas.map(({ valor, nome, Icone }) => (
                            <button
                                key={valor}
                                type="button"
                                onClick={() => setTheme(valor)}
                                aria-pressed={theme === valor}
                                className="flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm transition-colors hover:cursor-pointer aria-pressed:bg-background aria-pressed:shadow-sm"
                            >
                                <Icone className="size-4" />
                                {nome}
                            </button>
                        ))}
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}

export default MenuMobile
