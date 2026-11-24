"use client"

import Image from "next/image"
import { useRef, useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { atualizarFoto, removerFoto } from "../actions"

const LIMITE_FOTO = 2 * 1024 * 1024

export function TrocarFoto({ fotoUrl, iniciais }: { fotoUrl: string | null; iniciais: string }) {
  const entrada = useRef<HTMLInputElement>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [previa, setPrevia] = useState<string | null>(null)
  const [enviando, iniciar] = useTransition()

  const foto = previa ?? fotoUrl

  const aoEscolher = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0]
    e.target.value = ""
    if (!arquivo) return

    if (!["image/jpeg", "image/png", "image/webp"].includes(arquivo.type))
      return setErro("Use uma imagem JPG, PNG ou WebP.")
    if (arquivo.size > LIMITE_FOTO) return setErro("A imagem passou de 2 MB. Escolha uma menor.")

    setErro(null)
    const url = URL.createObjectURL(arquivo)
    setPrevia(url)

    const dados = new FormData()
    dados.set("foto", arquivo)
    iniciar(async () => {
      const resultado = await atualizarFoto(dados)
      if (resultado.erro) setErro(resultado.erro)
      setPrevia(null)
      URL.revokeObjectURL(url)
    })
  }

  const aoRemover = () => {
    setErro(null)
    iniciar(async () => {
      const resultado = await removerFoto()
      if (resultado.erro) setErro(resultado.erro)
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">Foto</span>
      <div className="flex items-center gap-4">
        <div className={enviando ? "opacity-60 transition-opacity" : "transition-opacity"}>
          {foto ? (
            <Image
              src={foto}
              alt="Sua foto de perfil"
              width={128}
              height={128}
              unoptimized={Boolean(previa)}
              className="size-16 rounded-md border object-cover"
            />
          ) : (
            <div
              aria-hidden
              className="flex size-16 items-center justify-center rounded-md bg-foreground font-titulo text-xl font-semibold text-background"
            >
              {iniciais}
            </div>
          )}
        </div>

        <div className="flex flex-col items-start gap-1.5">
          <div className="flex items-center gap-1">
            <input
              ref={entrada}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={aoEscolher}
              className="sr-only"
              tabIndex={-1}
              aria-hidden
            />
            <Button type="button" variant="outline" disabled={enviando} onClick={() => entrada.current?.click()}>
              {enviando ? "Enviando…" : foto ? "Trocar foto" : "Enviar foto"}
            </Button>
            {fotoUrl && !previa && (
              <Button type="button" variant="ghost" disabled={enviando} onClick={aoRemover}>
                Remover
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">JPG, PNG ou WebP, até 2 MB. Aparece para quem visita.</p>
        </div>
      </div>
      {erro && (
        <p role="alert" className="text-sm text-destructive">
          {erro}
        </p>
      )}
    </div>
  )
}
