import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { io } from 'socket.io-client';
import { resolveSocketUrl } from './socketConfig.js';
import './styles.css';
import equipeAImage from '../../equipea.png';
import equipeBImage from '../../equipeb.png';

const socketUrl = resolveSocketUrl({
  explicitUrl: import.meta.env.VITE_SOCKET_URL,
  locationOrigin: window.location.origin
});
const socket = io(socketUrl, { transports: ['websocket', 'polling'] });
const ADMIN_PASSWORD = '10203040';
const ADMIN_SESSION_KEY = 'partida-copa-admin-ok';

function useGameState() {
  const [state, setState] = useState(null);
  const [connected, setConnected] = useState(socket.connected);

  useEffect(() => {
    const onState = (nextState) => setState(nextState);
    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on('game:state', onState);
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    return () => {
      socket.off('game:state', onState);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  return { state, connected };
}

function App() {
  const { state, connected } = useGameState();
  const route = window.location.pathname.toLowerCase();

  if (!state) {
    return <Loading connected={connected} />;
  }

  if (route.includes('/equipe') || route.includes('/team')) {
    return <TeamPortal state={state} connected={connected} />;
  }

  if (route.includes('/partida') || route.includes('/atividade')) {
    return <PublicAdminScreen state={state} connected={connected} />;
  }

  if (route.includes('/campo')) {
    return <FieldPlaygroundScreen state={state} connected={connected} />;
  }

  return <StartScreen connected={connected} />;
}

function Loading({ connected }) {
  return (
    <main className="page center-page">
      <section className="panel compact-panel">
        <p className="eyebrow">Copa de Prompts MPAC</p>
        <h1>Carregando aquecimento</h1>
        <ConnectionPill connected={connected} />
      </section>
    </main>
  );
}

function StartScreen({ connected }) {
  return (
    <main className="page start-page">
      <section className="start-hero">
        <div>
          <p className="eyebrow">Aquecimento da Copa</p>
          <h1>Copa de Prompts MPAC</h1>
          <p className="brand-line">Escolha o modo de exibição para iniciar.</p>
        </div>
        <ConnectionPill connected={connected} />
      </section>

      <section className="start-grid">
        <a className="start-card primary-start-card" href="/partida">
          <span>01</span>
          <strong>Atividade atual</strong>
          <small>Abre a tela principal com placar, perguntas, cronômetro e equipes.</small>
        </a>
        <a className="start-card field-start-card" href="/campo">
          <span>02</span>
          <strong>Campo manipulável</strong>
          <small>Abre um campo tático livre para arrastar bola e equipes em qualquer posição.</small>
        </a>
      </section>
    </main>
  );
}

function FieldPlaygroundScreen({ state, connected }) {
  const [localFreeScore, setLocalFreeScore] = useState(() => state.field?.score || { A: 0, B: 0 });
  const freeScore = localFreeScore;

  useEffect(() => {
    if (!state.field?.score) return;
    setLocalFreeScore(state.field.score);
  }, [state.field?.score?.A, state.field?.score?.B]);

  function adjustFreeScore(teamId, delta) {
    const currentScore = Number(freeScore[teamId]) || 0;
    const nextScore = Math.max(0, currentScore + delta);

    setLocalFreeScore((current) => ({
      ...current,
      [teamId]: nextScore
    }));

    socket.emit('field:adjust-score', {
      teamId,
      score: nextScore
    });
  }

  function registerFreeGoal(teamId, side) {
    setLocalFreeScore((current) => ({
      ...current,
      [teamId]: (Number(current[teamId]) || 0) + 1
    }));
    socket.emit('field:goal', { teamId, side });
  }

  return (
    <main className="page field-playground-page">
      <a className="field-back-link" href="/">Voltar</a>
      <FreeScoreboard
        state={state}
        score={freeScore}
        onAdjust={adjustFreeScore}
      />
      <div className="field-playground-status">
        <ConnectionPill connected={connected} />
      </div>
      <section className="field-playground-card">
        <InteractivePitch state={state} freeMode onFreeGoal={registerFreeGoal} />
      </section>
    </main>
  );
}

function FreeScoreboard({ state, score, onAdjust }) {
  return (
    <section className="free-scoreboard" aria-label="Placar do campo">
      <FreeScoreTeam
        side="A"
        image={equipeAImage}
        name={state.teams.A.name}
        score={score.A}
        onAdjust={onAdjust}
      />
      <div className="free-score-divider">x</div>
      <FreeScoreTeam
        side="B"
        image={equipeBImage}
        name={state.teams.B.name}
        score={score.B}
        onAdjust={onAdjust}
      />
    </section>
  );
}

function FreeScoreTeam({ side, image, name, score, onAdjust }) {
  return (
    <div className={`free-score-team free-score-team-${side.toLowerCase()}`}>
      <img src={image} alt="" draggable="false" />
      <strong>{score}</strong>
      <div className="free-score-controls" aria-label={`Ajustar placar ${name}`}>
        <button type="button" onClick={() => onAdjust(side, 1)} aria-label={`Aumentar placar ${name}`}>▲</button>
        <button type="button" onClick={() => onAdjust(side, -1)} aria-label={`Diminuir placar ${name}`}>▼</button>
      </div>
    </div>
  );
}

function PublicAdminScreen({ state, connected }) {
  const [drawerOpen, setDrawerOpen] = useState(state.status === 'setup' || Boolean(state.recovery));
  const [adminUnlocked, setAdminUnlocked] = useState(() => localStorage.getItem(ADMIN_SESSION_KEY) === 'true');
  const [passwordOpen, setPasswordOpen] = useState(false);
  const previousStatus = useRef(state.status);
  const [teamAName, setTeamAName] = useState(state.teams.A.name);
  const [teamBName, setTeamBName] = useState(state.teams.B.name);
  const [scoreA, setScoreA] = useState(state.score.A);
  const [scoreB, setScoreB] = useState(state.score.B);
  const [emergency, setEmergency] = useState({
    roundIndex: state.roundIndex,
    phase: state.resumePhase || state.phase === 'paused' ? state.resumePhase || 'attack' : state.phase,
    activeTeam: state.activeTeam || state.starterTeam || 'A'
  });
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    setTeamAName(state.teams.A.name);
    setTeamBName(state.teams.B.name);
    setScoreA(state.score.A);
    setScoreB(state.score.B);
  }, [state.teams.A.name, state.teams.B.name, state.score.A, state.score.B]);

  useEffect(() => {
    if (!adminUnlocked) {
      setDrawerOpen(false);
      previousStatus.current = state.status;
      return;
    }

    const enteredRunning = previousStatus.current !== 'running' && state.status === 'running';
    const returnedToSetup = previousStatus.current !== 'setup' && state.status === 'setup';

    if (enteredRunning) {
      setDrawerOpen(false);
    }

    if (returnedToSetup || state.recovery) {
      setDrawerOpen(true);
    }

    previousStatus.current = state.status;
  }, [adminUnlocked, state.status, state.recovery]);

  function unlockAdmin(password) {
    if (password !== ADMIN_PASSWORD) {
      return false;
    }

    localStorage.setItem(ADMIN_SESSION_KEY, 'true');
    setAdminUnlocked(true);
    setPasswordOpen(false);
    setDrawerOpen(true);
    return true;
  }

  function lockAdmin() {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    setAdminUnlocked(false);
    setDrawerOpen(false);
  }

  function emitAdmin(event, payload) {
    socket.emit(event, payload, (result) => {
      if (!result?.ok) {
        setNotice({ type: 'error', message: result?.error || 'Operação não realizada.' });
        return;
      }
      setNotice({ type: 'success', message: 'Comando aplicado.' });
    });
  }

  function configure() {
    emitAdmin('admin:configure', { teamAName, teamBName });
  }

  function start() {
    emitAdmin('admin:start');
  }

  function pauseOrResume() {
    emitAdmin(state.status === 'paused' ? 'admin:resume' : 'admin:pause');
  }

  function adjustCurrentScore() {
    emitAdmin('admin:adjust-score', { A: Number(scoreA), B: Number(scoreB) });
  }

  function applyEmergencyRestore() {
    emitAdmin('admin:emergency-restore', {
      score: { A: Number(scoreA), B: Number(scoreB) },
      roundIndex: Number(emergency.roundIndex),
      phase: emergency.phase,
      activeTeam: emergency.activeTeam
    });
  }

  const spectatorMode = !drawerOpen;

  return (
    <main className={`page public-page ${adminUnlocked && drawerOpen ? 'drawer-open' : ''} ${spectatorMode ? 'spectator-mode' : ''}`}>
      {adminUnlocked && drawerOpen && (
        <AdminDrawer
          state={state}
          connected={connected}
          open={drawerOpen}
          teamAName={teamAName}
          teamBName={teamBName}
          scoreA={scoreA}
          scoreB={scoreB}
          emergency={emergency}
          notice={notice}
          setTeamAName={setTeamAName}
          setTeamBName={setTeamBName}
          setScoreA={setScoreA}
          setScoreB={setScoreB}
          setEmergency={setEmergency}
          onConfigure={configure}
          onStart={start}
          onPauseOrResume={pauseOrResume}
          onAdjustScore={adjustCurrentScore}
          onEmergencyRestore={applyEmergencyRestore}
          onLockAdmin={lockAdmin}
        />
      )}

      <button
        className="drawer-toggle"
        onClick={() => adminUnlocked ? setDrawerOpen((value) => !value) : setPasswordOpen(true)}
        title={adminUnlocked ? 'Abrir painel' : 'Desbloquear painel'}
      >
        {adminUnlocked ? drawerOpen ? 'Fechar painel' : 'Painel' : 'Admin'}
      </button>

      <a className="match-back-link" href="/" title="Voltar ao menu inicial">
        Menu
      </a>

      {passwordOpen && !adminUnlocked && <AdminPasswordDialog onUnlock={unlockAdmin} onClose={() => setPasswordOpen(false)} />}

      <section className="broadcast-shell">
        {!spectatorMode && <BroadcastHeader state={state} connected={connected} />}
        <ScoreField state={state} />
        {!spectatorMode && <MatchTimeline state={state} />}
      </section>
    </main>
  );
}

function AdminDrawer({
  state,
  connected,
  open,
  teamAName,
  teamBName,
  scoreA,
  scoreB,
  emergency,
  notice,
  setTeamAName,
  setTeamBName,
  setScoreA,
  setScoreB,
  setEmergency,
  onConfigure,
  onStart,
  onPauseOrResume,
  onAdjustScore,
  onEmergencyRestore,
  onLockAdmin
}) {
  const bothReady = state.teams.A.ready && state.teams.B.ready;
  const canConfigure = state.status === 'setup' || state.status === 'paused';

  return (
    <aside className={`admin-drawer ${open ? 'open' : ''}`}>
      <div className="drawer-head">
        <div>
          <p className="eyebrow">Cabine</p>
          <h2>Operação</h2>
        </div>
        <ConnectionPill connected={connected} />
      </div>

      {notice && <div className={`notice ${notice.type}`}>{notice.message}</div>}

      <section className="drawer-section">
        <h3>Equipes</h3>
        <label>
          Nome A
          <input value={teamAName} disabled={!canConfigure} onChange={(event) => setTeamAName(event.target.value)} />
        </label>
        <label>
          Nome B
          <input value={teamBName} disabled={!canConfigure} onChange={(event) => setTeamBName(event.target.value)} />
        </label>
        <button className="control-button" disabled={!canConfigure} onClick={onConfigure}>Salvar nomes</button>
      </section>

      <section className="drawer-section">
          <h3>Códigos</h3>
        <CodeStatus team={state.teams.A} />
        <CodeStatus team={state.teams.B} />
      </section>

      <section className="drawer-section">
        <h3>Partida</h3>
        <button className="primary-action" disabled={!bothReady || state.status !== 'setup'} onClick={onStart}>
          Iniciar partida
        </button>
        <button className="control-button" disabled={!['running', 'paused'].includes(state.status)} onClick={onPauseOrResume}>
          {state.status === 'paused' ? 'Retomar' : 'Pausar'}
        </button>
        <button className="danger-button" onClick={() => socket.emit('game:reset')}>
          Nova partida
        </button>
        <button className="control-button" onClick={onLockAdmin}>Bloquear painel</button>
      </section>

      <section className="drawer-section">
        <h3>Retomada</h3>
        {state.recovery ? (
          <p className="help-text">{state.recovery.mode === 'invalid' ? state.recovery.error : 'Snapshot carregado. Confira antes de retomar.'}</p>
        ) : (
          <p className="help-text">Sem pendência de recuperação.</p>
        )}
        <div className="score-edit">
          <label>
            Placar A
            <input type="number" min="0" value={scoreA} onChange={(event) => setScoreA(event.target.value)} />
          </label>
          <label>
            Placar B
            <input type="number" min="0" value={scoreB} onChange={(event) => setScoreB(event.target.value)} />
          </label>
        </div>
        <button className="control-button" disabled={state.status !== 'paused'} onClick={onAdjustScore}>Corrigir placar</button>
      </section>

      <details className="drawer-section emergency-box">
        <summary>Modo emergencial</summary>
        <p className="help-text">Use somente se o snapshot não permitir retomada normal.</p>
        <label>
          Rodada
          <input
            type="number"
            min="1"
            max={state.maxRounds}
            value={Number(emergency.roundIndex) + 1}
            onChange={(event) => setEmergency((value) => ({ ...value, roundIndex: Number(event.target.value) - 1 }))}
          />
        </label>
        <label>
          Fase
          <select value={emergency.phase} onChange={(event) => setEmergency((value) => ({ ...value, phase: event.target.value }))}>
            <option value="attack">Ataque</option>
            <option value="rebound">Contra-ataque</option>
            <option value="between">Intervalo</option>
          </select>
        </label>
        <label>
          Equipe ativa
          <select value={emergency.activeTeam} onChange={(event) => setEmergency((value) => ({ ...value, activeTeam: event.target.value }))}>
            <option value="A">{state.teams.A.name}</option>
            <option value="B">{state.teams.B.name}</option>
          </select>
        </label>
        <button className="danger-button" onClick={onEmergencyRestore}>Aplicar retomada emergencial</button>
      </details>
    </aside>
  );
}

function AdminPasswordDialog({ onUnlock, onClose }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  function submit(event) {
    event.preventDefault();
    const unlocked = onUnlock(password);
    if (!unlocked) {
      setError('Senha incorreta.');
    }
  }

  return (
    <div className="admin-lock-backdrop" role="dialog" aria-modal="true" aria-label="Acessar painel admin">
      <form className="admin-lock-panel" onSubmit={submit}>
        <p className="eyebrow">Acesso do operador</p>
        <h2>Painel admin</h2>
        <label>
          Senha
          <input
            autoFocus
            type="password"
            inputMode="numeric"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Digite a senha"
          />
        </label>
        {error && <div className="notice error">{error}</div>}
        <div className="admin-lock-actions">
          <button className="control-button" type="button" onClick={onClose}>Cancelar</button>
          <button className="primary-action">Entrar</button>
        </div>
      </form>
    </div>
  );
}

function CodeStatus({ team }) {
  return (
    <div className="code-status">
      <div>
        <strong>{team.name}</strong>
        <span>{team.connected ? 'Conectada' : 'Aguardando'} · {team.ready ? 'Pronta' : 'Não pronta'}</span>
      </div>
      <code>{team.code}</code>
    </div>
  );
}

function BroadcastHeader({ state, connected }) {
  return (
    <header className="broadcast-header">
      <div>
        <p className="eyebrow">Aquecimento da Copa</p>
        <h1>Copa de Prompts MPAC</h1>
        <p className="brand-line">Criatividade, estratégia e IA em campo.</p>
      </div>
      <div className="header-meta">
        <ConnectionPill connected={connected} />
        <div className="round-pill">Rodada {Math.min(state.roundIndex + 1, state.maxRounds)} / {state.maxRounds}</div>
        <div className="round-pill">{phaseLabel(state)}</div>
      </div>
    </header>
  );
}

function ScoreField({ state }) {
  return (
    <section className="stadium-board">
      <div className="question-side">
        <PublicQuestion state={state} compact />
      </div>

      <div className="field-card">
        <div className="field-topline">
          <div className="play-chip">
            <span>Jogada</span>
            <strong>{state.lastEvent?.title || 'Aguardando'}</strong>
            <small>{state.lastEvent?.message || 'Configure o aquecimento para começar.'}</small>
          </div>
          <TimerBadge state={state} />
          <div className="possession-chip">
            <span>Posse</span>
            <strong>{possessionText(state)}</strong>
          </div>
        </div>
        <div className="match-stage">
          <TeamScore team={state.teams.A} score={state.score.A} side="A" />
          <InteractivePitch state={state} />
          <TeamScore team={state.teams.B} score={state.score.B} side="B" />
        </div>
      </div>
    </section>
  );
}

function InteractivePitch({ state, freeMode = false, onFreeGoal }) {
  const isGoal = !freeMode && ['goal', 'rebound-goal'].includes(state.lastEvent?.type);
  const isDefense = !freeMode && ['defense', 'double-defense', 'timeout-defense', 'timeout-double-defense'].includes(state.lastEvent?.type);
  const fieldRef = useRef(null);
  const [pieces, setPieces] = useState(() => initialFieldPieces(state, freeMode));
  const piecesRef = useRef(pieces);
  const [freeGoal, setFreeGoal] = useState(null);
  const draggingPiece = useRef(null);
  const lastFreeTouch = useRef(null);
  const scoredFreeGoal = useRef(null);

  useEffect(() => {
    piecesRef.current = pieces;
  }, [pieces]);

  useEffect(() => {
    if (!freeMode || draggingPiece.current) return;
    const syncedPieces = initialFieldPieces(state, true);
    piecesRef.current = syncedPieces;
    setPieces(syncedPieces);
  }, [
    freeMode,
    state.field?.pieces?.teamA?.x,
    state.field?.pieces?.teamA?.y,
    state.field?.pieces?.teamB?.x,
    state.field?.pieces?.teamB?.y,
    state.field?.pieces?.ball?.x,
    state.field?.pieces?.ball?.y
  ]);

  useEffect(() => {
    if (freeMode) return;

    const nextPieces = {
      ...piecesRef.current,
      ball: automaticBallPosition(state)
    };
    piecesRef.current = nextPieces;
    setPieces((current) => ({
      ...current,
      ball: automaticBallPosition(state)
    }));
  }, [freeMode, state.activeTeam, state.lastEvent?.type, state.phase]);

  function movePiece(pieceId, event) {
    const bounds = fieldRef.current?.getBoundingClientRect();
    if (!bounds) return;

    const clientX = event.clientX ?? event.touches?.[0]?.clientX;
    const clientY = event.clientY ?? event.touches?.[0]?.clientY;

    if (clientX == null || clientY == null) return;

    const nextPosition = {
      x: clamp(((clientX - bounds.left) / bounds.width) * 100, 4, 96),
      y: clamp(((clientY - bounds.top) / bounds.height) * 100, 7, 93)
    };

    const previous = piecesRef.current;
    const next = applyPieceMovement(previous, pieceId, nextPosition, {
      freeMode,
      setFreeGoal,
      onFreeGoal,
      lastFreeTouch,
      scoredFreeGoal
    });

    piecesRef.current = next;
    setPieces(next);

    if (freeMode) {
      emitFieldPiece(pieceId, next[pieceId]);

      if (next.ball !== previous.ball) {
        emitFieldPiece('ball', next.ball);
      }
    }
  }

  function startDragging(pieceId, event) {
    draggingPiece.current = pieceId;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    movePiece(pieceId, event);
  }

  function dragPiece(event) {
    if (!draggingPiece.current) return;
    movePiece(draggingPiece.current, event);
  }

  function stopDragging(event) {
    if (draggingPiece.current) {
      event.currentTarget.releasePointerCapture?.(event.pointerId);
    }
    draggingPiece.current = null;
  }

  function resetPiece(pieceId) {
    const position = initialFieldPieces(state, freeMode)[pieceId];
    const next = {
      ...piecesRef.current,
      [pieceId]: position
    };
    piecesRef.current = next;
    setPieces(next);

    if (freeMode) {
      emitFieldPiece(pieceId, position);
    }
  }

  return (
    <div className={`field ${freeMode ? 'free-field' : ''}`} ref={fieldRef}>
      <div className="pitch-mow"></div>
      <div className="corner-arc corner-top-left"></div>
      <div className="corner-arc corner-top-right"></div>
      <div className="corner-arc corner-bottom-left"></div>
      <div className="corner-arc corner-bottom-right"></div>
      <div className="penalty-box left-penalty"></div>
      <div className="penalty-box right-penalty"></div>
      <div className="six-yard-box left-six-yard"></div>
      <div className="six-yard-box right-six-yard"></div>
      <div className="penalty-spot left-spot"></div>
      <div className="penalty-spot right-spot"></div>
      <div className="penalty-arc left-arc"></div>
      <div className="penalty-arc right-arc"></div>
      <div className="goal left-goal" aria-label="Gol esquerdo"></div>
      <div className="center-circle"></div>
      <div className="center-spot"></div>
      {freeGoal && <div className={`free-goal-flash ${freeGoal.side}`}>GOOOOOL</div>}
      <DraggableFieldPiece
        id="teamA"
        className="team-marker marker-a"
        position={pieces.teamA}
        label={teamInitial(state.teams.A.name, 'A')}
        image={equipeAImage}
        title={state.teams.A.name}
        onPointerDown={startDragging}
        onPointerMove={dragPiece}
        onPointerUp={stopDragging}
        onDoubleClick={resetPiece}
      />
      {!freeMode && (
        <DraggableFieldPiece
          id="ball"
          className={`ball ${isGoal ? 'ball-goal' : ''} ${isDefense ? 'ball-defense' : ''}`}
          position={pieces.ball}
          label="⚽"
          title="Bola"
          onPointerDown={startDragging}
          onPointerMove={dragPiece}
          onPointerUp={stopDragging}
          onDoubleClick={resetPiece}
        />
      )}
      {freeMode && (
        <DraggableFieldPiece
          id="ball"
          className={`free-ball ${freeGoal ? 'free-ball-scored' : ''}`}
          position={pieces.ball}
          label="⚽"
          title="Bola"
          onPointerDown={startDragging}
          onPointerMove={dragPiece}
          onPointerUp={stopDragging}
          onDoubleClick={resetPiece}
        />
      )}
      <DraggableFieldPiece
        id="teamB"
        className="team-marker marker-b"
        position={pieces.teamB}
        label={teamInitial(state.teams.B.name, 'B')}
        image={equipeBImage}
        title={state.teams.B.name}
        onPointerDown={startDragging}
        onPointerMove={dragPiece}
        onPointerUp={stopDragging}
        onDoubleClick={resetPiece}
      />
      <div className="goal right-goal" aria-label="Gol direito"></div>
    </div>
  );
}

function DraggableFieldPiece({
  id,
  className,
  position,
  label,
  image,
  title,
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onDoubleClick
}) {
  return (
    <button
      type="button"
      className={`field-piece ${className}`}
      style={{ left: `${position.x}%`, top: `${position.y}%` }}
      title={`${title}: arraste para reposicionar`}
      onPointerDown={(event) => onPointerDown(id, event)}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onDoubleClick={() => onDoubleClick(id)}
    >
      {image && <img src={image} alt="" draggable="false" />}
      {label}
    </button>
  );
}

function initialFieldPieces(state, freeMode = false) {
  if (freeMode && state.field?.pieces) {
    return {
      teamA: normalizeFieldPoint(state.field.pieces.teamA, { x: 12, y: 36 }),
      teamB: normalizeFieldPoint(state.field.pieces.teamB, { x: 12, y: 64 }),
      ball: normalizeFieldPoint(state.field.pieces.ball, { x: 88, y: 50 })
    };
  }

  return {
    teamA: freeMode ? { x: 12, y: 36 } : { x: 28, y: 50 },
    ball: freeMode ? { x: 88, y: 50 } : automaticBallPosition(state),
    teamB: freeMode ? { x: 12, y: 64 } : { x: 72, y: 50 }
  };
}

function normalizeFieldPoint(value, fallback) {
  const x = Number(value?.x);
  const y = Number(value?.y);

  if (!Number.isFinite(x) || !Number.isFinite(y)) {
    return fallback;
  }

  return {
    x: clamp(x, 3.5, 96.5),
    y: clamp(y, 7, 93)
  };
}

function emitFieldPiece(pieceId, position) {
  socket.emit('field:move-piece', { pieceId, position });
}

function applyPieceMovement(current, pieceId, nextPosition, options) {
  const { freeMode, setFreeGoal, onFreeGoal, lastFreeTouch, scoredFreeGoal } = options;

  if (!freeMode || pieceId === 'ball') {
    const next = { ...current, [pieceId]: nextPosition };

    if (freeMode && pieceId === 'ball') {
      checkFreeGoal(next.ball, {
        setFreeGoal,
        onFreeGoal,
        scorer: goalScorerFromSide(next.ball.x <= 50 ? 'left' : 'right', lastFreeTouch.current),
        scoredFreeGoal
      });
    }

    return next;
  }

  const next = { ...current, [pieceId]: nextPosition };

  if (!['teamA', 'teamB'].includes(pieceId)) {
    return next;
  }

  const dx = next.ball.x - nextPosition.x;
  const dy = next.ball.y - nextPosition.y;
  const distance = Math.hypot(dx, dy);

  if (distance > 10) {
    return next;
  }

  lastFreeTouch.current = pieceId === 'teamB' ? 'B' : 'A';

  const force = Math.max(5, 15 - distance);
  const directionX = distance > 0 ? dx / distance : 1;
  const directionY = distance > 0 ? dy / distance : 0;

  next.ball = {
    x: clamp(next.ball.x + directionX * force, 3.5, 96.5),
    y: clamp(next.ball.y + directionY * force, 18, 82)
  };

  checkFreeGoal(next.ball, {
    setFreeGoal,
    onFreeGoal,
    scorer: lastFreeTouch.current,
    scoredFreeGoal
  });
  return next;
}

function checkFreeGoal(ballPosition, options) {
  const { setFreeGoal, onFreeGoal, scorer, scoredFreeGoal } = options;
  const inGoalHeight = ballPosition.y >= 37 && ballPosition.y <= 63;
  const side = ballPosition.x <= 4.2 && inGoalHeight ? 'left' : ballPosition.x >= 95.8 && inGoalHeight ? 'right' : null;

  if (!side) {
    scoredFreeGoal.current = null;
    return;
  }

  if (scoredFreeGoal.current === side) return;

  scoredFreeGoal.current = side;
  setFreeGoal({ side, id: Date.now() });
  onFreeGoal?.(scorer || goalScorerFromSide(side), side);
  window.setTimeout(() => setFreeGoal(null), 1600);
}

function goalScorerFromSide(side, lastTouch) {
  if (lastTouch) return lastTouch;
  return side === 'right' ? 'A' : 'B';
}

function automaticBallPosition(state) {
  const type = state.lastEvent?.type;

  if (['goal', 'rebound-goal'].includes(type)) {
    return state.lastEvent?.team === 'A' ? { x: 93, y: 50 } : { x: 7, y: 50 };
  }

  if (['defense', 'double-defense', 'timeout-defense', 'timeout-double-defense'].includes(type)) {
    return state.activeTeam === 'A' ? { x: 38, y: 38 } : { x: 62, y: 38 };
  }

  if (state.activeTeam === 'A') return { x: 35, y: 50 };
  if (state.activeTeam === 'B') return { x: 65, y: 50 };
  return { x: 50, y: 50 };
}

function teamInitial(name, fallback) {
  return String(name || fallback).trim().slice(0, 1).toUpperCase();
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function TimerBadge({ state }) {
  const urgent = ['attack', 'rebound', 'revealing'].includes(state.phase) && Number(state.timeLeft) <= 5;

  return (
    <div className={`match-clock ${urgent ? 'urgent' : ''}`}>
      <span>{state.phase === 'revealing' ? 'Revelação' : 'Tempo'}</span>
      <strong>{formatTime(state.timeLeft)}</strong>
      <small>{clockHelp(state)}</small>
    </div>
  );
}

function TeamScore({ team, score, side }) {
  return (
    <aside className={`score-tower team-${side.toLowerCase()}`}>
      <p>Equipe {side}</p>
      <strong>{score}</strong>
      <span>{team.name}</span>
      <small>{team.ready ? 'Pronta' : team.connected ? 'Conectada' : 'Aguardando código'}</small>
    </aside>
  );
}

function PublicQuestion({ state, compact = false }) {
  const question = state.currentQuestion;
  const selected = state.pendingAnswer?.optionIndex ?? state.lastEvent?.selectedOption;
  const correct = state.lastEvent?.correctOption;
  const showCorrect = Number.isInteger(correct);
  const className = `question-panel ${compact ? 'field-question-panel' : ''} ${state.phase === 'revealing' ? 'is-revealing' : ''}`;

  if (state.status === 'setup') {
    return (
      <section className={`${className} setup-panel`}>
        {compact && <LiveEventLine state={state} />}
        <p className="eyebrow">Aquecimento</p>
        <h2>Configure as equipes e compartilhe os códigos</h2>
        <p>Este aquecimento prepara as equipes para a dinâmica da Copa: ritmo, técnica e validação em campo.</p>
      </section>
    );
  }

  if (state.status === 'paused') {
    return (
      <section className={`${className} paused-panel`}>
        {compact && <LiveEventLine state={state} />}
        <p className="eyebrow">Partida pausada</p>
        <h2>{state.recovery ? 'Retomada aguardando operador' : 'Jogo pausado'}</h2>
        <p>Confira o painel lateral antes de retomar.</p>
      </section>
    );
  }

  if (!question) {
    return (
      <section className={`${className} setup-panel`}>
        {compact && <LiveEventLine state={state} />}
        <p className="eyebrow">{state.status === 'finished' ? 'Fim de jogo' : 'Intervalo'}</p>
        <h2>{state.lastEvent?.title || 'Aguardando próxima jogada'}</h2>
        <p>{state.lastEvent?.message}</p>
      </section>
    );
  }

  return (
    <section className={className}>
      {compact && <LiveEventLine state={state} />}
      <div className="question-topline">
        <span>{question.category}</span>
        <strong>{state.phase === 'rebound' ? 'Contra-ataque' : state.phase === 'revealing' ? 'Resposta confirmada' : 'Ataque'}</strong>
      </div>
      <h2>{question.title}</h2>
      <p>{question.statement}</p>
      <div className="public-options">
        {question.options.map((option, index) => (
          <div
            className={[
              'public-option',
              selected === index ? 'selected' : '',
              showCorrect && correct === index ? 'correct' : '',
              showCorrect && selected === index && correct !== index ? 'wrong' : ''
            ].filter(Boolean).join(' ')}
            key={option}
          >
            <span>{String.fromCharCode(65 + index)}</span>
            <strong>{option}</strong>
          </div>
        ))}
      </div>
      {state.phase === 'revealing' && <div className="reveal-strip">Revelação em {formatTime(state.timeLeft)}</div>}
      {showCorrect && <div className="explanation-strip">{state.lastEvent?.explanation}</div>}
    </section>
  );
}

function LiveEventLine({ state }) {
  return (
    <div className={`live-event-line event-${eventTone(state.lastEvent?.type || 'setup')}`}>
      <span>{eventIcon(state.lastEvent?.type)}</span>
      <strong>{state.lastEvent?.title || phaseLabel(state)}</strong>
      <p>{state.lastEvent?.message || 'Aguardando início da partida.'}</p>
    </div>
  );
}

function MatchTimeline({ state }) {
  return (
    <section className="timeline-panel">
      <div>
        <p className="eyebrow">Histórico</p>
        <h2>Últimas jogadas</h2>
      </div>
      <div className="timeline-list">
        {state.history.length === 0 ? (
          <p className="muted">As jogadas aparecerão aqui.</p>
        ) : state.history.slice(0, 6).map((item) => (
          <article className="timeline-item" key={item.id}>
            <span>{eventIcon(item.type)}</span>
            <div>
              <strong>Rodada {item.round}</strong>
              <p>{item.message}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function TeamPortal({ state, connected }) {
  const [session, setSession] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('partida-copa-team') || 'null');
    } catch {
      return null;
    }
  });
  const [code, setCode] = useState(session?.code || '');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!session?.code) return;
    socket.emit('team:join-code', { code: session.code }, (result) => {
      if (!result?.ok) {
        localStorage.removeItem('partida-copa-team');
        setSession(null);
      }
    });
  }, []);

  function join(event) {
    event.preventDefault();
    socket.emit('team:join-code', { code }, (result) => {
      if (!result?.ok) {
        setError(result?.error || 'Código inválido.');
        return;
      }

      const nextSession = { code: code.trim().toUpperCase(), teamId: result.teamId };
      localStorage.setItem('partida-copa-team', JSON.stringify(nextSession));
      setSession(nextSession);
      setError(null);
    });
  }

  if (!session?.teamId) {
    return (
      <main className="page center-page team-entry-page">
        <form className="panel entry-panel" onSubmit={join}>
          <p className="eyebrow">Entrada da equipe</p>
          <h1>Digite o código</h1>
          <ConnectionPill connected={connected} />
          <input className="code-input" value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="A7K2" />
          {error && <div className="notice error">{error}</div>}
          <button className="primary-action" disabled={!code.trim()}>Entrar</button>
        </form>
      </main>
    );
  }

  return <TeamScreen state={state} connected={connected} teamId={session.teamId} onLeave={() => {
    localStorage.removeItem('partida-copa-team');
    setSession(null);
    setCode('');
  }} />;
}

