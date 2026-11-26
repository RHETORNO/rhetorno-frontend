import type { VisionResult } from "@/hooks/useVisionTracker"

type Ponto = {
  x: number;
  y: number
}

type PontoCorpo = Ponto & {
  visibility?: number
}

type Categoria = {
  categoryName: string;
  score: number
}

export type Quem = "ia" | "voce" | null

export type Detector = {
  vezes: number
  segundos: number
  ativo: boolean
  momentos: number[]
  atualizar: (valor: number | null, agora: number) => boolean
  segundosAte: (agora: number) => number
  zerar: () => void
}

export const criarDetector = (entrar: number, sair: number, minimoMs = 300): Detector => {
  let desde: number | null = null
  let inicio = 0

  const detector: Detector = {
    vezes: 0,
    segundos: 0,
    ativo: false,
    momentos: [],
    atualizar: (valor, agora) => {
      if (valor === null) {
        desde = null
        return false
      }
      if (!detector.ativo) {
        if (valor < entrar) {
          desde = null
          return false
        }
        desde ??= agora
        if (agora - desde < minimoMs) return false
        detector.ativo = true
        detector.vezes++
        detector.momentos.push(desde)
        inicio = desde
        return true
      }
      if (valor < sair) {
        detector.ativo = false
        detector.segundos += (agora - inicio) / 1000
        desde = null
      }
      return false
    },
    segundosAte: (agora) =>
      detector.segundos + (detector.ativo ? (agora - inicio) / 1000 : 0),
    zerar: () => {
      detector.vezes = 0
      detector.segundos = 0
      detector.ativo = false
      detector.momentos = []
      desde = null
    }
  }
  return detector
}

export const calcularGiro = (p: Ponto[]) => {
  const nariz = p[1]
  const meio = (p[33].x + p[263].x) / 2
  const largura = Math.abs(p[263].x - p[33].x)
  return (meio - nariz.x) / largura
}

export const criarBase = (duracaoMs = 3000, modo: "diferenca" | "proporcao" = "diferenca") => {
  let soma = 0
  let n = 0
  let comeco: number | null = null

  return (valor: number | null, agora: number) => {
    if (valor === null) return null
    comeco ??= agora
    if (agora - comeco < duracaoMs) {
      soma += valor
      n++
      return null
    }
    const media = soma / n
    return modo === "diferenca" ? valor - media : valor / media - 1
  }
}

export const criarVelocidade = (suavizar = 0.5) => {
  let ultimo: { x: number; y: number; t: number } | null = null
  let velocidade = 0

  return (ponto: Ponto | null, escala: number, agora: number) => {
    if (!ponto || !escala) {
      ultimo = null
      velocidade = 0
      return null
    }
    if (ultimo && ultimo.x === ponto.x && ultimo.y === ponto.y) return velocidade
    if (ultimo) {
      const dt = (agora - ultimo.t) / 1000
      if (dt > 0) {
        const v = Math.hypot(ponto.x - ultimo.x, ponto.y - ultimo.y) / escala / dt
        velocidade += (v - velocidade) * suavizar
      }
    }
    ultimo = { x: ponto.x, y: ponto.y, t: agora }
    return velocidade
  }
}

export const criarOscilacao = (amplitude: number, janelaMs = 1200) => {
  let centro: number | null = null
  let lado = 0
  let viradas: number[] = []

  return (valor: number | null, agora: number) => {
    if (valor === null) {
      centro = null
      lado = 0
      viradas = []
      return null
    }
    centro = centro === null ? valor : centro + (valor - centro) * 0.05
    const desvio = valor - centro
    const novo = desvio > amplitude ? 1 : desvio < -amplitude ? -1 : lado
    if (novo !== lado && lado !== 0) viradas.push(agora)
    lado = novo
    viradas = viradas.filter((t) => agora - t < janelaMs)
    return viradas.length >= 2 ? 1 : 0
  }
}

const nomesSinais = [
  "temRosto", "giro", "aceno", "inclinacao", "foraDoCentro", "acenando", "balancando",
  "olharEsquerda", "olharDireita", "olharCima", "olharBaixo", "olhandoCamera", "piscada",
  "sorriso", "franziu", "sobrancelhas", "labios",
  "temCorpo", "ombrosTortos", "ombrosCaidos", "frente", "tras", "seMexendo",
  "temMao", "maoNoRosto", "maoNoCabelo", "gesticulando", "positivo", "apontou", "maoAberta"
] as const

