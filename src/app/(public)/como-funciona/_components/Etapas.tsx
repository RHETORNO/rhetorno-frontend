import { ProcessCardsTimeline } from "@/components/timeline-process-cards"
import { Meteors } from "@/components/ui/meteors"

const passos = [
    {
        id: "curriculo",
        title: "Envie seu currículo",
        description: "A análise aponta seus pontos fortes, o que ajustar na apresentação e as palavras-chave que estão faltando."
    },
    {
        id: "encaixa",
        title: "Veja onde você se encaixa",
        description: "Compare seu perfil com os requisitos de cada vaga e entenda o que você já atende e o que falta desenvolver."
    },
    {
        id: "pratique",
        title: "Pratique a entrevista",
        description: "Responda como numa entrevista real. A IA observa expressões, movimentos e postura e devolve o que vale ajustar."
    },
    {
        id: "lacunas",
        title: "Feche as lacunas",
        description: "Receba trilhas de cursos gratuitos com certificado, montadas a partir do que a vaga pede e você ainda não tem."
    },
    {
        id: "mentores",
        title: "Evolua com mentores de RH",
        description: "Profissionais de RH ajudam a planejar os próximos passos, e seu progresso fica registrado a cada etapa."
    }
]

// a frase explica a lista de etapas, então no celular ela aparece logo abaixo
// do título (antes dos cards); no computador continua na coluna da direita
const frase =
    "Cada etapa responde a uma dúvida de quem busca emprego, do currículo à mentoria. Siga na ordem ou volte a qualquer uma delas quando precisar."

const Etapas = () => {
    return(
        <section className="relative scroll-mt-20 overflow-clip bg-[#F4F4F4] py-12 gap-6 grid grid-cols-1 px-6 md:py-17 md:px-17 xl:grid-cols-[1.3fr_1fr] xl:gap-10" id="etapas">
            {/* celular: as estrelas cadentes passam no fundo da seção inteira
                (overflow-clip e não overflow-hidden: o hidden quebra o efeito de grudar dos cards) */}
            <div className="pointer-events-none absolute inset-0 xl:hidden" aria-hidden>
                <Meteors number={14} />
            </div>
            <div className="relative z-10 flex flex-col gap-4">
                <ProcessCardsTimeline
                title="Cinco etapas, na ordem em que você vai usar."
                description={frase}
                descriptionClassName="text-black/70 xl:hidden"
                steps={passos}
                stackOffset={24} />
            </div>
            <div className="relative z-10 hidden xl:block">
                <p className="text-4xl max-w-2xl text-black font-semibold pt-24"> {frase} </p>
                <div className="relative h-[500px] w-full overflow-hidden">
                <Meteors />
                </div>
            </div>
        </section>
    )
}

export default Etapas
