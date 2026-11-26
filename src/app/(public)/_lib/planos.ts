import { Sparkles, Rocket, Zap, Crown } from "lucide-react"

// Planos dos candidatos. A home (precos.tsx) e a página Como funciona (Section.tsx) leem daqui,
// então qualquer mudança aqui aparece nas duas páginas.
export const planos = [
    {
        nome: "Gratuito",
        icone: Sparkles,
        destaque: false,
        selo: null,
        descricao: "Conheça nossa plataforma e dê os primeiros passos",
        botao: "Começar grátis",
        preco: "R$ 0,00",
        beneficios: [
            "3 análises de currículo por mês",
            "Feedback do seu currículo",
            "Trilha de desenvolvimento",
            "Vagas compatíveis com o seu perfil",
            "Hub de mentores humanos para escolher e agendar sua mentoria"
        ]
    },
    {
        nome: "Essencial",
        icone: Zap,
        destaque: false,
        selo: null,
        descricao: "Acompanhe sua evolução e treine para as entrevistas",
        botao: "Começar a treinar",
        preco: "R$ 49,90",
        beneficios: [
            "Tudo do plano Gratuito",
            "15 análises de currículo por mês",
            "Histórico da sua evolução",
            "5 simulações de entrevista por mês com nossa ia",
            "Indicadores visuais da sua evolução nas respostas",
            "Levando em consideração a análise de 30 padrões comportamentais trazendo um feedback mais completo",
        ]
    },
    {
        nome: "Premium",
        icone: Rocket,
        destaque: true,
        selo: "Plano principal",
        descricao: "Tenha um acompanhamento mais completo e com mais liberdade",
        botao: "Acelerar minha evolução",
        preco: "R$ 89,90",
        beneficios: [
            "Tudo do plano Essencial",
            "30 análises de currículo por mês",
            "10 simulações de entrevista por mês com a nossa ia",
        ]
    },
    {
        nome: "Elite",
        icone: Crown,
        destaque: false,
        selo: "Uso intensivo",
        descricao: "Para você que está em uma busca intensa e quer ir até o fim",
        botao: "Ir com tudo",
        preco: "R$ 129,90",
        beneficios: [
            "Tudo do plano Premium",
            "20 simulações de entrevista por mês com a Orb",
            "Relatórios comparativos da sua evolução",
        ]
    }
]
