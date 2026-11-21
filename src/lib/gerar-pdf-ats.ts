import { jsPDF } from "jspdf"

export interface DadosCabecalhoAts {
  nome: string
  email: string
  telefone: string
  localizacao: string
  linkedin: string
  portfolio: string
}

const SECOES_ATS = new Set([
  "RESUMO PROFISSIONAL",
  "OBJETIVO PROFISSIONAL",
  "OBJETIVO",
  "EXPERIÊNCIA PROFISSIONAL",
  "EXPERIENCIA PROFISSIONAL",
  "PROJETOS RELEVANTES",
  "PROJETOS",
  "FORMAÇÃO ACADÊMICA",
  "FORMACAO ACADEMICA",
  "CURSOS E CERTIFICAÇÕES",
  "CURSOS E CERTIFICACOES",
  "COMPETÊNCIAS TÉCNICAS",
  "COMPETENCIAS TECNICAS",
  "HABILIDADES TÉCNICAS",
  "IDIOMAS",
  "CERTIFICAÇÕES",
  "CERTIFICACOES",
])

export function extrairCorpoSemCabecalho(textoBruto: string): string {
  if (!textoBruto) return ""
  const linhas = textoBruto.split(/\r?\n/)
  const idxPrimeiraSecao = linhas.findIndex((l) => SECOES_ATS.has(l.trim().toUpperCase()))

  if (idxPrimeiraSecao > 0) {
    return linhas.slice(idxPrimeiraSecao).join("\n").trim()
  }
  return textoBruto.trim()
}

export function montarTextoCurriculoAts(
  textoBase: string,
  comDadosPessoais: boolean,
  dados?: DadosCabecalhoAts
): string {
  const corpo = extrairCorpoSemCabecalho(textoBase)
  if (!corpo) return ""
  if (!comDadosPessoais || !dados) return corpo

  const linhaNome = dados.nome.trim() || "NOME COMPLETO DO CANDIDATO"
  const linhaContatos = [
    dados.localizacao.trim(),
    dados.telefone.trim(),
    dados.email.trim(),
    dados.linkedin.trim(),
    dados.portfolio.trim(),
  ]
    .filter(Boolean)
    .join(" | ")

  return [linhaNome, linhaContatos, "", corpo]
    .filter((item, idx) => idx !== 1 || item !== "")
    .join("\n")
}

function sanitizarParaHelvetica(str: string): string {
  return str.replace(/•/g, "-").replace(/[^\x00-\xFF]/g, "").trim()
}

export function baixarCurriculoAtsPdf(params: {
  textoBase: string
  comDadosPessoais: boolean
  dados?: DadosCabecalhoAts
  cargoAlvo?: string | null
}) {
  const corpo = extrairCorpoSemCabecalho(params.textoBase)
  if (!corpo) return

  const fatoresEscala = [1.0, 0.92, 0.85, 0.78]

  for (let tentativa = 0; tentativa < fatoresEscala.length; tentativa++) {
    const escala = fatoresEscala[tentativa]
    const ehUltimaTentativa = tentativa === fatoresEscala.length - 1

    const doc = new jsPDF({ unit: "mm", format: "a4" })
    const margemX = 14
    const larguraUtil = 182
    const topoY = 14
    const limiteY = 285
    let y = topoY
    let estourouPagina = false

    const fontNome = 14 * escala
    const fontContato = 9 * escala
    const fontSecao = 10 * escala
    const fontCorpo = 9.3 * escala
    const lineHeight = 4.2 * escala
    const gapVazio = 2.4 * escala
    const gapAntesSecao = 2.4 * escala

    if (params.comDadosPessoais && params.dados) {
      const linhaNome = sanitizarParaHelvetica(
        params.dados.nome.trim() || "NOME COMPLETO DO CANDIDATO"
      )
      const linhaContatos = sanitizarParaHelvetica(
        [
          params.dados.localizacao.trim(),
          params.dados.telefone.trim(),
          params.dados.email.trim(),
          params.dados.linkedin.trim(),
          params.dados.portfolio.trim(),
        ]
          .filter(Boolean)
          .join(" | ")
      )

      doc.setFont("helvetica", "bold")
      doc.setFontSize(fontNome)
      doc.setTextColor(20, 28, 58)
      ;(doc.splitTextToSize(linhaNome, larguraUtil) as string[]).forEach((parte) => {
        doc.text(parte, margemX, y)
        y += 5.8 * escala
      })

      if (linhaContatos) {
        doc.setFont("helvetica", "normal")
        doc.setFontSize(fontContato)
        doc.setTextColor(75, 85, 99)
        ;(doc.splitTextToSize(linhaContatos, larguraUtil) as string[]).forEach((parte) => {
          doc.text(parte, margemX, y)
          y += 4.2 * escala
        })
      }

      doc.setDrawColor(180, 188, 208)
      doc.line(margemX, y, margemX + larguraUtil, y)
      y += 4.5 * escala
    }

    const linhas = corpo.split(/\r?\n/)

    for (let i = 0; i < linhas.length; i++) {
      const limpa = sanitizarParaHelvetica(linhas[i])

      if (!limpa) {
        y += gapVazio
        continue
      }

      const ehSecao = SECOES_ATS.has(limpa.toUpperCase())

      if (ehSecao) {
        if (y > topoY + 2) y += gapAntesSecao
        doc.setFont("helvetica", "bold")
        doc.setFontSize(fontSecao)
        doc.setTextColor(20, 28, 58)
      } else {
        doc.setFont("helvetica", "normal")
        doc.setFontSize(fontCorpo)
        doc.setTextColor(25, 25, 25)
      }

      const partes = doc.splitTextToSize(limpa, larguraUtil) as string[]
      for (let p = 0; p < partes.length; p++) {
        if (y > limiteY) {
          if (!ehUltimaTentativa) {
            estourouPagina = true
            break
          }
          doc.addPage()
          y = topoY
        }
        doc.text(partes[p], margemX, y)
        y += lineHeight
      }

      if (estourouPagina) break

      if (ehSecao && y < limiteY) {
        doc.setDrawColor(205, 210, 220)
        doc.line(margemX, y - 2.6 * escala, margemX + larguraUtil, y - 2.6 * escala)
        y += 1.2 * escala
      }
    }

    if (!estourouPagina) {
      const slug = (params.cargoAlvo || "otimizado")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")

      const sufixo = params.comDadosPessoais ? "completo" : "sem-dados"
      doc.save(`curriculo-ats-${slug}-${sufixo}.pdf`)
      return
    }
  }
}