import {
  createClient
} from "@/lib/supabase/server"
import {
  getCredencial
} from "@/lib/azure"

const endpoint = "https://rhetorno-mentoria-resource.services.ai.azure.com/openai/v1/responses"
const modelo = "analista"

//molde do arquivo jsonnn
 
const item = {
  type: "object",
  properties: {
    titulo: { type: "string" },
    descricao: { type: "string" }
  },
  required: ["titulo", "descricao"],
  additionalProperties: false
}

const formato = {
  type: "object",
  properties: {
    pontuacao_geral: { type: "integer", description: "nota geral de 0 a 100" },
    resumo: { type: "string" },
    criterios: {
      type: "array",
      items: {
        type: "object",
        properties: {
          nome: { type: "string" },
          nota: { type: "integer", description: "0 a 10" },
          comentario: { type: "string"}
        },
        required: ["nome", "nota", "comentario"],
        additionalProperties: false
      }
    },
    foi_bem: { type: "array", items: item },
    melhorar: { type: "array", items: item },
    proximo_passo: { type: "array", items: item},
    respostas: {
      type: "array",
      items: {
        type: "object",
        properties: {
          pergunta: { type: "string" },
          inicio: { type: "number", description: "o t da pergunta na conversa, em segundos" },
          resumo: { type: "string" },
          funcionou: { type: "string" },
          faltou: { type: "string" },
          exemplo: { type: "string" }
        },
        required: ["pergunta", "inicio", "resumo", "funcionou", "faltou", "exemplo"],
        additionalProperties: false
      }
    }
  },
  required: ["pontuacao_geral", "resumo", "criterios", "foi_bem", "melhorar", "proximo_passo", "respostas"],
  additionalProperties: false
}

// item é um molde reaproveitado rs
// required para os campos nao virm vazio e o additionalProperties para nao vir extra, 
// se acontecer recusa

// prompt gerado por ia
const instrucoes = `Você é um mentor de entrevistas de emprego. Vai receber os dados de uma entrevista simulada:
- "conversa": a transcrição (quem: "ia" é a entrevistadora, "voce" é o candidato; t = segundos desde o início).
- "fala": métricas da fala do candidato (palavras por minuto, tamanho das respostas, vícios de linguagem).
- "comportamento": contagens da webcam. Cada evento tem vezes, porMinuto, segundos, porcentagem do tempo e as contagens na primeira e na segunda metade. "conversa" traz contato visual falando/ouvindo (% do tempo), tempo médio para responder e interrupções.

Regras:
- Escreva em português do Brasil, falando direto com o candidato ("você").
- Avalie o conteúdo das respostas (clareza, estrutura, exemplos concretos) e a comunicação não verbal.
- Cite números reais dos dados (ex.: "você desviou o olhar 12 vezes, cerca de 3 por minuto"). Compare primeira e segunda metade quando houver diferença clara.
- Descreva só o que é observável. Nunca diga que a pessoa estava nervosa, insegura, mentindo ou qualquer estado emocional.
- A câmera fica acima da tela: "olhar para baixo" pode ser a pessoa lendo a tela. Seja cauteloso com isso.
- Ignore eventos com 0 vezes. Não invente dados que não estão no JSON.
- Seja gentil e prático: cada ponto de "melhorar" deve dizer o que fazer na próxima vez.
- criterios: exatamente estes, nesta ordem: "Conteúdo das respostas", "Clareza e objetividade", "Ritmo e vícios de linguagem", "Contato visual", "Linguagem corporal", "Postura".
- foi_bem, melhorar e proximo_passo: de 2 a 4 itens cada.
- A entrevista termina quando o candidato decide encerrar: ignore a última pergunta da entrevistadora se ela ficou sem resposta.
- respostas: um item para cada pergunta da entrevistadora que o candidato respondeu, na ordem da conversa. "pergunta": a pergunta resumida em uma frase. "inicio": o t da pergunta. "resumo": o que o candidato respondeu, em uma frase. "funcionou" e "faltou": uma ou duas frases cada. "exemplo": uma versão melhor da resposta, em primeira pessoa, curta (até 5 frases), usando só o que o candidato contou; se faltou um exemplo concreto, indique entre colchetes onde ele entraria, como [cite um projeto seu].`

