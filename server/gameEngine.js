export const ATTACK_SECONDS = 45;
export const REBOUND_SECONDS = 15;
export const REVEAL_SECONDS = 5;
export const BETWEEN_ROUNDS_SECONDS = 3;
export const SNAPSHOT_VERSION = 1;

const VALID_PHASES = ['setup', 'attack', 'rebound', 'revealing', 'between', 'paused', 'finished'];

function clone(value) {
  return structuredClone(value);
}

function normalizeCode(value) {
  return String(value || '').trim().toUpperCase();
}

function sanitizeName(value, fallback) {
  const name = String(value || '').trim();
  return name.slice(0, 40) || fallback;
}

function defaultCodeGenerator(teamId) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 3; i += 1) {
    suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `${teamId}${suffix}`;
}

function buildQuestionPayload(question, round, phase) {
  return {
    id: `${round.round}-${phase}`,
    round: round.round,
    category: round.category,
    phase,
    title: question.title,
    statement: question.statement,
    options: [...question.options]
  };
}

function questionFor(state, phase) {
  const round = state.questions[state.roundIndex];
  if (!round) return null;
  return buildQuestionPayload(phase === 'rebound' ? round.rebound : round.attack, round, phase);
}

function answerFor(state, phase) {
  const round = state.questions[state.roundIndex];
  if (!round) return null;
  return phase === 'rebound' ? round.rebound : round.attack;
}

function otherTeam(teamId) {
  return teamId === 'A' ? 'B' : 'A';
}

function addHistory(state, entry) {
  state.history = [
    {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      round: state.roundIndex + 1,
      phase: state.phase,
      at: new Date().toISOString(),
      ...entry
    },
    ...state.history
  ].slice(0, 30);
}

function nextStarter(roundIndex) {
  return roundIndex % 2 === 0 ? 'A' : 'B';
}

function setBetween(state, event) {
  state.phase = 'between';
  state.activeTeam = null;
  state.currentQuestion = null;
  state.pendingAnswer = null;
  state.timeLeft = BETWEEN_ROUNDS_SECONDS;
  state.lastEvent = event;
  addHistory(state, event);
}

function finishGame(state) {
  state.status = 'finished';
  state.phase = 'finished';
  state.activeTeam = null;
  state.currentQuestion = null;
  state.pendingAnswer = null;
  state.timeLeft = 0;

  const winner = state.score.A === state.score.B ? null : state.score.A > state.score.B ? 'A' : 'B';
  state.lastEvent = winner
    ? {
        type: 'finished',
        team: winner,
        title: 'Fim de jogo!',
        message: `${state.teams[winner].name} vence por ${state.score.A} x ${state.score.B}.`
      }
    : {
        type: 'draw',
        team: null,
        title: 'Fim de jogo!',
        message: `Empate em ${state.score.A} x ${state.score.B}.`
      };
  addHistory(state, state.lastEvent);
}

function goToNextRound(state) {
  state.roundIndex += 1;

  if (state.roundIndex >= state.maxRounds) {
    finishGame(state);
    return;
  }

  const starterTeam = nextStarter(state.roundIndex);
  state.status = 'running';
  state.phase = 'attack';
  state.resumePhase = null;
  state.activeTeam = starterTeam;
  state.starterTeam = starterTeam;
  state.timeLeft = ATTACK_SECONDS;
  state.pendingAnswer = null;
  state.currentQuestion = questionFor(state, 'attack');
  state.lastEvent = {
    type: 'next-round',
    team: starterTeam,
    title: `Rodada ${state.roundIndex + 1}`,
    message: `${state.teams[starterTeam].name} comeca atacando.`
  };
}

export function createInitialState(questions, options = {}) {
  const codeGenerator = options.codeGenerator || defaultCodeGenerator;
  const safeQuestions = clone(questions);

  return {
    snapshotVersion: SNAPSHOT_VERSION,
    status: 'setup',
    phase: 'setup',
    resumePhase: null,
    roundIndex: 0,
    maxRounds: safeQuestions.length,
    activeTeam: null,
    starterTeam: 'A',
    score: { A: 0, B: 0 },
    timeLeft: 0,
    currentQuestion: null,
    pendingAnswer: null,
    lastEvent: {
      type: 'setup',
      title: 'Configure o aquecimento',
      message: 'Informe os nomes das equipes e compartilhe os codigos.'
    },
    history: [],
    answeredQuestionIds: [],
    teams: {
      A: {
        id: 'A',
        name: 'Equipe A',
        shortName: 'A',
        code: normalizeCode(codeGenerator('A')),
        connected: false,
        ready: false
      },
      B: {
        id: 'B',
        name: 'Equipe B',
        shortName: 'B',
        code: normalizeCode(codeGenerator('B')),
        connected: false,
        ready: false
      }
    },
    questions: safeQuestions,
    recovery: null,
    updatedAt: Date.now()
  };
}

