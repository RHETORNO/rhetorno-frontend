import { chaveDia, mesmoDia } from "../_lib/horarios";

const LETRAS_DIAS = ["D", "S", "T", "Q", "Q", "S", "S"];

type Props = {
  meses: Date[];
  mes: Date;
  aoTrocarMes: (mes: Date) => void;
  hoje: Date;
  selecionado: Date | null;
  disponivel: (dia: Date) => boolean;
  aoEscolher: (dia: Date) => void;
};

export default function CalendarioMes({ meses, mes, aoTrocarMes, hoje, selecionado, disponivel, aoEscolher }: Props) {
  const ano = mes.getFullYear();
  const numeroMes = mes.getMonth();
  const espacosVazios = new Date(ano, numeroMes, 1).getDay();
  const totalDias = new Date(ano, numeroMes + 1, 0).getDate();
  const dias = Array.from({ length: totalDias }, (_, i) => new Date(ano, numeroMes, i + 1));

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-1 rounded-xl bg-[#f1f3f7] p-1" role="group" aria-label="Mês">
        {meses.map((opcao) => {
          const ativo = opcao.getTime() === mes.getTime();
          const nome = opcao.toLocaleDateString("pt-BR", { month: "short" }).replace(".", "");
          const outroAno = opcao.getFullYear() !== hoje.getFullYear();
          return (
            <button
              key={chaveDia(opcao)}
              type="button"
              onClick={() => aoTrocarMes(opcao)}
              aria-pressed={ativo}
              aria-label={opcao.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
              className={`rounded-lg px-2 py-1.5 text-sm capitalize transition ${
                ativo ? "bg-white font-semibold text-[#0f1b3d] shadow-sm" : "text-[#595959] hover:text-[#2d2d2d]"
              }`}
            >
              {nome}
              {outroAno && <span className="ml-1 text-[11px] font-normal text-[#8a8a8a]">{opcao.getFullYear()}</span>}
            </button>
          );
        })}
      </div>

      <div>
        <div className="grid grid-cols-7 text-center text-xs font-medium text-[#9aa3b2]" aria-hidden>
          {LETRAS_DIAS.map((letra, posicao) => (
            <span key={posicao} className="py-1">
              {letra}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: espacosVazios }, (_, posicao) => (
            <span key={`vazio-${posicao}`} aria-hidden />
          ))}

          {dias.map((dia) => {
            const passou = dia < hoje;
            const livre = !passou && disponivel(dia);
            const escolhido = selecionado ? mesmoDia(dia, selecionado) : false;
            const ehHoje = mesmoDia(dia, hoje);

            return (
              <button
                key={dia.getDate()}
                type="button"
                disabled={!livre}
                onClick={() => aoEscolher(dia)}
                aria-pressed={escolhido}
                aria-label={`${dia.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}${livre ? "" : ", indisponível"}`}
                className={`relative flex aspect-square items-center justify-center rounded-lg text-sm tabular-nums transition ${
                  escolhido
                    ? "bg-[#0f1b3d] font-semibold text-white shadow-sm"
                    : passou
                      ? "cursor-not-allowed bg-[#f1f3f7] text-[#c0c6d0]"
                      : livre
                        ? "bg-[#e8edf8] font-medium text-[#0f1b3d] hover:bg-[#c3d1ef]"
                        : "cursor-not-allowed text-[#c9cfd9]"
                }`}
              >
                {dia.getDate()}
                {ehHoje && !escolhido && <span className="absolute bottom-1 size-1 rounded-full bg-current" aria-hidden />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[#8a8a8a]" aria-hidden>
        <span className="flex items-center gap-1">
          <span className="size-2.5 rounded-sm bg-[#e8edf8] ring-1 ring-[#c3d1ef]" /> Disponível
        </span>
        <span className="flex items-center gap-1">
          <span className="size-2.5 rounded-sm bg-[#f1f3f7]" /> Já passou
        </span>
        <span className="flex items-center gap-1">
          <span className="size-2.5 rounded-sm bg-[#0f1b3d]" /> Escolhido
        </span>
      </div>
    </div>
  );
}
