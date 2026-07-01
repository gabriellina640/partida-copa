import fs from 'fs';
import path from 'path';
import { SNAPSHOT_VERSION } from './gameEngine.js';

export const DEFAULT_SNAPSHOT_PATH = path.resolve(process.cwd(), 'server/game-snapshot.json');

export function validateSnapshot(snapshot, questions = []) {
  if (!snapshot || typeof snapshot !== 'object') {
    return { ok: false, error: 'Snapshot vazio ou invalido.' };
  }

  if (snapshot.snapshotVersion !== SNAPSHOT_VERSION) {
    return { ok: false, error: 'Versao de snapshot incompativel.' };
  }

  if (!['setup', 'ready', 'running', 'paused', 'finished'].includes(snapshot.status)) {
    return { ok: false, error: 'Status de partida invalido.' };
  }

  if (!['setup', 'attack', 'rebound', 'revealing', 'between', 'paused', 'finished'].includes(snapshot.phase)) {
    return { ok: false, error: 'Fase de partida invalida.' };
  }

  if (!snapshot.teams?.A || !snapshot.teams?.B) {
    return { ok: false, error: 'Equipes ausentes no snapshot.' };
  }

  if (!snapshot.teams.A.code || !snapshot.teams.B.code) {
    return { ok: false, error: 'Codigos das equipes ausentes.' };
  }

  if (!snapshot.score || !Number.isInteger(snapshot.score.A) || !Number.isInteger(snapshot.score.B)) {
    return { ok: false, error: 'Placar invalido.' };
  }

  if (!Number.isInteger(snapshot.roundIndex) || snapshot.roundIndex < 0 || snapshot.roundIndex >= questions.length) {
    if (snapshot.status !== 'finished') {
      return { ok: false, error: 'Rodada atual invalida.' };
    }
  }

  if (!Array.isArray(snapshot.history) || !Array.isArray(snapshot.answeredQuestionIds)) {
    return { ok: false, error: 'Historico ou respostas invalidos.' };
  }

  return { ok: true };
}

export function loadSnapshot(filePath = DEFAULT_SNAPSHOT_PATH, questions = []) {
  if (!fs.existsSync(filePath)) {
    return { ok: false, missing: true, error: 'Snapshot nao encontrado.' };
  }

  try {
    const snapshot = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const validation = validateSnapshot(snapshot, questions);
    if (!validation.ok) return validation;
    return { ok: true, snapshot };
  } catch (error) {
    return { ok: false, error: `Falha ao ler snapshot: ${error.message}` };
  }
}

export function saveSnapshot(state, filePath = DEFAULT_SNAPSHOT_PATH) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });

  const tempPath = `${filePath}.tmp`;
  fs.writeFileSync(tempPath, `${JSON.stringify(state, null, 2)}\n`);
  fs.renameSync(tempPath, filePath);

  return { ok: true, filePath };
}
