import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BadgeCheck,
  ChevronRight,
  Clock3,
  Crosshair,
  Fingerprint,
  Medal,
  RotateCcw,
  ScanLine,
  Share2,
  ShieldCheck,
  Trophy,
  UserRound,
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import './styles.css';

const ASSET = `${import.meta.env.BASE_URL}assets/`;

const cases = [
  {
    id: 'root-knot-01',
    crop: 'Tomato / vegetable field',
    alert: 'Unexplained wilting and uneven crop vigour after root infection.',
    scene: 'field-scene.png',
    evidenceImage: 'root-evidence.png',
    clues: [
      { id: 'wilting', label: 'Wilting despite irrigation', x: 27, y: 34 },
      { id: 'galling', label: 'Root galling', x: 64, y: 45 },
      { id: 'stunting', label: 'Stunted growth', x: 50, y: 63 },
      { id: 'soil', label: 'Soil discoloration', x: 75, y: 70 },
      { id: 'patchy', label: 'Patchy field pattern', x: 32, y: 73 },
    ],
    diagnosisQuestion: 'Which threat is causing these typical symptoms?',
    diagnosisOptions: ['Root-knot Nematode', 'Fusarium Wilt', 'Bacterial Leaf Blight', 'Phytophthora Root Rot'],
    correctDiagnosis: 'Root-knot Nematode',
    solutionQuestion: 'Recommend the most relevant protection protocol.',
    solutionOptions: [
      'Seed treatment + soil application',
      'Foliar spray at seeding stage only',
      'Post-harvest fumigation',
      'No treatment required',
    ],
    correctSolution: 'Seed treatment + soil application',
    product: 'Tymirium technology / Vaniva',
    explanation:
      'Root galling, wilting and patchy field decline point to plant pathogenic nematodes. Early root-zone protection is the right intervention.',
  },
  {
    id: 'banana-tr4',
    crop: 'Banana plantation',
    alert: 'Plantation decline with destructive wilt symptoms.',
    scene: 'field-scene.png',
    evidenceImage: 'root-evidence.png',
    clues: [
      { id: 'yellowing', label: 'Yellowing leaves', x: 23, y: 39 },
      { id: 'vascular', label: 'Vascular browning', x: 60, y: 42 },
      { id: 'collapse', label: 'Canopy collapse', x: 45, y: 58 },
      { id: 'soilborne', label: 'Soil-borne spread', x: 72, y: 66 },
      { id: 'patch', label: 'Plantation hot spot', x: 34, y: 72 },
    ],
    diagnosisQuestion: 'Which pathogen is causing devastation in banana plantations?',
    diagnosisOptions: [
      'Panama disease / Fusarium oxysporum f. sp. cubense TR4',
      'Root-knot Nematode',
      'Bacterial Leaf Blight',
      'Powdery Mildew',
    ],
    correctDiagnosis: 'Panama disease / Fusarium oxysporum f. sp. cubense TR4',
    solutionQuestion: 'Select the investigation outcome.',
    solutionOptions: ['Soil-borne disease management', 'Only insect trapping', 'Ignore and replant immediately', 'Leaf polish spray'],
    correctSolution: 'Soil-borne disease management',
    product: 'Vaniva / Tymirium technology',
    explanation:
      'The banana case points to Fusarium TR4, a soil-borne pathogen associated with devastating wilt and long-term plantation risk.',
  },
  {
    id: 'nematode-viability',
    crop: 'Lab evidence: nematode motility',
    alert: 'Speed-of-kill visualisation showing nematode motility disruption.',
    scene: 'root-evidence.png',
    evidenceImage: 'root-evidence.png',
    clues: [
      { id: 'movement', label: 'Movement reduced', x: 38, y: 34 },
      { id: 'motility', label: 'Motility disruption', x: 63, y: 44 },
      { id: 'exposure', label: 'Tymirium exposure', x: 48, y: 61 },
      { id: 'viability', label: 'Viability endpoint', x: 73, y: 68 },
    ],
    diagnosisQuestion: 'After how many hours do nematodes stop showing viability in Tymirium solution?',
    diagnosisOptions: ['2 hours', '4 hours', '8 hours', '24 hours'],
    correctDiagnosis: '24 hours',
    solutionQuestion: 'What is the learning from this evidence?',
    solutionOptions: [
      'Tymirium rapidly disrupts nematode movements',
      'The crop needs more water only',
      'The evidence is unrelated to nematodes',
      'Delay all intervention until harvest',
    ],
    correctSolution: 'Tymirium rapidly disrupts nematode movements',
    product: 'Tymirium technology',
    explanation:
      'This case uses the PPT prompt wording. The 24-hour answer is a placeholder assumption until your technical team confirms the exact value.',
    needsConfirmation: true,
  },
];

