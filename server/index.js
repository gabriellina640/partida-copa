import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';
import {
  adjustScore,
  configureMatch,
  createInitialState,
  emergencyRestore,
  ensureFieldState,
  fieldAdjustScore,
  fieldMovePiece,
  fieldRegisterGoal,
  fieldReset,
  joinTeamByCode,
  markTeamReady,
  pauseForRecovery,
  pauseGame,
  publicState,
  resumeGame,
  startMatch,
  submitAnswer,
  tick
} from './gameEngine.js';
import { gameQuestions } from './questions.js';
import { DEFAULT_SNAPSHOT_PATH, loadSnapshot, saveSnapshot } from './snapshotStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

function bootState() {
  const loaded = loadSnapshot(DEFAULT_SNAPSHOT_PATH, gameQuestions);
  if (loaded.ok) {
    const restored = {
      ...loaded.snapshot,
      questions: gameQuestions,
      maxRounds: gameQuestions.length
    };
    restored.field = ensureFieldState(restored);

    if (restored.status === 'setup') {
      return restored;
    }

    return pauseForRecovery(restored).state;
  }

  const initial = createInitialState(gameQuestions);
  if (!loaded.missing) {
    initial.recovery = {
      mode: 'invalid',
      error: loaded.error,
      loadedAt: new Date().toISOString()
    };
    initial.lastEvent = {
      type: 'snapshot-invalid',
      title: 'Snapshot inválido',
      message: loaded.error
    };
  }
  return initial;
}

let state = bootState();

function persistState() {
  saveSnapshot(state, DEFAULT_SNAPSHOT_PATH);
}

function emitState() {
  state.updatedAt = Date.now();
  io.emit('game:state', publicState(state));
}

function applyResult(result, callback, options = {}) {
  if (!result?.ok) {
    if (typeof callback === 'function') {
      callback({ ok: false, error: result?.error || 'Operação inválida.' });
    }
    return;
  }

  state = result.state;
  persistState();
  emitState();

  if (typeof callback === 'function') {
    callback({ ok: true, ...options });
  }
}

setInterval(() => {
  const previousUpdatedAt = state.updatedAt;
  const result = tick(state);
  if (!result.ok || result.state === state) return;

  state = result.state;
  if (state.updatedAt !== previousUpdatedAt) {
    persistState();
    emitState();
  }
}, 1000);

io.on('connection', (socket) => {
  socket.emit('game:state', publicState(state));

  socket.on('admin:configure', (payload, callback) => {
    applyResult(configureMatch(state, payload || {}), callback);
  });

  socket.on('admin:start', (_payload, callback) => {
    applyResult(startMatch(state), callback);
  });

  socket.on('admin:pause', (_payload, callback) => {
    applyResult(pauseGame(state), callback);
  });

  socket.on('admin:resume', (_payload, callback) => {
    applyResult(resumeGame(state), callback);
  });

  socket.on('admin:adjust-score', (payload, callback) => {
    applyResult(adjustScore(state, payload || {}), callback);
  });

  socket.on('admin:emergency-restore', (payload, callback) => {
    applyResult(emergencyRestore(state, payload || {}), callback);
  });

  socket.on('game:reset', (_payload, callback) => {
    state = createInitialState(gameQuestions);
    persistState();
    emitState();
    if (typeof callback === 'function') callback({ ok: true });
  });

  socket.on('team:join-code', (payload, callback) => {
    const result = joinTeamByCode(state, payload?.code);
    if (result.ok) {
      socket.join(`team:${result.teamId}`);
    }
    applyResult(result, callback, result.ok ? { teamId: result.teamId, team: result.team } : {});
  });

  socket.on('team:ready', (payload, callback) => {
    applyResult(markTeamReady(state, payload?.teamId, payload?.ready !== false), callback);
  });

  socket.on('answer:submit', (payload, callback) => {
    applyResult(submitAnswer(state, payload || {}), callback);
  });

  socket.on('field:move-piece', (payload, callback) => {
    applyResult(fieldMovePiece(state, payload || {}), callback);
  });

  socket.on('field:adjust-score', (payload, callback) => {
    applyResult(fieldAdjustScore(state, payload || {}), callback);
  });

  socket.on('field:goal', (payload, callback) => {
    applyResult(fieldRegisterGoal(state, payload || {}), callback);
  });

  socket.on('field:reset', (_payload, callback) => {
    applyResult(fieldReset(state), callback);
  });
});

app.get('/health', (_req, res) => {
  res.json({ ok: true, status: state.status, phase: state.phase });
});

const clientDist = path.resolve(__dirname, '../client/dist');
app.use(express.static(clientDist));
app.get(/.*/, (_req, res) => {
  res.sendFile(path.join(clientDist, 'index.html'), (error) => {
    if (error) {
      res.status(200).send('Aquecimento da Copa de Prompts MPAC API online. Rode `npm run dev` para abrir o frontend em desenvolvimento.');
    }
  });
});

server.listen(PORT, () => {
  console.log(`Aquecimento Copa de Prompts MPAC server running on http://localhost:${PORT}`);
});
