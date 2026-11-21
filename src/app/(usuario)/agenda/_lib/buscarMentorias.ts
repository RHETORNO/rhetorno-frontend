import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

export type StatusMentoria = Database["public"]["Enums"]["status_mentoria"];

export type Mentoria = {
  id: number;
  status: StatusMentoria;
  tipo: string | null;
  link_chamada: string | null;
  horario_disponivel: { inicio: string; fim: string } | null;
  mentor: { foto_url: string; cargo_atual: string | null } | null;
};

const COLUNAS =
  "id, status, tipo, link_chamada, horario_disponivel(inicio, fim), mentor(foto_url, cargo_atual)";

export async function buscarMentorias(idPerfil: string): Promise<Mentoria[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("mentoria")
    .select(COLUNAS)
    .eq("idperfil", idPerfil)
    .neq("status", "cancelada");

  if (error) throw new Error(error.message);

  return (data ?? []) as unknown as Mentoria[];
}