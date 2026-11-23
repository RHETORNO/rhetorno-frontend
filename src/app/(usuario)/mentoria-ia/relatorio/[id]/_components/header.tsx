import Link from "next/link"
import { Clock, Timer, Briefcase, Mic } from "lucide-react"
import { SplitText } from "@/components/ui/split-text"

type HeaderProps = {
    criadaEm: string
    duracao?: number
    cargo?: string | null
}

const formatarData = (data: string) =>
    new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "long",
        timeStyle: "short",
        timeZone: "America/Sao_Paulo",
    }).format(new Date(data))

const formatarDuracao = (segundos: number) => {
    const min = Math.floor(segundos / 60)
    const seg = segundos % 60
    return min ? `${min} min ${seg.toString().padStart(2, "0")} s` : `${seg} s`
}

const Header = ({ criadaEm, duracao, cargo }: HeaderProps) => {
    return (
        <section className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex min-w-0 flex-col gap-4">
                <SplitText text="Sua entrevista foi analisada" className="text-4xl" immediate />
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                        <Clock className="size-4 shrink-0" />
                        {formatarData(criadaEm)}
                    </span>
                    {duracao != null && (
                        <span className="flex items-center gap-1.5">
                            <Timer className="size-4 shrink-0" />
                            {formatarDuracao(duracao)} de conversa
                        </span>
                    )}
                    {cargo && cargo !== "Geral" && (
                        <span className="flex items-center gap-1.5">
                            <Briefcase className="size-4 shrink-0" />
                            Vaga: {cargo}
                        </span>
                    )}
                </div>
            </div>

            <Link href="/mentoria-ia" className="flex shrink-0 items-center gap-2 self-start rounded-full border border-foreground/70 px-4 py-2 text-sm md:self-auto">
                <Mic className="size-4 shrink-0" />
                Fazer outra entrevista
            </Link>
        </section>
    )
}

export default Header
