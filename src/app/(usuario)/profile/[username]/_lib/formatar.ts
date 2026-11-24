const fuso = "America/Sao_Paulo"

export const mesAno = (data: string) =>
  new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric", timeZone: fuso }).format(new Date(data))

export const diaMes = (data: string) =>
  new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short", timeZone: fuso })
    .format(new Date(data))
    .replace(".", "")

export const chaveMes = (data: string) =>
  new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", timeZone: fuso }).format(new Date(data))

export const iniciais = (nome: string) => {
  const partes = nome.trim().split(/\s+/).filter(Boolean)
  if (partes.length === 0) return "?"
  const primeira = partes[0][0]
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : ""
  return (primeira + ultima).toUpperCase()
}

export const primeiroNome = (nome: string) => nome.trim().split(/\s+/)[0] ?? nome

export const plural = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`
