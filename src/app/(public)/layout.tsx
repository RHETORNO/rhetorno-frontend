import type { Metadata } from "next";
import { Geist, Geist_Mono, Epilogue } from "next/font/google";
import ".././globals.css";
import Header from "./_components/header";
import { ThemeProvider } from "@/components/theme-provider";
import Footer from "@/components/layout/footer";
import VLibras from "@/components/accessibility/VLibras";
import RolagemSuave from "./_components/RolagemSuave";
import "./revelar.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const epilogue = Epilogue({
  variable: "--font-epilogue",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "RHetorno",
  description: "Prepare-se para o mercado de trabalho com análise de currículo, compatibilidade com vagas, simulação de entrevistas com IA, cursos e mentoria de profissionais de RH.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-br"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${epilogue.variable} h-full antialiased scrollbar-none [&::-webkit-scrollbar]:hidden`}
    >
      <body suppressHydrationWarning>
      <ThemeProvider 
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      >
        <VLibras />
        {/* rolagem suave com a rodinha do mouse em todas as páginas públicas */}
        <RolagemSuave />
        <Header/>
        {children}
        <Footer/>
      </ThemeProvider>
        </body>
    </html>
  );
}
