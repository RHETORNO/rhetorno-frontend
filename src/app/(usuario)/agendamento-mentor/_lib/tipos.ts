export type Formacao ="psicologia" | "gestao-rh" | "administracao";

export const NOMES_FORMACAO: Record<Formacao, string> = {
    psicologia: "Psicologia",
    "gestao-rh": "Gestão de Recursos Humanos",
   administracao: "Administração",
};

export type Turno = "manha" | "tarde" | "noite";
export const NOMES_TURNO: Record<Turno, string> = {
  manha: "Manhã",
  tarde: "Tarde",
  noite: "Noite",
};

export type Agenda = {
  diasSemana: number[];
  turnos: Turno[];
};


export type Servico ={
    id: number;
    nome: string;
    oQueFaz: string;
    candidatoRecebe: string;
    grupo: Formacao | "inicio-carreira";
}

export type FormacaoAcademica ={
    curso: string;
    instituicao: string;   
};

export type Experiencia ={
    empresa:string;
    periodo: string;
    cargo: string
};

export type Mentor ={
    id: string,
    nome: string,
    bio: string,
    abordagem: string,
    fotoUrl: string,
    linkedinUrl: string;
    formacaoPrincipal: Formacao;
    formacoes: FormacaoAcademica[];
    experiencias: Experiencia[];
    idiomas: string[];
    servicos: number[]; 
    valorSessao: number;
    duracaoMinutos: number;
    atendeLibras: boolean;
    avaliacao: number;
    agenda: Agenda;
    };