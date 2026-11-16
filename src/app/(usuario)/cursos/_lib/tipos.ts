// Os tipos abaixo vêm do arquivo gerado pelo Supabase (só lemos, não alteramos).
// Se a equipe mudar o banco e gerar o arquivo de novo, o TypeScript avisa aqui.
import type { Enums, Tables } from "@/lib/supabase/database.types";

// Enum status_inscricao: salvo | inscrito | concluido | cancelado
export type StatusInscricao = Enums<"status_inscricao">;

// Da tabela habilidade usamos só id e nome.
export type Habilidade = Pick<Tables<"habilidade">, "id" | "nome">;

// Todas as colunas da tabela curso + as habilidades que ele desenvolve.
export type Curso = Tables<"curso"> & {
  desenvolve: { habilidade: Habilidade | null }[];
};

export type CursoComDados = Curso & {
  status: StatusInscricao | null;
  faltantes: string[];
  maisRapido: boolean;
};

export type Aba = "recomendados" | "todos" | "meus";

export type Filtros = {
  q: string;
  local: string;
  modalidade: string;
  turno: string;
  habilidade: string;
  aba: Aba;
  // Só a aba "Todos" usa: quantas vezes a pessoa clicou em "Carregar mais" (começa em 1).
  pagina: number;
};