function TeamScreen({ state, connected, teamId, onLeave }) {
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const team = state.teams[teamId];
  const isActive = state.activeTeam === teamId && ['attack', 'rebound'].includes(state.phase);
  const isLocked = state.pendingAnswer?.teamId === teamId && state.phase === 'revealing';
  const question = state.currentQuestion;

  useEffect(() => {
    setSelected(null);
    setFeedback(null);
  }, [question?.id, state.phase]);

  function ready() {
    socket.emit('team:ready', { teamId, ready: true }, (result) => {
      if (!result?.ok) setFeedback({ type: 'error', message: result?.error || 'Não foi possível marcar prontidão.' });
    });
  }

  function submit() {
    if (!isActive || !question || selected === null) return;

    socket.emit('answer:submit', { teamId, questionId: question.id, optionIndex: selected }, (result) => {
      if (!result?.ok) {
        setFeedback({ type: 'error', message: result?.error || 'Não foi possível confirmar.' });
        return;
      }
      setFeedback({ type: 'success', message: 'Resposta travada. Aguarde a revelação.' });
    });
  }

  return (
    <main className={`page team-page team-${teamId.toLowerCase()}-page`}>
      <header className="team-header">
        <div>
          <p className="eyebrow">Tela da equipe</p>
          <h1>{team.name}</h1>
        </div>
        <div className="team-actions">
          <ConnectionPill connected={connected} />
          <button className="ghost-button" onClick={onLeave}>Sair</button>
        </div>
      </header>

      <section className="team-status-grid">
        <MiniStatus label="Placar" value={`${state.score.A} x ${state.score.B}`} />
        <MiniStatus label="Rodada" value={`${Math.min(state.roundIndex + 1, state.maxRounds)} / ${state.maxRounds}`} />
        <MiniStatus label="Tempo" value={formatTime(state.timeLeft)} />
      </section>

      <section className="team-question panel">
        {state.status === 'setup' ? (
          <WaitingTeamSetup team={team} onReady={ready} />
        ) : state.status === 'paused' ? (
          <WaitingBox title="Partida pausada" text="Aguarde o operador retomar a partida." />
        ) : state.status === 'finished' ? (
          <WaitingBox title="Fim de jogo" text={state.lastEvent?.message} />
        ) : isLocked ? (
          <LockedAnswer state={state} question={question} />
        ) : isActive && question ? (
          <>
            <div className="question-topline">
              <span>{question.category}</span>
              <strong>{state.phase === 'rebound' ? 'Contra-ataque' : 'Ataque'}</strong>
            </div>
            <h2>{question.title}</h2>
            <p>{question.statement}</p>
            <div className="team-options">
              {question.options.map((option, index) => (
                <button className={`team-option ${selected === index ? 'selected' : ''}`} key={option} onClick={() => setSelected(index)}>
                  <span>{String.fromCharCode(65 + index)}</span>
                  {option}
                </button>
              ))}
            </div>
            {feedback && <div className={`notice ${feedback.type}`}>{feedback.message}</div>}
            <button className="kick-button" disabled={selected === null} onClick={submit}>Confirmar resposta</button>
          </>
        ) : (
          <WaitingTurn state={state} teamId={teamId} />
        )}
      </section>
    </main>
  );
}

