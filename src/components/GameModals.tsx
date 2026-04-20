import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { AlertCircle, RotateCcw, ShieldAlert, Sparkles, BookOpen } from 'lucide-react';

export const DeathModal: React.FC = () => {
  const { state, recoverFromCheckpoint } = useGame();
  const { deathReason, player } = state;

  if (!deathReason) return null;

  const handleRestart = () => {
    window.location.reload(); // Simple prototype reset
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel animate-pop p-4" style={{ background: '#fff', maxWidth: 400, width: '100%', border: '2px solid var(--danger)' }}>
        <div className="text-center mb-4">
           <ShieldAlert size={48} color="var(--danger)" style={{ margin: '0 auto' }}/>
           <h2 className="mt-2" style={{ color: 'var(--danger)' }}>Crop Died!</h2>
           <p style={{ fontWeight: 600 }}>{deathReason.main}</p>
        </div>

        <div className="mb-4 text-center">
           <div className="chip status-danger mb-2">Cause: {deathReason.secondary}</div>
           <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{deathReason.actions}</p>
        </div>

        <div className="bg-[#E6FFFA] p-3 rounded-xl mb-4 text-sm" style={{ border: '1px solid #319795' }}>
           <h4 className="flex items-center gap-2 mb-1" style={{ color: '#2C7A7B' }}><BookOpen size={16}/> Learning Note</h4>
           <div style={{ color: '#285E61' }}>{deathReason.lesson}</div>
        </div>

        <div className="flex-col gap-2">
           <button 
             className="btn btn-primary" 
             onClick={recoverFromCheckpoint}
             disabled={player.tokens < 2}
           >
              Use 2 Tokens to Recover Checkpoint ({player.tokens} left)
           </button>
           <button className="btn btn-outline" onClick={handleRestart}>
              <RotateCcw size={16} /> Start New Crop
           </button>
        </div>
      </div>
    </div>
  );
};

export const FeedbackModal: React.FC = () => {
  const { state, closeFeedback } = useGame();
  const { dayFeedback } = state;

  if (!dayFeedback) return null;

  return (
    <div className="modal-overlay">
      <div className="glass-panel animate-pop p-4 text-center" style={{ background: '#fff', border: dayFeedback.isWarning ? '2px solid var(--warning)' : '2px solid var(--success)', maxWidth: 300 }}>
         {dayFeedback.isWarning ? <AlertCircle size={40} color="var(--warning)" className="mb-2 mx-auto" /> : <Sparkles size={40} color="var(--success)" className="mb-2 mx-auto" />}
         <h3 className="mb-2" style={{ color: dayFeedback.isWarning ? 'var(--warning)' : 'var(--text-main)' }}>{dayFeedback.title}</h3>
         <p className="mb-4 text-sm text-gray-600">{dayFeedback.desc}</p>
         
         {dayFeedback.tokensGained && dayFeedback.tokensGained > 0 ? (
            <div className="chip mb-4" style={{ background: '#FEFCBF', color: '#B7791F' }}>
               +{dayFeedback.tokensGained} Token{dayFeedback.tokensGained > 1 ? 's' : ''}!
            </div>
         ) : null}

         <button className="btn w-full text-white" style={{ background: dayFeedback.isWarning ? 'var(--warning)' : 'var(--primary)' }} onClick={closeFeedback}>
            Continue
         </button>
      </div>
    </div>
  );
};

export const MinigameModal: React.FC = () => {
  const { state, completeMinigame } = useGame();
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);

  if (!state.minigameActive) return null;

  // Static simple prototype minigame
  const handleAnswer = (isCorrect: boolean) => {
    setAnswered(true);
    setCorrect(isCorrect);
    setTimeout(() => {
       completeMinigame(isCorrect);
       setAnswered(false);
    }, 1500);
  };

  return (
    <div className="modal-overlay">
      <div className="glass-panel animate-pop p-4 text-center" style={{ background: '#fff', border: '2px solid #805AD5', maxWidth: 320 }}>
         <h2 className="mb-2" style={{ color: '#805AD5' }}>Quick Knowledge!</h2>
         <p className="mb-4 text-sm">If the environment temperature is 3°C, what is the best heating response?</p>
         
         {!answered ? (
           <div className="flex-col gap-2">
             <button className="btn" style={{ background: '#EDF2F7', color: '#2D3748' }} onClick={() => handleAnswer(false)}>Low Heat</button>
             <button className="btn btn-secondary" style={{ background: '#805AD5', color: '#fff' }} onClick={() => handleAnswer(true)}>High Heat</button>
             <button className="btn" style={{ background: '#EDF2F7', color: '#2D3748' }} onClick={() => handleAnswer(false)}>Ventilation Max</button>
           </div>
         ) : (
           <div className="p-4 rounded-xl" style={{ background: correct ? '#F0FFF4' : '#FED7D7', color: correct ? '#38A169' : '#E53E3E', fontWeight: 'bold' }}>
             {correct ? "Correct! +1 Token" : "Incorrect! 3°C can cause cold stress."}
           </div>
         )}
      </div>
    </div>
  );
};
