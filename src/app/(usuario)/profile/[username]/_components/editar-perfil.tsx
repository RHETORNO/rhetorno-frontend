"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { atualizarPerfil, type EstadoEdicao } from "../actions"
import { UFS } from "../_lib/ufs"
import { TrocarFoto } from "./trocar-foto"

export type ValoresPerfil = {
  bio: string
  cidade: string
  uf: string
  linkedin_url: string
  telefone: string
  foto_url: string | null
  iniciais: string
}

type Props = {
  valoresIniciais: ValoresPerfil
  aoSalvar: () => void
  aoCancelar: () => void
}

const LIMITE_BIO = 500

const campoBase =
  "w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30"

function Rotulo({ htmlFor, children, dica }: { htmlFor: string; children: string; dica?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {children}
      </label>
      {dica && <span className="text-xs text-muted-foreground">{dica}</span>}
    </div>
  )
}

export function EditarPerfil({ valoresIniciais, aoSalvar, aoCancelar }: Props) {
  const [estado, acao, salvando] = useActionState<EstadoEdicao, FormData>(atualizarPerfil, {})
  const [bio, setBio] = useState(valoresIniciais.bio)
  const primeiroCampo = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    primeiroCampo.current?.focus()
  }, [])

  useEffect(() => {
    if (estado.ok) aoSalvar()
  }, [estado, aoSalvar])

  const invalido = (campo: EstadoEdicao["campo"]) => estado.campo === campo || undefined

  return (
    <form
      action={acao}
      aria-labelledby="titulo-edicao"
      className="flex flex-col gap-6"
      onKeyDown={(e) => {
        if (e.key === "Escape") aoCancelar()
      }}
    >
      <div className="flex flex-col gap-1">
        <h2 id="titulo-edicao" className="text-sm font-semibold">
          Editar perfil
        </h2>
        <p className="text-xs text-muted-foreground">
          Foto, apresentação, cidade e LinkedIn aparecem para quem visita. Telefone fica só com você.
        </p>
      </div>

      <TrocarFoto fotoUrl={valoresIniciais.foto_url} iniciais={valoresIniciais.iniciais} />

      <div className="flex flex-col gap-2">
        <Rotulo htmlFor="bio" dica={`${bio.length}/${LIMITE_BIO}`}>
          Apresentação
        </Rotulo>
        <textarea
          ref={primeiroCampo}
          id="bio"
          name="bio"
          rows={6}
          maxLength={LIMITE_BIO}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Ex.: Analista administrativa com 4 anos em atendimento, migrando para dados. Procuro vaga júnior em BI."
          aria-invalid={invalido("bio")}
          className={`${campoBase} resize-y py-2 leading-relaxed`}
        />
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_6rem] gap-3">
        <div className="flex flex-col gap-2">
          <Rotulo htmlFor="cidade">Cidade</Rotulo>
          <Input
            id="cidade"
            name="cidade"
            defaultValue={valoresIniciais.cidade}
            autoComplete="address-level2"
            maxLength={80}
            aria-invalid={invalido("cidade")}
            className="h-9"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Rotulo htmlFor="uf">UF</Rotulo>
          <select
            id="uf"
            name="uf"
            defaultValue={valoresIniciais.uf}
            aria-invalid={invalido("uf")}
            className={`${campoBase} h-9`}
          >
            <option value="">—</option>
            {UFS.map((uf) => (
              <option key={uf} value={uf}>
                {uf}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Rotulo htmlFor="linkedin_url">LinkedIn</Rotulo>
        <Input
          id="linkedin_url"
          name="linkedin_url"
          type="url"
          inputMode="url"
          defaultValue={valoresIniciais.linkedin_url}
          placeholder="https://linkedin.com/in/seu-nome"
          aria-invalid={invalido("linkedin_url")}
          className="h-9"
        />
      </div>

      <div className="flex flex-col gap-2">
        <Rotulo htmlFor="telefone" dica="Só você vê">
          Telefone
        </Rotulo>
        <Input
          id="telefone"
          name="telefone"
          type="tel"
          autoComplete="tel"
          defaultValue={valoresIniciais.telefone}
          placeholder="(11) 91234-5678"
          aria-invalid={invalido("telefone")}
          className="h-9"
        />
      </div>

      {estado.erro && (
        <p role="alert" className="text-sm text-destructive">
          {estado.erro}
        </p>
      )}

      <div className="flex items-center gap-2 border-t pt-5">
        <Button type="submit" size="lg" disabled={salvando}>
          {salvando ? "Salvando…" : "Salvar perfil"}
        </Button>
        <Button type="button" variant="ghost" size="lg" onClick={aoCancelar} disabled={salvando}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