const demoScores = [
  { name: 'Mónica S.', region: 'LATAM', score: 520 },
  { name: 'Chen W.', region: 'APAC', score: 495 },
  { name: 'Ahmed K.', region: 'MEA', score: 480 },
  { name: 'Rojesh A.', region: 'IN', score: 420 },
];

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

function App() {
  const [screen, setScreen] = useState('briefing');
  const [agent, setAgent] = useState('');
  const [caseIndex, setCaseIndex] = useState(0);
  const [foundClues, setFoundClues] = useState([]);
  const [diagnosis, setDiagnosis] = useState('');
  const [solution, setSolution] = useState('');
  const [startedAt, setStartedAt] = useState(Date.now());
  const [leaderboard, setLeaderboard] = useState(demoScores);
  const active = cases[caseIndex];

  const score = useMemo(() => {
    const clueScore = foundClues.length * 35;
    const diagnosisScore = diagnosis === active.correctDiagnosis ? 150 : 0;
    const solutionScore = solution === active.correctSolution ? 120 : 0;
    const seconds = Math.max(1, Math.round((Date.now() - startedAt) / 1000));
    const speedBonus = Math.max(0, 120 - seconds);
    return clueScore + diagnosisScore + solutionScore + speedBonus;
  }, [active, diagnosis, foundClues.length, solution, startedAt]);

  async function submitScore(finalScore) {
    const entry = {
      name: agent.trim() || 'Field Agent',
      region: 'GLOBAL',
      score: finalScore,
      case_id: active.id,
    };

    if (supabase) {
      await supabase.from('leaderboard').insert(entry);
      const { data } = await supabase
        .from('leaderboard')
        .select('name, region, score')
        .order('score', { ascending: false })
        .limit(20);
      if (data) setLeaderboard(data);
    } else {
      setLeaderboard((prev) => [entry, ...prev].sort((a, b) => b.score - a.score).slice(0, 20));
    }
  }

  function resetGame(nextCase = caseIndex) {
    setCaseIndex(nextCase);
    setFoundClues([]);
    setDiagnosis('');
    setSolution('');
    setStartedAt(Date.now());
    setScreen('scan');
  }

  function briefStart() {
    setStartedAt(Date.now());
    setScreen('scan');
  }

  function closeCase() {
    const finalScore = score;
    submitScore(finalScore);
    setScreen('closed');
  }

  return (
    <main className="app-shell">
      <div className="phone">
        <HudBar screen={screen} score={score} clues={foundClues.length} total={active.clues.length} />
        {screen === 'briefing' && (
          <Briefing agent={agent} setAgent={setAgent} active={active} onStart={briefStart} />
        )}
        {screen === 'scan' && (
          <ScanScene
            active={active}
            foundClues={foundClues}
            setFoundClues={setFoundClues}
            onDiagnosis={() => setScreen('diagnosis')}
          />
        )}
        {screen === 'diagnosis' && (
          <Diagnosis active={active} diagnosis={diagnosis} setDiagnosis={setDiagnosis} onNext={() => setScreen('solution')} />
        )}
        {screen === 'solution' && (
          <Solution active={active} solution={solution} setSolution={setSolution} onClose={closeCase} />
        )}
        {screen === 'closed' && (
          <CaseClosed
            active={active}
            agent={agent}
            score={score}
            diagnosis={diagnosis}
            solution={solution}
            onLeaderboard={() => setScreen('leaderboard')}
            onReplay={() => resetGame((caseIndex + 1) % cases.length)}
          />
        )}
        {screen === 'leaderboard' && (
          <Leaderboard leaderboard={leaderboard} score={score} onReplay={() => resetGame((caseIndex + 1) % cases.length)} />
        )}
      </div>
    </main>
  );
}

