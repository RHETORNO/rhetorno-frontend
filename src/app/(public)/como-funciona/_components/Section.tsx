import { Card, CardDescription, CardHeader, CardPanel, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import { planos } from "../../_lib/planos"


const [gratuito, ...pagos] = planos


const Section = () => {
    return (
        <section className="grid grid-cols-1 gap-8 px-6 py-16 bg-foreground md:grid-cols-2 md:px-17 md:py-25 xl:grid-cols-3 xl:gap-15">
            <div className="revelar flex flex-col gap-6 md:col-span-2 md:gap-8 xl:col-span-1">
                <h2 className="text-5xl max-w-2xl text-accent sm:text-6xl xl:text-8xl"> Você começa sem pagar nada. </h2>
                <p className="text-sm text-accent/70"> A versão gratuita já cobre a análise do currículo, as vagas, a trilha de desenvolvimento e o hub de mentores. Os planos pagos liberam o histórico, as simulações de entrevista com a Orb e o mentor de IA. </p>
            </div>
            <div className="revelar">
                <Card className="h-full">
                    <CardHeader>
                    <CardTitle> {gratuito.nome} </CardTitle>
                    <CardDescription className="text-5xl text-foreground pb-6 sm:text-6xl md:text-5xl lg:text-6xl xl:text-7xl xl:pb-10">
                        
                        <span aria-hidden="true" className="invisible block pb-2 text-base"> a partir de </span>
                        {gratuito.preco} <span className="text-base text-foreground ">/mês</span>
                    </CardDescription>
                    </CardHeader>

                    <CardPanel>
                        <ul className="flex flex-col gap-3">
                            {gratuito.beneficios.map((b) => (
                                <li key={b} className="flex items-start gap-3">
                                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                                    <span className="text-sm"> {b} </span>
                                </li>
                            ))}
                        </ul>
                    </CardPanel>
                </Card>
            </div>
            <div className="revelar">
                <Card className="h-full">
                    <CardHeader>
                    <CardTitle> Planos pagos </CardTitle>
                    <CardDescription className="text-5xl text-foreground pb-6 sm:text-6xl md:text-5xl lg:text-6xl xl:text-7xl xl:pb-10">
                        <span className="block pb-2 text-base text-foreground/60"> a partir de </span>
                        R$ 49,90 <span className="text-base text-foreground ">/mês</span>
                    </CardDescription>
                    </CardHeader>

                    <CardPanel className="flex flex-col gap-6">
                        {pagos.map((p) => (
                            <div key={p.nome} className="flex flex-col gap-3">
                                <div className="flex items-baseline justify-between gap-4">
                                    <span className="font-medium"> {p.nome} </span>
                                    <span className="whitespace-nowrap text-sm font-medium"> {p.preco}<span className="text-foreground/50">/mês</span> </span>
                                </div>
                                <ul className="flex flex-col gap-2">
                                    {p.beneficios.map((b) => (
                                        <li key={b} className="flex items-start gap-3">
                                            <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                                            <span className="text-sm text-foreground/70"> {b} </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </CardPanel>
                </Card>
            </div>
        </section>
    )
}

export default Section