export type Sinais = Record<(typeof nomesSinais)[number], number | null>

const vazio = () => Object.fromEntries(nomesSinais.map((n) => [n, null])) as Sinais

const pontas = [4, 8, 12, 16, 20]

export const criarLeitor = () => {
  const baseAceno = criarBase()
  const baseOmbros = criarBase()
  const basePescoco = criarBase()
  const baseLargura = criarBase(3000, "proporcao")
  const velCorpo = criarVelocidade()
  const velMao = criarVelocidade()
  const oscAceno = criarOscilacao(0.025)
  const oscGiro = criarOscilacao(0.06)

  return (v: VisionResult, agora: number): Sinais => {
    const s = vazio()
    const rosto = v.face?.faceLandmarks[0]
    const categorias: Categoria[] | undefined = v.face?.faceBlendshapes?.[0]?.categories
    const corpo: PontoCorpo[] | undefined = v.pose?.landmarks[0]
    const mao: Ponto[] | undefined = v.gesture?.landmarks[0]
    const gesto: Categoria | undefined = v.gesture?.gestures[0]?.[0]

    let caixa: { esq: number; dir: number; topo: number; base: number } | null = null
    let escalaRosto = 0

    s.temRosto = rosto ? 1 : 0
    if (rosto) {
      const bs = (nome: string) => categorias?.find((c) => c.categoryName === nome)?.score ?? 0
      const olhosY = (rosto[33].y + rosto[263].y) / 2
      escalaRosto = Math.abs(rosto[263].x - rosto[33].x)
      const piscando = (bs("eyeBlinkLeft") + bs("eyeBlinkRight")) / 2 > 0.35

      s.giro = calcularGiro(rosto)
      s.aceno = baseAceno((rosto[1].y - olhosY) / (rosto[152].y - olhosY), agora)
      s.inclinacao = Math.abs(rosto[263].y - rosto[33].y) / escalaRosto
      s.acenando = oscAceno(s.aceno, agora)
      s.balancando = oscGiro(s.giro, agora)

      s.olharEsquerda = (bs("eyeLookOutLeft") + bs("eyeLookInRight")) / 2
      s.olharDireita = (bs("eyeLookOutRight") + bs("eyeLookInLeft")) / 2
      s.olharCima = (bs("eyeLookUpLeft") + bs("eyeLookUpRight")) / 2
      s.olharBaixo = piscando ? null : (bs("eyeLookDownLeft") + bs("eyeLookDownRight")) / 2
      s.piscada = (bs("eyeBlinkLeft") + bs("eyeBlinkRight")) / 2

      s.sorriso = (bs("mouthSmileLeft") + bs("mouthSmileRight")) / 2
      s.franziu = (bs("browDownLeft") + bs("browDownRight")) / 2
      s.sobrancelhas = bs("browInnerUp")
      s.labios = Math.max((bs("mouthPressLeft") + bs("mouthPressRight")) / 2, bs("mouthRollLower"))

      const xs = [rosto[234].x, rosto[454].x]
      caixa = { esq: Math.min(...xs), dir: Math.max(...xs), topo: rosto[10].y, base: rosto[152].y }
      s.foraDoCentro = Math.abs((caixa.esq + caixa.dir) / 2 - 0.5)

      const desviando = Math.max(s.olharEsquerda, s.olharDireita, s.olharCima, s.olharBaixo ?? 0) > 0.3
      const virado = Math.abs(s.giro) > 0.15 || Math.abs(s.aceno ?? 0) > 0.06
      s.olhandoCamera = desviando || virado ? 0 : 1
    } else {
      oscAceno(null, agora)
      oscGiro(null, agora)
    }

    const ombroE = corpo?.[11]
    const ombroD = corpo?.[12]
    const nariz = corpo?.[0]
    const corpoVisivel = !!ombroE && !!ombroD && !!nariz
      && (ombroE.visibility ?? 1) > 0.5 && (ombroD.visibility ?? 1) > 0.5

    s.temCorpo = corpoVisivel ? 1 : 0
    if (corpoVisivel) {
      const largura = Math.abs(ombroE.x - ombroD.x)
      const ombrosY = (ombroE.y + ombroD.y) / 2
      const tortos = baseOmbros((ombroE.y - ombroD.y) / largura, agora)
      const pescoco = basePescoco((ombrosY - nariz.y) / largura, agora)
      const distancia = baseLargura(largura, agora)

      s.ombrosTortos = tortos === null ? null : Math.abs(tortos)
      s.ombrosCaidos = pescoco === null ? null : -pescoco
      s.frente = distancia
      s.tras = distancia === null ? null : -distancia
      s.seMexendo = velCorpo({ x: (ombroE.x + ombroD.x) / 2, y: ombrosY }, largura, agora)
    } else {
      velCorpo(null, 0, agora)
    }

    s.temMao = mao ? 1 : 0
    if (mao) {
      s.gesticulando = velMao(mao[0], escalaRosto, agora)
      s.positivo = gesto?.categoryName === "Thumb_Up" ? gesto.score : 0
      s.apontou = gesto?.categoryName === "Pointing_Up" ? gesto.score : 0
      s.maoAberta = gesto?.categoryName === "Open_Palm" ? gesto.score : 0

      if (caixa) {
        const c = caixa
        const altura = c.base - c.topo
        const folga = (c.dir - c.esq) * 0.1
        const dedos = pontas.map((i) => mao[i])
        s.maoNoRosto = dedos.some((d) =>
          d.x > c.esq - folga && d.x < c.dir + folga && d.y > c.topo && d.y < c.base + folga
        ) ? 1 : 0
        s.maoNoCabelo = dedos.some((d) =>
          d.x > c.esq - folga * 3 && d.x < c.dir + folga * 3 && d.y < c.topo && d.y > c.topo - altura * 0.8
        ) ? 1 : 0
      }
    } else {
      velMao(null, 0, agora)
      s.gesticulando = 0
      s.positivo = 0
      s.apontou = 0
      s.maoAberta = 0
      s.maoNoRosto = 0
      s.maoNoCabelo = 0
    }

    return s
  }
}

