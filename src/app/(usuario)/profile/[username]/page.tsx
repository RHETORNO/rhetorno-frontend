import { Suspense } from "react"
import { notFound, redirect } from "next/navigation"
import type { Metadata } from "next"
import { getCurrentUser } from "@/lib/supabase/auth"
import { buscarPerfil, usernameDoId } from "./_lib/buscarPerfil"
import { iniciais } from "./_lib/formatar"
import { Identidade } from "./_components/identidade"
import { Sobre } from "./_components/sobre"
import { Trajetoria } from "./_components/trajetoria"
import { PerfilLayout } from "./_components/perfil-layout"
import { PerfilSkeleton } from "./_components/perfil-skeleton"

export const metadata: Metadata = {
  title: "Perfil | RHETORNO",
}

const Page = ({ params }: PageProps<"/profile/[username]">) => {
  return (
    <Suspense fallback={<PerfilSkeleton />}>
      <Perfil params={params} />
    </Suspense>
  )
}

export default Page

const Perfil = async ({ params }: { params: Promise<{ username: string }> }) => {
  const { username } = await params
  const user = await getCurrentUser()

  const antigo = await usernameDoId(username)
  if (antigo) redirect(`/profile/${antigo}`)

  const dados = await buscarPerfil(username, user.id)
  if (!dados) notFound()

  const { perfil, ehDono, contato } = dados

  return (
    <PerfilLayout
      ehDono={ehDono}
      linkedin={perfil.linkedin_url}
      identidade={<Identidade dados={dados} />}
      sobre={<Sobre dados={dados} />}
      trajetoria={<Trajetoria dados={dados} />}
      valoresIniciais={{
        bio: perfil.bio ?? "",
        cidade: perfil.cidade ?? "",
        uf: perfil.uf ?? "",
        linkedin_url: perfil.linkedin_url ?? "",
        telefone: contato?.telefone ?? "",
        foto_url: perfil.foto_url,
        iniciais: iniciais(perfil.nome_completo),
      }}
    />
  )
}
