# Aquecimento da Copa de Prompts MPAC - Design

Data: 2026-07-01

## Objetivo

Criar um aquecimento em tempo real para a Copa de Prompts do MPAC, com duas equipes e metafora de futebol: ataque, defesa, contra-ataque, gol, placar e tempo.

O produto tera uma tela publica que tambem funciona como painel do administrador, e uma tela de equipe acessada por codigo. O backend sera a fonte da verdade da partida e sincronizara todas as telas via Socket.io.

## Escopo Aprovado

- Uma partida unica por vez.
- Duas equipes configuraveis pelo administrador.
- Codigos de entrada gerados automaticamente para cada equipe.
- Inicio bloqueado ate as duas equipes estarem conectadas e prontas.
- Tela publica/admin com campo, placar, pergunta, alternativas, tempo e eventos.
- Painel administrativo em gaveta lateral recolhivel.
- Tela de equipe com entrada por codigo e resposta da pergunta ativa.
- 10 rodadas no total, com 5 posses iniciais para cada equipe.
- Ataque com 45 segundos.
- Contra-ataque com 15 segundos.
- Revelacao com 5 segundos apos confirmacao da resposta.
- Snapshot JSON local para recuperacao.
- Retomada normal e retomada emergencial.

## Fora De Escopo

- Login, cadastro ou autenticacao formal.
- Multiplas partidas simultaneas.
- Banco de dados.
- Historico permanente de varias partidas.
- Area admin separada.
- Edicao visual completa da identidade da competicao.

## Telas

### Tela Publica/Admin

Antes da partida, a tela publica mostra:

- nomes editaveis das equipes;
- codigos gerados automaticamente;
- status de conexao/prontidao de cada equipe;
- botao de iniciar, liberado somente quando as duas equipes estiverem prontas;
- painel administrativo em gaveta lateral recolhivel.

Durante a partida, a tela publica mostra:

- campo de futebol;
- placar;
- rodada atual;
- equipe com posse;
- fase da jogada;
- tempo restante;
- pergunta e alternativas completas;
- alternativa escolhida depois da confirmacao;
- alternativa correta depois da revelacao;
- resultado narrativo e visual: gol, defesa ou contra-ataque.

Controles administrativos durante e apos a partida:

- pausar/retomar quando aplicavel;
- corrigir placar em retomada normal;
- acionar modo emergencial quando necessario;
- reiniciar/criar nova partida.

### Tela Da Equipe

A equipe acessa a tela inicial, informa o codigo gerado pelo sistema e entra como Equipe A ou Equipe B.

Depois de entrar, a equipe ve:

- nome da equipe;
- status da partida;
- placar;
- tempo;
- estado de espera quando nao for sua vez;
- pergunta e alternativas quando for sua vez.

Fluxo de resposta:

1. A equipe seleciona uma alternativa localmente.
2. A equipe confirma a resposta.
3. A resposta fica travada.
4. Publico e equipe entram juntos em uma espera de 5 segundos.
5. Durante a espera, publico e equipe veem a alternativa escolhida.
6. Ao fim da espera, o sistema mostra alternativa correta e resultado.

## Regras Da Partida

### Rodadas

O aquecimento tem 10 rodadas. A posse inicial alterna de forma fixa:

1. Equipe A
2. Equipe B
3. Equipe A
4. Equipe B
5. Equipe A
6. Equipe B
7. Equipe A
8. Equipe B
9. Equipe A
10. Equipe B

A alternancia da proxima rodada independe do contra-ataque.

### Ataque

- A equipe atacante recebe uma pergunta de ataque.
- Ela tem 45 segundos para confirmar uma resposta.
- Se acertar, marca gol e a rodada termina.
- Se errar ou o tempo acabar, ocorre defesa e a equipe adversaria recebe contra-ataque.

### Contra-Ataque

- A equipe adversaria recebe uma pergunta de contra-ataque.
- Ela tem 15 segundos para confirmar uma resposta.
- Se acertar, marca gol e a rodada termina.
- Se errar ou o tempo acabar, a rodada termina sem gol adicional.

### Revelacao

Apos uma equipe confirmar resposta:

- o servidor trava a resposta;
- o timer da pergunta para;
- publico e equipe veem a alternativa escolhida;
- o sistema aguarda 5 segundos;
- o servidor revela a alternativa correta;
- o campo mostra o resultado da jogada.

## Arquitetura

### Backend

O backend Express + Socket.io continua sendo a fonte da verdade.

Responsabilidades:

