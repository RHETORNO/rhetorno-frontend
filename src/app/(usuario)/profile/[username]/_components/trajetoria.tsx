import Link from "next/link"
import type { DadosPerfil, Evento } from "../_lib/buscarPerfil"
import { chaveMes, diaMes, mesAno, plural, primeiroNome } from "../_lib/formatar"

function Resumo({ dados }: { dados: DadosPerfil }) {
  const { analises, entrevistas, cursosConcluidos } = dados.contagem
  const partes = [
    analises > 0 && plural(analises, "análise de currículo", "análises de currículo"),
    entrevistas > 0 && plural(entrevistas, "entrevista simulada", "entrevistas simuladas"),
    cursosConcluidos > 0 && plural(cursosConcluidos, "curso concluído", "cursos concluídos"),
  ].filter((p): p is string => Boolean(p))

  if (partes.length === 0) return null

  const frase = partes.length === 1
    ? partes[0]
    : `${partes.slice(0, -1).join(", ")} e ${partes[partes.length - 1]}`

  return (
    <p className="max-w-[56ch] text-[1.0625rem] leading-relaxed text-muted-foreground text-pretty">
      Até agora: <span className="text-foreground">{frase}</span>.
    </p>
  )
}

function Item({ evento }: { evento: Evento }) {
  const titulo = evento.href ? (
    <Link
      href={evento.href}
      className="rounded-sm underline-offset-4 decoration-foreground/30 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
    >
      {evento.titulo}
    </Link>
  ) : (
    evento.titulo
  )

  return (
    <li className="relative pb-6 pl-6 last:pb-0">
      <span
        aria-hidden
        className={
          evento.concluido
            ? "absolute top-[0.4rem] -left-[4.5px] size-2 rounded-full bg-foreground"
            : "absolute top-[0.4rem] -left-[4.5px] size-2 rounded-full border border-foreground bg-background"
        }
      />
      <div className="flex items-baseline justify-between gap-4">
        <p className="min-w-0 text-[0.9375rem] font-medium leading-snug text-pretty">{titulo}</p>
        {evento.pontuacao != null && (
          <p className="shrink-0 text-sm tabular-nums" aria-label={`Nota ${evento.pontuacao} de 100`}>
            <span className="font-semibold">{evento.pontuacao}</span>
            <span className="text-muted-foreground">/100</span>
          </p>
        )}
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        <time dateTime={evento.data}>{diaMes(evento.data)}</time>
        {evento.detalhe && <span className="ml-3">{evento.detalhe}</span>}
        {!evento.concluido && <span className="ml-3">Em andamento</span>}
      </p>
    </li>
  )
}

export function Trajetoria({ dados }: { dados: DadosPerfil }) {
  const { eventos, ehDono, perfil } = dados

  const meses = new Map<string, Evento[]>()
  for (const evento of eventos) {
    const chave = chaveMes(evento.data)
    meses.set(chave, [...(meses.get(chave) ?? []), evento])
  }

  return (
    <section aria-labelledby="titulo-trajetoria" className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h2 id="titulo-trajetoria" className="font-titulo text-2xl font-semibold tracking-[-0.02em]">
          Trajetória
        </h2>
        <Resumo dados={dados} />
      </div>

      {eventos.length === 0 ? (
        <div className="flex flex-col items-start gap-3 border-t pt-6">
          <p className="max-w-[48ch] text-sm leading-relaxed text-muted-foreground">
            {ehDono
              ? "Sua trajetória começa aqui. Cada análise de currículo, entrevista simulada e curso concluído aparece nesta linha do tempo."
              : `${primeiroNome(perfil.nome_completo)} ainda não tem atividades visíveis no perfil.`}
          </p>
          {ehDono && (
            <Link
              href="/analise-curriculo"
              className="text-sm font-medium underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground"
            >
              Analisar meu currículo
            </Link>
          )}
        </div>
      ) : (
        <ol className="flex flex-col">
          {[...meses.entries()].map(([chave, lista]) => (
            <li key={chave} className="grid gap-x-8 gap-y-4 border-t py-6 md:grid-cols-[9rem_minmax(0,1fr)]">
              <h3 className="text-sm font-medium text-muted-foreground first-letter:uppercase md:sticky md:top-6 md:self-start">
                {mesAno(lista[0].data)}
              </h3>
              <ol className="ml-1 border-l border-border">
                {lista.map((evento) => (
                  <Item key={evento.chave} evento={evento} />
                ))}
              </ol>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
