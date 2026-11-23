import { ScrollTextHighlight } from "@/components/ui/scroll-text-highlight"
import { Fragment } from "react"

//fazer outro array para mudança rapida
const listaDescricao = [
    { title: "Missão", paragraph: "Transformar a falta de retorno em orientação e a insegurança em evolução para quem busca uma colocação no mercado de trabalho"},
    { title: "Visão", paragraph: "Ser a plataforma onde cada etapa da busca por emprego vira aprendizado, aproximando talentos em evolução das empresas que procuram por eles"},
    { title: "Valores", paragraph: "Clareza, aprendizado contínuo, acesso e respeito à pessoa guiam nosso processo. Dizemos com franqueza o que melhorar, cada etapa é uma chance de evoluir, oferecemos cursos gratuitos e planos acessíveis, e tratamos o candidato como alguém em desenvolvimento, não como um número."}
]

const Acreditamos = () => {
    return (
        <section className="py-14 px-6 grid grid-cols-1 gap-6 bg-muted md:py-18 md:px-16 lg:grid-cols-[1.5fr_2fr] lg:gap-10">
            <div className="revelar flex flex-col gap-6">
                <h4 className="text-4xl max-w-sm sm:text-5xl lg:text-6xl">
                    No que acreditamos
                </h4>
                <p className="text-justify text-base text-foreground/70 sm:text-lg lg:text-left">
                    Uma rejeição não define o potencial de ninguém. Por trás de cada currículo existe uma pessoa com objetivos e vontade de crescer.
                </p>
            </div>
            <div className="lg:py-4">
                {/* Por favor nao tocar aqui por que eu tambem nao sei o que esta acontecendo */}
                {listaDescricao.map((l) => (
                    <Fragment key={l.title}>
                        <div className="grid grid-cols-1 gap-2 border-y py-6 sm:grid-cols-[7.5rem_1fr] sm:gap-4 sm:p-8 justify-center">
                        <ScrollTextHighlight 
                        text={l.title}
                        className="text-xl leading-relaxed font-semibold sm:text-2xl"/>
                        <div>
                            <ScrollTextHighlight
                            text={l.paragraph}
                            className="text-base leading-relaxed font-light sm:text-lg" />
                        </div>
                        </div>
                    </Fragment>
                ))}
            </div>
        </section>
    )
}

export default Acreditamos