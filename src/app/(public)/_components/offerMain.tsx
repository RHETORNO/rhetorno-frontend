import { ScrollTimeline,
    ScrollTimelineItem
 } from "@/components/ui/scroll-timeline"
 import { Bot, File, FileCheckCorner } from "lucide-react"
import Image from "next/image"
import { OrbitingCircles } from "@/components/magicui/orbiting-circles"


 const lancar = [
    { nome: 'Análise de currículo', conteudo: 'Sugestões personalizadas para o seu currículo, da apresentação das informações às palavras-chave, explicando o que mudou e por quê.'},
    { nome: 'Compatibilidade com vagas', conteudo: 'Compare seu perfil aos requisitos de cada vaga e veja o que você já atende e o que falta desenvolver.'},
    { nome: 'Feedback', conteudo: 'Devolutivas claras sobre o seu desempenho, no lugar do silêncio depois de um processo seletivo.'},
    { nome: 'Cursos e trilhas', conteudo: 'Desenvolva as competências que faltam para a vaga com cursos gratuitos com certificado, exercícios práticos e recomendações personalizadas ao seu perfil e aos seus objetivos.'},
    { nome: 'Mentoria e evolução', conteudo: 'Profissionais de RH ajudam você a planejar os próximos passos, e seu progresso fica registrado a cada etapa.'}
 ]
 
const Oferecemos = () => {
    return(
        <section className="scroll-mt-20 py-16 md:py-20 bg-background" id="candidatos">
            <h1 className="revelar px-6 pb-10 text-3xl sm:text-4xl md:px-20 md:pb-16 lg:pl-32"> O que oferecemos? </h1>
            <div className="grid grid-cols-1 gap-12 px-6 md:px-20 lg:grid-cols-2 lg:gap-0">
                <div className="revelar order-2 rounded-xl border p-5 py-7 shadow-lg border-foreground/40 sm:p-6 sm:py-8 lg:order-none lg:h-[575px] lg:overflow-y-auto">
                    <ScrollTimeline activationLine={0.70}>
                        {lancar.map((l) => (
                        <ScrollTimelineItem key={l.nome} title={l.nome}>
                            {l.conteudo}
                        </ScrollTimelineItem>
                        ))}
                    </ScrollTimeline>
                </div>
                <div className="revelar order-1 lg:order-none lg:pl-18">
                    <h3 className="text-lg text-foreground/70 pb-2 sm:text-xl lg:text-2xl">
                        Tudo para evoluir na carreira. Valorize seu perfil, desenvolva suas competências e prepare-se para a próxima oportunidade. <br/>
                        Cada etapa responde a uma dúvida comum, para você não enfrentar essa jornada sozinho. 
                    </h3>
                    <div className="relative flex h-[300px] w-full items-center justify-center overflow-hidden sm:h-[420px] lg:h-[500px]">
                        {/* no celular as órbitas ficam menores pra caber na tela */}
                        <div className="relative flex size-[400px] shrink-0 scale-[0.68] items-center justify-center sm:scale-90 lg:scale-100">
                        <OrbitingCircles>
                            <File/>
                            <Image
                            src="/images/logo.svg"
                            alt="logo"
                            width={50}
                            height={50}
                            className="brightness-0 dark:invert"
                            />
                            <FileCheckCorner/>
                        </OrbitingCircles>
                        <OrbitingCircles radius={100} reverse>
                            <File/>
                            <Bot/>
                        </OrbitingCircles>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Oferecemos