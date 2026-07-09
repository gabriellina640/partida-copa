export const gameQuestions = [
  {
    round: 1,
    category: 'Restrição',
    attack: {
      title: 'Redução de risco de invenção',
      statement: 'Qual instrução é mais adequada para reduzir risco de invenção de dados em análise institucional?',
      options: [
        'Use as informações disponíveis e complemente o que parecer lógico.',
        'Quando faltar dado relevante, registre a lacuna e não formule conclusão definitiva.',
        'Utilize conhecimento geral para tornar a análise mais completa.',
        'Evite mencionar dúvidas para deixar o texto mais objetivo.'
      ],
      correctIndex: 1,
      explanation: 'A melhor instrução exige registrar lacunas e evita conclusões definitivas sem base nos dados.'
    },
    rebound: {
      title: 'Risco de alucinação',
      statement: 'Qual comando representa maior risco de alucinação?',
      options: [
        'Indique lacunas.',
        'Não invente dados.',
        'Presuma as informações ausentes.',
        'Use apenas os documentos fornecidos.'
      ],
      correctIndex: 2,
      explanation: 'Presumir informações ausentes incentiva a IA a preencher lacunas sem evidência.'
    }
  },
  {
    round: 2,
    category: 'Formato de saída',
    attack: {
      title: 'Comparação institucional',
      statement: 'A tarefa é comparar uma recomendação do MPAC com a resposta enviada por uma Secretaria Municipal. Qual formato tende a ser mais útil?',
      options: [
        'Texto corrido com opinião geral sobre a resposta.',
        'Resumo informal com os pontos que parecerem mais importantes.',
        'Tabela com recomendação, resposta apresentada, evidência de cumprimento, lacuna e providência sugerida.',
        'Lista livre de comentários, sem estrutura fixa.'
      ],
      correctIndex: 2,
      explanation: 'A tabela torna a comparação verificável, organizada e acionável para uso institucional.'
    },
    rebound: {
      title: 'Função do formato',
      statement: 'O formato de saída define:',
      options: [
        'Como a resposta deve ser organizada.',
        'Qual ferramenta será usada.',
        'Quem vencerá o desafio.',
        'Qual dado deve ser inventado.'
      ],
      correctIndex: 0,
      explanation: 'O formato de saída orienta a organização da resposta.'
    }
  },
  {
    round: 3,
    category: 'Pergunta técnica',
    attack: {
      title: 'Texto em números',
      statement: 'Quando uma palavra vira números dentro da IA, isso é chamado de:',
      options: [
        'Cópia literal da frase original',
        'Tradução visual da palavra escrita',
        'Representação vetorial do texto',
        'Conversão mágica para resposta'
      ],
      correctIndex: 2,
      explanation: 'Modelos representam textos numericamente, frequentemente como vetores usados para capturar relações de significado.'
    },
    rebound: {
      title: 'Utilidade dos vetores',
      statement: 'Na IA generativa, representar palavras ou trechos de texto como vetores ajuda principalmente a:',
      options: [
        'Medir semelhanças de significado entre textos',
        'Corrigir automaticamente erros de digitação',
        'Transformar qualquer texto em imagem',
        'Impedir que a IA erre respostas'
      ],
      correctIndex: 0,
      explanation: 'Representações vetoriais ajudam a comparar proximidade semântica entre textos.'
    }
  },
  {
    round: 4,
    category: 'Qualidade da resposta',
    attack: {
      title: 'Resposta convincente com dado inventado',
      statement: 'A resposta da IA está bem escrita, organizada e convincente, mas afirma que houve descumprimento de prazo sem que essa informação conste nos dados fornecidos. Qual é o principal problema?',
      options: [
        'Falta de criatividade.',
        'Excesso de formalidade.',
        'Extrapolação ou alucinação a partir dos dados.',
        'Uso inadequado de tópicos.'
      ],
      correctIndex: 2,
      explanation: 'Uma resposta bem escrita ainda é insegura se extrapola fatos não presentes nos dados fornecidos.'
    },
    rebound: {
      title: 'Resposta confiável',
      statement: 'Uma resposta confiável deve:',
      options: [
        'Parecer convincente, ainda que faltem dados.',
        'Separar fatos fornecidos, lacunas e inferências possíveis.',
        'Evitar mencionar limitações.',
        'Apresentar sempre conclusão definitiva.'
      ],
      correctIndex: 1,
      explanation: 'Separar fatos, lacunas e inferências ajuda a revisar e auditar a resposta.'
    }
  },
  {
    round: 5,
    category: 'Dados de entrada',
    attack: {
      title: 'Fragilidade do prompt',
      statement: 'O prompt diz: "Atue como assessor do MPAC e elabore despacho de continuidade do procedimento, com providências urgentes e linguagem institucional." Qual é a principal fragilidade do prompt?',
      options: [
        'Não foram fornecidos o histórico, os fatos ou os documentos que permitam justificar as providências.',
        'Não foi indicado se o despacho deve ter fundamentação normativa ou apenas encaminhamentos administrativos.',
        'Não foi definido o nível de detalhamento esperado para a linguagem institucional.',
        'Não foi informado se a resposta deve priorizar síntese, análise crítica ou minuta final.'
      ],
      correctIndex: 0,
      explanation: 'Todas apontam falhas possíveis, mas a ausência de dados de entrada impede a elaboração segura do despacho.'
    },
    rebound: {
      title: 'Procedimento ausente',
      statement: 'Quando o prompt pede análise "com base no procedimento", mas não traz o procedimento, a melhor orientação é:',
      options: [
        'Produzir uma análise geral, deixando claro que é apenas ilustrativa.',
        'Registrar a ausência dos dados e não inventar fatos ou providências.',
        'Usar conhecimento institucional para presumir o conteúdo provável.',
        'Criar um modelo padrão de despacho sem mencionar a falta de dados.'
      ],
      correctIndex: 1,
      explanation: 'Sem o procedimento, a IA deve registrar a lacuna e evitar fatos ou providências inventadas.'
    }
  },
  {
    round: 6,
    category: 'Pergunta técnica',
    attack: {
      title: 'Histórico muito extenso',
      statement: 'Uma equipe quer enviar para a IA um histórico muito extenso de um procedimento, com documentos repetidos, mensagens antigas e trechos pouco relevantes. Qual orientação técnica é mais adequada antes de montar o prompt?',
      options: [
        'Enviar todo o conteúdo possível, porque quanto maior o prompt, melhor será necessariamente a resposta.',
        'Reduzir o texto de entrada ao que for relevante, pois modelos processam o conteúdo em tokens e excesso de informação pode prejudicar foco, custo e precisão.',
        'Dividir palavras longas manualmente em partes menores, porque isso melhora a interpretação dos tokens.',
        'Remover todos os sinais de pontuação, pois eles não são considerados pelos modelos de linguagem.'
      ],
      correctIndex: 1,
      explanation: 'Selecionar o que é relevante melhora foco, custo e precisão, já que modelos processam texto em tokens.'
    },
    rebound: {
      title: 'Tokens',
      statement: 'Em modelos de linguagem, tokens podem ser:',
      options: [
        'Apenas imagens e desenhos',
        'Apenas frases longas inteiras',
        'Somente números matemáticos',
        'Palavras, pedaços ou sinais'
      ],
      correctIndex: 3,
      explanation: 'Tokens podem representar palavras, partes de palavras, sinais e outros fragmentos do texto.'
    }
  },
  {
    round: 7,
    category: 'Anonimização de dados',
    attack: {
      title: 'Risco de reidentificação',
      statement: 'Em um prompt institucional, a equipe pretende enviar à IA um relato contendo informações sobre servidores, unidades administrativas, datas, cargos e fatos específicos, mas decide remover apenas os nomes próprios antes do envio. Sobre essa estratégia, assinale a alternativa mais adequada:',
      options: [
        'A retirada dos nomes próprios elimina integralmente o risco de identificação, pois a IA não consegue associar pessoas sem nome completo.',
        'A anonimização de nomes próprios é suficiente quando o uso da IA for interno e a finalidade for institucional.',
        'A remoção de nomes reduz parte do risco, mas não garante anonimização completa, pois a reidentificação pode ocorrer pela combinação de cargo, unidade, data, local, fato específico ou outros dados indiretos.',
        'A proteção de dados só é necessária quando houver CPF, endereço residencial ou dado de saúde expressamente indicado no texto.'
      ],
      correctIndex: 2,
      explanation: 'Remover nomes reduz risco, mas dados indiretos combinados ainda podem permitir reidentificação.'
    },
    rebound: {
      title: 'Remover apenas o nome',
      statement: 'Remover apenas o nome de uma pessoa antes de enviar dados à IA:',
      options: [
        'Sempre anonimiza o texto.',
        'Reduz o risco, mas pode não impedir reidentificação.',
        'Só é necessário em casos criminais.',
        'Dispensa outros cuidados com dados pessoais.'
      ],
      correctIndex: 1,
      explanation: 'A remoção do nome é apenas uma medida parcial; outros dados podem identificar a pessoa.'
    }
  },
  {
    round: 8,
    category: 'Cadeia de raciocínio',
    attack: {
      title: 'Auditabilidade da resposta',
      statement: 'Em uma análise institucional produzida por IA, a equipe quer aumentar a auditabilidade da resposta. Qual instrução é mais adequada?',
      options: [
        'Mostre todo o seu raciocínio interno, passo a passo, antes de responder.',
        'Explique longamente como chegou à conclusão, mesmo sem indicar as fontes usadas.',
        'Apresente a conclusão acompanhada de justificativa objetiva, evidências utilizadas, lacunas identificadas e critérios aplicados.',
        'Responda de forma assertiva e evite mencionar dúvidas para transmitir segurança.'
      ],
      correctIndex: 2,
      explanation: 'Para auditar, o ideal é pedir conclusão, justificativa objetiva, evidências, lacunas e critérios aplicados.'
    },
    rebound: {
      title: 'Conferindo a resposta',
      statement: 'Para conferir uma resposta da IA, é melhor pedir:',
      options: [
        'Raciocínio interno completo.',
        'Justificativa objetiva e evidências verificáveis.',
        'Conclusão sem ressalvas.',
        'Texto mais longo e persuasivo.'
      ],
      correctIndex: 1,
      explanation: 'Evidências verificáveis e justificativa objetiva permitem revisão humana sem depender de raciocínio interno.'
    }
  },
  {
    round: 9,
    category: 'Alucinação e lacunas',
    attack: {
      title: 'Omissão de lacunas relevantes',
      statement: 'Em uma análise de procedimento do MPAC, a IA produziu uma resposta bem organizada e não inventou nenhum fato novo. Porém, deixou de mencionar que não havia documentos sobre prazo, responsável, providências anteriores e confirmação dos fatos narrados. Sobre essa resposta, assinale a alternativa mais adequada:',
      options: [
        'A resposta é tecnicamente segura, porque alucinação só ocorre quando a IA cria fatos inexistentes.',
        'A resposta é aceitável, desde que a conclusão pareça coerente com o tema analisado.',
        'A resposta é problemática, porque omitir lacunas relevantes pode induzir uma conclusão equivocada, mesmo sem inventar fatos novos.',
        'A resposta é adequada, pois mencionar lacunas pode enfraquecer a utilidade institucional da análise.'
      ],
      correctIndex: 2,
      explanation: 'A confiabilidade depende de evitar fatos inventados e explicitar o que não está comprovado, localizado ou concluído.'
    },
    rebound: {
      title: 'Lacunas omitidas',
      statement: 'Uma resposta da IA que não inventa fatos, mas omite lacunas importantes, é:',
      options: [
        'Sempre segura.',
        'Potencialmente enganosa.',
        'Melhor para decisão rápida.',
        'Apenas incompleta, sem risco.'
      ],
      correctIndex: 1,
      explanation: 'Omitir lacunas relevantes pode induzir decisão equivocada mesmo sem criar fatos novos.'
    }
  },
  {
    round: 10,
    category: 'Exemplos no prompt',
    attack: {
      title: 'Uso de exemplos',
      statement: 'Em um prompt institucional complexo, a equipe decide incluir dois exemplos de respostas anteriores para orientar a IA sobre o padrão esperado. Sobre o uso dessa técnica, assinale a alternativa mais adequada:',
      options: [
        'Exemplos sempre aumentam a precisão da resposta, independentemente de serem semelhantes ou não ao novo caso.',
        'Exemplos podem ajudar a padronizar formato, linguagem e nível de detalhamento, mas devem ser compatíveis com a nova tarefa para não induzir categorias, raciocínios ou conclusões inadequadas.',
        'Exemplos devem substituir as instruções do prompt, pois a IA aprende melhor copiando modelos do que seguindo comandos objetivos.',
        'Exemplos são úteis apenas para tarefas criativas, não sendo recomendados em análises institucionais, jurídicas ou administrativas.'
      ],
      correctIndex: 1,
      explanation: 'Exemplos ajudam a orientar padrão, linguagem e detalhamento, mas precisam ser compatíveis com a tarefa atual.'
    },
    rebound: {
      title: 'Cuidado com exemplos',
      statement: 'Ao incluir exemplos em um prompt, o principal cuidado é:',
      options: [
        'Usar exemplos compatíveis com a tarefa atual.',
        'Colocar o maior número possível de exemplos.',
        'Retirar todas as restrições do prompt.',
        'Usar exemplos mesmo sem contexto.'
      ],
      correctIndex: 0,
      explanation: 'Exemplos incompatíveis podem induzir formato, categorias ou conclusões inadequadas.'
    }
  }
];
