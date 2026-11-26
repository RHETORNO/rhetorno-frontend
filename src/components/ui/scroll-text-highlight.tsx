"use client";
import * as React from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
interface ScrollTextHighlightProps {
    text: string;
    by?: "char" | "word";
    container?: React.RefObject<HTMLElement | null>;
    className?: string;
}
function splitGraphemes(text: string): string[] {
    if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
        const segmenter = new Intl.Segmenter(undefined, {
            granularity: "grapheme",
        });
        return Array.from(segmenter.segment(text), (s) => s.segment);
    }
    return Array.from(text);
}
export function ScrollTextHighlight({ text, by = "char", container, className, }: ScrollTextHighlightProps) {
    const targetRef = React.useRef<HTMLParagraphElement>(null);
    const reducedMotion = useReducedMotion();
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => setMounted(true), []);
    const units = React.useMemo(() => {
        if (by === "word")
            return text
                .split(" ")
                .map((w, i, arr) => (i < arr.length - 1 ? w + " " : w));
        return splitGraphemes(text);
    }, [text, by]);
    const inView = useInView(targetRef, { root: container, once: true, amount: 0.5 });
    const passo = Math.min(0.03, 1 / units.length);
    if (mounted && reducedMotion) {
        return <p className={className}>{text}</p>;
    }
    return (<p ref={targetRef} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {units.map((unit, i) => (<HighlightUnit key={`${unit}-${i}`} ativo={inView} atraso={i * passo}>
            {unit}
          </HighlightUnit>))}
      </span>
    </p>);
}
function HighlightUnit({ ativo, atraso, children, }: {
    ativo: boolean;
    atraso: number;
    children: React.ReactNode;
}) {
    return (<motion.span initial={{ opacity: 0.3 }} animate={{ opacity: ativo ? 1 : 0.3 }} transition={{ duration: 0.3, delay: ativo ? atraso : 0 }}>
        {children}
      </motion.span>);
}
