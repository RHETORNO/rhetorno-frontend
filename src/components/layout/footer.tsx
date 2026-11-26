import Image from "next/image"
import Link from "next/link"

type Item = {
    texto: string
    href?: string
}

type Coluna = {
    titulo: string
    largura: string
    itens: Item[]
}

const colunas: Coluna[] = [
    {
        titulo: "PARA CANDIDATOS",
        largura: "lg:w-[230px]",
        itens: [
            { texto: "Buscar Vagas" },
            { texto: "Meu Painel" },
            { texto: "Mentor IA" },
            { texto: "Criar Conta Grátis", href: "/signup" },
        ],
    },
    {
        titulo: "PARA EMPRESAS",
        largura: "lg:w-[230px]",
        itens: [
            { texto: "Banco de Talentos" },
            { texto: "Divulgar uma Vaga" },
            { texto: "Planos" },
        ],
    },
    {
        titulo: "INSTITUCIONAL",
        largura: "lg:w-[157px]",
        itens: [
            { texto: "Quem somos", href: "/sobre" },
            { texto: "Privacidade e transparência" },
        ],
    },
    {
        titulo: "CONTATO",
        largura: "lg:w-[197px]",
        itens: [
            { texto: "contato@RHETORNO.com", href: "mailto:contato@RHETORNO.com" },
        ],
    },
]

// tudo que começa com "lg:" é o footer do computador (igual ao Figma);
// o resto é o footer do celular e do tablet
export default function Footer() {
    return (
        <footer className="flex flex-col gap-8 border-t border-foreground/10 bg-background px-6 pt-12 pb-10 text-sm text-foreground md:px-[86px] lg:gap-6 lg:border-t-0 lg:py-12 lg:text-[12px] lg:leading-[15px] lg:font-semibold">
            <div className="flex flex-col gap-10 pb-2 lg:flex-row lg:justify-between lg:gap-y-8 lg:pb-[30px]">

                {/* marca */}
                <div className="flex flex-col items-center gap-5 text-center lg:w-[183px] lg:items-start lg:gap-[30px] lg:text-left">
                    <div className="flex flex-col gap-2 lg:gap-[9px]">
                        <p className="font-titulo text-xl text-foreground lg:text-[12px]">RHETORNO</p>
                        <p className="text-muted-foreground lg:text-foreground">Seu caminho para um futuro melhor.</p>
                    </div>

                    <div className="flex items-center gap-4 lg:gap-3">
                        <Image src="/icons/instagram.svg" alt="Instagram" width={22} height={22} className="brightness-0 dark:invert" />
                        <Image src="/icons/linkedin.svg" alt="LinkedIn" width={18} height={20} className="-translate-y-px brightness-0 dark:invert" />
                    </div>
                </div>

                {/* links: candidatos e empresas lado a lado, institucional e contato embaixo; tudo centralizado no celular */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-3 lg:contents">
                    {colunas.map((coluna) => (
                        <div key={coluna.titulo} className={`flex flex-col items-center gap-3 text-center ${coluna.largura} lg:items-start lg:gap-[9px] lg:text-left`}>
                            <p className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground lg:text-[12px] lg:tracking-normal lg:text-foreground">
                                {coluna.titulo}
                            </p>

                            {coluna.itens.map((item) =>
                                item.href ? (
                                    <Link key={item.texto} href={item.href} className={item.href.startsWith("mailto:") ? "w-fit whitespace-nowrap text-[13px] sm:text-sm lg:text-[12px]" : "w-fit"}>{item.texto}</Link>
                                ) : (
                                    <p key={item.texto}>{item.texto}</p>
                                )
                            )}
                        </div>
                    ))}
                </div>

                {/* acessibilidade: só informação (sem borda pra não parecer botão) */}
                <div className="flex items-center justify-center gap-6 text-muted-foreground lg:w-[127px] lg:flex-col lg:justify-start lg:gap-[30px] lg:text-foreground">
                    <div className="flex items-center gap-3 lg:flex-col lg:gap-[9px]">
                        <p className="font-medium lg:font-semibold">Acessibilidade</p>
                        <p className="tracking-widest lg:tracking-normal">A+ A A-</p>
                    </div>

                    <div className="flex items-center gap-2 lg:gap-[19px]">
                        <Image src="/icons/vlibras.svg" alt="" width={28} height={23} className="brightness-0 dark:invert" />
                        <p className="whitespace-nowrap lg:[text-shadow:0px_4px_4px_rgba(0,0,0,0.25)]">VLibras</p>
                    </div>
                </div>
            </div>

            <p className="border-t border-foreground/10 pt-6 text-center text-xs text-[#64748b] lg:border-t-0 lg:pt-0 lg:text-left lg:text-[12px]">
                © 2026 RHETORNO. Todos os direitos reservados.
            </p>
        </footer>
    )
}