export function configureMatch(state, payload = {}) {
  const next = clone(state);

  if (!['setup', 'paused'].includes(next.status)) {
    return { ok: false, error: 'O aquecimento ja foi iniciado.', state };
  }

  next.teams.A.name = sanitizeName(payload.teamAName, 'Equipe A');
  next.teams.B.name = sanitizeName(payload.teamBName, 'Equipe B');
  next.lastEvent = {
    type: 'configured',
    title: 'Partida configurada',
    message: `${next.teams.A.name} x ${next.teams.B.name}`
  };
  next.updatedAt = Date.now();
  return { ok: true, state: next };
}

export function joinTeamByCode(state, code) {
  const next = clone(state);
  const normalized = normalizeCode(code);
  const teamId = Object.values(next.teams).find((team) => team.code === normalized)?.id;

  if (!teamId) {
    return { ok: false, error: 'Codigo invalido.', state };
  }

  next.teams[teamId].connected = true;
  next.lastEvent = {
    type: 'team-connected',
    team: teamId,
    title: 'Equipe conectada',
    message: `${next.teams[teamId].name} entrou na partida.`
  };
  next.updatedAt = Date.now();
  return { ok: true, teamId, team: next.teams[teamId], state: next };
}

export function markTeamReady(state, teamId, ready = true) {
  const next = clone(state);

  if (!['A', 'B'].includes(teamId)) {
    return { ok: false, error: 'Equipe invalida.', state };
  }

  if (!next.teams[teamId].connected) {
    return { ok: false, error: 'Equipe ainda nao conectada.', state };
  }

  next.teams[teamId].ready = Boolean(ready);
  next.lastEvent = {
    type: 'team-ready',
    team: teamId,
    title: next.teams[teamId].ready ? 'Equipe pronta' : 'Equipe em espera',
    message: `${next.teams[teamId].name} ${next.teams[teamId].ready ? 'esta pronta.' : 'ainda nao esta pronta.'}`
  };
  next.updatedAt = Date.now();
  return { ok: true, state: next };
}

export function canStartMatch(state) {
  return state.teams.A.ready && state.teams.B.ready;
}

export function startMatch(state) {
  if (state.status !== 'setup') {
    return { ok: false, error: 'O aquecimento so pode iniciar na preparacao.', state };
  }

  if (!canStartMatch(state)) {
    return { ok: false, error: 'As duas equipes precisam estar prontas.', state };
  }

  const next = clone(state);
  next.status = 'running';
  next.phase = 'attack';
  next.resumePhase = null;
  next.roundIndex = 0;
  next.starterTeam = 'A';
  next.activeTeam = 'A';
  next.score = next.score || { A: 0, B: 0 };
  next.timeLeft = ATTACK_SECONDS;
  next.currentQuestion = questionFor(next, 'attack');
  next.pendingAnswer = null;
  next.answeredQuestionIds = [];
  next.history = [];
  next.lastEvent = {
    type: 'kickoff',
    team: 'A',
    title: 'Apita o arbitro!',
    message: `${next.teams.A.name} comeca atacando.`
  };
  next.updatedAt = Date.now();
  return { ok: true, state: next };
}

export function pauseGame(state, reason = 'Pausado pelo operador.') {
  if (!['running', 'paused'].includes(state.status)) {
    return { ok: false, error: 'O aquecimento nao esta em andamento.', state };
  }

  const next = clone(state);
  if (next.status !== 'paused') {
    next.resumePhase = next.phase;
  }
  next.status = 'paused';
  next.phase = 'paused';
  next.lastEvent = {
    type: 'paused',
    title: 'Partida pausada',
    message: reason
  };
  next.updatedAt = Date.now();
  return { ok: true, state: next };
}

export function pauseForRecovery(state) {
  const next = clone(state);
  next.resumePhase = state.phase === 'paused' ? state.resumePhase : state.phase;
  next.status = 'paused';
  next.phase = 'paused';
  next.recovery = { mode: 'normal', loadedAt: new Date().toISOString() };
  next.lastEvent = {
    type: 'recovered',
    title: 'Partida recuperada',
    message: 'Snapshot carregado. Confira o placar e retome quando estiver seguro.'
  };
  next.updatedAt = Date.now();
  return { ok: true, state: next };
}

