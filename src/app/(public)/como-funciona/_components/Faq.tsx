import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

const perguntas = [
    {
        id: "pagar",
        pergunta: "Preciso pagar para começar?",
        resposta:
            "Não. O plano gratuito inclui 3 análises de currículo por mês, feedback do seu currículo, a trilha de desenvolvimento, vagas compatíveis com o seu perfil e o hub de mentores humanos.",
    },
    {
        id: "certificado",
        pergunta: "Os cursos têm certificado?",
        resposta: "Sim. Ao concluir um curso você recebe um certificado de conclusão.",
    },
    {
        id: "entrevista",
        pergunta: "Como funciona a entrevista simulada?",
        resposta:
            "Você responde a perguntas de uma vaga conversando com a Orb e recebe devolutivas sobre o que ajustar. Tudo fica registrado no seu histórico de evolução. Disponível a partir do plano Essencial.",
    },
    {
        id: "orb",
        pergunta: "O que é a Orb?",
        resposta:
            "A Orb é a inteligência artificial da RHETORNO   e a essência da nossa plataforma. É ela quem conduz as suas simulações de entrevista e analisa as suas respostas com base em 30 padrões comportamentais te encaminhando uma devolutiva mais detahada. Orb é uma marca registrada da RHETORNO.",
    },
    {
        id: "mentores",
        pergunta: "Quem são os mentores?",
        resposta:
            "Profissionais de Recursos Humanos, Psicologia e Administração que apoiam você na sua evolução profissional. Pelo hub de mentores, você compara os perfis, os tipos de mentoria e os valores, e agenda a sessão que mais combina com você. O acesso ao hub está disponível em todos os planos, e cada mentoria tem o seu próprio valor.",
    },
]

const Faq = () => {
    return (
        <section className="grid grid-cols-1 gap-6 px-6 py-16 md:px-17 md:py-25 lg:grid-cols-3 lg:gap-15">
            <h2 className="revelar text-3xl font-light sm:text-4xl"> Dúvidas comuns </h2>
            <div className="revelar max-w-2xl lg:col-span-2">
                <Accordion>
                    {perguntas.map(({ id, pergunta, resposta }) => (
                        <AccordionItem key={id} value={id}>
                            <AccordionTrigger> {pergunta} </AccordionTrigger>
                            <AccordionContent> {resposta} </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    )
}

export default Faq
