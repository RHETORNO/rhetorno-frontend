import Image from "next/image"
import { CalendarDays, MapPin } from "lucide-react"
import type { DadosPerfil } from "../_lib/buscarPerfil"
import { iniciais, mesAno } from "../_lib/formatar"

const papel = {
  candidato: "Candidato",
  mentor: "Mentor de RH",
  admin: "Equipe RHETORNO",
} as const

export function Identidade({ dados }: { dados: DadosPerfil }) {
  const { perfil, cargoAlvo } = dados
  const local = [perfil.cidade, perfil.uf].filter(Boolean).join(", ")
  const subtitulo = cargoAlvo ? `Preparando-se para ${cargoAlvo}` : papel[perfil.tipo ?? "candidato"]

  return (
    <div className="flex min-w-0 items-start gap-5 sm:gap-7">
      {perfil.foto_url ? (
        <Image
          src={perfil.foto_url}
          alt={`Foto de ${perfil.nome_completo}`}
          width={192}
          height={192}
          priority
          className="size-16 shrink-0 rounded-md border object-cover sm:size-24"
        />
      ) : (
        <div
          aria-hidden
          className="flex size-16 shrink-0 select-none items-center justify-center rounded-md bg-foreground font-titulo text-2xl font-semibold tracking-tight text-background sm:size-24 sm:text-4xl"
        >
          {iniciais(perfil.nome_completo)}
        </div>
      )}

      <div className="flex min-w-0 flex-col gap-3">
        <h1 className="font-titulo text-[2.25rem] font-semibold leading-[0.95] tracking-[-0.035em] text-balance sm:text-5xl lg:text-6xl">
          {perfil.nome_completo}
        </h1>
        <p className="text-lg text-foreground/80 text-pretty">{subtitulo}</p>
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-muted-foreground">
          {local && (
            <li className="flex items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              {local}
            </li>
          )}
          <li className="flex items-center gap-1.5">
            <CalendarDays className="size-3.5 shrink-0" aria-hidden />
            No RHETORNO desde {mesAno(perfil.criado_em)}
          </li>
        </ul>
      </div>
    </div>
  )
}
