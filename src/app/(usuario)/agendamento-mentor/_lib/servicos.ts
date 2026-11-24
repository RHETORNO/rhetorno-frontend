import type {Servico} from "./tipos";

function s(
    id: number,
    grupo: Servico ["grupo"],
    nome: string,
    oQueFaz: string,
    candidatoRecebe:string,
): Servico {
    return{ id , grupo, nome , oQueFaz , candidatoRecebe }
}

export const SERVICOS: Servico[] = [

  s(1, "psicologia", "Seu Diferencial Profissional", "Exercícios guiados para descobrir seus valores, motivações e talentos", "Mapa de valores e talentos e uma resposta pronta para o “fale sobre você”"),
  s(2, "psicologia", "Fim do Nervosismo em Entrevistas", "Técnicas de respiração, ensaio mental e controle de pensamentos para chegar calmo", "Protocolo de 10 minutos, áudio guiado e cartão de emergência para o “branco”"),
  s(3, "psicologia", "Inteligência Emocional sob Pressão", "Avalia como você lida com pressão, críticas e conflitos", "Diagnóstico emocional e respostas prontas sobre conflito e pressão"),
  s(4, "psicologia", "Fale com Confiança: Comunicação e Oratória", "Analisa gravações suas: voz, ritmo, vícios de linguagem e postura", "Vídeo comentado e 5 exercícios para eliminar o “né” e o “tipo”"),
  s(5, "psicologia", "Destrave sua Carreira", "Identifica o que te trava: síndrome do impostor, procrastinação, medo de rejeição", "Mapa dos bloqueios e plano de 30 dias com micro-desafios"),
  s(6, "psicologia", "Leitura Comportamental da Entrevista", "Analisa linguagem corporal, contato visual e se a fala combina com os gestos", "Análise em vídeo com os momentos marcados e guia de postura confiante"),
  s(7, "psicologia", "Resiliência na Busca de Emprego", "Ajuda a lidar com os “nãos”, o silêncio das empresas e a queda de motivação", "Rotina semanal e roteiro para pedir feedback depois de uma reprovação"),
  s(8, "psicologia", "Decisões Difíceis de Carreira", "Método para escolher entre propostas, áreas, ou entre ficar e sair", "Matriz de decisão com pontuação e recomendação final justificada"),
  s(9, "psicologia", "Trabalhe sem se Esgotar: Prevenção de Burnout", "Identifica sinais de esgotamento e hábitos de trabalho prejudiciais", "Checklist de alerta, plano de limites e perguntas para avaliar a cultura da empresa"),

  s(10, "gestao-rh", "Bastidores do Recrutador: Como Você é Avaliado", "Um recrutador revela os critérios reais da triagem, da entrevista e da decisão", "Checklist do que aprova e elimina e os 10 erros que mais reprovam"),
  s(11, "gestao-rh", "Palavras-chave que Fazem o Recrutador te Encontrar", "Levanta os termos que os recrutadores mais buscam na sua área", "30 palavras-chave e onde colocar cada uma no currículo e no LinkedIn"),
  s(12, "gestao-rh", "Currículo Internacional (Resume em Inglês)", "Adapta o currículo ao padrão de fora, o que vai além de traduzir", "Resume pronto, em PDF e em versão editável"),
  s(13, "gestao-rh", "Carta de Apresentação que Gera Entrevista", "Escreve uma carta personalizada para a vaga que você quer", "Carta pronta e modelo editável para adaptar em 5 minutos"),
  s(14, "gestao-rh", "Portfólio que Vende seu Trabalho", "Seleciona e organiza seus projetos destacando os resultados", "Portfólio com cada projeto em problema, solução e resultado"),
  s(15, "gestao-rh", "LinkedIn Magnético", "Otimiza o perfil para aparecer nas buscas dos recrutadores", "Título, “sobre” e experiências reescritos e estratégia para ser chamado"),
  s(16, "gestao-rh", "Marca Pessoal: Seja Lembrado", "Define como você quer ser visto no mercado", "Plano de posicionamento, ideias de posts e 3 posts prontos"),
  s(17, "gestao-rh", "Simulação de Entrevista com Recrutador Real", "Entrevista simulada com as perguntas mais usadas nos processos", "Nota por resposta e versão melhorada das respostas fracas"),
  s(18, "gestao-rh", "Simulação de Entrevista em Inglês", "Entrevista simulada inteiramente em inglês", "Feedback de fluência e respostas para as 15 perguntas mais comuns"),
  s(19, "gestao-rh", "Respostas que Provam Competência (Método STAR)", "Transforma suas experiências em histórias que convencem", "Banco com 10 respostas STAR prontas"),
  s(20, "gestao-rh", "Domine a Entrevista Online e Gravada", "Ajusta câmera, luz e áudio e treina respostas em vídeo", "Checklist técnico e treino gravado com feedback"),
  s(21, "gestao-rh", "Etapa Final: Entrevista com Gestor e Painel", "Prepara você para a fase em que a decisão é tomada", "Estratégia para a etapa final e perguntas inteligentes para o gestor"),
  s(22, "gestao-rh", "Vídeo de Apresentação que Chama Atenção", "Roteiriza e revisa um vídeo de 1 minuto sobre você", "Roteiro e vídeo revisado, pronto para enviar"),
  s(23, "gestao-rh", "Perfil Comportamental DISC", "Mapeia Dominância, Influência, Estabilidade e Conformidade", "Relatório DISC comentado e cargos que combinam com você"),
  s(24, "gestao-rh", "O que Falta para a Vaga dos Sonhos (Mapa CHA)", "Compara suas competências com as que a vaga pede", "Mapa de lacunas e cursos para preencher cada uma"),
  s(25, "gestao-rh", "Plano de Desenvolvimento Individual (PDI)", "Monta seu plano de crescimento profissional", "PDI completo, com metas, prazos e indicadores"),

  s(26, "inicio-carreira", "Primeiro Emprego sem Experiência", "Transforma cursos, projetos e voluntariado em experiência que conta", "Currículo pronto e estratégia de candidatura"),
  s(27, "inicio-carreira", "Aprovado no Estágio", "Prepara você para todas as etapas do processo seletivo", "Currículo para quem não tem experiência e roteiro de entrevista"),
  s(28, "inicio-carreira", "Mentoria para Processos de Trainee", "Acompanha testes online, dinâmica, painel e case", "Plano para cada fase e simulação de case"),
  s(29, "inicio-carreira", "Destaque-se nas Dinâmicas de Grupo", "Mostra o que os avaliadores observam em cada dinâmica", "Estratégia por tipo de dinâmica e os papéis que mais aprovam"),
  s(30, "inicio-carreira", "Trabalho em Equipe que Faz Você Crescer", "Ensina a colaborar, dividir tarefas e dar e receber feedback", "Guia de convivência e resposta para “me conte de um trabalho em grupo”"),

  s(31, "administracao", "Planejamento Estratégico de Carreira", "Analisa onde você está e aonde quer chegar, com uma SWOT pessoal", "Plano de carreira com metas de curto, médio e longo prazo"),
  s(32, "administracao", "Análise de Mercado e Tendências", "Mostra quais áreas crescem, quanto pagam", "O que pedem"),
  s(33, "administracao", "Estratégia de Busca de Emprego", "Organiza sua busca para parar de mandar currículo no escuro", "Plano semanal de busca, com canais e metas"),
  s(34, "administracao", "Estratégia de Candidatura a Vagas", "Ensina a escolher as vagas certas e adaptar cada candidatura", "Método de candidatura e planilha para controlar os processos"),
  s(35, "administracao", "Networking Estratégico", "Mostra como chegar em quem contrata sem parecer forçado", "Roteiro de abordagem e mensagens prontas"),
  s(36, "administracao", "Recolocação Profissional", "Estratégia para voltar a trabalhar rápido depois de um desligamento", "Plano de recolocação com prazos"),
  s(37, "administracao", "Retorno ao Mercado após Pausa", "Prepara a volta depois de maternidade, doença, estudos ou pausa", "Estratégia e resposta pronta para explicar a pausa"),
  s(38, "administracao", "Transição de Carreira Estratégica", "Mostra como migrar de área aproveitando o que você já sabe", "Mapa de habilidades transferíveis e rota de transição"),
  s(39, "administracao", "Carreira Internacional e Vagas Remotas", "Mostra o caminho para trabalhar para fora ou de qualquer lugar", "Plano para vagas internacionais e sites onde procurar"),
  s(40, "administracao", "Negociação Salarial Estratégica", "Prepara você para pedir mais sem perder a vaga", "Faixa salarial ideal e roteiro de negociação"),
  s(41, "administracao", "Análise de Proposta de Emprego", "Avalia salário, benefícios, crescimento e riscos da proposta", "Comparativo completo da proposta"),
  s(42, "administracao", "Comparativo CLT x PJ", "Faz as contas reais de cada formato de contratação", "Planilha com o valor líquido de cada opção"),
  s(43, "administracao", "Promoção e Crescimento Interno", "Mostra como ser notado e promovido onde você já está", "Plano para conquistar a promoção"),
  s(44, "administracao", "Transição para Cargos de Liderança", "Prepara você para sair de executor e virar líder", "Plano de desenvolvimento de líder"),
  s(45, "administracao", "Carreira Empreendedora e Freelancer", "Ajuda a transformar sua profissão em um negócio próprio", "Plano para começar como autônomo, com precificação"),
  s(46, "administracao", "Pitch Pessoal", "Cria uma apresentação curta e marcante sobre você", "Pitch de 60 segundos pronto"),
];
