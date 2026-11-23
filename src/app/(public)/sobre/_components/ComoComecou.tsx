import Image from "next/image";

export default function ComoComecou() {
    return (
        <section className="bg-muted px-4 py-20 xl:px-[120px] xl:py-[120px]">
            <div className="mx-auto grid max-w-[1200px] items-center gap-10 xl:grid-cols-2 xl:gap-20">
                <div className="relative aspect-[560/680] w-full overflow-hidden rounded-[20px]">
                    <Image
                        src="/images/reuniao-mesa.png"
                        alt="Pessoas reunidas em uma mesa de trabalho apertando as mãos"
                        fill
                        sizes="(min-width: 1280px) 50vw, 100vw"
                        className="object-cover transition-[scale] duration-500 ease-out motion-safe:hover:scale-105"
                    />
                </div>
                <div className="flex flex-col gap-6">
                    <h2 className="text-3xl font-medium leading-[1.12] tracking-[-1.1px] text-foreground xl:text-[44px]" >
                        Uma visão melhor sobre o mercado de trabalho
                    </h2>
                    <div className="flex flex-col gap-2 leading-[1.64] text-muted-foreground xl:text-lg xl:text-justify">
                        <p>
                            Criado em setembro de 2026, a partir de um projeto do Instituto
                            PROA, o RHETORNO nasceu da iniciativa de oito integrantes com um
                            propósito em comum,
                            <strong> tornar a preparação profissional mais acessível e direcionada.</strong>
                        </p>             
                        <p>
                        Muitos candidatos desconhecem os requisitos das vagas, não recebem feedbacks que orientem seu desenvolvimento ou encontram dificuldades para identificar as competências que precisam aprimorar.
                        </p>
                        <p>
                            Essa falta de direcionamento pode afastá-los de seus objetivos profissionais.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}