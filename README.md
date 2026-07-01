# Aquecimento da Copa de Prompts MPAC

Aquecimento em tempo real para a Copa de Prompts do MPAC, com perguntas no formato futebol: ataque, defesa, contra-ataque e gol.

## Fluxo principal

1. O operador abre a tela publica/admin do aquecimento.
2. O operador edita os nomes das equipes.
3. O sistema gera automaticamente um codigo para cada equipe.
4. Cada equipe acessa a tela de equipe e entra com seu codigo.
5. O aquecimento so pode iniciar quando as duas equipes estiverem prontas.
6. A tela publica mostra campo, placar, pergunta, alternativas, tempo e resultado das jogadas.
7. A tela de equipe mostra a pergunta ativa somente quando for a vez daquela equipe responder.

## Regras da partida

- 10 rodadas no total.
- 5 posses iniciais para cada equipe.
- Alternancia fixa de posse inicial: A, B, A, B...
- Ataque: 45 segundos.
- Contra-ataque: 15 segundos.
- Apos confirmar resposta, publico e equipe veem a alternativa escolhida e aguardam 5 segundos.
- Depois dos 5 segundos, o sistema revela a alternativa correta e mostra gol, defesa ou fim da jogada.
- Se o ataque errar ou estourar o tempo, a outra equipe recebe contra-ataque.
- Se o contra-ataque errar ou estourar o tempo, a rodada termina.

## Telas

- Publico/admin: `http://localhost:5173/`
- Equipe: `http://localhost:5173/equipe`

A tela publica/admin usa uma gaveta lateral para nomes, codigos, inicio, pausa, retomada e recuperacao.

## Como rodar localmente

```bash
npm install
npm run dev
```

Isso sobe:

- Frontend Vite em `http://localhost:5173`
- Backend Socket.io em `http://localhost:3001`

## Testes

```bash
npm test
npm run build
```

## Recuperacao por snapshot

O servidor salva um snapshot local em:

```text
server/game-snapshot.json
```

Esse arquivo nao deve ser versionado. Se o servidor reiniciar com snapshot valido, o aquecimento volta pausado para o operador conferir e retomar.

Na retomada normal, o operador pode corrigir o placar antes de continuar.

Se houver problema no snapshot, o operador pode usar o modo emergencial para ajustar placar, rodada, fase e equipe ativa antes de retomar.

## Arquivos principais

```text
server/gameEngine.js       regras puras da partida
server/snapshotStore.js    leitura, gravacao e validacao do snapshot
server/index.js            Express, Socket.io e timers
server/questions.js        perguntas e respostas corretas
client/src/main.jsx        telas publica/admin e equipe
client/src/styles.css      visual do telao e da cabine
```

## Personalizar perguntas

Edite `server/questions.js`.

Cada rodada tem uma pergunta de ataque e uma pergunta de contra-ataque:

```js
{
  round: 1,
  category: 'Chute a Gol',
  attack: {
    title: '...',
    statement: '...',
    options: ['...', '...', '...', '...'],
    correctIndex: 2,
    explanation: '...'
  },
  rebound: {
    title: '...',
    statement: '...',
    options: ['...', '...', '...', '...'],
    correctIndex: 1,
    explanation: '...'
  }
}
```

`correctIndex` comeca em 0.
