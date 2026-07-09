# Aquecimento da Copa de Prompts MPAC

Aquecimento em tempo real para a Copa de Prompts do MPAC, com perguntas no formato futebol: ataque, defesa, contra-ataque e gol.

## Fluxo principal

1. O operador abre a tela pública/admin do aquecimento.
2. O operador edita os nomes das equipes.
3. O sistema gera automaticamente um código para cada equipe.
4. Cada equipe acessa a tela de equipe e entra com seu código.
5. O aquecimento só pode iniciar quando as duas equipes estiverem prontas.
6. A tela pública mostra campo, placar, pergunta, alternativas, tempo e resultado das jogadas.
7. A tela de equipe mostra a pergunta ativa somente quando for a vez daquela equipe responder.

## Regras da partida

- 10 rodadas no total.
- 5 posses iniciais para cada equipe.
- Alternância fixa de posse inicial: A, B, A, B...
- Ataque: 45 segundos.
- Contra-ataque: 20 segundos.
- Após confirmar resposta, público e equipe veem a alternativa escolhida e aguardam 5 segundos.
- Depois dos 5 segundos, o sistema revela a alternativa correta e mostra gol, defesa ou fim da jogada.
- Se o ataque errar ou estourar o tempo, a outra equipe recebe contra-ataque.
- Se o contra-ataque errar ou estourar o tempo, a rodada termina.

## Telas

- Público/admin: `http://localhost:5173/`
- Equipe: `http://localhost:5173/equipe`

A tela pública/admin usa uma gaveta lateral para nomes, códigos, início, pausa, retomada e recuperação.

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

## Recuperação por snapshot

O servidor salva um snapshot local em:

```text
server/game-snapshot.json
```

Esse arquivo não deve ser versionado. Se o servidor reiniciar com snapshot válido, o aquecimento volta pausado para o operador conferir e retomar.

Na retomada normal, o operador pode corrigir o placar antes de continuar.

Se houver problema no snapshot, o operador pode usar o modo emergencial para ajustar placar, rodada, fase e equipe ativa antes de retomar.

## Arquivos principais

```text
server/gameEngine.js       regras puras da partida
server/snapshotStore.js    leitura, gravação e validação do snapshot
server/index.js            Express, Socket.io e timers
server/questions.js        perguntas e respostas corretas
client/src/main.jsx        telas pública/admin e equipe
client/src/styles.css      visual do telão e da cabine
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

`correctIndex` começa em 0.
