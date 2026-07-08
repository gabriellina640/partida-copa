export const gameQuestions = [
  {
    round: 1,
    category: 'Restricao',
    attack: {
      title: 'Reducao de risco de invencao',
      statement: 'Qual instrucao e mais adequada para reduzir risco de invencao de dados em analise institucional?',
      options: [
        'Use as informacoes disponiveis e complemente o que parecer logico.',
        'Quando faltar dado relevante, registre a lacuna e nao formule conclusao definitiva.',
        'Utilize conhecimento geral para tornar a analise mais completa.',
        'Evite mencionar duvidas para deixar o texto mais objetivo.'
      ],
      correctIndex: 1,
      explanation: 'A melhor instrucao exige registrar lacunas e evita conclusoes definitivas sem base nos dados.'
    },
    rebound: {
      title: 'Risco de alucinacao',
      statement: 'Qual comando representa maior risco de alucinacao?',
      options: [
        'Indique lacunas.',
        'Nao invente dados.',
        'Presuma as informacoes ausentes.',
        'Use apenas os documentos fornecidos.'
      ],
      correctIndex: 2,
      explanation: 'Presumir informacoes ausentes incentiva a IA a preencher lacunas sem evidencia.'
    }
  },
  {
    round: 2,
    category: 'Formato de saida',
    attack: {
      title: 'Comparacao institucional',
      statement: 'A tarefa e comparar uma recomendacao do MPAC com a resposta enviada por uma Secretaria Municipal. Qual formato tende a ser mais util?',
      options: [
        'Texto corrido com opiniao geral sobre a resposta.',
        'Resumo informal com os pontos que parecerem mais importantes.',
        'Tabela com recomendacao, resposta apresentada, evidencia de cumprimento, lacuna e providencia sugerida.',
        'Lista livre de comentarios, sem estrutura fixa.'
      ],
      correctIndex: 2,
      explanation: 'A tabela torna a comparacao verificavel, organizada e acionavel para uso institucional.'
    },
    rebound: {
      title: 'Funcao do formato',
      statement: 'O formato de saida define:',
      options: [
        'Como a resposta deve ser organizada.',
        'Qual ferramenta sera usada.',
        'Quem vencera o desafio.',
        'Qual dado deve ser inventado.'
      ],
      correctIndex: 0,
      explanation: 'O formato de saida orienta a organizacao da resposta.'
    }
  },
  {
    round: 3,
    category: 'Pergunta tecnica',
    attack: {
      title: 'Texto em numeros',
      statement: 'Quando uma palavra vira numeros dentro da IA, isso e chamado de:',
      options: [
        'Copia literal da frase original',
        'Traducao visual da palavra escrita',
        'Representacao vetorial do texto',
        'Conversao magica para resposta'
      ],
      correctIndex: 2,
      explanation: 'Modelos representam textos numericamente, frequentemente como vetores usados para capturar relacoes de significado.'
    },
    rebound: {
      title: 'Utilidade dos vetores',
      statement: 'Na IA generativa, representar palavras ou trechos de texto como vetores ajuda principalmente a:',
      options: [
        'Medir semelhancas de significado entre textos',
        'Corrigir automaticamente erros de digitacao',
        'Transformar qualquer texto em imagem',
        'Impedir que a IA erre respostas'
      ],
      correctIndex: 0,
      explanation: 'Representacoes vetoriais ajudam a comparar proximidade semantica entre textos.'
    }
  },
  {
    round: 4,
    category: 'Qualidade da resposta',
    attack: {
      title: 'Resposta convincente com dado inventado',
      statement: 'A resposta da IA esta bem escrita, organizada e convincente, mas afirma que houve descumprimento de prazo sem que essa informacao conste nos dados fornecidos. Qual e o principal problema?',
      options: [
        'Falta de criatividade.',
        'Excesso de formalidade.',
        'Extrapolacao ou alucinacao a partir dos dados.',
        'Uso inadequado de topicos.'
      ],
      correctIndex: 2,
      explanation: 'Uma resposta bem escrita ainda e insegura se extrapola fatos nao presentes nos dados fornecidos.'
    },
    rebound: {
      title: 'Resposta confiavel',
      statement: 'Uma resposta confiavel deve:',
      options: [
        'Parecer convincente, ainda que faltem dados.',
        'Separar fatos fornecidos, lacunas e inferencias possiveis.',
        'Evitar mencionar limitacoes.',
        'Apresentar sempre conclusao definitiva.'
      ],
      correctIndex: 1,
      explanation: 'Separar fatos, lacunas e inferencias ajuda a revisar e auditar a resposta.'
    }
  },
  {
    round: 5,
    category: 'Dados de entrada',
    attack: {
      title: 'Fragilidade do prompt',
      statement: 'O prompt diz: "Atue como assessor do MPAC e elabore despacho de continuidade do procedimento, com providencias urgentes e linguagem institucional." Qual e a principal fragilidade do prompt?',
      options: [
        'Nao foram fornecidos o historico, os fatos ou os documentos que permitam justificar as providencias.',
        'Nao foi indicado se o despacho deve ter fundamentacao normativa ou apenas encaminhamentos administrativos.',
        'Nao foi definido o nivel de detalhamento esperado para a linguagem institucional.',
        'Nao foi informado se a resposta deve priorizar sintese, analise critica ou minuta final.'
      ],
      correctIndex: 0,
      explanation: 'Todas apontam falhas possiveis, mas a ausencia de dados de entrada impede a elaboracao segura do despacho.'
    },
    rebound: {
      title: 'Procedimento ausente',
      statement: 'Quando o prompt pede analise "com base no procedimento", mas nao traz o procedimento, a melhor orientacao e:',
      options: [
        'Produzir uma analise geral, deixando claro que e apenas ilustrativa.',
        'Registrar a ausencia dos dados e nao inventar fatos ou providencias.',
        'Usar conhecimento institucional para presumir o conteudo provavel.',
        'Criar um modelo padrao de despacho sem mencionar a falta de dados.'
      ],
      correctIndex: 1,
      explanation: 'Sem o procedimento, a IA deve registrar a lacuna e evitar fatos ou providencias inventadas.'
    }
  },
  {
    round: 6,
    category: 'Pergunta tecnica',
    attack: {
      title: 'Historico muito extenso',
      statement: 'Uma equipe quer enviar para a IA um historico muito extenso de um procedimento, com documentos repetidos, mensagens antigas e trechos pouco relevantes. Qual orientacao tecnica e mais adequada antes de montar o prompt?',
      options: [
        'Enviar todo o conteudo possivel, porque quanto maior o prompt, melhor sera necessariamente a resposta.',
        'Reduzir o texto de entrada ao que for relevante, pois modelos processam o conteudo em tokens e excesso de informacao pode prejudicar foco, custo e precisao.',
        'Dividir palavras longas manualmente em partes menores, porque isso melhora a interpretacao dos tokens.',
        'Remover todos os sinais de pontuacao, pois eles nao sao considerados pelos modelos de linguagem.'
      ],
      correctIndex: 1,
      explanation: 'Selecionar o que e relevante melhora foco, custo e precisao, ja que modelos processam texto em tokens.'
    },
    rebound: {
      title: 'Tokens',
      statement: 'Em modelos de linguagem, tokens podem ser:',
      options: [
        'Apenas imagens e desenhos',
        'Apenas frases longas inteiras',
        'Somente numeros matematicos',
        'Palavras, pedacos ou sinais'
      ],
      correctIndex: 3,
      explanation: 'Tokens podem representar palavras, partes de palavras, sinais e outros fragmentos do texto.'
    }
  },
  {
    round: 7,
    category: 'Anonimizacao de dados',
    attack: {
      title: 'Risco de reidentificacao',
      statement: 'Em um prompt institucional, a equipe pretende enviar a IA um relato contendo informacoes sobre servidores, unidades administrativas, datas, cargos e fatos especificos, mas decide remover apenas os nomes proprios antes do envio. Sobre essa estrategia, assinale a alternativa mais adequada:',
      options: [
        'A retirada dos nomes proprios elimina integralmente o risco de identificacao, pois a IA nao consegue associar pessoas sem nome completo.',
        'A anonimizacao de nomes proprios e suficiente quando o uso da IA for interno e a finalidade for institucional.',
        'A remocao de nomes reduz parte do risco, mas nao garante anonimizacao completa, pois a reidentificacao pode ocorrer pela combinacao de cargo, unidade, data, local, fato especifico ou outros dados indiretos.',
        'A protecao de dados so e necessaria quando houver CPF, endereco residencial ou dado de saude expressamente indicado no texto.'
      ],
      correctIndex: 2,
      explanation: 'Remover nomes reduz risco, mas dados indiretos combinados ainda podem permitir reidentificacao.'
    },
    rebound: {
      title: 'Remover apenas o nome',
      statement: 'Remover apenas o nome de uma pessoa antes de enviar dados a IA:',
      options: [
        'Sempre anonimiza o texto.',
        'Reduz o risco, mas pode nao impedir reidentificacao.',
        'So e necessario em casos criminais.',
        'Dispensa outros cuidados com dados pessoais.'
      ],
      correctIndex: 1,
      explanation: 'A remocao do nome e apenas uma medida parcial; outros dados podem identificar a pessoa.'
    }
  },
  {
    round: 8,
    category: 'Cadeia de raciocinio',
    attack: {
      title: 'Auditabilidade da resposta',
      statement: 'Em uma analise institucional produzida por IA, a equipe quer aumentar a auditabilidade da resposta. Qual instrucao e mais adequada?',
      options: [
        'Mostre todo o seu raciocinio interno, passo a passo, antes de responder.',
        'Explique longamente como chegou a conclusao, mesmo sem indicar as fontes usadas.',
        'Apresente a conclusao acompanhada de justificativa objetiva, evidencias utilizadas, lacunas identificadas e criterios aplicados.',
        'Responda de forma assertiva e evite mencionar duvidas para transmitir seguranca.'
      ],
      correctIndex: 2,
      explanation: 'Para auditar, o ideal e pedir conclusao, justificativa objetiva, evidencias, lacunas e criterios aplicados.'
    },
    rebound: {
      title: 'Conferindo a resposta',
      statement: 'Para conferir uma resposta da IA, e melhor pedir:',
      options: [
        'Raciocinio interno completo.',
        'Justificativa objetiva e evidencias verificaveis.',
        'Conclusao sem ressalvas.',
        'Texto mais longo e persuasivo.'
      ],
      correctIndex: 1,
      explanation: 'Evidencias verificaveis e justificativa objetiva permitem revisao humana sem depender de raciocinio interno.'
    }
  },
  {
    round: 9,
    category: 'Alucinacao e lacunas',
    attack: {
      title: 'Omissao de lacunas relevantes',
      statement: 'Em uma analise de procedimento do MPAC, a IA produziu uma resposta bem organizada e nao inventou nenhum fato novo. Porem, deixou de mencionar que nao havia documentos sobre prazo, responsavel, providencias anteriores e confirmacao dos fatos narrados. Sobre essa resposta, assinale a alternativa mais adequada:',
      options: [
        'A resposta e tecnicamente segura, porque alucinacao so ocorre quando a IA cria fatos inexistentes.',
        'A resposta e aceitavel, desde que a conclusao pareca coerente com o tema analisado.',
        'A resposta e problematica, porque omitir lacunas relevantes pode induzir uma conclusao equivocada, mesmo sem inventar fatos novos.',
        'A resposta e adequada, pois mencionar lacunas pode enfraquecer a utilidade institucional da analise.'
      ],
      correctIndex: 2,
      explanation: 'A confiabilidade depende de evitar fatos inventados e explicitar o que nao esta comprovado, localizado ou concluido.'
    },
    rebound: {
      title: 'Lacunas omitidas',
      statement: 'Uma resposta da IA que nao inventa fatos, mas omite lacunas importantes, e:',
      options: [
        'Sempre segura.',
        'Potencialmente enganosa.',
        'Melhor para decisao rapida.',
        'Apenas incompleta, sem risco.'
      ],
      correctIndex: 1,
      explanation: 'Omitir lacunas relevantes pode induzir decisao equivocada mesmo sem criar fatos novos.'
    }
  },
  {
    round: 10,
    category: 'Exemplos no prompt',
    attack: {
      title: 'Uso de exemplos',
      statement: 'Em um prompt institucional complexo, a equipe decide incluir dois exemplos de respostas anteriores para orientar a IA sobre o padrao esperado. Sobre o uso dessa tecnica, assinale a alternativa mais adequada:',
      options: [
        'Exemplos sempre aumentam a precisao da resposta, independentemente de serem semelhantes ou nao ao novo caso.',
        'Exemplos podem ajudar a padronizar formato, linguagem e nivel de detalhamento, mas devem ser compativeis com a nova tarefa para nao induzir categorias, raciocinios ou conclusoes inadequadas.',
        'Exemplos devem substituir as instrucoes do prompt, pois a IA aprende melhor copiando modelos do que seguindo comandos objetivos.',
        'Exemplos sao uteis apenas para tarefas criativas, nao sendo recomendados em analises institucionais, juridicas ou administrativas.'
      ],
      correctIndex: 1,
      explanation: 'Exemplos ajudam a orientar padrao, linguagem e detalhamento, mas precisam ser compativeis com a tarefa atual.'
    },
    rebound: {
      title: 'Cuidado com exemplos',
      statement: 'Ao incluir exemplos em um prompt, o principal cuidado e:',
      options: [
        'Usar exemplos compativeis com a tarefa atual.',
        'Colocar o maior numero possivel de exemplos.',
        'Retirar todas as restricoes do prompt.',
        'Usar exemplos mesmo sem contexto.'
      ],
      correctIndex: 0,
      explanation: 'Exemplos incompativeis podem induzir formato, categorias ou conclusoes inadequadas.'
    }
  }
];
