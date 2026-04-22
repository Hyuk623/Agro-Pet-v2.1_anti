import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { Gamepad2, Coins, HelpCircle, Trophy, AlertCircle, RefreshCcw, Bug, Target, Zap, Waves } from 'lucide-react';

type GameMode = 'lobby' | 'quiz' | 'pest' | 'balance';

export const ArcadeScreen: React.FC = () => {
  const { state, completeMinigame } = useGame();
  const { minigameTokensEarnedToday, maxDailyMinigameTokens, player } = state;
  
  const [gameMode, setGameMode] = useState<GameMode>('lobby');
  const [gameState, setGameState] = useState<'playing' | 'result'>('playing');
  const [success, setSuccess] = useState(false);
  const [resultMsg, setResultMsg] = useState("");

  const canEarnMore = minigameTokensEarnedToday < maxDailyMinigameTokens;

  const handleFinish = (isWin: boolean, msg: string) => {
    setSuccess(isWin);
    setResultMsg(msg);
    setGameState('result');
    completeMinigame(isWin);
  };

  const resetArcade = () => {
    setGameMode('lobby');
    setGameState('playing');
  };

  return (
    <div className="flex-col animate-pop" style={{ paddingBottom: 20 }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="flex items-center gap-3" style={{ color: '#805AD5', margin: 0 }}>
          <Gamepad2 size={28} /> Agro-Arcade
        </h2>
        <div className="chip" style={{ background: '#E9D8FD', color: '#553C9A', border: '1px solid #B794F4', display: 'flex', gap: 6, alignItems: 'center', padding: '10px 16px', borderRadius: '14px' }}>
          Bonus: {minigameTokensEarnedToday} / {maxDailyMinigameTokens} <Coins size={16} />
        </div>
      </div>

      {gameMode === 'lobby' && (
        <div className="flex-col gap-4">
          <GameCard 
            title="Agro-Knowledge Quiz" 
            desc="Test your farming wisdom." 
            icon={<HelpCircle size={32} color="#805AD5" />} 
            onClick={() => setGameMode('quiz')}
          />
          <GameCard 
            title="Pest Patrol" 
            desc="Squash the bugs spreading disease!" 
            icon={<Bug size={32} color="#D53F8C" />} 
            onClick={() => setGameMode('pest')}
          />
          <GameCard 
            title="Eco-Balance" 
            desc="Sync the energy for peak growth." 
            icon={<Waves size={32} color="#3182CE" />} 
            onClick={() => setGameMode('balance')}
          />
          
          <div className="glass-panel mt-4" style={{ background: 'rgba(128, 90, 213, 0.05)', border: '1px dashed #805AD5' }}>
            <p className="text-xs text-muted text-center m-0">
              Win any game to earn **1 Token**. You can earn up to {maxDailyMinigameTokens} tokens daily.
            </p>
          </div>
        </div>
      )}

      {gameMode === 'quiz' && (
        <QuizGame onFinish={handleFinish} onReset={resetArcade} state={gameState} success={success} msg={resultMsg} tokens={player.tokens} canEarnMore={canEarnMore} />
      )}

      {gameMode === 'pest' && (
        <PestGame onFinish={handleFinish} onReset={resetArcade} state={gameState} success={success} msg={resultMsg} tokens={player.tokens} canEarnMore={canEarnMore} />
      )}

      {gameMode === 'balance' && (
        <BalanceGame onFinish={handleFinish} onReset={resetArcade} state={gameState} success={success} msg={resultMsg} tokens={player.tokens} canEarnMore={canEarnMore} />
      )}
    </div>
  );
};

// Sub-Components
const GameCard: React.FC<{title: string, desc: string, icon: React.ReactNode, onClick: () => void}> = ({ title, desc, icon, onClick }) => (
  <button className="glass-panel flex items-center gap-4 w-full text-left animate-pop" onClick={onClick} style={{ padding: '20px' }}>
    <div style={{ background: '#F7FAFC', padding: '16px', borderRadius: '16px' }}>{icon}</div>
    <div>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>{title}</h3>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>{desc}</p>
    </div>
  </button>
);

const ResultScreen: React.FC<{success: boolean, msg: string, tokens: number, canEarnMore: boolean, onReset: () => void}> = ({ success, msg, tokens, canEarnMore, onReset }) => (
  <div className="glass-panel text-center p-8 animate-pop">
    {success ? <Trophy size={64} color="var(--success)" className="mx-auto mb-4" /> : <AlertCircle size={64} color="var(--danger)" className="mx-auto mb-4" />}
    <h3 style={{ color: success ? 'var(--success)' : 'var(--danger)', fontSize: '1.5rem', marginBottom: 8 }}>{success ? 'Success!' : 'Failed!'}</h3>
    <p className="text-sm mb-6">{msg} {success && !canEarnMore && "(Daily limit reached)"}</p>
    <div className="p-4 rounded-xl mb-6 bg-[#F7FAFC]">
       Balance: <strong>{tokens} Tokens</strong>
    </div>
    <button className="btn btn-outline w-full flex items-center justify-center gap-2" onClick={onReset}>
       <RefreshCcw size={16} /> Back to Lobby
    </button>
  </div>
);

// --- Game 1: Quiz ---
const QuizGame: React.FC<{onFinish: (win: boolean, m: string) => void, onReset: () => void, state: any, success: boolean, msg: string, tokens: number, canEarnMore: boolean}> = (props) => {
  const q = {
    q: "If the temperature is 28°C and humidity is high, what ventilation is best?",
    options: [
      { text: "Low Ventilation", correct: false },
      { text: "High Ventilation", correct: true },
      { text: "Keep Air Tight", correct: false }
    ],
    exp: "High ventilation helps reduce humidity and temperature, preventing heat stress."
  };

  if (props.state === 'result') return <ResultScreen {...props} />;

  return (
    <div className="glass-panel p-6 animate-pop text-center">
       <HelpCircle size={48} color="#805AD5" className="mx-auto mb-4" />
       <p className="mb-6 font-bold" style={{ fontSize: '1.1rem' }}>{q.q}</p>
       <div className="flex-col gap-3">
         {q.options.map((opt, i) => (
           <button key={i} className="btn btn-outline w-full p-4" onClick={() => props.onFinish(opt.correct, opt.correct ? "Great agricultural knowledge!" : q.exp)}>
             {opt.text}
           </button>
         ))}
       </div>
    </div>
  );
};

// --- Game 2: Pest Patrol ---
const PestGame: React.FC<{onFinish: (win: boolean, m: string) => void, onReset: () => void, state: any, success: boolean, msg: string, tokens: number, canEarnMore: boolean}> = (props) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [bugPos, setBugPos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    if (props.state === 'result') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          props.onFinish(score >= 8, `Points: ${score}. ${score >= 8 ? "Yard is clean!" : "Too many bugs left!"}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const bugTimer = setInterval(() => {
       setBugPos({ x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 });
    }, 800);

    return () => { clearInterval(timer); clearInterval(bugTimer); };
  }, [props.state, score]);

  if (props.state === 'result') return <ResultScreen {...props} />;

  return (
    <div className="glass-panel p-6 animate-pop text-center">
       <div className="flex justify-between mb-4">
          <div className="chip status-caution">Score: {score} / 8</div>
          <div className="chip status-danger">Time: {timeLeft}s</div>
       </div>
       <div className="relative w-full" style={{ height: '240px', background: '#F0FFF4', borderRadius: '16px', overflow: 'hidden', border: '2px solid #C6F6D5' }}>
          <button 
            style={{ 
              position: 'absolute', 
              left: `${bugPos.x}%`, 
              top: `${bugPos.y}%`, 
              transform: 'translate(-50%, -50%)',
              background: 'none', border: 'none', cursor: 'pointer', padding: 10
            }}
            onMouseDown={() => { setScore(s => s + 1); setBugPos({ x: Math.random() * 80 + 10, y: Math.random() * 80 + 10 }); }}
          >
             <Bug size={32} color="#D53F8C" />
          </button>
       </div>
       <p className="text-xs text-muted mt-4">Tap 8 bugs to win!</p>
    </div>
  );
};

// --- Game 3: Eco-Balance ---
const BalanceGame: React.FC<{onFinish: (win: boolean, m: string) => void, onReset: () => void, state: any, success: boolean, msg: string, tokens: number, canEarnMore: boolean}> = (props) => {
  const [needle, setNeedle] = useState(50);
  const [combo, setCombo] = useState(0);
  const direction = useRef(1);

  useEffect(() => {
    if (props.state === 'result') return;
    const interval = setInterval(() => {
       setNeedle(prev => {
         let next = prev + (4 * direction.current);
         if (next >= 95 || next <= 5) direction.current *= -1;
         return next;
       });
    }, 30);
    return () => clearInterval(interval);
  }, [props.state]);

  const handleStop = () => {
    const isOk = needle >= 40 && needle <= 60;
    if (isOk) {
      if (combo >= 2) props.onFinish(true, "Perfect balance achieved!");
      else setCombo(c => c + 1);
    } else {
      props.onFinish(false, "Balance lost. Try again!");
    }
  };

  if (props.state === 'result') return <ResultScreen {...props} />;

  return (
    <div className="glass-panel p-8 animate-pop text-center">
       <div className="flex justify-center mb-8">
          {[1,2,3].map(i => (
             <Zap key={i} size={32} color={combo >= i ? "#ECC94B" : "#E2E8F0"} style={{ margin: '0 4px' }} />
          ))}
       </div>
       <div className="relative w-full h-8 bg-[#E2E8F0] rounded-full mb-8">
          <div style={{ position: 'absolute', left: '40%', width: '20%', height: '100%', background: 'var(--success)', opacity: 0.3, borderRadius: '4px' }}></div>
          <div style={{ 
            position: 'absolute', 
            left: `${needle}%`, 
            width: '4px', 
            height: '140%', 
            background: 'var(--primary)', 
            top: '-20%',
            borderRadius: '2px',
            boxShadow: '0 0 8px rgba(255, 75, 114, 0.5)'
          }}></div>
       </div>
       <button className="btn btn-primary w-full p-6" onClick={handleStop} style={{ fontSize: '1.2rem' }}>
          SYNC ENERGY
       </button>
       <p className="text-xs text-muted mt-4">Stop the needle in the green zone 3 times!</p>
    </div>
  );
};
