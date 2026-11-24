import type { ReactNode } from "react"
import type { DadosPerfil } from "../_lib/buscarPerfil"
import { primeiroNome } from "../_lib/formatar"

function Bloco({ titulo, nota, children }: { titulo: string; nota?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-sm font-semibold">{titulo}</h2>
        {nota && <p className="text-xs text-muted-foreground">{nota}</p>}
      </div>
      {children}
    </section>
  )
}

export function Sobre({ dados }: { dados: DadosPerfil }) {
  const { perfil, ehDono, contato, pontosFortes, habilidades } = dados
  const nome = primeiroNome(perfil.nome_completo)

  return (
    <div className="flex flex-col gap-10">
      <Bloco titulo="Sobre">
        {perfil.bio ? (
          <p className="max-w-[62ch] whitespace-pre-line text-[1.0625rem] leading-[1.65] text-foreground/90 text-pretty">
            {perfil.bio}
          </p>
        ) : (
          <p className="max-w-[48ch] text-sm leading-relaxed text-muted-foreground">
            {ehDono
              ? "Conte em poucas linhas o que você faz e que vaga procura. É a primeira coisa que um mentor lê quando abre seu perfil."
              : `${nome} ainda não escreveu uma apresentação.`}
          </p>
        )}
      </Bloco>

      {pontosFortes.length > 0 && (
        <Bloco titulo="Pontos fortes" nota="Da análise de currículo mais recente">
          <ul className="flex flex-col border-t">
            {pontosFortes.map((ponto) => (
              <li key={ponto} className="border-b py-2.5 text-[0.9375rem] leading-snug text-pretty">
                {ponto}
              </li>
            ))}
          </ul>
        </Bloco>
      )}

      {habilidades.length > 0 && (
        <Bloco titulo="Habilidades desenvolvidas" nota="Pelos cursos concluídos na trilha">
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-[0.9375rem]">
            {habilidades.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </Bloco>
      )}

      {ehDono && contato && (
        <Bloco titulo="Contato" nota="Só você vê estes dados">
          <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-2 text-sm">
            <dt className="text-muted-foreground">E-mail</dt>
            <dd className="truncate">{contato.email}</dd>
            <dt className="text-muted-foreground">Telefone</dt>
            <dd className={contato.telefone ? "tabular-nums" : "text-muted-foreground"}>
              {contato.telefone ?? "Não informado"}
            </dd>
          </dl>
        </Bloco>
      )}
    </div>
  )
}
