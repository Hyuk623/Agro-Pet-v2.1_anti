import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Gamepad2, Coins, HelpCircle, Trophy, AlertCircle, RefreshCcw } from 'lucide-react';

export const ArcadeScreen: React.FC = () => {
  const { state, completeMinigame } = useGame();
  const { minigameTokensEarnedToday, maxDailyMinigameTokens, player } = state;
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'result'>('lobby');
  const [correct, setCorrect] = useState(false);

  const canEarnMore = minigameTokensEarnedToday < maxDailyMinigameTokens;

  // Simple quiz logic for the prototype
  const questions = [
    {
      q: "If the temperature is 28°C and humidity is high, what ventilation is best?",
      options: [
        { text: "Low Ventilation", correct: false },
        { text: "High Ventilation", correct: true },
        { text: "Keep Air Tight", correct: false }
      ],
      explanation: "High ventilation helps reduce humidity and temperature, preventing heat stress and disease risk."
    }
  ];

  const [currentQ] = useState(questions[0]);

  const handleAnswer = (isCorrect: boolean) => {
    setCorrect(isCorrect);
    setGameState('result');
    // We call the context function to handle token payout & stats
    completeMinigame(isCorrect);
  };

  const resetGame = () => {
    setGameState('lobby');
  };

  return (
    <div className="flex-col p-4 animate-pop" style={{ marginBottom: 80 }}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="flex items-center gap-2" style={{ color: '#805AD5', margin: 0 }}>
          <Gamepad2 size={28} /> Arcade
        </h2>
        <div className="chip" style={{ background: '#E9D8FD', color: '#553C9A', border: '1px solid #553C9A', display: 'flex', gap: 6, alignItems: 'center' }}>
          Today: {minigameTokensEarnedToday} / {maxDailyMinigameTokens} <Coins size={14} />
        </div>
      </div>

      <div className="glass-panel text-center p-6">
        {gameState === 'lobby' && (
          <div className="animate-pop">
            <Trophy size={64} color="#D69E2E" className="mb-4 mx-auto" />
            <h3 className="mb-2">Crop Knowledge Quiz</h3>
            <p className="text-muted mb-6 text-sm">
              Answer agricultural questions correctly to earn tokens! 
              {canEarnMore 
                ? " You can still earn tokens today." 
                : " You've reached your daily limit, but can still play for practice."}
            </p>
            <button className="btn btn-primary w-full p-4" onClick={() => setGameState('playing')}>
              Play Mini-game
            </button>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="animate-pop">
            <HelpCircle size={48} color="#805AD5" className="mb-4 mx-auto" />
            <p className="mb-6" style={{ fontWeight: 600, fontSize: '1.1rem' }}>{currentQ.q}</p>
            
            <div className="flex-col gap-3">
              {currentQ.options.map((opt, i) => (
                <button 
                  key={i} 
                  className="btn btn-outline w-full" 
                  style={{ border: '2px solid #E2E8F0', padding: '12px' }}
                  onClick={() => handleAnswer(opt.correct)}
                >
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {gameState === 'result' && (
          <div className="animate-pop">
            {correct ? (
              <>
                <Trophy size={64} color="var(--success)" className="mb-4 mx-auto" />
                <h3 className="mb-2" style={{ color: 'var(--success)' }}>Correct!</h3>
                <p className="text-sm mb-4">
                  {canEarnMore 
                    ? "Great job! You earned 1 token for your agricultural wisdom." 
                    : "Correct! Your knowledge is growing, even though you've hit the daily token limit."}
                </p>
              </>
            ) : (
              <>
                <AlertCircle size={64} color="var(--danger)" className="mb-4 mx-auto" />
                <h3 className="mb-2" style={{ color: 'var(--danger)' }}>Incorrect!</h3>
                <p className="text-sm mb-4">{currentQ.explanation}</p>
              </>
            )}

            <div className="p-4 rounded-xl mb-6" style={{ background: 'var(--bg-color)', fontSize: '0.9rem' }}>
              Current Balance: <strong>{player.tokens} Tokens</strong>
            </div>

            <button className="btn btn-outline w-full flex items-center justify-center gap-2" onClick={resetGame}>
              <RefreshCcw size={16} /> Play Again
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 rounded-xl" style={{ border: '1px solid #E2E8F0', background: 'rgba(255,255,255,0.5)' }}>
        <h4 style={{ fontSize: '0.9rem', marginBottom: 8, color: 'var(--text-main)' }}>Rules & Rewards</h4>
        <ul style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingLeft: '1.2rem', gap: 4, display: 'flex', flexDirection: 'column' }}>
          <li>Each correct answer rewards <strong>1 Token</strong>.</li>
          <li>Daily income is capped at <strong>{maxDailyMinigameTokens} Tokens</strong> to maintain game balance.</li>
          <li>Limits are reset every time a <strong>New Day</strong> begins on the Farm.</li>
        </ul>
      </div>
    </div>
  );
};
