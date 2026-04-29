import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { Gamepad2, Coins, HelpCircle, Trophy, AlertCircle, RefreshCcw, Bug, Target, Zap, Waves, ThermometerSun, Scissors } from 'lucide-react';

type GameMode = 'lobby' | 'quiz' | 'pest' | 'balance' | 'temp' | 'harvest';

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
          <Gamepad2 size={28} /> 오락실
        </h2>
        <div className="chip" style={{ background: '#E9D8FD', color: '#553C9A', border: '1px solid #B794F4', display: 'flex', gap: 6, alignItems: 'center', padding: '10px 16px', borderRadius: '14px' }}>
          보너스: {minigameTokensEarnedToday} / {maxDailyMinigameTokens} <Coins size={16} />
        </div>
      </div>

      {gameMode === 'lobby' && (
        <div className="flex-col gap-4">
          <GameCard 
            title="농업 상식 퀴즈" 
            desc="간단한 퀴즈로 농업 지식을 키워요." 
            icon={<HelpCircle size={32} color="#805AD5" />} 
            onClick={() => setGameMode('quiz')}
          />
          <GameCard 
            title="온도 맞추기" 
            desc="딸기가 좋아하는 온도로 조절하세요." 
            icon={<ThermometerSun size={32} color="#DD6B20" />} 
            onClick={() => setGameMode('temp')}
          />
          <GameCard 
            title="수확 타이밍" 
            desc="딸기가 가장 맛있게 익었을 때 수확하세요!" 
            icon={<Scissors size={32} color="#E53E3E" />} 
            onClick={() => setGameMode('harvest')}
          />
          <GameCard 
            title="해충 잡기" 
            desc="화면을 터치해서 해충을 잡으세요!" 
            icon={<Bug size={32} color="#D53F8C" />} 
            onClick={() => setGameMode('pest')}
          />
          <GameCard 
            title="에너지 균형" 
            desc="녹색 영역에 맞춰 에너지를 동기화하세요." 
            icon={<Waves size={32} color="#3182CE" />} 
            onClick={() => setGameMode('balance')}
          />
          
          <div className="glass-panel mt-4" style={{ background: 'rgba(128, 90, 213, 0.05)', border: '1px dashed #805AD5' }}>
            <p className="text-xs text-muted text-center m-0">
              게임을 클리어하면 **1 토큰**을 얻습니다. 하루 최대 {maxDailyMinigameTokens}개의 토큰을 획득할 수 있습니다.
            </p>
          </div>
        </div>
      )}

      {gameMode === 'quiz' && <QuizGame onFinish={handleFinish} onReset={resetArcade} state={gameState} success={success} msg={resultMsg} tokens={player.tokens} canEarnMore={canEarnMore} />}
      {gameMode === 'pest' && <PestGame onFinish={handleFinish} onReset={resetArcade} state={gameState} success={success} msg={resultMsg} tokens={player.tokens} canEarnMore={canEarnMore} />}
      {gameMode === 'balance' && <BalanceGame onFinish={handleFinish} onReset={resetArcade} state={gameState} success={success} msg={resultMsg} tokens={player.tokens} canEarnMore={canEarnMore} />}
      {gameMode === 'temp' && <TempGame onFinish={handleFinish} onReset={resetArcade} state={gameState} success={success} msg={resultMsg} tokens={player.tokens} canEarnMore={canEarnMore} />}
      {gameMode === 'harvest' && <HarvestGame onFinish={handleFinish} onReset={resetArcade} state={gameState} success={success} msg={resultMsg} tokens={player.tokens} canEarnMore={canEarnMore} />}
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
    <h3 style={{ color: success ? 'var(--success)' : 'var(--danger)', fontSize: '1.5rem', marginBottom: 8 }}>{success ? '성공!' : '실패!'}</h3>
    <p className="text-sm mb-6">{msg} {success && !canEarnMore && "(일일 한도 초과)"}</p>
    <div className="p-4 rounded-xl mb-6 bg-[#F7FAFC]">
       보유 토큰: <strong>{tokens} 개</strong>
    </div>
    <button className="btn btn-outline w-full flex items-center justify-center gap-2" onClick={onReset}>
       <RefreshCcw size={16} /> 로비로 돌아가기
    </button>
  </div>
);

// --- Game 1: Quiz ---
const QuizGame: React.FC<any> = (props) => {
  const [qIndex] = useState(Math.floor(Math.random() * 3));
  const questions = [
    {
      q: "외부 기온이 3°C일 때 딸기에 가장 적합한 대응은?",
      options: [
        { text: "낮은 가온 (Low Heat)", correct: false },
        { text: "강한 가온 (High Heat)", correct: true },
        { text: "환기 최대 (Max Vent)", correct: false }
      ],
      exp: "3°C의 저온에서는 냉해를 막기 위해 강한 가온이 필요합니다."
    },
    {
      q: "딸기가 자라기 가장 좋은 최적 온도는 대략 얼마일까요?",
      options: [
        { text: "5 ~ 10°C", correct: false },
        { text: "15 ~ 25°C", correct: true },
        { text: "30 ~ 35°C", correct: false }
      ],
      exp: "딸기는 서늘한 기후를 좋아하여 15~25°C에서 가장 잘 자랍니다."
    },
    {
      q: "습도가 너무 높고 물이 많을 때 발생할 수 있는 문제는?",
      options: [
        { text: "곰팡이 등 병해 위험 증가", correct: true },
        { text: "생장 속도 폭발적 증가", correct: false },
        { text: "수분 스트레스 감소", correct: false }
      ],
      exp: "과습한 환경은 곰팡이병 발생을 크게 높이므로 환기가 필요합니다."
    }
  ];
  
  const q = questions[qIndex];

  if (props.state === 'result') return <ResultScreen {...props} />;

  return (
    <div className="glass-panel p-6 animate-pop text-center">
       <HelpCircle size={48} color="#805AD5" className="mx-auto mb-4" />
       <p className="mb-6 font-bold" style={{ fontSize: '1.1rem', wordBreak: 'keep-all' }}>{q.q}</p>
       <div className="flex-col gap-3">
         {q.options.map((opt: any, i: number) => (
           <button key={i} className="btn btn-outline w-full p-4" onClick={() => props.onFinish(opt.correct, opt.correct ? "정답입니다!" : q.exp)}>
             {opt.text}
           </button>
         ))}
       </div>
    </div>
  );
};