type Regra = {
  nome: string
  rotulo: string
  entrar: number
  sair: number
  minimoMs?: number
  silencioso?: boolean
  ler: (s: Sinais) => number | null
}

const oposto = (v: number | null) => (v === null ? null : -v)

export const regras: Regra[] = [
  { nome: "rostoDireita", rotulo: "virou o rosto para direita", entrar: 0.25, sair: 0.15, ler: (s) => s.giro },
  { nome: "rostoEsquerda", rotulo: "virou o rosto para esquerda", entrar: 0.25, sair: 0.15, ler: (s) => oposto(s.giro) },
  { nome: "rostoBaixo", rotulo: "abaixou a cabeça", entrar: 0.08, sair: 0.05, ler: (s) => s.aceno },
  { nome: "rostoCima", rotulo: "levantou a cabeça", entrar: 0.08, sair: 0.05, ler: (s) => oposto(s.aceno) },
  { nome: "inclinou", rotulo: "inclinou a cabeça", entrar: 0.15, sair: 0.1, minimoMs: 500, ler: (s) => s.inclinacao },
  { nome: "acenou", rotulo: "acenou que sim", entrar: 0.5, sair: 0.5, minimoMs: 0, ler: (s) => s.acenando },
  { nome: "balancou", rotulo: "balançou a cabeça que não", entrar: 0.5, sair: 0.5, minimoMs: 0, ler: (s) => s.balancando },
  { nome: "foraDoQuadro", rotulo: "saiu do quadro", entrar: 0.5, sair: 0.5, minimoMs: 1000, ler: (s) => 1 - (s.temRosto ?? 0) },
  { nome: "foraDoCentro", rotulo: "saiu do centro", entrar: 0.18, sair: 0.12, minimoMs: 2000, ler: (s) => s.foraDoCentro },

  { nome: "olharEsquerda", rotulo: "olhou para esquerda", entrar: 0.45, sair: 0.3, minimoMs: 400, ler: (s) => s.olharEsquerda },
  { nome: "olharDireita", rotulo: "olhou para direita", entrar: 0.45, sair: 0.3, minimoMs: 400, ler: (s) => s.olharDireita },
  { nome: "olharCima", rotulo: "olhou para cima", entrar: 0.35, sair: 0.2, minimoMs: 400, ler: (s) => s.olharCima },
  { nome: "olharBaixo", rotulo: "olhou para baixo", entrar: 0.45, sair: 0.3, minimoMs: 500, ler: (s) => s.olharBaixo },
  { nome: "piscou", rotulo: "piscou", entrar: 0.5, sair: 0.3, minimoMs: 0, silencioso: true, ler: (s) => s.piscada },

  { nome: "sorriso", rotulo: "sorriu", entrar: 0.5, sair: 0.3, minimoMs: 400, ler: (s) => s.sorriso },
  { nome: "franziu", rotulo: "franziu a testa", entrar: 0.45, sair: 0.3, minimoMs: 500, ler: (s) => s.franziu },
  { nome: "sobrancelhas", rotulo: "levantou as sobrancelhas", entrar: 0.5, sair: 0.3, minimoMs: 300, ler: (s) => s.sobrancelhas },
  { nome: "labios", rotulo: "apertou ou mordeu os lábios", entrar: 0.45, sair: 0.3, minimoMs: 500, ler: (s) => s.labios },

  { nome: "ombrosTortos", rotulo: "ficou com os ombros tortos", entrar: 0.1, sair: 0.06, minimoMs: 1500, ler: (s) => s.ombrosTortos },
  { nome: "ombrosCaidos", rotulo: "afundou na cadeira", entrar: 0.08, sair: 0.05, minimoMs: 2000, ler: (s) => s.ombrosCaidos },
  { nome: "frente", rotulo: "inclinou o corpo para frente", entrar: 0.12, sair: 0.07, minimoMs: 1500, ler: (s) => s.frente },
  { nome: "tras", rotulo: "inclinou o corpo para trás", entrar: 0.12, sair: 0.07, minimoMs: 1500, ler: (s) => s.tras },
  { nome: "seMexendo", rotulo: "se mexeu na cadeira", entrar: 0.25, sair: 0.12, minimoMs: 600, ler: (s) => s.seMexendo },

  { nome: "maoVisivel", rotulo: "mostrou a mão", entrar: 0.5, sair: 0.5, minimoMs: 500, ler: (s) => s.temMao },
  { nome: "gesticulou", rotulo: "gesticulou", entrar: 1.2, sair: 0.6, minimoMs: 300, ler: (s) => s.gesticulando },
  { nome: "maoNoRosto", rotulo: "levou a mão ao rosto", entrar: 0.5, sair: 0.5, minimoMs: 500, ler: (s) => s.maoNoRosto },
  { nome: "maoNoCabelo", rotulo: "mexeu no cabelo", entrar: 0.5, sair: 0.5, minimoMs: 500, ler: (s) => s.maoNoCabelo },
  { nome: "positivo", rotulo: "fez sinal de positivo", entrar: 0.6, sair: 0.4, minimoMs: 300, ler: (s) => s.positivo },
  { nome: "apontou", rotulo: "apontou", entrar: 0.6, sair: 0.4, minimoMs: 300, ler: (s) => s.apontou },
  { nome: "maoAberta", rotulo: "mostrou a palma da mão", entrar: 0.6, sair: 0.4, minimoMs: 300, ler: (s) => s.maoAberta }
]