type Item = { titulo: string; descricao: string }

type Relatorio = {
  pontuacao_geral: number
  resumo: string
  criterios: { nome: string; nota: number; comentario: string }[]
  foi_bem: Item[]
  melhorar: Item[]
  proximo_passo: Item[]
  respostas: { pergunta: string; inicio: number; resumo: string; funcionou: string; faltou: string; exemplo: string }[]
}

const categorias = ["foi_bem", "melhorar", "proximo_passo"] as const

const enviar = async (init: RequestInit) => {
  try {
    return await fetch(endpoint, init)
  }
  catch (erro) {
    console.warn("[entrevista/analisar] a rede falhou, tentando de novo", erro)
    await new Promise((r) => setTimeout(r, 1500))
    return fetch(endpoint, init)
  }
}

const POST = async (req: Request) => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ erro: "faça login" }, { status: 401 })

  const { comportamento, fala, conversa, salvarHistorico } = await req.json()
  if (!conversa?.length) return Response.json({ erro: "entrevista vazia" }, { status: 400 })

  try {
    const { token } = await getCredencial().getToken("https://cognitiveservices.azure.com/.default")

    const resposta = await enviar({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        model: modelo,
        instructions: instrucoes,
        input: JSON.stringify({ comportamento, fala, conversa }),
        text: { format: { type: "json_schema", name: "relatorio", schema: formato, strict: true}}
      })
    })
    if (!resposta.ok) throw new Error(`azure ${resposta.status}: ${await resposta.text()}`)

    const dados = await resposta.json()
    const mensagem = dados.output.find((o: { type: string }) => o.type === "message")
    const texto = mensagem?.content.find((c: { type: string }) => c.type === "output_text")?.text
    if (!texto) throw new Error("o modelo nao devolveu texto")

    const relatorio: Relatorio = JSON.parse(texto)

    const { data: analise } = await supabase
      .from("analise_curriculo")
      .select("id, cargo_alvo, curriculo!inner(idperfil)")
      .eq("curriculo.idperfil", user.id)
      .order("criada_em", { ascending: false })
      .limit(1)
      .maybeSingle()

    const { data: entrevista, error: erroEntrevista } = await supabase
      .from("entrevista_ia")
      .insert({
        idperfil: user.id,
        idanalise_curriculo: analise?.id ?? null,
        cargo_foco: analise?.cargo_alvo ?? "Geral",
        agendada_para: new Date().toISOString(),
        status: "concluida",
        resumo: relatorio.resumo,
        pontuacao_geral: relatorio.pontuacao_geral,
        criterios: relatorio.criterios,
        respostas: relatorio.respostas,
        metricas: { comportamento, fala },
        qtd_perguntas: conversa.filter((f: { quem: string }) => f.quem === "ia").length,
        consentimento_observacao: true,
        salvar_historico: salvarHistorico === true,
        transcricao: salvarHistorico === true ? conversa : null
      })
      .select("id")
      .single()
    if (erroEntrevista) throw erroEntrevista

    const itens = categorias.flatMap((categoria) =>
      relatorio[categoria].map((i, ordem) => ({
        identrevista_ia: entrevista.id,
        categoria,
        titulo: i.titulo,
        descricao: i.descricao,
        ordem
      }))
    )
    const { error: erroItens } = await supabase.from("feedback_entrevista_item").insert(itens)
    if (erroItens) throw erroItens

    return Response.json({ id: entrevista.id })
  }
  catch (erro) {
    console.error("[entrevista/analisar]", erro)
    return Response.json({ erro: "nao foi possivel analisar a entrevista"}, {status: 500})
  }
}

export { POST }