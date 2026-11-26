import { Check, CircleAlert } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type Item = {
    titulo: string
    descricao: string | null
}

type DevolutivaProps = {
    foiBem: Item[]
    melhorar: Item[]
    proximoPasso: Item[]
}

const Lista = ({ itens, icone }: { itens: Item[]; icone: "bem" | "melhorar" }) => (
    <ul className="flex flex-col gap-4">
        {itens.map((item) => (
            <li key={item.titulo} className="flex items-start gap-3 text-sm">
                {icone === "bem" ? (
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-emerald-500/12 text-emerald-600 dark:text-emerald-400">
                        <Check className="size-3" strokeWidth={3} />
                    </span>
                ) : (
                    <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-orange-500/12 text-orange-600 dark:text-orange-400">
                        <CircleAlert className="size-3.5" strokeWidth={2.5} />
                    </span>
                )}
                <span className="flex flex-col gap-0.5">
                    <span className="font-medium leading-snug">{item.titulo}</span>
                    {item.descricao && <span className="leading-snug text-foreground/75">{item.descricao}</span>}
                </span>
            </li>
        ))}
    </ul>
)

const Devolutiva = ({ foiBem, melhorar, proximoPasso }: DevolutivaProps) => {
    return (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="text-base">O que foi bem</CardTitle>
                    <CardDescription>Continue fazendo assim</CardDescription>
                </CardHeader>
                <CardContent>
                    <Lista itens={foiBem} icone="bem" />
                </CardContent>
            </Card>

            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="text-base">O que melhorar</CardTitle>
                    <CardDescription>O que fazer diferente na próxima vez</CardDescription>
                </CardHeader>
                <CardContent>
                    <Lista itens={melhorar} icone="melhorar" />
                </CardContent>
            </Card>

            <Card className="h-full md:col-span-2 xl:col-span-1">
                <CardHeader>
                    <CardTitle className="text-base">Próximos passos</CardTitle>
                    <CardDescription>Para treinar antes da entrevista real</CardDescription>
                </CardHeader>
                <CardContent>
                    <ol className="flex flex-col gap-4">
                        {proximoPasso.map((item) => (
                            <li key={item.titulo} className="flex flex-col gap-0.5 text-sm">
                                <span className="font-medium leading-snug">{item.titulo}</span>
                                {item.descricao && <span className="leading-snug text-foreground/75">{item.descricao}</span>}
                            </li>
                        ))}
                    </ol>
                </CardContent>
            </Card>
        </section>
    )
}

export default Devolutiva