type Contagem = { ia: number; voce: number; silencio: number }

export type Trecho = { quem: "ia" | "voce"; de: number; ate: number }

const contagem = (): Contagem => ({ ia: 0, voce: 0, silencio: 0 })

export const criarConversa = () => {
  let anterior: Quem = null
  let fimIa: number | null = null
  let ultimo: number | null = null
  let tempo = contagem()
  let olhando = contagem()
  let gestos = contagem()
  let respostas: number[] = []
  let interrupcoes = 0
  let trechos: Trecho[] = []

  const atualizar = (quem: Quem, olhandoCamera: boolean, gesticulando: boolean, agora: number) => {
    const dt = ultimo === null ? 0 : Math.min((agora - ultimo) / 1000, 0.5)
    ultimo = agora
    const chave = quem ?? "silencio"

    tempo[chave] += dt
    if (olhandoCamera) olhando[chave] += dt
    if (gesticulando) gestos[chave] += dt

    if (quem) {
      const atual = trechos.at(-1)
      if (atual && atual.quem === quem && agora - atual.ate < 600) atual.ate = agora
      else trechos.push({ quem, de: agora, ate: agora })
    }

    if (quem === "ia") fimIa = null
    else if (anterior === "ia") fimIa = agora

    if (quem === "voce" && anterior !== "voce") {
      if (anterior === "ia") interrupcoes++
      else if (fimIa !== null) respostas.push((agora - fimIa) / 1000)
      fimIa = null
    }
    anterior = quem
  }

  const zerar = () => {
    anterior = null
    fimIa = null
    ultimo = null
    tempo = contagem()
    olhando = contagem()
    gestos = contagem()
    respostas = []
    interrupcoes = 0
    trechos = []
  }

  const porcentagem = (parte: number, total: number) => (total > 0 ? Math.round((parte / total) * 100) : null)

  const resumo = () => ({
    segundosFalando: { voce: Math.round(tempo.voce), ia: Math.round(tempo.ia) },
    contatoVisual: {
      falando: porcentagem(olhando.voce, tempo.voce),
      ouvindo: porcentagem(olhando.ia, tempo.ia)
    },
    gesticulouFalando: porcentagem(gestos.voce, tempo.voce),
    tempoParaResponder: {
      media: respostas.length ? +(respostas.reduce((a, b) => a + b, 0) / respostas.length).toFixed(1) : null,
      respostas: respostas.map((r) => +r.toFixed(1))
    },
    interrupcoes
  })

  const falas = () => trechos.filter((t) => t.ate - t.de >= 300)

  return { atualizar, zerar, resumo, falas }
}

