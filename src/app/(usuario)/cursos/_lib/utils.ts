import type { Aba, Filtros } from "./tipos";

// Acima disso, a trilha daquela habilidade é considerada longa (decisão do PO).
export const LIMITE_TRILHA_RAPIDA_H = 160;

// Quantos cursos a aba "Todos" mostra de cada vez ("Carregar mais" traz outros 30).
export const TAMANHO_PAGINA = 30;

// Proteção: ninguém precisa de mais que isso (50 x 30 = 1500 cursos).
const PAGINA_MAXIMA = 50;

// Algum filtro de busca está preenchido? (a aba não conta)
export function temFiltroAtivo(filtros: Filtros): boolean {
  return Boolean(
    filtros.q ||
      filtros.local ||
      filtros.modalidade ||
      filtros.turno ||
      filtros.habilidade,
  );
}

// ["Excel", "Python"] -> "Excel e Python"
export function juntarNomes(nomes: string[]): string {
  return new Intl.ListFormat("pt-BR", { type: "conjunction" }).format(nomes);
}

export const MODALIDADES = ["presencial", "hidrido", "semipresencial", "EAD"];
export const TURNOS = ["manha", "tarde", "noturno", "integral"];

export const ABAS: { valor: Aba; titulo: string }[] = [
  { valor: "recomendados", titulo: "Recomendados para você" },
  { valor: "todos", titulo: "Todos os cursos" },
  { valor: "meus", titulo: "Meus cursos" },
];

const ROTULOS: Record<string, string> = {
  presencial: "Presencial",
  hidrido: "Híbrido",
  semipresencial: "Semipresencial",
  EAD: "Online (EAD)",
  manha: "Manhã",
  tarde: "Tarde",
  noturno: "Noite",
  integral: "Integral",
};

export function rotulo(valor: string | null) {
  if (!valor) return "";
  return ROTULOS[valor] ?? valor;
}

export function formatarCarga(horas: number | null, completo = false) {
  if (!horas) return "";
  if (completo) return horas === 1 ? "1 hora" : `${horas} horas`;
  return `${horas}h`;
}

export function formatarLocal(cidade: string, uf: string | null) {
  return uf ? `${cidade}, ${uf}` : cidade;
}

function lerAba(valor: string): Aba {
  if (valor === "todos" || valor === "meus") return valor;
  return "recomendados";
}

// "2" -> 2. Qualquer coisa estranha ("abc", "-5", vazio) vira 1.
function lerPagina(valor: string): number {
  const numero = Number.parseInt(valor, 10);
  if (!Number.isInteger(numero) || numero < 1) return 1;
  return Math.min(numero, PAGINA_MAXIMA);
}

export function lerFiltros(
  params: Record<string, string | string[] | undefined>,
): Filtros {
  const ler = (chave: string) => {
    const valor = params[chave];
    return typeof valor === "string" ? valor.trim() : "";
  };

  return {
    q: ler("q"),
    local: ler("local"),
    modalidade: ler("modalidade"),
    turno: ler("turno"),
    habilidade: ler("habilidade"),
    aba: lerAba(ler("aba")),
    pagina: lerPagina(ler("pagina")),
  };
}

// Monta o link de /cursos com os filtros atuais.
// Trocar de aba ou de filtro sempre volta para a primeira parte da lista;
// só o "Carregar mais" passa a página.
export function hrefCursos(filtros: Filtros, aba?: Aba, pagina = 1) {
  const params = new URLSearchParams();

  if (filtros.q) params.set("q", filtros.q);
  if (filtros.local) params.set("local", filtros.local);
  if (filtros.modalidade) params.set("modalidade", filtros.modalidade);
  if (filtros.turno) params.set("turno", filtros.turno);
  if (filtros.habilidade) params.set("habilidade", filtros.habilidade);

  const abaFinal = aba ?? filtros.aba;
  if (abaFinal !== "recomendados") params.set("aba", abaFinal);
  if (pagina > 1) params.set("pagina", String(pagina));

  const texto = params.toString();
  return texto ? `/cursos?${texto}` : "/cursos";
}
