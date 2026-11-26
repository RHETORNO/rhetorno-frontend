import Botao from "@/components/layout/button"
import { SplitText } from "@/components/ui/split-text"
import Link from "next/link"

const Hero = () => {
    return(
        <section className="pt-28 pb-12 grid grid-cols-1 gap-10 px-6 md:px-17 md:pt-35 md:pb-15 lg:grid-cols-2 lg:gap-8">
            <div className="flex flex-col gap-6 md:gap-8">
                <SplitText text="Como funciona?" className="text-sm text-muted-foreground"/>
                <SplitText text="Do currículo à entrevista, um passo de cada vez." className="text-5xl font-semibold max-w-3xl sm:text-6xl xl:text-8xl"  />
                <SplitText text="Você envia o currículo, descobre onde se encaixa, pratica a entrevista e fecha o que falta. Tudo fica registrado, para você ver a própria evolução."
                className="text-base text-foreground/80 max-w-2xl"/>
                <Link href="#etapas">
                <Botao conteudo="Ver as etapas" className="w-fit"/>
                </Link>
            </div>
            <div>
                <video 
                src="/video/video2.mp4"
                width={1000}
                height={1150}
                autoPlay
                muted
                playsInline
                className="rounded-xl w-full h-72 object-cover sm:h-96 lg:h-full"/>
            </div>
        </section>
    )
}

export default Hero