export function resumeGame(state) {
  if (state.status !== 'paused') {
    return { ok: false, error: 'O aquecimento nao esta pausado.', state };
  }

  const next = clone(state);
  const phase = next.resumePhase || 'attack';
  next.status = phase === 'finished' ? 'finished' : 'running';
  next.phase = phase;
  next.resumePhase = null;
  next.recovery = null;
  next.lastEvent = {
    type: 'resumed',
    title: 'Partida retomada',
    message: 'O jogo voltou a rodar.'
  };
  next.updatedAt = Date.now();
  return { ok: true, state: next };
}

export function adjustScore(state, score) {
  const next = clone(state);
  const scoreA = Number(score?.A);
  const scoreB = Number(score?.B);

  if (!Number.isInteger(scoreA) || !Number.isInteger(scoreB) || scoreA < 0 || scoreB < 0) {
    return { ok: false, error: 'Placar invalido.', state };
  }

  next.score = { A: scoreA, B: scoreB };
  next.lastEvent = {
    type: 'score-adjusted',
    title: 'Placar corrigido',
    message: `Placar ajustado para ${scoreA} x ${scoreB}.`
  };
  next.updatedAt = Date.now();
  return { ok: true, state: next };
}

export function emergencyRestore(state, payload = {}) {
  const next = clone(state);
  const phase = VALID_PHASES.includes(payload.phase) && payload.phase !== 'paused' ? payload.phase : 'attack';
  const roundIndex = Number(payload.roundIndex);
  const activeTeam = ['A', 'B'].includes(payload.activeTeam) ? payload.activeTeam : nextStarter(roundIndex || 0);
  const scoreResult = adjustScore(next, payload.score || next.score);

  if (!scoreResult.ok) {
    return scoreResult;
  }

  const restored = scoreResult.state;
  restored.roundIndex = Number.isInteger(roundIndex)
    ? Math.min(Math.max(roundIndex, 0), Math.max(0, restored.maxRounds - 1))
    : 0;
  restored.resumePhase = phase;
  restored.status = 'paused';
  restored.phase = 'paused';
  restored.activeTeam = phase === 'between' || phase === 'finished' ? null : activeTeam;
  restored.starterTeam = nextStarter(restored.roundIndex);
  restored.currentQuestion = ['attack', 'rebound'].includes(phase) ? questionFor(restored, phase) : null;
  restored.timeLeft = phase === 'rebound' ? REBOUND_SECONDS : phase === 'attack' ? ATTACK_SECONDS : BETWEEN_ROUNDS_SECONDS;
  restored.pendingAnswer = null;
  restored.recovery = { mode: 'emergency', loadedAt: new Date().toISOString() };
  restored.lastEvent = {
    type: 'emergency-restore',
    title: 'Retomada emergencial aplicada',
    message: 'Confira o estado antes de retomar a partida.'
  };
  restored.updatedAt = Date.now();
  return { ok: true, state: restored };
}

export function submitAnswer(state, payload = {}) {
  if (state.status !== 'running') {
    return { ok: false, error: 'O aquecimento nao esta em andamento.', state };
  }

  if (!['attack', 'rebound'].includes(state.phase)) {
    return { ok: false, error: 'Aguarde a proxima jogada.', state };
  }

  if (state.activeTeam !== payload.teamId) {
    return { ok: false, error: 'Ainda nao e a vez da sua equipe.', state };
  }

  if (!state.currentQuestion || state.currentQuestion.id !== payload.questionId) {
    return { ok: false, error: 'Pergunta desatualizada.', state };
  }

  if (state.answeredQuestionIds.includes(payload.questionId)) {
    return { ok: false, error: 'Esta pergunta ja foi respondida.', state };
  }

  const answer = answerFor(state, state.phase);
  const optionIndex = Number(payload.optionIndex);
  if (!Number.isInteger(optionIndex) || optionIndex < 0 || optionIndex >= answer.options.length) {
    return { ok: false, error: 'Alternativa invalida.', state };
  }

  const next = clone(state);
  const correct = optionIndex === answer.correctIndex;
  next.phase = 'revealing';
  next.timeLeft = REVEAL_SECONDS;
  next.pendingAnswer = {
    teamId: payload.teamId,
    questionId: payload.questionId,
    phase: state.phase,
    optionIndex,
    correctIndex: answer.correctIndex,
    correct,
    explanation: answer.explanation
  };
  next.answeredQuestionIds = [...next.answeredQuestionIds, payload.questionId];
  next.lastEvent = {
    type: 'answer-locked',
    team: payload.teamId,
    title: 'Resposta confirmada',
    message: `${next.teams[payload.teamId].name} confirmou a alternativa ${String.fromCharCode(65 + optionIndex)}.`
  };
  next.updatedAt = Date.now();
  return { ok: true, correct, state: next };
}