export const montarResumo = (
  detectores: Record<string, Detector>,
  conversa: ReturnType<typeof criarConversa>,
  inicio: number,
  agora: number
) => {
  const duracao = Math.max((agora - inicio) / 1000, 1)
  const minutos = duracao / 60
  const metade = inicio + (agora - inicio) / 2

  const eventos = Object.fromEntries(regras.map((r) => {
    const d = detectores[r.nome]
    const segundos = d.segundosAte(agora)
    return [r.nome, {
      rotulo: r.rotulo,
      vezes: d.vezes,
      porMinuto: +(d.vezes / minutos).toFixed(1),
      segundos: +segundos.toFixed(1),
      porcentagem: Math.round((segundos / duracao) * 100),
      primeiraMetade: d.momentos.filter((t) => t < metade).length,
      segundaMetade: d.momentos.filter((t) => t >= metade).length
    }]
  }))

  const relativo = (t: number) => +((t - inicio) / 1000).toFixed(1)

  const linhaDoTempo = {
    falas: conversa.falas().map((f) => ({ quem: f.quem, de: relativo(f.de), ate: relativo(f.ate) })),
    eventos: Object.fromEntries(
      regras
        .filter((r) => !r.silencioso && detectores[r.nome].momentos.length > 0)
        .map((r) => [r.nome, detectores[r.nome].momentos.map(relativo)])
    )
  }

  return { duracao: Math.round(duracao), eventos, conversa: conversa.resumo(), linhaDoTempo }
}

export type Resumo = ReturnType<typeof montarResumo>

const semAcento = (t: string) => t.normalize("NFD").replace(/\p{M}/gu, "")

const vicios = ["tipo", "ne", "entao", "ai", "hum", "hmm", "ee", "eee", "sabe", "basicamente", "literalmente", "enfim", "que"]
const viciosDuplos = ["tipo assim", "meio que", "sei la", "ao qual"]

export const resumirFala = (falas: { quem: "ia" | "voce"; texto: string }[], segundosFalando: number) => {
  const respostas = falas.filter((f) => f.quem === "voce")
  const palavrasPorResposta = respostas.map((r) => semAcento(r.texto.toLowerCase()).match(/[\p{L}']+/gu) ?? [])
  const todas = palavrasPorResposta.flat()
  const contagem: Record<string, number> = {}

  for (let i = 0; i < todas.length; i++) {
    const duplo = `${todas[i]} ${todas[i + 1]}`
    if (viciosDuplos.includes(duplo)) {
      contagem[duplo] = (contagem[duplo] ?? 0) + 1
      i++
    } else if (vicios.includes(todas[i])) {
      contagem[todas[i]] = (contagem[todas[i]] ?? 0) + 1
    }
  }

  return {
    respostas: respostas.length,
    palavras: todas.length,
    palavrasPorMinuto: segundosFalando > 0 ? Math.round(todas.length / (segundosFalando / 60)) : null,
    mediaPalavrasPorResposta: respostas.length ? Math.round(todas.length / respostas.length) : null,
    maiorResposta: Math.max(0, ...palavrasPorResposta.map((p) => p.length)),
    vicios: contagem
  }
}
