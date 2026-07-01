import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { io } from 'socket.io-client';
import { resolveSocketUrl } from './socketConfig.js';
import './styles.css';

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

  return <PublicAdminScreen state={state} connected={connected} />;
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
        setNotice({ type: 'error', message: result?.error || 'Operacao nao realizada.' });
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

  return (
    <main className={`page public-page ${adminUnlocked && drawerOpen ? 'drawer-open' : ''}`}>
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

      {passwordOpen && !adminUnlocked && <AdminPasswordDialog onUnlock={unlockAdmin} onClose={() => setPasswordOpen(false)} />}

      <section className="broadcast-shell">
        <BroadcastHeader state={state} connected={connected} />
        <ScoreField state={state} />
        <PublicQuestion state={state} />
        <MatchTimeline state={state} />
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
          <h2>Operacao</h2>
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
        <h3>Codigos</h3>
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
          <p className="help-text">Sem pendencia de recuperacao.</p>
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
        <p className="help-text">Use somente se o snapshot nao permitir retomada normal.</p>
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
        <span>{team.connected ? 'Conectada' : 'Aguardando'} · {team.ready ? 'Pronta' : 'Nao pronta'}</span>
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
        <p className="brand-line">Criatividade, estrategia e IA em campo.</p>
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
  const isGoal = ['goal', 'rebound-goal'].includes(state.lastEvent?.type);
  const isDefense = ['defense', 'double-defense', 'timeout-defense', 'timeout-double-defense'].includes(state.lastEvent?.type);
  const ballSide = state.activeTeam === 'A' ? 'ball-left' : state.activeTeam === 'B' ? 'ball-right' : 'ball-center';
  const eventType = state.lastEvent?.type || 'setup';

  return (
    <section className="stadium-board">
      <TeamScore team={state.teams.A} score={state.score.A} side="A" />

      <div className="field-card">
        <div className="field-topline">
          <div className="play-chip">
            <span>Jogada</span>
            <strong>{state.lastEvent?.title || 'Aguardando'}</strong>
          </div>
          <TimerBadge state={state} />
          <div className="possession-chip">
            <span>Posse</span>
            <strong>{possessionText(state)}</strong>
          </div>
        </div>
        <div className="field">
          <div className="goal left-goal">GOL</div>
          <div className="center-circle"></div>
          <div className={`ball ${ballSide} ${isGoal ? 'ball-goal' : ''} ${isDefense ? 'ball-defense' : ''}`}>⚽</div>
          <div className="goal right-goal">GOL</div>
        </div>
        <div className={`event-panel event-${eventTone(eventType)}`}>
          <div className="event-icon">{eventIcon(eventType)}</div>
          <div>
            <p>{phaseLabel(state)}</p>
            <h2>{state.lastEvent?.message || 'Configure o aquecimento para comecar.'}</h2>
          </div>
        </div>
      </div>

      <TeamScore team={state.teams.B} score={state.score.B} side="B" />
    </section>
  );
}

function TimerBadge({ state }) {
  const urgent = ['attack', 'rebound', 'revealing'].includes(state.phase) && Number(state.timeLeft) <= 5;

  return (
    <div className={`match-clock ${urgent ? 'urgent' : ''}`}>
      <span>{state.phase === 'revealing' ? 'Revelacao' : 'Tempo'}</span>
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
      <small>{team.ready ? 'Pronta' : team.connected ? 'Conectada' : 'Aguardando codigo'}</small>
    </aside>
  );
}

function PublicQuestion({ state }) {
  const question = state.currentQuestion;
  const selected = state.pendingAnswer?.optionIndex ?? state.lastEvent?.selectedOption;
  const correct = state.lastEvent?.correctOption;
  const showCorrect = Number.isInteger(correct);

  if (state.status === 'setup') {
    return (
      <section className="question-panel setup-panel">
        <p className="eyebrow">Aquecimento</p>
        <h2>Configure as equipes e compartilhe os codigos</h2>
        <p>Este aquecimento prepara as equipes para a dinamica da Copa: ritmo, tecnica e validacao em campo.</p>
      </section>
    );
  }

  if (state.status === 'paused') {
    return (
      <section className="question-panel paused-panel">
        <p className="eyebrow">Partida pausada</p>
        <h2>{state.recovery ? 'Retomada aguardando operador' : 'Jogo pausado'}</h2>
        <p>Confira o painel lateral antes de retomar.</p>
      </section>
    );
  }

  if (!question) {
    return (
      <section className="question-panel setup-panel">
        <p className="eyebrow">{state.status === 'finished' ? 'Fim de jogo' : 'Intervalo'}</p>
        <h2>{state.lastEvent?.title || 'Aguardando proxima jogada'}</h2>
        <p>{state.lastEvent?.message}</p>
      </section>
    );
  }

  return (
    <section className={`question-panel ${state.phase === 'revealing' ? 'is-revealing' : ''}`}>
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
      {state.phase === 'revealing' && <div className="reveal-strip">Revelacao em {formatTime(state.timeLeft)}</div>}
      {showCorrect && <div className="explanation-strip">{state.lastEvent?.explanation}</div>}
    </section>
  );
}

function MatchTimeline({ state }) {
  return (
    <section className="timeline-panel">
      <div>
        <p className="eyebrow">Historico</p>
        <h2>Ultimas jogadas</h2>
      </div>
      <div className="timeline-list">
        {state.history.length === 0 ? (
          <p className="muted">As jogadas aparecerao aqui.</p>
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
        setError(result?.error || 'Codigo invalido.');
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
          <h1>Digite o codigo</h1>
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
      if (!result?.ok) setFeedback({ type: 'error', message: result?.error || 'Nao foi possivel marcar prontidao.' });
    });
  }

  function submit() {
    if (!isActive || !question || selected === null) return;

    socket.emit('answer:submit', { teamId, questionId: question.id, optionIndex: selected }, (result) => {
      if (!result?.ok) {
        setFeedback({ type: 'error', message: result?.error || 'Nao foi possivel confirmar.' });
        return;
      }
      setFeedback({ type: 'success', message: 'Resposta travada. Aguarde a revelacao.' });
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
      <h2>{team.ready ? 'Equipe pronta' : 'Marque prontidao'}</h2>
      <p>O aquecimento so comeca quando as duas equipes estiverem prontas.</p>
      <button className="primary-action" disabled={team.ready} onClick={onReady}>{team.ready ? 'Pronta' : 'Estou pronta'}</button>
    </div>
  );
}

function WaitingTurn({ state, teamId }) {
  const active = state.activeTeam ? state.teams[state.activeTeam] : null;
  const text = state.phase === 'between'
    ? 'A proxima rodada comeca em instantes.'
    : state.phase === 'revealing'
      ? 'Resposta confirmada. Aguarde a revelacao.'
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
      <p>A alternativa {String.fromCharCode(65 + selected)} foi travada. Revelacao em {formatTime(state.timeLeft)}.</p>
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
  if (state.phase === 'revealing') return 'Revelacao';
  if (state.phase === 'between') return 'Intervalo';
  return state.phase;
}

function clockHelp(state) {
  if (state.status === 'setup') return 'Aquecimento';
  if (state.status === 'paused') return 'Pausado';
  if (state.phase === 'attack') return 'Ataque 45s';
  if (state.phase === 'rebound') return 'Contra-ataque 15s';
  if (state.phase === 'revealing') return 'Decisao em campo';
  if (state.phase === 'between') return 'Proxima rodada';
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
