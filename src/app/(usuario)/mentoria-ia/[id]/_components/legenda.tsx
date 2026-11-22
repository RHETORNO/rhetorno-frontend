"use client"

import {
  useEffect,
  useState
} from "react"

type Props = {
  texto: string
  progresso: () => number
}

const Legendas = ({ texto, progresso }: Props) => {
  const [acesas, setAcesas] = useState(0)

  // eu odeio regexxxxxxxxxxxxxxxxxxx
  const frases = texto.split(/(?<=[.!?])\s+/).map((f) => f.split(" ").filter(Boolean))
  const total = frases.reduce((n, f) => n + f.length, 0)

  useEffect(() => {
    let id = 0
    const loop = () => {
      setAcesas(Math.round(progresso() * total))
      id = requestAnimationFrame(loop)
    }
    id = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(id)
  }, [progresso, total])

  let atual = 0
  let antes = 0
  while (atual < frases.length - 1 && acesas >= antes + frases[atual].length) {
    antes += frases[atual].length
    atual++
  }

  return (
    <span
      key={atual}
      className="animate-in fade-in duration-500">
      {frases[atual].map((palavra, i) => (
        <span
          key={i}
          className={`transition-opacity duration-300 ${antes + i < acesas ? "opacity-100" : "opacity-25"}`}>
          {palavra}{" "}
        </span>
      ))}
    </span>
  )
}

export default Legendas