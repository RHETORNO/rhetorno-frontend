import GlowCursor from "@/components/GlowCursor"

// celular e tablet: mesmo estilo do final da página Sobre
// computador (lg): título maior e seção mais alta
const Final = () => {
    return (
        <section className="bg-black relative min-h-[420px] overflow-hidden sm:min-h-[520px] lg:min-h-[600px]">
            <div className="absolute inset-0 z-0">
                <GlowCursor
                    color="#5f8bff"
                    intensity={1.3}
                    trailWidth={3}
                    linger={1.4}
                    glow={1.2}
                    clickBurst
                    theme="light"
                >
                    <div className="relative z-10 mx-auto flex min-h-[420px] max-w-[1000px] flex-col items-center justify-center gap-6 px-6 py-20 text-center text-white sm:min-h-[520px] sm:gap-8 sm:px-14 lg:min-h-[600px] lg:max-w-none lg:gap-14 lg:py-0">
                        <h4 className="revelar max-w-4xl text-balance text-[2rem] font-medium leading-[1.14] tracking-[-1.2px] sm:text-5xl lg:text-7xl lg:font-normal lg:leading-none lg:tracking-normal lg:text-wrap">Comece agora com a sua primeira análise de currículo</h4>
                        <p className="revelar max-w-[640px] text-balance text-base leading-[1.6] text-white/65 sm:text-[19px] lg:max-w-4xl lg:text-lg lg:leading-normal lg:text-white/70 lg:text-wrap">Leva poucos minutos e mostra exatamente o que ajeitar para a sua próxima candidatura.</p>
                    </div>
                </GlowCursor>
            </div>
        </section>
    )
}

export default Final
