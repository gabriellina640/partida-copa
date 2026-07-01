import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ATTACK_SECONDS,
  REBOUND_SECONDS,
  REVEAL_SECONDS,
  adjustScore,
  configureMatch,
  createInitialState,
  emergencyRestore,
  finalizeReveal,
  joinTeamByCode,
  markTeamReady,
  pauseForRecovery,
  startMatch,
  submitAnswer,
  tick
} from './gameEngine.js';
import { validateSnapshot } from './snapshotStore.js';
import { gameQuestions } from './questions.js';

function createConfiguredState() {
  const state = createInitialState(gameQuestions, {
    codeGenerator: (teamId) => (teamId === 'A' ? 'A111' : 'B222')
  });
  return configureMatch(state, {
    teamAName: 'Azul',
    teamBName: 'Amarela'
  }).state;
}

function createReadyState() {
  let state = createConfiguredState();
  state = joinTeamByCode(state, 'A111').state;
  state = joinTeamByCode(state, 'B222').state;
  state = markTeamReady(state, 'A', true).state;
  state = markTeamReady(state, 'B', true).state;
  return state;
}

function createRunningState() {
  return startMatch(createReadyState()).state;
}

test('configures team names and generates entry codes', () => {
  const state = createConfiguredState();

  assert.equal(state.status, 'setup');
  assert.equal(state.teams.A.name, 'Azul');
  assert.equal(state.teams.B.name, 'Amarela');
  assert.equal(state.teams.A.code, 'A111');
  assert.equal(state.teams.B.code, 'B222');
});

test('blocks match start until both teams are ready', () => {
  const state = createConfiguredState();
  const result = startMatch(state);

  assert.equal(result.ok, false);
  assert.equal(result.error, 'As duas equipes precisam estar prontas.');
});

test('starts match with team A attacking for 45 seconds when both teams are ready', () => {
  const state = createRunningState();

  assert.equal(state.status, 'running');
  assert.equal(state.phase, 'attack');
  assert.equal(state.activeTeam, 'A');
  assert.equal(state.timeLeft, ATTACK_SECONDS);
  assert.equal(state.currentQuestion.id, '1-attack');
});

test('rejects starting a match that is already running', () => {
  const state = createRunningState();
  const result = startMatch(state);

  assert.equal(result.ok, false);
  assert.equal(result.error, 'O aquecimento so pode iniciar na preparacao.');
});

test('correct attack enters reveal and only scores after reveal finishes', () => {
  let state = createRunningState();

  const submit = submitAnswer(state, {
    teamId: 'A',
    questionId: '1-attack',
    optionIndex: gameQuestions[0].attack.correctIndex
  });
  state = submit.state;

  assert.equal(submit.ok, true);
  assert.equal(state.phase, 'revealing');
  assert.equal(state.timeLeft, REVEAL_SECONDS);
  assert.equal(state.pendingAnswer.correct, true);
  assert.equal(state.score.A, 0);

  state = finalizeReveal(state).state;

  assert.equal(state.score.A, 1);
  assert.equal(state.phase, 'between');
  assert.equal(state.currentQuestion, null);
});

test('wrong attack reveals defense and gives rebound to the other team', () => {
  let state = createRunningState();
  const wrongIndex = (gameQuestions[0].attack.correctIndex + 1) % 4;

  state = submitAnswer(state, {
    teamId: 'A',
    questionId: '1-attack',
    optionIndex: wrongIndex
  }).state;
  state = finalizeReveal(state).state;

  assert.equal(state.score.A, 0);
  assert.equal(state.score.B, 0);
  assert.equal(state.phase, 'rebound');
  assert.equal(state.activeTeam, 'B');
  assert.equal(state.timeLeft, REBOUND_SECONDS);
  assert.equal(state.currentQuestion.id, '1-rebound');
});

test('wrong rebound ends the round without a goal', () => {
  let state = createRunningState();
  const wrongAttackIndex = (gameQuestions[0].attack.correctIndex + 1) % 4;
  const wrongReboundIndex = (gameQuestions[0].rebound.correctIndex + 1) % 4;

  state = finalizeReveal(submitAnswer(state, {
    teamId: 'A',
    questionId: '1-attack',
    optionIndex: wrongAttackIndex
  }).state).state;
  state = submitAnswer(state, {
    teamId: 'B',
    questionId: '1-rebound',
    optionIndex: wrongReboundIndex
  }).state;
  state = finalizeReveal(state).state;

  assert.equal(state.score.A, 0);
  assert.equal(state.score.B, 0);
  assert.equal(state.phase, 'between');
});

test('between phase advances to next fixed starter regardless of rebound', () => {
  let state = createRunningState();
  const wrongAttackIndex = (gameQuestions[0].attack.correctIndex + 1) % 4;

  state = finalizeReveal(submitAnswer(state, {
    teamId: 'A',
    questionId: '1-attack',
    optionIndex: wrongAttackIndex
  }).state).state;
  state = finalizeReveal(submitAnswer(state, {
    teamId: 'B',
    questionId: '1-rebound',
    optionIndex: gameQuestions[0].rebound.correctIndex
  }).state).state;
  state = tick(tick(tick(state).state).state).state;

  assert.equal(state.roundIndex, 1);
  assert.equal(state.phase, 'attack');
  assert.equal(state.activeTeam, 'B');
  assert.equal(state.currentQuestion.id, '2-attack');
});

test('recovery pauses a valid snapshot and allows score correction', () => {
  let state = createRunningState();
  state = pauseForRecovery(state).state;

  assert.equal(state.status, 'paused');
  assert.equal(state.phase, 'paused');
  assert.equal(state.resumePhase, 'attack');

  state = adjustScore(state, { A: 2, B: 1 }).state;

  assert.deepEqual(state.score, { A: 2, B: 1 });
});

test('emergency restore accepts a manually corrected valid state shape', () => {
  const state = emergencyRestore(createConfiguredState(), {
    score: { A: 3, B: 2 },
    roundIndex: 4,
    phase: 'attack',
    activeTeam: 'A'
  }).state;

  assert.equal(state.status, 'paused');
  assert.equal(state.phase, 'paused');
  assert.equal(state.resumePhase, 'attack');
  assert.equal(state.roundIndex, 4);
  assert.deepEqual(state.score, { A: 3, B: 2 });
});

test('validates snapshot shape before restore', () => {
  const valid = validateSnapshot(createRunningState(), gameQuestions);
  const invalid = validateSnapshot({ status: 'running', score: { A: 0 } }, gameQuestions);

  assert.equal(valid.ok, true);
  assert.equal(invalid.ok, false);
});
