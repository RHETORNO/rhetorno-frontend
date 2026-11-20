"use server";

import { refresh } from "next/cache";
import { getCurrentUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";

type Resultado = { erro: string } | undefined;

const FORMATO_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  
async function buscarInscricao(idCurso: string) {
  const user = await getCurrentUser();
  const supabase = await createClient();

  const { data } = await supabase
    .from("inscricao_curso")
    .select("id, status")
    .eq("idperfil", user.id)
    .eq("idcurso", idCurso)
    .maybeSingle();

  return { user, supabase, inscricao: data };
}

export async function alternarCursoSalvo(idCurso: string): Promise<Resultado> {
  if (!FORMATO_ID.test(idCurso)) return { erro: "Curso inválido." };

  const { user, supabase, inscricao } = await buscarInscricao(idCurso);

  if (inscricao?.status === "inscrito" || inscricao?.status === "concluido") {
    return { erro: "Você já se inscreveu neste curso." };
  }

  const { error } = inscricao
    ? await supabase.from("inscricao_curso").delete().eq("id", inscricao.id)
    : await supabase
        .from("inscricao_curso")
        .insert({ idperfil: user.id, idcurso: idCurso, status: "salvo" });

  if (error) return { erro: "Não foi possível salvar o curso. Tente novamente." };

  refresh();
}

// A inscrição acontece no site da instituição, não aqui.
// Esta função só registra o que a PRÓPRIA PESSOA informou ("Já me inscrevi").
export async function informarInscricao(idCurso: string): Promise<Resultado> {
  if (!FORMATO_ID.test(idCurso)) return { erro: "Curso inválido." };

  const { user, supabase, inscricao } = await buscarInscricao(idCurso);

  if (inscricao?.status === "inscrito" || inscricao?.status === "concluido") {
    return;
  }

  const { error } = inscricao
    ? await supabase
        .from("inscricao_curso")
        .update({ status: "inscrito", inscrito_em: new Date().toISOString() })
        .eq("id", inscricao.id)
    : await supabase
        .from("inscricao_curso")
        .insert({ idperfil: user.id, idcurso: idCurso, status: "inscrito" });

  if (error) return { erro: "Não foi possível registrar sua inscrição." };

  refresh();
}