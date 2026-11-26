"use client"

import { useState, type ReactNode } from "react"
import { ArrowUpRight, Check, Link2, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EditarPerfil, type ValoresPerfil } from "./editar-perfil"

type Props = {
  ehDono: boolean
  linkedin: string | null
  identidade: ReactNode
  sobre: ReactNode
  trajetoria: ReactNode
  valoresIniciais: ValoresPerfil
}

function CopiarLink() {
  const [copiado, setCopiado] = useState(false)

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      setCopiado(false)
    }
  }

  return (
    <Button variant="outline" size="lg" onClick={copiar} aria-live="polite">
      {copiado ? <Check aria-hidden /> : <Link2 aria-hidden />}
      {copiado ? "Link copiado" : "Copiar link"}
    </Button>
  )
}

export function PerfilLayout({ ehDono, linkedin, identidade, sobre, trajetoria, valoresIniciais }: Props) {
  const [editando, setEditando] = useState(false)
  const [salvo, setSalvo] = useState(false)

  const aoSalvar = () => {
    setEditando(false)
    setSalvo(true)
    setTimeout(() => setSalvo(false), 3000)
  }

  return (
    <article className="mx-auto flex w-full max-w-6xl flex-col selection:bg-foreground selection:text-background">
      <header className="flex flex-col gap-6 border-b pb-10 lg:flex-row lg:items-end lg:justify-between">
        {identidade}

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <p role="status" className="mr-2 text-sm text-muted-foreground">
            {salvo ? "Perfil salvo" : ""}
          </p>
          {ehDono ? (
            <>
              <CopiarLink />
              {!editando && (
                <Button size="lg" onClick={() => setEditando(true)}>
                  <Pencil aria-hidden />
                  Editar perfil
                </Button>
              )}
            </>
          ) : (
            linkedin && (
              <Button
                variant="outline"
                size="lg"
                nativeButton={false}
                render={<a href={linkedin} target="_blank" rel="noopener noreferrer" />}
              >
                Ver LinkedIn
                <ArrowUpRight aria-hidden />
              </Button>
            )
          )}
          {ehDono && linkedin && !editando && (
            <a
              href={linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 inline-flex items-center gap-1 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
            >
              LinkedIn
              <ArrowUpRight className="size-3.5" aria-hidden />
            </a>
          )}
        </div>
      </header>

      <div className="grid gap-x-16 gap-y-14 pt-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <aside className="lg:sticky lg:top-8 lg:self-start">
          {editando ? (
            <div key="form" className="animate-in fade-in-0 duration-200 motion-reduce:animate-none">
              <EditarPerfil
                valoresIniciais={valoresIniciais}
                aoSalvar={aoSalvar}
                aoCancelar={() => setEditando(false)}
              />
            </div>
          ) : (
            <div key="sobre" className="animate-in fade-in-0 duration-200 motion-reduce:animate-none">
              {sobre}
            </div>
          )}
        </aside>

        {trajetoria}
      </div>
    </article>
  )
}
