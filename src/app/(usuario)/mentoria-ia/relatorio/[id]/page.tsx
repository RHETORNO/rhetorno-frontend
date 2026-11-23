import { Suspense } from "react"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { Resumo, resumirFala } from "@/lib/comportamento"
import Header from "./_components/header"
import VisaoGeral, { type Criterio } from "./_components/visao-geral"
import Devolutiva from "./_components/devolutiva"
import Comportamento from "./_components/comportamento"
import Revisao, { type LinhaDoTempo, type Resposta } from "./_components/revisao"

type Metricas = {
    comportamento: (Resumo & { linhaDoTempo?: LinhaDoTempo }) | null
    fala: ReturnType<typeof resumirFala> | null
}

const Page = ({ params }: { params: Promise<{ id: string }> }) => {
    return (
        <Suspense fallback={<p className="text-muted-foreground">Carregando relatório...</p>}>
            <Relatorio params={params} />
        </Suspense>
    )
}

export default Page

const Relatorio = async ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params
    if (!/^\d+$/.test(id)) notFound()

    const supabase = await createClient()
    const { data: entrevista } = await supabase
        .from("entrevista_ia")
        .select(`
            id, cargo_foco, criada_em, pontuacao_geral, resumo, criterios, respostas, metricas,
            feedback_entrevista_item ( categoria, titulo, descricao, ordem )
        `)
        .eq("id", Number(id))
        .maybeSingle()

    if (!entrevista) notFound()

    const criterios = (entrevista.criterios ?? []) as Criterio[]
    const metricas = (entrevista.metricas ?? { comportamento: null, fala: null }) as Metricas
    const respostas = (entrevista.respostas ?? []) as Resposta[]
    const rotulos = Object.fromEntries(
        Object.entries(metricas.comportamento?.eventos ?? {}).map(([nome, e]) => [nome, e.rotulo])
    )
    const itens = [...entrevista.feedback_entrevista_item].sort((a, b) => a.ordem - b.ordem)
    const daCategoria = (categoria: string) => itens.filter((i) => i.categoria === categoria)

    return (
        <div className="flex flex-col gap-8">
            <Header
                criadaEm={entrevista.criada_em}
                duracao={metricas.comportamento?.duracao}
                cargo={entrevista.cargo_foco} />
            <VisaoGeral
                pontuacao={entrevista.pontuacao_geral}
                criterios={criterios}
                resumo={entrevista.resumo} />
            <Revisao
                duracao={metricas.comportamento?.duracao ?? 0}
                linha={metricas.comportamento?.linhaDoTempo ?? null}
                rotulos={rotulos}
                respostas={respostas} />
            <Devolutiva
                foiBem={daCategoria("foi_bem")}
                melhorar={daCategoria("melhorar")}
                proximoPasso={daCategoria("proximo_passo")} />
            <Comportamento
                comportamento={metricas.comportamento}
                fala={metricas.fala} />
        </div>
    )
}
