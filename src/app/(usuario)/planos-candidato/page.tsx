import { createClient } from "@/lib/supabase/server";
import CardPlano, { PlanoCardData } from "@/components/cards-planos/cards-planos";

interface PlanoBanco {
  id: number;
  nome: string;
  preco_mensal?: number | null;
  valor_mensal?: number | null;
  valor?: number | null;
  preco?: number | null;
  limite_analises?: number | null;
  limite_entrevistas?: number | null;
}

/**
 * Busca os dados de um plano na tabela "planos" pelo nome ("Gratuito", "Premium").
 * Retorna null quando o plano não está cadastrado no banco.
 */
async function buscarPlanoPorNome(
  supabase: Awaited<ReturnType<typeof createClient>>,
  nomePlano: string
): Promise<PlanoBanco | null> {
  const { data, error } = await supabase
    .from("planos")
    .select("*")
    .ilike("nome", nomePlano.trim())
    .maybeSingle();

  if (error) {
    console.error(`Erro ao buscar plano "${nomePlano}" na tabela planos:`, error);
    return null;
  }

  return (data as PlanoBanco | null) ?? null;
}

function extrairPrecoPlano(plano: PlanoBanco | null, fallback: number): number {
  if (!plano) return fallback;
  return (
    plano.preco_mensal ??
    plano.valor_mensal ??
    plano.valor ??
    plano.preco ??
    fallback
  );
}

function formatarPrecoBRL(valor: number): string {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export default async function PlanosCandidatoPage() {
  const supabase = await createClient();

  const [planoGratuitoDb, planoPremiumDb] = await Promise.all([
    buscarPlanoPorNome(supabase, "Gratuito"),
    buscarPlanoPorNome(supabase, "Premium"),
  ]);

  const planosCandidatos: PlanoCardData[] = [
    {
      id: planoGratuitoDb?.id ?? "gratuito",
      tag: "Para começar",
      nome: planoGratuitoDb?.nome ?? "Gratuito",
      subtitulo: "Dê os primeiros passos na sua preparação.",
      precoFormatado: formatarPrecoBRL(extrairPrecoPlano(planoGratuitoDb, 0)),
      periodo: "por mês",
      destaque: false,
      textoBotao: "Começar gratuitamente",
      beneficios: [
        `${planoGratuitoDb?.limite_analises ?? 3} análises de currículo`,
        "Feedback básico",
        "Acesso a vagas",
        "Trilha de desenvolvimento",
      ],
    },
    {
      id: "essencial",
      tag: "Preparação essencial",
      nome: "Essencial",
      subtitulo: "Pratique e acompanhe sua preparação.",
      precoFormatado: "R$ 49,90",
      periodo: "por mês",
      destaque: false,
      textoBotao: "Escolher Essencial",
      beneficios: [
        "15 análises de currículo",
        "Histórico de análises",
        "5 simulações de entrevista",
        "Análise de respostas",
      ],
    },
    {
      id: planoPremiumDb?.id ?? "premium",
      tag: "Plano principal",
      nome: planoPremiumDb?.nome ?? "Premium",
      subtitulo: "Mais recursos para acelerar sua evolução.",
      precoFormatado: formatarPrecoBRL(
        extrairPrecoPlano(planoPremiumDb, 89.9)
      ),
      periodo: "por mês",
      destaque: true,
      textoBotao: "Escolher Premium",
      beneficios: [
        `${planoPremiumDb?.limite_analises ?? 30} análises de currículo`,
        "Histórico de análises",
        `${planoPremiumDb?.limite_entrevistas ?? 10} simulações de entrevista`,
        "Análise de respostas",
        "Indicadores visuais",
        "Mentor IA",
      ],
    },
    {
      id: "elite",
      tag: "Uso intensivo",
      nome: "Elite",
      subtitulo: "Intensifique sua preparação com mais recursos.",
      precoFormatado: "R$ 129,90",
      periodo: "por mês",
      destaque: false,
      textoBotao: "Escolher Elite",
      beneficios: [
        "45 análises de currículo",
        "Histórico de análises",
        "20 simulações de entrevista",
        "Análise de respostas",
        "Indicadores visuais",
        "Mentor IA",
        "Relatórios comparativos",
        "Maior volume de mentor IA",
      ],
    },
  ];

  return (
    <article className="min-h-screen px-6 py-8 md:px-10">
      <div className="mx-auto max-w-[1200px]">
        {/* Cabeçalho */}
        <header>
          <h1 className="text-2xl font-bold tracking-tight text-[#212D62] md:text-[28px]">
            Planos e Evolução
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Escolha o plano ideal para acelerar sua preparação e conquistar sua
            próxima oportunidade.
          </p>
        </header>

        {/* Subtítulo da seção */}
        <div className="mt-6">
          <h2 className="text-sm font-bold text-[#1E293B]">
            Planos para sua evolução
          </h2>
          <p className="mt-0.5 text-xs text-[#64748B]">Cobrança mensal</p>
        </div>

        {/* .map() direto no page.tsx delegando cada card para cards-planos.tsx */}
        <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {planosCandidatos.map((plano) => (
            <CardPlano key={plano.id} plano={plano} />
          ))}
        </section>

        {/* Rodapé informativo */}
        <p className="mt-5 text-[11px] text-[#64748B]">
          Valores mensais em reais (R$). Escolha o plano de acordo com a sua
          preparação.
        </p>
      </div>
    </article>
  );
}