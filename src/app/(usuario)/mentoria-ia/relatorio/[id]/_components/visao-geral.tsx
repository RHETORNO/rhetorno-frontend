import { ArrowDownRight, ArrowUpRight } from "lucide-react"
import { ActivityRingsCard } from "@/components/activity-rings-card"
import { PeriodBarChartCard } from "@/components/period-bar-chart-card"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

export type Criterio = {
    nome: string
    nota: number
    comentario: string
}

type VisaoGeralProps = {
    pontuacao: number | null
    criterios: Criterio[]
    resumo: string
}

const classificar = (nota: number) => {
    if (nota >= 85) return "Excelente"
    if (nota >= 70) return "Boa"
    if (nota >= 50) return "Regular"
    return "Em desenvolvimento"
}

const VisaoGeral = ({ pontuacao, criterios, resumo }: VisaoGeralProps) => {
    const nota = pontuacao ?? 0
    const dados = criterios.map((c) => ({ criterio: c.nome.split(" ")[0], nota: c.nota }))

    const ordenados = [...criterios].sort((a, b) => b.nota - a.nota)
    const maisForte = ordenados[0]
    const maisFraco = ordenados.at(-1)

    return (
        <section className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[20rem_minmax(0,1fr)] xl:grid-cols-[20rem_minmax(0,1fr)_minmax(0,1fr)]">
                <ActivityRingsCard
                    className="h-full w-full"
                    title="Pontuação geral"
                    size={150}
                    thickness={12}
                    metrics={[
                        {
                            label: "Classificação",
                            value: nota,
                            max: 100,
                            display: classificar(nota),
                            color: "#2563eb",
                        },
                    ]}
                    center={
                        <>
                            <span className="text-2xl font-semibold tabular-nums">{nota}</span>
                            <span className="text-muted-foreground text-xs">de 100</span>
                        </>
                    }
                />
                {dados.length > 0 && (
                    <PeriodBarChartCard
                        className="h-full w-full"
                        title="Avaliação por critério"
                        data={dados}
                        xKey="criterio"
                        yKey="nota"
                        format="number"
                        compare={false}
                        defaultSelected={maisFraco?.nome.split(" ")[0]}
                        color="#2563eb"
                        barWidth={16}
                        chartClassName="h-44"
                    />
                )}
                <Card className="h-full w-full md:col-span-2 xl:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-base">Resumo da entrevista</CardTitle>
                        <CardDescription>O que a mentora observou na conversa</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <p className="max-w-prose text-sm leading-relaxed text-foreground/85">{resumo}</p>
                    </CardContent>
                    {maisForte && maisFraco && maisForte !== maisFraco && (
                        <CardFooter className="flex flex-col items-stretch gap-2 border-t pt-4 text-sm">
                            <div className="flex items-center justify-between gap-3">
                                <span className="flex items-center gap-2 text-muted-foreground">
                                    <ArrowUpRight className="size-4 shrink-0 text-blue-600 dark:text-blue-400" />
                                    Ponto mais forte
                                </span>
                                <span className="font-medium">
                                    {maisForte.nome}
                                    <span className="ml-2 tabular-nums text-muted-foreground">{maisForte.nota}</span>
                                </span>
                            </div>
                            <div className="flex items-center justify-between gap-3">
                                <span className="flex items-center gap-2 text-muted-foreground">
                                    <ArrowDownRight className="size-4 shrink-0 text-orange-600 dark:text-orange-400" />
                                    Precisa de atenção
                                </span>
                                <span className="font-medium">
                                    {maisFraco.nome}
                                    <span className="ml-2 tabular-nums text-muted-foreground">{maisFraco.nota}</span>
                                </span>
                            </div>
                        </CardFooter>
                    )}
                </Card>
            </div>

            {criterios.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Nota de cada critério</CardTitle>
                        <CardDescription>De 0 a 10, com o motivo da nota</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <dl className="grid grid-cols-1 gap-x-8 gap-y-5 md:grid-cols-2">
                            {criterios.map((c) => (
                                <div key={c.nome} className="flex flex-col gap-1.5">
                                    <dt className="flex items-baseline justify-between gap-3 text-sm font-medium">
                                        {c.nome}
                                        <span className="tabular-nums text-muted-foreground">{c.nota}/10</span>
                                    </dt>
                                    <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                                        <div className="h-full rounded-full bg-blue-600 dark:bg-blue-400" style={{ width: `${c.nota * 10}%` }} />
                                    </div>
                                    <dd className="text-sm leading-snug text-foreground/80">{c.comentario}</dd>
                                </div>
                            ))}
                        </dl>
                    </CardContent>
                </Card>
            )}
        </section>
    )
}

export default VisaoGeral
