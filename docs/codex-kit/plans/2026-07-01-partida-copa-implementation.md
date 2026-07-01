# Aquecimento da Copa de Prompts MPAC Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `.codex-kit/skills/subagent-driven-development/` (recommended) or `.codex-kit/skills/executing-plans/` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar o aquecimento em tempo real da Copa de Prompts MPAC com tela publica/admin, entrada de equipes por codigo, revelacao em 5 segundos e snapshot JSON de recuperacao.

**Architecture:** O backend Express + Socket.io sera a fonte da verdade e concentrara regras, timers, validacao e persistencia em snapshot local. O frontend React renderizara o estado recebido e enviara comandos por Socket.io, sem calcular regra de jogo.

**Tech Stack:** Node.js ESM, Express, Socket.io, React, Vite, `node:test`.

---

## Direcao Visual Aprovada

**Nome:** Telão de Estadio com Cabine de Operacao.

**Tese:** A interface deve parecer um aquecimento oficial da Copa de Prompts MPAC controlado por uma cabine discreta, com campo como centro narrativo, placar forte, pergunta visivel e painel administrativo recolhivel.

**Regras:**
- Campo, placar e pergunta comandam a tela publica.
- A gaveta administrativa fica lateral, densa e discreta.
- Estados de gol, defesa, contra-ataque, revelacao e pausa devem ter linguagem visual propria.
- Evitar aparencia de dashboard SaaS generico; tudo deve reforcar partida, posse, rodada, tempo e torcida.
- Manter a paleta escura de estadio, verde do campo, amarelo de alerta, azul/vermelho para equipes.

## Arquivos

- Create: `server/gameEngine.js` - regras puras da partida, validacao, transicoes e comandos.
- Create: `server/snapshotStore.js` - leitura/gravação/validacao basica do snapshot JSON.
- Create: `server/gameEngine.test.js` - testes unitarios dos fluxos principais.
- Modify: `server/index.js` - Socket.io, timers, snapshot, eventos e serving Express.
- Modify: `client/src/main.jsx` - tela publica/admin, entrada por codigo, tela da equipe e estados de revelacao/retomada.
- Modify: `client/src/styles.css` - layout de telao, gaveta admin, pergunta publica e estados visuais.
- Modify: `.gitignore` - ignorar snapshot operacional.
- Modify: `package.json` - adicionar script de teste.
- Modify: `README.md` - atualizar fluxo de uso.

## Tarefas

### Task 1: Testes do motor da partida

- [ ] Criar `server/gameEngine.test.js` com testes para configuracao, prontidao, inicio bloqueado, gol no ataque, erro no ataque com contra-ataque, erro no contra-ataque, revelacao e retomada pausada.
- [ ] Rodar `node --test server/gameEngine.test.js` e confirmar falha por modulo ausente.

### Task 2: Motor de jogo

- [ ] Criar `server/gameEngine.js` com estado inicial configuravel, codigos automaticos, validacoes, timers logicos, submissao de resposta, revelacao e transicoes.
- [ ] Rodar `node --test server/gameEngine.test.js` e confirmar testes verdes.

### Task 3: Snapshot

- [ ] Criar `server/snapshotStore.js` com `loadSnapshot`, `saveSnapshot`, `validateSnapshot`.
- [ ] Adicionar testes de snapshot valido/invalido em `server/gameEngine.test.js`.
- [ ] Rodar `node --test server/gameEngine.test.js`.

### Task 4: Integracao Socket.io

- [ ] Refatorar `server/index.js` para usar o motor de jogo.
- [ ] Implementar eventos admin: `admin:configure`, `admin:start`, `admin:pause`, `admin:resume`, `admin:adjust-score`, `admin:emergency-restore`, `game:reset`.
- [ ] Implementar eventos equipe: `team:join-code`, `team:ready`, `answer:submit`.
- [ ] Salvar snapshot apos mudancas importantes.
- [ ] Rodar `node --test server/gameEngine.test.js`.

### Task 5: Frontend publico/admin

- [ ] Atualizar `client/src/main.jsx` para tela publica/admin com gaveta lateral, configuracao, codigos, prontidao, iniciar, campo, pergunta, alternativas, revelacao e recuperacao.
- [ ] Garantir que a tela publica mostre pergunta e alternativas completas durante a jogada.

### Task 6: Frontend equipe

- [ ] Atualizar entrada por codigo.
- [ ] Renderizar tela de equipe conectada, espera, pergunta ativa, confirmacao, travamento, revelacao e resultado.

### Task 7: CSS e responsividade

- [ ] Atualizar `client/src/styles.css` para o layout de telão/cabine, gaveta lateral, campo, pergunta, estados e mobile.
- [ ] Verificar que textos nao estouram botoes ou cards.

### Task 8: Docs e comandos

- [ ] Atualizar `.gitignore` com snapshot local.
- [ ] Atualizar `package.json` com `test`.
- [ ] Atualizar `README.md`.

### Task 9: Verificacao final

- [ ] Rodar `npm test`.
- [ ] Rodar `npm run build`.
- [ ] Iniciar app local e validar rotas principais quando possivel.
- [ ] Executar revisao de codigo e checklist de verificacao antes de concluir.