export function finalizeReveal(state) {
  if (state.phase !== 'revealing' || !state.pendingAnswer) {
    return { ok: false, error: 'Nao ha resposta em revelacao.', state };
  }

  const next = clone(state);
  const pending = next.pendingAnswer;
  const team = next.teams[pending.teamId];
  const choice = String.fromCharCode(65 + pending.optionIndex);
  const correctChoice = String.fromCharCode(65 + pending.correctIndex);

  if (pending.correct) {
    next.score[pending.teamId] += 1;
    const isRebound = pending.phase === 'rebound';
    setBetween(next, {
      type: isRebound ? 'rebound-goal' : 'goal',
      team: pending.teamId,
      title: isRebound ? 'Gol no contra-ataque!' : 'GOOOOOL!',
      message: `${team.name} marcou. Escolha ${choice}; correta ${correctChoice}. Placar: ${next.score.A} x ${next.score.B}.`,
      selectedOption: pending.optionIndex,
      correctOption: pending.correctIndex,
      explanation: pending.explanation
    });
  } else if (pending.phase === 'attack') {
    const reboundTeam = otherTeam(pending.teamId);
    next.phase = 'rebound';
    next.activeTeam = reboundTeam;
    next.timeLeft = REBOUND_SECONDS;
    next.currentQuestion = questionFor(next, 'rebound');
    next.pendingAnswer = null;
    next.lastEvent = {
      type: 'defense',
      team: pending.teamId,
      title: 'Defesa!',
      message: `${team.name} escolheu ${choice}; correta ${correctChoice}. Contra-ataque para ${next.teams[reboundTeam].name}.`,
      selectedOption: pending.optionIndex,
      correctOption: pending.correctIndex,
      explanation: pending.explanation
    };
    addHistory(next, next.lastEvent);
  } else {
    setBetween(next, {
      type: 'double-defense',
      team: pending.teamId,
      title: 'Defesa dupla!',
      message: `${team.name} escolheu ${choice}; correta ${correctChoice}. A rodada termina sem gol.`,
      selectedOption: pending.optionIndex,
      correctOption: pending.correctIndex,
      explanation: pending.explanation
    });
  }

  next.updatedAt = Date.now();
  return { ok: true, state: next };
}

export function handleTimeout(state) {
  if (state.status !== 'running') {
    return { ok: false, error: 'O aquecimento nao esta em andamento.', state };
  }

  const next = clone(state);

  if (next.phase === 'attack') {
    const attackingTeam = next.activeTeam;
    const reboundTeam = otherTeam(attackingTeam);
    next.phase = 'rebound';
    next.activeTeam = reboundTeam;
    next.timeLeft = REBOUND_SECONDS;
    next.currentQuestion = questionFor(next, 'rebound');
    next.lastEvent = {
      type: 'timeout-defense',
      team: attackingTeam,
      title: 'Tempo esgotado!',
      message: `${next.teams[attackingTeam].name} nao respondeu. Contra-ataque para ${next.teams[reboundTeam].name}.`
    };
    addHistory(next, next.lastEvent);
  } else if (next.phase === 'rebound') {
    setBetween(next, {
      type: 'timeout-double-defense',
      team: next.activeTeam,
      title: 'Tempo esgotado!',
      message: `${next.teams[next.activeTeam].name} nao respondeu o contra-ataque. Rodada encerrada.`
    });
  } else {
    return { ok: false, error: 'Nao ha timer ativo para timeout.', state };
  }

  next.updatedAt = Date.now();
  return { ok: true, state: next };
}

export function tick(state) {
  if (state.status !== 'running') {
    return { ok: true, state };
  }

  if (!['attack', 'rebound', 'revealing', 'between'].includes(state.phase)) {
    return { ok: true, state };
  }

  const next = clone(state);
  next.timeLeft = Math.max(0, next.timeLeft - 1);

  if (next.timeLeft > 0) {
    next.updatedAt = Date.now();
    return { ok: true, state: next };
  }

  if (next.phase === 'revealing') {
    return finalizeReveal(next);
  }

  if (next.phase === 'between') {
    goToNextRound(next);
    next.updatedAt = Date.now();
    return { ok: true, state: next };
  }

  return handleTimeout(next);
}

export function publicState(state) {
  const safe = clone(state);
  delete safe.questions;

  if (safe.phase === 'revealing' && safe.pendingAnswer) {
    safe.pendingAnswer.correct = null;
    safe.pendingAnswer.correctIndex = null;
    safe.pendingAnswer.explanation = null;
  }

  return safe;
}
