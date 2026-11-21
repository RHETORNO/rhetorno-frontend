"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { DropzoneUploadFileRow, HaloDropzone } from "@/components/ui/halo-dropzone"
import {
  iniciarDiagnosticoCurriculo,
  type DiagnosticoInicialResponse,
} from "@/services/curriculo-api"

const limite = 5 * 1024 * 1024

export interface SessaoAnaliseIniciada {
  arquivo: File
  cargoInput: string
  empresaInput: string
  cargoParaIa: string
  diagnostico: DiagnosticoInicialResponse
}

interface UploadProps {
  onDiagnosticoConcluido: (sessao: SessaoAnaliseIniciada) => void
}

const Upload = ({ onDiagnosticoConcluido }: UploadProps) => {
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string>()

  const escolher = (files: File[]) => {
    const f = files[0]
    setErro(undefined)
    if (!f) return
    if (f.type !== "application/pdf" && !f.name.toLowerCase().endsWith(".pdf")) {
      return setErro("O arquivo precisa ser um PDF.")
    }
    if (f.size > limite) return setErro("O arquivo é muito grande, o limite é 5MB.")
    setArquivo(f)
  }

  const enviar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!arquivo) return setErro("Selecione seu currículo para continuar.")

    const formData = new FormData(e.currentTarget)
    const cargoInput = String(formData.get("cargo") ?? "").trim()
    const empresaInput = String(formData.get("empresa") ?? "").trim()
    const vagaInfo = String(formData.get("descricaoVaga") ?? "").trim()

    const cargoParaIa = cargoInput || "Cargo compatível com o perfil do currículo"
    const ehUrl = /^https?:\/\//i.test(vagaInfo)

    setEnviando(true)
    setErro(undefined)

    try {
      const diagnostico = await iniciarDiagnosticoCurriculo({
        arquivoPdf: arquivo,
        cargoDesejado: cargoParaIa,
        tipoOrigem: ehUrl ? "url" : "titulo",
        urlVaga: ehUrl ? vagaInfo : undefined,
        descricaoComplementar: !ehUrl && vagaInfo ? vagaInfo : undefined,
      })

      onDiagnosticoConcluido({
        arquivo,
        cargoInput,
        empresaInput,
        cargoParaIa,
        diagnostico,
      })
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Erro ao processar currículo com a IA.")
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={enviar} className="mx-auto flex flex-col w-full max-w-2xl gap-6">
      <HaloDropzone
        accept="application/pdf"
        disabled={enviando}
        onFiles={escolher}
        emptyLabel="Arraste seu currículo aqui ou clique para escolher"
        formatHint="PDF de até 5MB"
        successLabel="Currículo selecionado"
        showSuccessThumbnails={false}
        successResetMs={1600}
      />

      {arquivo && (
        <DropzoneUploadFileRow
          file={arquivo}
          progress={100}
          complete
          onRemove={enviando ? undefined : () => setArquivo(null)}
        />
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field>
          <FieldLabel htmlFor="cargo">Cargo que você busca</FieldLabel>
          <Input id="cargo" name="cargo" placeholder="Ex.: Desenvolvedor Front-end Júnior" />
          <FieldDescription>Opcional</FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="empresa">Empresa que você quer</FieldLabel>
          <Input id="empresa" name="empresa" placeholder="Ex.: Nubank" />
          <FieldDescription>Opcional, deixa a análise mais certeira</FieldDescription>
        </Field>
      </div>

      <Field>
        <FieldLabel htmlFor="descricaoVaga">Descrição ou link da vaga</FieldLabel>
        <textarea
          id="descricaoVaga"
          name="descricaoVaga"
          rows={3}
          placeholder="Cole os requisitos da vaga ou o link..."
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        />
        <FieldDescription>
          Opcional — adapta seu currículo ATS e a trilha de cursos aos requisitos exatos da vaga
        </FieldDescription>
      </Field>

      {erro && (
        <p role="alert" className="text-sm text-destructive">
          {erro}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando || !arquivo}
        className="flex h-12 w-full items-center justify-center rounded-lg bg-[#0b1437] text-sm font-medium text-white outline-none transition-colors hover:bg-[#13265e] focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-400 hover:cursor-pointer"
      >
        {enviando ? "Lendo currículo e gerando perguntas..." : "Analisar meu currículo"}
      </button>
    </form>
  )
}

export default Upload