"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { ModeToggle } from "@/components/toggleModo"
import Entrar from "./menu-entrar"
import MenuMobile, { type Solucao } from "./menu-mobile"

const linkClass =
    "relative text-[17px] hover:cursor-pointer after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-current after:transition-all after:duration-[600ms] hover:after:w-full"
    //erro por quebra de linha no tailwind


const solucoes: Solucao[] = [
    { titulo: "Analise de curriculo", descricao: "Descubra pontos fortes e oportunidades de melhoria", href: "/" },
    { titulo: "Compatibilidade com Vagas", descricao: "Descubra como seu perfil se encaixa nas oportunidades.", href: "/" },
    { titulo: "Preparação de entrevistas", descricao: "Pratique entrevistas e receba seu Feedback", href: "/" },
    { titulo: "Desenvolvimento profissional", descricao: "Encontre cursos e trilhas para evoluir", href: "/" },
]

const Header = () => {

    const [scrolled, setScrolled] = useState(false) // teoricamente irei fazer icar true com 50px

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY >= 400)

        onScroll() // cobre o caso de recarregar a pagina ja rolada/scroladars
        window.addEventListener("scroll", onScroll, { passive: true}) // aqui deixa true
        return () => window.removeEventListener("scroll", onScroll)
    }, [])

    
    const pathname = usePathname()
    const textoClaro = pathname === "/" && !scrolled

    // celular e tablet: header de vidro transparente; computador (lg): fundo com desfoque e sombra ao rolar
    return (
        <header className={`fixed inset-x-0 top-0 z-50 border-b py-1.5 transition-all duration-300 lg:border-b-0 ${
            scrolled
            ? "border-foreground/10 bg-background/40 backdrop-blur-xl backdrop-saturate-150 lg:bg-background/70 lg:shadow-sm lg:backdrop-blur-md"
            : "border-transparent bg-transparent"
        }`}>
            <nav className="mx-auto justify-between items-center flex h-16 gap-3 px-4 sm:h-20 sm:px-6"
            aria-label="Principal">
                <Link href="/" className="shrink-0">
                <div className="text-2xl text-foreground flex gap-2 items-center">
                    <Image
                    src={"/images/logo.svg"}
                    alt=""
                    width={52}
                    height={52}
                    className={`size-10 sm:size-13 brightness-0 dark:invert ${
                        textoClaro
                        ? "invert"
                        : "brightness-0"
                    }`}
                    // irei fazer gambiarra nesse classname
                     />
                    <p className={`font-normal font-titulo text-lg sm:text-[22px] ${
                        textoClaro
                        ? "text-white/90"
                        : "text-foreground"
                    }`}>RHETORNO</p>
                </div>
                </Link>

                <div className={`hidden items-center gap-8 text-[20px] transition-colors duration-300 lg:flex ${
                    textoClaro ? "text-white/90" : "text-foreground"
                }`}>

                    <Link href="/#candidatos" className={linkClass}>
                    Candidato
                    </Link>

                    <NavigationMenu>
                        <NavigationMenuList>
                        <NavigationMenuItem>
                            <NavigationMenuTrigger
                                className={`${linkClass} h-auto rounded-none bg-transparent px-0 py-0 font-normal outline-none focus-visible:ring-0 focus-visible:outline-none focus-visible:after:w-full hover:bg-transparent focus:bg-transparent data-popup-open:bg-transparent data-popup-open:hover:bg-transparent data-open:bg-transparent data-open:hover:bg-transparent data-open:focus:bg-transparent`}
                            >
                                Soluções
                            </NavigationMenuTrigger>
                            <NavigationMenuContent>
                                <ul className="grid w-screen gap-2 p-4 md:grid-cols-2">
                                    <li className="grid grid-cols-2 w-[200%] "> {/* Fiz gambiarra aqui por favor nao perguntar */}
                                        {solucoes.map((s) => (
                                            <NavigationMenuLink key={s.titulo} render={<Link href={s.href} />} className="p-4 hover:bg-transparent hover:cursor-pointer">
                                                <div className="font-medium"> {s.titulo} </div>
                                                <p className="text-sm text-muted-foreground"> {s.descricao} </p>
                                            </NavigationMenuLink>
                                        ))}
                                    </li>
                                </ul>
                            </NavigationMenuContent>
                            </NavigationMenuItem>
                        </NavigationMenuList>
                    </NavigationMenu>

                    <Link href="/como-funciona" className={linkClass}>
                    Como funciona
                    </Link>

                    <Link href="/sobre" className={linkClass}>
                    Sobre
                    </Link>
                </div>


                <div className="flex flex-row gap-2 items-center justify-center sm:gap-4 lg:gap-6">
                {/* no celular o tema fica dentro do menu */}
                <div className="hidden lg:block">
                    <ModeToggle />
                </div>
                <Entrar textoClaro={textoClaro} />
                <MenuMobile solucoes={solucoes} textoClaro={textoClaro} />
                </div>
            </nav>
        </header>
    )
}

export default Header
