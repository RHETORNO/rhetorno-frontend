import DotGrid from "@/components/DotGrid"

const noiseSvg = `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'>
  <filter id='n'>
    <feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/>
    <feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  12 0 0 0 -7.6'/>
  </filter>
  <rect width='100%' height='100%' filter='url(#n)'/>
</svg>`

const noiseUrl = `url("data:image/svg+xml,${encodeURIComponent(noiseSvg)}")`

// style={{ width: '100%', height: '600px', position: 'relative' }}
const Dados = () => {
    return (
        <section className="bg-black relative min-h-[600px] overflow-hidden">


            <div className="absolute inset-0 z-0">
                <DotGrid
                    baseColor="#000000"
                    activeColor="#ffffff"
                    shape="circle"
                    dotSize={5}
                    gap={18}
                    proximity={140}
                    strength={1}
                    bounce={0.6}
                    tension={0.4}
                    returnDuration={0.8}
                    shockRadius={320}
                    shockStrength={5}
                    swell={0.8}
                    stretch={0.5}
                    glow={0.5}
                    fade={0}
                    intro
                    opacity={1}
                    mouseInteraction
                    clickShock
                // background rs
                />
            </div>

            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 z-5 opacity-15"
                style={{ backgroundImage: noiseUrl }}
            />

            {/* celular: cada frase vem seguida do número que explica ela
                computador (xl): frases na esquerda, números na direita */}
            <div className="relative z-10 min-h-[600px] text-white px-6 py-16 grid grid-cols-1 gap-6 md:px-14 xl:grid-cols-2 xl:gap-0">
                <div className="contents xl:flex xl:flex-col xl:gap-20 xl:my-auto">
                    <h3 className="revelar order-1 text-4xl font-medium max-w-xl sm:text-5xl xl:order-none">
                        Falta retorno de um lado.
                    </h3>
                    <h3 className="revelar order-3 mt-10 text-4xl font-medium max-w-2xl sm:text-5xl xl:order-none xl:mt-0">
                        Sobra vontade de aprender do outro.
                    </h3>
                    {/* fechamento: linha fininha + frase leve, com o nome na fonte do logo e brilho azul */}
                    <div className="revelar order-5 mt-12 flex flex-col items-center gap-4 text-center xl:order-none xl:mt-0 xl:items-start xl:text-left">
                        <span aria-hidden className="h-0.5 w-20 rounded-full bg-linear-to-r from-transparent via-[#5f8bff] to-transparent xl:from-[#5f8bff] xl:via-[#5f8bff]/40" />
                        <p className="text-balance text-xl leading-relaxed text-white/85 xl:text-lg xl:font-light xl:text-white/75">
                            Foi para suprir isso que o{" "}
                            <span className="font-titulo font-medium tracking-wide text-white [text-shadow:0_0_22px_rgba(95,139,255,0.6)]">RHETORNO</span>{" "}
                            nasceu.
                        </p>
                    </div>
                </div>
                <div className="contents xl:flex xl:flex-col xl:gap-12 xl:my-10">
                    <div className="revelar order-2 grid grid-cols-[auto_1fr] items-center gap-4 sm:gap-6 xl:order-none xl:grid-cols-[0.1fr_2fr] xl:items-start xl:gap-4">
                        <h4 className="text-6xl sm:text-8xl xl:text-9xl"> 41% </h4>
                        <div className="flex flex-col gap-1.5 sm:gap-4">
                            <p className="text-base leading-snug sm:text-2xl">dos candidatos receberam algum retorno depois de um processo seletivo.</p>
                            <p className="text-xs text-white/70 sm:text-sm sm:text-white/85">Fonte: Global Talent Trends, 2024</p>
                        </div>
                    </div>
                    <div className="revelar order-4 grid grid-cols-[auto_1fr] items-center gap-4 sm:gap-6 xl:order-none xl:grid-cols-[0.1fr_2fr] xl:items-start xl:gap-2">
                        <h4 className="text-6xl sm:text-8xl xl:text-9xl"> 69% </h4>
                        <div className="flex flex-col gap-1.5 sm:gap-4">
                            <p className="text-base leading-snug sm:text-2xl">dos trabalhadores brasileiros planejam fazer cursos rápidos e certificações para manter o currículo competitivo.</p>
                            <p className="text-xs text-white/70 sm:text-sm sm:text-white/85">Fonte: Levantamento EDC Group</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Dados