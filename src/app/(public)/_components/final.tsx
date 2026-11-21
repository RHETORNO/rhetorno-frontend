import GlowCursor from "@/components/GlowCursor"


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
                        <h4 className="revelar max-w-4xl text-balance text-[2rem] font-medium leading-[1.14] tracking-[-1.2px] sm:text-5xl lg:text-7xl lg:font-normal lg:leading-none lg:tracking-normal lg:text-wrap">Sua próxima oportunidade começa com o que aprende hoje</h4>
                        <p className="revelar max-w-[640px] text-balance text-base leading-[1.6] text-white/65 sm:text-[19px] lg:max-w-4xl lg:text-lg lg:leading-normal lg:text-white/70 lg:text-wrap">O problema não é receber um não. É não saber o que fazer depois dele.</p>
                    </div>
                </GlowCursor>
            </div>
        </section>
    )
}

export default Final
