import "./rolagem.css";

export default function SobreLayout({ children }: LayoutProps<"/sobre">) {
    return (
        <div className="sobre-rolagem">
            {children}
        </div>
    );
}
