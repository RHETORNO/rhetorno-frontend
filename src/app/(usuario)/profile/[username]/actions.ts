"use server"

import { refresh } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { UFS } from "./_lib/ufs"

export type EstadoEdicao = {
  ok?: boolean
  erro?: string
  campo?: "bio" | "cidade" | "uf" | "linkedin_url" | "telefone"
}

const texto = (formData: FormData, nome: string) => String(formData.get(nome) ?? "").trim()

export async function atualizarPerfil(_anterior: EstadoEdicao, formData: FormData): Promise<EstadoEdicao> {
  const bio = texto(formData, "bio")
  const cidade = texto(formData, "cidade")
  const uf = texto(formData, "uf").toUpperCase()
  const linkedin = texto(formData, "linkedin_url")
  const telefone = texto(formData, "telefone")

  if (bio.length > 500)
    return { erro: "A apresentação passou de 500 caracteres. Encurte um pouco.", campo: "bio" }
  if (cidade.length > 80)
    return { erro: "O nome da cidade está longo demais.", campo: "cidade" }
  if (uf && !UFS.includes(uf))
    return { erro: "Escolha uma UF da lista.", campo: "uf" }
  if (linkedin && !/^https:\/\/(www\.)?linkedin\.com\/in\/[\w\-%.]+\/?$/i.test(linkedin))
    return { erro: "Use o endereço do seu perfil, no formato https://linkedin.com/in/seu-nome.", campo: "linkedin_url" }
  if (telefone && !/^[\d\s()+-]{10,20}$/.test(telefone))
    return { erro: "Telefone inválido. Use DDD e número, por exemplo (11) 91234-5678.", campo: "telefone" }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { erro: "Sua sessão expirou. Entre novamente para salvar." }

  const { error } = await supabase
    .from("perfil")
    .update({
      bio: bio || null,
      cidade: cidade || null,
      uf: uf || null,
      linkedin_url: linkedin || null,
      telefone: telefone || null,
    })
    .eq("id", user.id)

  if (error) {
    console.error("[perfil] falha ao salvar", { code: error.code, message: error.message, details: error.details, hint: error.hint })
    return { erro: "Não conseguimos salvar seu perfil agora. Tente de novo em instantes." }
  }

  refresh()
  return { ok: true }
}


const BUCKET = "avatares"
const LIMITE_FOTO = 2 * 1024 * 1024
const EXTENSOES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" }

export type EstadoFoto = { erro?: string }

async function limparFotosAntigas(supabase: Awaited<ReturnType<typeof createClient>>, idUsuario: string, manter?: string) {
  const { data: arquivos } = await supabase.storage.from(BUCKET).list(idUsuario)
  const antigos = (arquivos ?? [])
    .map((a) => `${idUsuario}/${a.name}`)
    .filter((caminho) => caminho !== manter)
  if (antigos.length > 0) await supabase.storage.from(BUCKET).remove(antigos)
}

export async function atualizarFoto(formData: FormData): Promise<EstadoFoto> {
  const arquivo = formData.get("foto")

  if (!(arquivo instanceof File) || arquivo.size === 0) return { erro: "Escolha uma imagem." }
  const extensao = EXTENSOES[arquivo.type]
  if (!extensao) return { erro: "Use uma imagem JPG, PNG ou WebP." }
  if (arquivo.size > LIMITE_FOTO) return { erro: "A imagem passou de 2 MB. Escolha uma menor." }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { erro: "Sua sessão expirou. Entre novamente para trocar a foto." }

  const caminho = `${user.id}/${crypto.randomUUID()}.${extensao}`

  const { error: erroUpload } = await supabase.storage
    .from(BUCKET)
    .upload(caminho, arquivo, { contentType: arquivo.type })
  if (erroUpload) {
    console.error("[perfil] falha no upload da foto", erroUpload.message)
    return { erro: "Não conseguimos enviar a foto. Tente de novo em instantes." }
  }

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(caminho)

  const { error } = await supabase.from("perfil").update({ foto_url: publicUrl }).eq("id", user.id)
  if (error) {
    console.error("[perfil] falha ao salvar foto_url", { code: error.code, message: error.message })
    await supabase.storage.from(BUCKET).remove([caminho])
    return { erro: "Não conseguimos salvar a foto. Tente de novo em instantes." }
  }

  await limparFotosAntigas(supabase, user.id, caminho)
  refresh()
  return {}
}

export async function removerFoto(): Promise<EstadoFoto> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { erro: "Sua sessão expirou. Entre novamente para remover a foto." }

  const { error } = await supabase.from("perfil").update({ foto_url: null }).eq("id", user.id)
  if (error) {
    console.error("[perfil] falha ao remover foto", { code: error.code, message: error.message })
    return { erro: "Não conseguimos remover a foto. Tente de novo em instantes." }
  }

  await limparFotosAntigas(supabase, user.id)
  refresh()
  return {}
}
