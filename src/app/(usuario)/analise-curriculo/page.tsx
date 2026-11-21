import { Suspense } from "react"
import Header from "./_components/header"
import FluxoAnalise from "./_components/fluxo-analise"
import Banner from "./_components/banner"

const AnaliseCurriculo = () => {
  return (
    <div className="flex flex-col gap-8">
      <Header />
      <FluxoAnalise />
      <Suspense fallback={null}>
        <Banner />
      </Suspense>
    </div>
  )
}

export default AnaliseCurriculo