- manter o estado da partida em memoria;
- gerar codigos das equipes;
- validar entrada por codigo;
- controlar prontidao das equipes;
- validar vez da equipe;
- validar pergunta ativa;
- validar resposta correta usando `server/questions.js`;
- controlar timers de ataque, contra-ataque e revelacao;
- aplicar transicoes de fase;
- salvar snapshot JSON local a cada mudanca importante;
- emitir o estado publico para todas as telas conectadas.

O frontend nao calcula regra de jogo. Ele apenas renderiza estado e envia comandos.

### Frontend

O frontend React renderiza rotas por contexto:

- `/` ou `/telao`: tela publica/admin;
- tela de entrada por codigo para equipes;
- tela de equipe apos codigo validado.

O estado vem sempre do servidor via Socket.io.

### Snapshot JSON

O servidor salva um snapshot local com:

- versao do snapshot;
- status da partida;
- nomes das equipes;
- codigos gerados;
- status de prontidao;
- placar;
- rodada atual;
- fase atual;
- equipe ativa;
- pergunta atual;
- resposta pendente ou revelada;
- historico de eventos;
- ids de perguntas ja respondidas.

O arquivo de snapshot deve ser tratado como dado operacional local e nao deve ser versionado.

## Recuperacao

### Retomada Normal

Quando o servidor reinicia e encontra snapshot valido:

- carrega o estado salvo;
- coloca a partida em modo pausado;
- nao retoma timers automaticamente;
- permite ao admin corrigir apenas o placar;
- permite retomar a partida quando o estado estiver conferido.

### Retomada Emergencial

Quando o snapshot estiver invalido, incompleto ou a situacao exigir correcao manual:

- o admin pode acionar explicitamente o modo emergencial;
- a interface mostra aviso de risco operacional;
- o admin pode ajustar placar, rodada atual, posse/fase e equipe ativa;
- ao confirmar, o servidor valida combinacoes basicas antes de retomar.

O modo emergencial existe para recuperacao no evento, nao para operacao normal.

## Eventos E Comandos

Comandos administrativos:

- configurar partida com nomes das equipes;
- gerar ou regenerar codigos antes do inicio;
- iniciar partida;
- pausar partida;
- retomar partida;
- corrigir placar em retomada normal;
- aplicar retomada emergencial;
- reiniciar partida.

Comandos da equipe:

- entrar por codigo;
- marcar prontidao;
- confirmar resposta.

Eventos emitidos pelo servidor:

- estado completo publico;
- sucesso ou erro de entrada por codigo;
- sucesso ou erro de confirmacao de resposta;
- atualizacao de timer;
- transicao de fase;
- evento narrativo da jogada.

## Erros E Seguranca Operacional

- Codigo invalido: a equipe recebe erro claro e permanece na tela de entrada.
- Equipe ja conectada: o sistema permite reconexao pelo mesmo codigo, sem trocar o lado da equipe.
- Inicio sem prontidao: servidor rejeita iniciar se uma equipe nao estiver pronta.
- Resposta fora da vez: servidor rejeita.
- Pergunta desatualizada: servidor rejeita.
- Resposta duplicada: servidor rejeita.
- Timer zerado: servidor aplica defesa ou encerramento do contra-ataque.
- Snapshot valido: servidor carrega pausado e aguarda admin.
- Snapshot invalido: servidor exige decisao do admin, com opcao de modo emergencial.
- Resposta correta nunca vem do frontend; a validacao usa dados do servidor.

## Validacao Tecnica

Fluxos que devem ser verificados:

- configurar nomes, gerar codigos e conectar as duas equipes;
- bloquear inicio antes das duas equipes prontas;
- iniciar partida com duas equipes prontas;
- gol no ataque;
- erro no ataque e gol no contra-ataque;
- erro no ataque e erro no contra-ataque;
- timeout no ataque;
- timeout no contra-ataque;
- pausa de 5 segundos com alternativa escolhida visivel;
- revelacao com alternativa correta;
- snapshot JSON salvo apos mudancas importantes;
- restart com snapshot valido e retomada pausada;
- correcao de placar antes de retomar;
- modo emergencial para snapshot invalido;
- rejeicao de codigo invalido;
- rejeicao de resposta duplicada;
- build de producao.

## Criterios De Sucesso

- O publico entende a jogada em tempo real sem depender de narracao externa.
- As equipes conseguem entrar por codigo e responder somente quando for sua vez.
- O aquecimento nao inicia sem as duas equipes prontas.
- Gol, defesa e contra-ataque aparecem sincronizados para publico e equipes.
- A resposta correta so e revelada apos a espera de 5 segundos.
- Um restart do servidor nao perde completamente a partida quando houver snapshot valido.
- O admin consegue corrigir placar e retomar com seguranca operacional.

## Proxima Skill

Depois da revisao deste design, a proxima etapa e usar `writing-plans` para criar um plano executavel por tarefas atomicas.