function HudBar({ screen, score, clues, total }) {
  return (
    <div className="hud">
      <div className="hud-pill">
        <Clock3 size={15} />
        <Timer />
      </div>
      <div className="hud-title">{screen === 'briefing' ? 'SCAN' : 'SOIL SLEUTH'}</div>
      <div className="hud-pill score">{screen === 'scan' ? `${clues}/${total}` : score}</div>
    </div>
  );
}

function BrandStrip() {
  return (
    <div className="brand-strip" aria-label="Syngenta Vaniva Tymirium technology">
      <img src={`${ASSET}syngenta-logo.jpeg`} alt="Syngenta" />
      <img src={`${ASSET}vaniva-logo.png`} alt="Vaniva Tymirium technology" />
    </div>
  );
}

function Timer() {
  const [now, setNow] = useState(Date.now());
  React.useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const seconds = Math.floor((now / 1000) % 60).toString().padStart(2, '0');
  return <span>0:{seconds}</span>;
}

function Briefing({ agent, setAgent, active, onStart }) {
  return (
    <section className="screen briefing" style={{ '--brief-bg': `url("${ASSET}${active.scene}")` }}>
      <div className="scan-logo">
        <ScanLine size={54} />
        <span>SCAN</span>
      </div>
      <div className="brief-card">
        <p className="eyebrow">Incoming field alert</p>
        <h1>{active.crop}</h1>
        <p>{active.alert}</p>
        <BrandStrip />
        <div className="mini-evidence">
          <img src={`${ASSET}${active.evidenceImage}`} alt="" />
          <div>
            <strong>Objective</strong>
            <span>Find clues, diagnose the threat, recommend the right protocol.</span>
          </div>
        </div>
      </div>
      <label className="agent-input">
        <UserRound size={17} />
        <input value={agent} onChange={(event) => setAgent(event.target.value)} placeholder="Enter agent name" />
      </label>
      <button className="primary" onClick={onStart}>
        Start investigation <ChevronRight size={18} />
      </button>
    </section>
  );
}

function ScanScene({ active, foundClues, setFoundClues, onDiagnosis }) {
  const complete = foundClues.length === active.clues.length;
  return (
    <section className="screen scan">
      <img className="scene-img" src={`${ASSET}${active.scene}`} alt="" />
      <div className="scan-grid" />
      <div className="scan-sweep" />
      {active.clues.map((clue) => {
        const found = foundClues.includes(clue.id);
        return (
          <button
            key={clue.id}
            className={`marker ${found ? 'found' : ''}`}
            style={{ left: `${clue.x}%`, top: `${clue.y}%` }}
            onClick={() => setFoundClues((prev) => (prev.includes(clue.id) ? prev : [...prev, clue.id]))}
            aria-label={clue.label}
          >
            <Crosshair size={24} />
          </button>
        );
      })}
      <div className="clue-panel">
        <div>
          <p className="eyebrow">Evidence collected</p>
          <strong>{foundClues.length}/{active.clues.length} clues found</strong>
        </div>
        <button className="compact" disabled={!complete} onClick={onDiagnosis}>
          Diagnose
        </button>
      </div>
      <div className="clue-list">
        {active.clues.map((clue) => (
          <span key={clue.id} className={foundClues.includes(clue.id) ? 'active' : ''}>
            {clue.label}
          </span>
        ))}
      </div>
    </section>
  );
}