// --- Game 2: Pest Patrol ---
const PestGame: React.FC<any> = (props) => {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [bugPos, setBugPos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    if (props.state === 'result') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          props.onFinish(score >= 8, `점수: ${score}. ${score >= 8 ? "성공적으로 해충을 막았습니다!" : "해충을 다 잡지 못했어요!"}`);
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
          <div className="chip status-caution">잡은 수: {score} / 8</div>
          <div className="chip status-danger">시간: {timeLeft}초</div>
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
       <p className="text-xs text-muted mt-4">10초 안에 8마리의 해충을 터치해서 잡으세요!</p>
    </div>
  );
};

// --- Game 3: Eco-Balance ---
const BalanceGame: React.FC<any> = (props) => {
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
      if (combo >= 2) props.onFinish(true, "완벽한 에너지 밸런스를 맞췄습니다!");
      else setCombo(c => c + 1);
    } else {
      props.onFinish(false, "균형이 무너졌습니다. 다시 시도해보세요!");
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
          동기화 (SYNC)
       </button>
       <p className="text-xs text-muted mt-4">바늘이 녹색 구간에 왔을 때 멈춰서 3번 성공하세요!</p>
    </div>
  );
};

// --- Game 4: Temp Match ---
const TempGame: React.FC<any> = (props) => {
  const [temp, setTemp] = useState(10);
  const target = 20;

  if (props.state === 'result') return <ResultScreen {...props} />;

  const submit = () => {
    if (temp >= 18 && temp <= 22) {
      props.onFinish(true, "완벽한 온도 조절입니다! 딸기가 아주 좋아해요.");
    } else {
      props.onFinish(false, `아쉽습니다. 적정 온도는 ${target}°C 근처입니다.`);
    }
  };

  return (
    <div className="glass-panel p-8 animate-pop text-center">
      <ThermometerSun size={48} color="#DD6B20" className="mx-auto mb-4" />
      <h3 className="mb-2">온도 조절기</h3>
      <p className="text-sm text-muted mb-6">딸기가 좋아하는 최적의 온도로 맞추고 확인을 누르세요.</p>
      
      <div className="mb-8" style={{ fontSize: '2rem', fontWeight: 800, color: temp >= 18 && temp <= 22 ? '#48BB78' : '#2D3748' }}>
        {temp}°C
      </div>

      <input 
        type="range" 
        min="0" max="40" 
        value={temp} 
        onChange={(e) => setTemp(Number(e.target.value))}
        className="w-full mb-8"
        style={{ accentColor: '#DD6B20' }}
      />

      <button className="btn btn-primary w-full" onClick={submit}>온도 설정 완료</button>
    </div>
  );
};

// --- Game 5: Harvest Timing ---
const HarvestGame: React.FC<any> = (props) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (props.state === 'result') return;
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(timer);
          props.onFinish(false, "너무 늦게 수확해서 딸기가 물러버렸습니다!");
          return 100;
        }
        return p + 2;
      });
    }, 50);
    return () => clearInterval(timer);
  }, [props.state]);

  const harvest = () => {
    if (progress >= 75 && progress <= 90) {
      props.onFinish(true, "가장 맛있을 때 수확했습니다!");
    } else if (progress < 75) {
      props.onFinish(false, "아직 덜 익었어요. 너무 빨리 수확했습니다.");
    } else {
      props.onFinish(false, "너무 늦게 수확했습니다.");
    }
  };

  if (props.state === 'result') return <ResultScreen {...props} />;

  return (
    <div className="glass-panel p-8 animate-pop text-center">
      <Scissors size={48} color="#E53E3E" className="mx-auto mb-4" />
      <h3 className="mb-2">수확 타이밍</h3>
      <p className="text-sm text-muted mb-6">딸기가 최적으로 익는 구간(녹색)에서 수확 버튼을 누르세요!</p>

      <div className="relative w-full h-8 bg-[#E2E8F0] rounded-full mb-8 overflow-hidden">
        {/* Sweet spot: 75% to 90% */}
        <div style={{ position: 'absolute', left: '75%', width: '15%', height: '100%', background: '#48BB78' }}></div>
        {/* Overripe: 90% to 100% */}
        <div style={{ position: 'absolute', left: '90%', width: '10%', height: '100%', background: '#E53E3E' }}></div>
        
        {/* Progress bar */}
        <div style={{ 
          position: 'absolute', left: 0, top: 0, height: '100%', 
          width: `${progress}%`, background: 'rgba(0,0,0,0.5)', transition: 'width 0.05s linear' 
        }}></div>
      </div>

      <button className="btn w-full" style={{ background: '#E53E3E', color: 'white', fontWeight: 'bold', padding: '16px', fontSize: '1.2rem', borderRadius: '12px' }} onClick={harvest}>
        수확하기!
      </button>
    </div>
  );
};
