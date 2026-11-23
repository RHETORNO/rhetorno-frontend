import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Resumo, resumirFala } from "@/lib/comportamento"
import { grupos, maiuscula } from "./grupos"

type ComportamentoProps = {
    comportamento: Resumo | null
    fala: ReturnType<typeof resumirFala> | null
}

const comAcento: Record<string, string> = { ne: "né", entao: "então", ai: "aí", "sei la": "sei lá" }

const decimal = (n: number) => n.toLocaleString("pt-BR", { maximumFractionDigits: 1 })

const Numero = ({ valor, unidade, rotulo }: { valor: string; unidade?: string; rotulo: string }) => (
    <div className="flex flex-col gap-1">
        <span className="text-2xl font-semibold tabular-nums">
            {valor}
            {unidade && <span className="ml-0.5 text-base font-normal text-muted-foreground">{unidade}</span>}
        </span>
        <span className="text-xs leading-snug text-muted-foreground">{rotulo}</span>
    </div>
)

const Comportamento = ({ comportamento, fala }: ComportamentoProps) => {
    if (!comportamento) return null

    const { eventos, conversa } = comportamento
    const vicios = Object.entries(fala?.vicios ?? {}).sort((a, b) => b[1] - a[1])

    const numeros = [
        conversa.contatoVisual.falando != null && { valor: `${conversa.contatoVisual.falando}`, unidade: "%", rotulo: "olhando para a câmera enquanto você falava" },
        conversa.contatoVisual.ouvindo != null && { valor: `${conversa.contatoVisual.ouvindo}`, unidade: "%", rotulo: "olhando para a câmera enquanto ouvia" },
        conversa.tempoParaResponder.media != null && { valor: decimal(conversa.tempoParaResponder.media), unidade: "s", rotulo: "em média para começar a responder" },
        fala?.palavrasPorMinuto != null && { valor: `${fala.palavrasPorMinuto}`, rotulo: "palavras por minuto" },
        { valor: `${conversa.interrupcoes}`, rotulo: conversa.interrupcoes === 1 ? "vez que você falou por cima da mentora" : "vezes que você falou por cima da mentora" },
    ].filter((n) => n !== false)

    return (
        <section aria-labelledby="comportamento" className="flex flex-col gap-5 pt-4">
            <div className="flex flex-col gap-1">
                <h2 id="comportamento" className="text-2xl font-semibold tracking-tight">
                    O que a câmera registrou
                </h2>
                <p className="max-w-prose text-sm text-muted-foreground">
                    Contagens feitas no seu próprio navegador durante a conversa. Nenhum vídeo foi gravado ou enviado, só os números.
                </p>
            </div>

            <Card>
                <CardContent className="grid grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-5">
                    {numeros.map((n) => <Numero key={n.rotulo} {...n} />)}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {grupos.map((grupo) => {
                    const linhas = grupo.nomes
                        .map((nome) => eventos[nome])
                        .filter((e) => e && e.vezes > 0)

                    return (
                        <Card key={grupo.titulo} className="h-full">
                            <CardHeader>
                                <CardTitle className="text-base">{grupo.titulo}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {linhas.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">Nada registrado aqui.</p>
                                ) : (
                                    <ul className="flex flex-col divide-y divide-border">
                                        {linhas.map((e) => (
                                            <li key={e.rotulo} className="flex items-baseline justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
                                                <span className="flex flex-col gap-0.5 text-sm">
                                                    <span className="leading-snug">{maiuscula(e.rotulo)}</span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {grupo.tempo
                                                            ? `${e.porcentagem}% do tempo`
                                                            : `${decimal(e.porMinuto)} por minuto`}
                                                        {e.primeiraMetade !== e.segundaMetade &&
                                                            `, ${e.primeiraMetade} na 1ª metade e ${e.segundaMetade} na 2ª`}
                                                    </span>
                                                </span>
                                                <span className="shrink-0 text-lg font-semibold tabular-nums">
                                                    {e.vezes}
                                                    <span className="ml-0.5 text-sm font-normal text-muted-foreground">×</span>
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>
                    )
                })}

                <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="text-base">Vícios de linguagem</CardTitle>
                        {fala && (
                            <CardDescription>
                                {fala.palavras} palavras em {fala.respostas} {fala.respostas === 1 ? "resposta" : "respostas"}
                            </CardDescription>
                        )}
                    </CardHeader>
                    <CardContent>
                        {vicios.length === 0 ? (
                            <p className="text-sm text-muted-foreground">Nenhum vício de linguagem encontrado.</p>
                        ) : (
                            <ul className="flex flex-wrap gap-2">
                                {vicios.map(([palavra, vezes]) => (
                                    <li key={palavra} className="inline-flex items-baseline gap-1.5 rounded-full border px-3 py-1 text-sm">
                                        “{comAcento[palavra] ?? palavra}”
                                        <span className="tabular-nums text-muted-foreground">{vezes}×</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>
        </section>
    )
}

export default Comportamento