function WaitingTeamSetup({ team, onReady }) {
  return (
    <div className="waiting-box">
      <div className="waiting-ball">⚽</div>
      <p className="eyebrow">Aquecimento</p>
      <h2>{team.ready ? 'Equipe pronta' : 'Marque prontidão'}</h2>
      <p>O aquecimento só começa quando as duas equipes estiverem prontas.</p>
      <button className="primary-action" disabled={team.ready} onClick={onReady}>{team.ready ? 'Pronta' : 'Estou pronta'}</button>
    </div>
  );
}

function WaitingTurn({ state, teamId }) {
  const active = state.activeTeam ? state.teams[state.activeTeam] : null;
  const text = state.phase === 'between'
    ? 'A próxima rodada começa em instantes.'
    : state.phase === 'revealing'
      ? 'Resposta confirmada. Aguarde a revelação.'
      : active
        ? `Vez de ${active.name}.`
        : 'Aguardando jogada.';

  return (
    <WaitingBox
      title={active?.id === teamId ? 'Prepare-se' : 'Aguardando'}
      text={text}
    />
  );
}

function WaitingBox({ title, text }) {
  return (
    <div className="waiting-box">
      <div className="waiting-ball">⚽</div>
      <p className="eyebrow">Status</p>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}

function LockedAnswer({ state, question }) {
  const selected = state.pendingAnswer?.optionIndex;
  return (
    <>
      <div className="question-topline">
        <span>{question.category}</span>
        <strong>Resposta confirmada</strong>
      </div>
      <h2>{question.title}</h2>
      <p>A alternativa {String.fromCharCode(65 + selected)} foi travada. Revelação em {formatTime(state.timeLeft)}.</p>
      <div className="team-options">
        {question.options.map((option, index) => (
          <div className={`team-option locked ${selected === index ? 'selected' : ''}`} key={option}>
            <span>{String.fromCharCode(65 + index)}</span>
            {option}
          </div>
        ))}
      </div>
    </>
  );
}

function MiniStatus({ label, value }) {
  return (
    <div className="mini-status panel">
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}

function ConnectionPill({ connected }) {
  return <span className={`connection-pill ${connected ? 'online' : 'offline'}`}>{connected ? 'Online' : 'Reconectando'}</span>;
}

function phaseLabel(state) {
  if (state.status === 'setup') return 'Aquecimento';
  if (state.status === 'paused') return 'Pausada';
  if (state.status === 'finished') return 'Fim de jogo';
  if (state.phase === 'attack') return 'Ataque';
  if (state.phase === 'rebound') return 'Contra-ataque';
  if (state.phase === 'revealing') return 'Revelação';
  if (state.phase === 'between') return 'Intervalo';
  return state.phase;
}

function clockHelp(state) {
  if (state.status === 'setup') return 'Aquecimento';
  if (state.status === 'paused') return 'Pausado';
  if (state.phase === 'attack') return 'Ataque 45s';
  if (state.phase === 'rebound') return 'Contra-ataque 20s';
  if (state.phase === 'revealing') return 'Decisão em campo';
  if (state.phase === 'between') return 'Próxima rodada';
  return 'Encerrado';
}

function possessionText(state) {
  if (state.activeTeam) return state.teams[state.activeTeam].name;
  if (state.status === 'setup') return 'Aguardando';
  if (state.phase === 'between') return 'Intervalo';
  if (state.status === 'finished') return 'Fim';
  return 'Sem posse';
}

function eventTone(type) {
  if (type?.includes('goal')) return 'goal';
  if (type?.includes('defense') || type?.includes('timeout')) return 'defense';
  if (type?.includes('paused') || type?.includes('recovered')) return 'pause';
  if (type?.includes('ready') || type?.includes('connected')) return 'ready';
  return 'neutral';
}

function formatTime(seconds) {
  const safe = Math.max(0, Number(seconds || 0));
  return `00:${String(safe).padStart(2, '0')}`;
}

function eventIcon(type) {
  if (type?.includes('goal')) return '⚽';
  if (type?.includes('defense')) return '🧤';
  if (type?.includes('timeout')) return '⏱️';
  if (type?.includes('paused')) return '⏸';
  if (type?.includes('finished')) return '🏆';
  if (type?.includes('ready')) return '✓';
  return '•';
}

createRoot(document.getElementById('root')).render(<App />);