function Diagnosis({ active, diagnosis, setDiagnosis, onNext }) {
  return (
    <section className="screen pane">
      <div className="pane-header">
        <Fingerprint />
        <div>
          <p className="eyebrow">The diagnosis</p>
          <h2>{active.diagnosisQuestion}</h2>
        </div>
      </div>
      <img className="evidence-photo" src={`${ASSET}${active.evidenceImage}`} alt="" />
      <div className="options">
        {active.diagnosisOptions.map((option, index) => (
          <button
            key={option}
            className={diagnosis === option ? 'selected' : ''}
            onClick={() => setDiagnosis(option)}
          >
            <span>{index + 1}</span>
            {option}
          </button>
        ))}
      </div>
      <button className="primary" disabled={!diagnosis} onClick={onNext}>
        Submit diagnosis <ChevronRight size={18} />
      </button>
    </section>
  );
}

function Solution({ active, solution, setSolution, onClose }) {
  return (
    <section className="screen pane">
      <div className="threat-badge">
        <ShieldCheck />
        <span>Threat identified</span>
        <strong>{active.correctDiagnosis}</strong>
      </div>
      <p className="solution-copy">{active.solutionQuestion}</p>
      <div className="options solution-options">
        {active.solutionOptions.map((option) => (
          <button
            key={option}
            className={solution === option ? 'selected' : ''}
            onClick={() => setSolution(option)}
          >
            <BadgeCheck size={18} />
            {option}
          </button>
        ))}
      </div>
      <div className="product-note">
        <span>Recommended product</span>
        <strong>{active.product}</strong>
        <BrandStrip />
      </div>
      <button className="primary" disabled={!solution} onClick={onClose}>
        Close case <ChevronRight size={18} />
      </button>
    </section>
  );
}

function CaseClosed({ active, agent, score, diagnosis, solution, onLeaderboard, onReplay }) {
  const correct = diagnosis === active.correctDiagnosis && solution === active.correctSolution;
  const shareText = encodeURIComponent(
    `I scored ${score} on Mission: Soil Sleuth. Can you spot the crop threat faster?`
  );
  return (
    <section className="screen closed">
      <img className="reward-bg" src={`${ASSET}case-closed.png`} alt="" />
      <div className="stamp">Case #{active.id.toUpperCase()} Closed</div>
      <div className="score-card">
        <Medal size={42} />
        <p className="eyebrow">{agent || 'Field Agent'}</p>
        <h2>{score}</h2>
        <span>{correct ? 'Classified: expert diagnosis' : 'Case reviewed: keep training'}</span>
      </div>
      <p className="explanation">{active.explanation}</p>
      <div className="closed-actions">
        <a className="secondary" href={`https://wa.me/?text=${shareText}`} target="_blank" rel="noreferrer">
          <Share2 size={18} />
          Share
        </a>
        <button className="secondary" onClick={onLeaderboard}>
          <Trophy size={18} />
          Leaderboard
        </button>
      </div>
      <button className="primary amber" onClick={onReplay}>
        Play next case <RotateCcw size={18} />
      </button>
    </section>
  );
}

function Leaderboard({ leaderboard, onReplay }) {
  return (
    <section className="screen pane leaderboard">
      <div className="pane-header">
        <Trophy />
        <div>
          <p className="eyebrow">Scan leaderboard</p>
          <h2>Top investigators</h2>
        </div>
      </div>
      <div className="rank-list">
        {leaderboard.map((entry, index) => (
          <div className={index < 3 ? 'rank top' : 'rank'} key={`${entry.name}-${index}`}>
            <span>#{index + 1}</span>
            <strong>{entry.name}</strong>
            <small>{entry.region || 'GLOBAL'}</small>
            <b>{entry.score}</b>
          </div>
        ))}
      </div>
      <button className="primary amber" onClick={onReplay}>
        Play again <RotateCcw size={18} />
      </button>
    </section>
  );
}

createRoot(document.getElementById('root')).render(<App />);
