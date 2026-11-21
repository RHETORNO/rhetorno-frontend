import { Card, CardDescription, CardHeader, CardPanel, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"

const gratuito = [
    {
        id: 1,
        icon: Check,
        conteudo: "5 análises de currículo por mês, com devolutivas e vagas personalizadas"
    },
    {
        id: 2,
        icon: Check,
        conteudo: "Perguntas complementares após a análise"
    },
    {
        id: 3,
        icon: Check,
        conteudo: "Trilha de aprendizagens gratuitas"
    }
]

const pagos = [
    {
        id: 1,
        icon: Check,
        conteudo: "Tudo do plano gratuito"
    },
    {
        id: 2,
        icon: Check,
        conteudo: "Historico completo de evolução"
    },
    {
        id: 3,
        icon: Check,
        conteudo: "Mentor de IA, 30 conversas por mês"
    },
    {
        id: 4,
        icon: Check,
        conteudo: "Compatibilidade ilimitada com vagas"
    }
]



const Section = () => {
    return (
        <section className="grid grid-cols-1 gap-8 px-6 py-16 bg-foreground md:grid-cols-2 md:px-17 md:py-25 xl:grid-cols-3 xl:gap-15">
            <div className="revelar flex flex-col gap-6 md:col-span-2 md:gap-8 xl:col-span-1">
                <h2 className="text-5xl max-w-2xl text-accent sm:text-6xl xl:text-8xl"> Você comeca sem pagar nada. </h2>
                <p className="text-sm text-accent/70"> A versão gratuita já cobre a análise do currículo e as trilhas de cursos. O plano Pro amplia o histórico e libera o mentor de IA. </p>
            </div>
            <div className="revelar">
                <Card className="h-full">
                    <CardHeader>
                    <CardTitle> Gratís </CardTitle>
                    <CardDescription className="text-5xl text-foreground pb-6 sm:text-6xl md:text-5xl lg:text-6xl xl:text-7xl xl:pb-10"> R$ 0 <span className="text-base text-foreground ">/mês</span> </CardDescription>
                    </CardHeader>

                    {gratuito.map(({ id, icon: Icon, conteudo}) => (
                        <CardPanel key={id} className="flex items-start gap-3">
                        <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
                        <span className="text-sm"> {conteudo} </span>    
                        </CardPanel>
                    ))}
                </Card>
            </div>
            <div className="revelar">
                <Card className="h-full">
                    <CardHeader>
                    <CardTitle> Premium </CardTitle>
                    <CardDescription className="text-5xl text-foreground pb-6 sm:text-6xl md:text-5xl lg:text-6xl xl:text-7xl"> R$ 110,00 <span className="text-base text-foreground ">/mês</span></CardDescription>
                    </CardHeader>

                    {pagos.map(({ id, icon: Icon, conteudo}) => (
                        <CardPanel key={id} className="flex items-start gap-3">
                        <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
                        <span className="text-sm"> {conteudo} </span>    
                        </CardPanel>
                    ))}
                </Card>
            </div>
        </section>
    )
}

export default Section