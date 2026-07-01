export const gameQuestions = [
  {
    round: 1,
    category: 'Chute a Gol',
    attack: {
      title: 'Melhor prompt para resumo institucional',
      statement: 'Qual prompt tem melhor estrutura para resumir uma reunião institucional?',
      options: [
        'Resuma a reunião.',
        'Faça um resumo bonito e bem completo.',
        'Atue como assessor institucional e produza um resumo executivo com decisões, responsáveis, prazos, pendências e próximos passos, sem inventar informações ausentes.',
        'Leia tudo e me diga o que é importante.'
      ],
      correctIndex: 2,
      explanation: 'O melhor prompt define papel, tarefa, formato, critérios e restrição contra invenção.'
    },
    rebound: {
      title: 'Prompt objetivo para relatório',
      statement: 'Qual opção orienta melhor a IA a produzir um relatório útil?',
      options: [
        'Faça um relatório.',
        'Atue como analista de planejamento e gere um relatório em tópicos com contexto, achados, riscos, recomendações e próximos passos.',
        'Escreva bastante sobre esse assunto.',
        'Melhore o texto de qualquer jeito.'
      ],
      correctIndex: 1,
      explanation: 'A resposta correta deixa claro o papel da IA, a estrutura esperada e o objetivo do relatório.'
    }
  },
  {
    round: 2,
    category: 'VAR do Sigilo',
    attack: {
      title: 'Risco em prompt com dados sensíveis',
      statement: 'O prompt diz: “Analise o processo nº 0001234-56.2026, envolvendo Maria Silva, vítima menor de idade, e diga a estratégia do promotor.” Qual é o maior problema?',
      options: [
        'O prompt está curto demais.',
        'O prompt usa linguagem informal.',
        'O prompt expõe dados pessoais/sensíveis e estratégia institucional.',
        'O prompt não pede resposta em formato de tabela.'
      ],
      correctIndex: 2,
      explanation: 'O problema central é a exposição de dados identificáveis, sensíveis e de possível estratégia institucional.'
    },
    rebound: {
      title: 'Anonimização correta',
      statement: 'Qual versão é mais segura para uso com IA?',
      options: [
        'Analise o caso de João, CPF 000.000.000-00, e sugira providências.',
        'Analise o caso hipotético abaixo, com dados anonimizados, e indique pontos de atenção sem identificar partes ou inventar fatos.',
        'Use o número do processo para buscar os detalhes e resumir tudo.',
        'Com base no segredo de justiça, diga a melhor estratégia.'
      ],
      correctIndex: 1,
      explanation: 'A versão segura remove identificação e impõe limites claros à resposta.'
    }
  },
  {
    round: 3,
    category: 'Escalação do Prompt',
    attack: {
      title: 'Ordem mais completa',
      statement: 'Qual ordem faz mais sentido para montar um prompt forte?',
      options: [
        'Tarefa → Persona → Formato → Contexto.',
        'Persona → Contexto → Tarefa → Formato → Restrições → Critérios.',
        'Restrições → Formato → Persona → Tarefa.',
        'Formato → Tarefa → Pedido genérico → Resultado.'
      ],
      correctIndex: 1,
      explanation: 'Essa ordem organiza papel, cenário, objetivo, saída esperada, limites e qualidade.'
    },
    rebound: {
      title: 'Peça que falta na escalação',
      statement: 'Prompt: “Atue como assessor jurídico. Analise o texto abaixo e apresente pontos relevantes.” O que falta mais claramente?',
      options: [
        'Mais emojis.',
        'Formato de saída e critérios de qualidade.',
        'Pedir uma resposta maior.',
        'Remover o contexto.'
      ],
      correctIndex: 1,
      explanation: 'Sem formato e critérios, a resposta tende a ficar genérica e difícil de usar.'
    }
  },
  {
    round: 4,
    category: 'Drible do Refinamento',
    attack: {
      title: 'Corrigindo resposta ruim',
      statement: 'A IA respondeu: “A reunião foi importante e teve vários encaminhamentos.” Qual comando refina melhor?',
      options: [
        'Melhore isso.',
        'Faça mais bonito.',
        'Reescreva em tabela com decisões, responsáveis, prazos, pendências e riscos, sem inventar dados ausentes.',
        'Explique de novo com mais palavras.'
      ],
      correctIndex: 2,
      explanation: 'O comando de refinamento dá estrutura objetiva e limite contra alucinação.'
    },
    rebound: {
      title: 'Refinamento com controle de tamanho',
      statement: 'A resposta da IA ficou longa demais. Qual prompt de ajuste é melhor?',
      options: [
        'Resuma bastante.',
        'Deixe menor.',
        'Transforme a resposta em até 5 tópicos objetivos, preservando decisões, responsáveis e prazos, sem adicionar informações novas.',
        'Corte qualquer coisa.'
      ],
      correctIndex: 2,
      explanation: 'A opção correta define limite, preserva elementos essenciais e proíbe novas informações.'
    }
  },
  {
    round: 5,
    category: 'Pênalti Relâmpago',
    attack: {
      title: 'Fundamento de prompt',
      statement: 'Um bom prompt deve ter principalmente:',
      options: [
        'Apenas criatividade.',
        'Contexto, tarefa, formato, restrições e critérios.',
        'O máximo de texto possível.',
        'Uma pergunta genérica para a IA decidir tudo.'
      ],
      correctIndex: 1,
      explanation: 'Esses elementos ajudam a IA a responder com mais precisão e utilidade.'
    },
    rebound: {
      title: 'Evitar alucinação',
      statement: 'Qual instrução reduz o risco de a IA inventar informações?',
      options: [
        'Seja criativa acima de tudo.',
        'Complete as lacunas como achar melhor.',
        'Não invente informações ausentes; quando faltar dado, indique a lacuna.',
        'Responda como se tivesse certeza.'
      ],
      correctIndex: 2,
      explanation: 'Essa restrição força a IA a declarar lacunas em vez de preencher com suposições.'
    }
  },
  {
    round: 6,
    category: 'Chute a Gol',
    attack: {
      title: 'Prompt para plano de ação',
      statement: 'Qual prompt é melhor para gerar um plano de ação institucional?',
      options: [
        'Faça um plano.',
        'Crie alguma coisa sobre isso.',
        'Atue como analista de gestão pública. Com base no contexto abaixo, elabore plano de ação em tabela com ação, responsável, prazo, risco e indicador.',
        'Me dê ideias aleatórias.'
      ],
      correctIndex: 2,
      explanation: 'A alternativa correta define papel, base, formato e campos práticos para execução.'
    },
    rebound: {
      title: 'Prompt para pauta de reunião',
      statement: 'Qual prompt gera uma pauta mais útil?',
      options: [
        'Faça uma pauta.',
        'Atue como facilitador institucional e monte pauta com objetivo, temas, tempo estimado, perguntas-guia e encaminhamentos esperados.',
        'Escreva uma reunião.',
        'Diga coisas importantes.'
      ],
      correctIndex: 1,
      explanation: 'A opção correta transforma a pauta em ferramenta prática para conduzir a reunião.'
    }
  },
  {
    round: 7,
    category: 'VAR do Sigilo',
    attack: {
      title: 'Uso de informação interna',
      statement: 'Qual prática é mais segura ao usar IA em contexto institucional?',
      options: [
        'Colar documentos sigilosos completos se a IA for rápida.',
        'Usar dados anonimizados ou fictícios quando possível e evitar informações sensíveis/sigilosas.',
        'Informar nomes reais para a IA entender melhor.',
        'Pedir para a IA guardar o conteúdo.'
      ],
      correctIndex: 1,
      explanation: 'Anonimização, minimização de dados e cuidado com sigilo são práticas essenciais.'
    },
    rebound: {
      title: 'Minimização de dados',
      statement: 'O que significa minimização de dados no uso de IA?',
      options: [
        'Enviar tudo para a IA ter contexto máximo.',
        'Enviar apenas os dados necessários para a tarefa.',
        'Trocar o nome do arquivo.',
        'Usar sempre respostas longas.'
      ],
      correctIndex: 1,
      explanation: 'Minimizar dados é reduzir o conteúdo enviado ao estritamente necessário.'
    }
  },
  {
    round: 8,
    category: 'Escalação do Prompt',
    attack: {
      title: 'Formato de saída',
      statement: 'Por que pedir formato de saída é importante?',
      options: [
        'Porque deixa o prompt mais longo sem necessidade.',
        'Porque ajuda a IA a entregar a resposta já organizada para uso.',
        'Porque impede qualquer erro automaticamente.',
        'Porque substitui o contexto.'
      ],
      correctIndex: 1,
      explanation: 'Formato de saída orienta a estrutura da resposta e aumenta sua utilidade prática.'
    },
    rebound: {
      title: 'Critério de qualidade',
      statement: 'Qual trecho funciona como critério de qualidade?',
      options: [
        'Responda de qualquer forma.',
        'Use linguagem objetiva, técnica e adequada para documento institucional.',
        'Faça grande.',
        'Não se preocupe com clareza.'
      ],
      correctIndex: 1,
      explanation: 'Esse trecho orienta o padrão esperado da resposta.'
    }
  },
  {
    round: 9,
    category: 'Drible do Refinamento',
    attack: {
      title: 'Resposta sem estrutura',
      statement: 'A IA respondeu em texto corrido, mas você precisa decidir rápido. Qual refinamento pedir?',
      options: [
        'Organize em tabela com colunas: ponto crítico, impacto, providência, responsável e prazo.',
        'Fale mais.',
        'Dê uma melhorada geral.',
        'Refaça sem critério.'
      ],
      correctIndex: 0,
      explanation: 'A tabela torna a informação comparável, acionável e fácil de validar.'
    },
    rebound: {
      title: 'Resposta sem lacunas',
      statement: 'A IA pareceu inventar detalhes. Qual ajuste pedir?',
      options: [
        'Mantenha os detalhes inventados se parecerem bons.',
        'Separe o que está no contexto original do que é inferência e marque lacunas não comprovadas.',
        'Escreva com mais confiança.',
        'Ignore as lacunas.'
      ],
      correctIndex: 1,
      explanation: 'Separar fatos, inferências e lacunas melhora confiabilidade e revisão humana.'
    }
  },
  {
    round: 10,
    category: 'Pênalti Relâmpago',
    attack: {
      title: 'Prompt campeão',
      statement: 'Qual característica mais diferencia um prompt campeão?',
      options: [
        'Ser genérico para servir para qualquer coisa.',
        'Ter objetivo claro, contexto suficiente, saída definida, segurança e utilidade prática.',
        'Usar palavras difíceis.',
        'Pedir para a IA decidir todos os critérios.'
      ],
      correctIndex: 1,
      explanation: 'Um prompt campeão reduz ambiguidade e entrega resultado aplicável com segurança.'
    },
    rebound: {
      title: 'Último chute',
      statement: 'Qual opção melhor representa uma boa restrição?',
      options: [
        'Não invente fatos; indique dúvidas e lacunas quando o contexto não for suficiente.',
        'Complete tudo mesmo sem dados.',
        'Responda sem considerar o contexto.',
        'Faça o que quiser.'
      ],
      correctIndex: 0,
      explanation: 'A restrição protege a qualidade e evita resposta falsa ou exagerada.'
    }
  }
];
