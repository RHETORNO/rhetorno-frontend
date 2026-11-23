export const grupos = [
    { titulo: "Rosto", nomes: ["rostoDireita", "rostoEsquerda", "rostoBaixo", "rostoCima", "inclinou", "acenou", "balancou", "foraDoQuadro", "foraDoCentro"] },
    { titulo: "Olhar", nomes: ["olharEsquerda", "olharDireita", "olharCima", "olharBaixo"] },
    { titulo: "Expressão", nomes: ["sorriso", "franziu", "sobrancelhas", "labios"] },
    { titulo: "Postura", nomes: ["ombrosTortos", "ombrosCaidos", "frente", "tras", "seMexendo"], tempo: true },
    { titulo: "Mãos", nomes: ["gesticulou", "maoAberta", "apontou", "positivo", "maoNoRosto", "maoNoCabelo"] },
]

export const maiuscula = (t: string) => t.charAt(0).toUpperCase() + t.slice(1)

export const relogio = (segundos: number) => {
    const s = Math.max(0, Math.round(segundos))
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`
}
