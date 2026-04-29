import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { EnvironmentBoard } from './components/EnvironmentBoard';
import { CropVisual } from './components/CropVisual';
import { StatusPanel } from './components/StatusPanel';
import { ActionControls } from './components/ActionControls';
import { DeathModal, FeedbackModal, MinigameModal } from './components/GameModals';
import { Coins, RefreshCw } from 'lucide-react';
import { BottomNav } from './components/BottomNav';
import { ShopScreen } from './components/ShopScreen';
import { ArcadeScreen } from './components/ArcadeScreen';

// ─── Setup / Welcome Screen ──────────────────────────────────────────────────
const SetupScreen: React.FC = () => {
  const { startGame } = useGame();
  const [name, setName] = React.useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() !== '') startGame(name.trim());
  };

  return (
    <div className="flex-col items-center justify-center p-4 app-container" style={{
      textAlign: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #F6AD55 0%, #F687B3 100%)',
      minHeight: '100vh'
    }}>
      {/* Decorative floats */}
      <div className="animate-sway" style={{ position: 'absolute', top: '10%', left: '10%', fontSize: '2rem', opacity: 0.3 }}>🍓</div>
      <div className="animate-sway" style={{ position: 'absolute', bottom: '20%', right: '10%', fontSize: '2.5rem', opacity: 0.3, animationDelay: '1s' }}>🌿</div>

      <div className="glass-panel animate-pop" style={{
        width: '100%',
        maxWidth: 380,
        padding: '40px 30px',
        borderRadius: '30px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        border: '1px solid rgba(255,255,255,0.4)',
        background: 'rgba(255,255,255,0.9)'
      }}>
        {/* Character */}
        <div className="animate-bounce" style={{ marginBottom: 20 }}>
          <div style={{ fontSize: '6rem', lineHeight: 1, position: 'relative' }}>
            🌱
            <div className="char-face" style={{ top: '60%' }}>
              <div className="char-eyes">
                <div className="char-eye"></div>
                <div className="char-eye"></div>
              </div>
              <div className="char-mouth"></div>
            </div>
          </div>
        </div>

        <h1 style={{
          color: '#FF4B72',
          fontSize: '2.8rem',
          fontWeight: 900,
          margin: '0 0 10px 0',
          letterSpacing: '-1.5px',
        }}>
          Agro Buddy
        </h1>

        <p style={{ color: '#718096', fontSize: '0.95rem', fontWeight: 600, marginBottom: 30 }}>
          나만의 작물 친구를 키워보세요 🌸
        </p>

        <form onSubmit={onSubmit}>
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <input
              className="input-field text-center"
              placeholder="작물의 이름을 지어주세요"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              maxLength={15}
              style={{
                padding: '18px',
                fontSize: '1.1rem',
                borderRadius: '15px',
                border: '2px solid #FED7E2',
                backgroundColor: '#FFF5F7',
                fontWeight: 700,
                color: '#D53F8C',
                width: '100%',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            className="btn btn-primary w-full animate-pulse"
            disabled={name.trim() === ''}
            type="submit"
            style={{
              padding: '20px',
              fontSize: '1.2rem',
              fontWeight: 900,
              borderRadius: '18px',
              background: 'linear-gradient(to right, #FF4B72, #F687B3)',
              boxShadow: '0 8px 20px rgba(255, 75, 114, 0.4)',
              border: 'none',
              color: '#fff',
              width: '100%',
            }}
          >
            🌱 작물 키우기 시작!
          </button>
        </form>

        <div style={{ marginTop: 25, fontSize: '0.75rem', color: '#A0AEC0', fontWeight: 600 }}>
          v2.1 CHARACTER EDITION
        </div>
      </div>
    </div>
  );
};

// ─── Farm Screen ─────────────────────────────────────────────────────────────
const FarmScreen: React.FC = () => (
  <div className="animate-pop" style={{ marginBottom: 80 }}>
    <EnvironmentBoard />
    <CropVisual />
    <StatusPanel />
    <ActionControls />
  </div>
);

// ─── Main Game Shell ──────────────────────────────────────────────────────────
const MainGameScreen: React.FC = () => {
  const { state, resetGame } = useGame();
  const { currentPage } = state;
  const [showResetConfirm, setShowResetConfirm] = React.useState(false);

  return (
    <div className="app-container p-4">
      {/* Top Bar */}
      <div className="flex justify-between items-center mb-4">
        <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary)' }}>
          🌱 {state.crop.name || 'Agro Buddy'}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div className="chip" style={{
            background: '#FEFCBF', color: '#D69E2E',
            border: '1px solid #D69E2E', display: 'flex',
            gap: 6, alignItems: 'center'
          }}>
            <Coins size={16} /> {state.player.tokens}
          </div>
          <button
            onClick={() => setShowResetConfirm(true)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: 4, color: '#CBD5E0', borderRadius: 8
            }}
            title="게임 초기화"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Reset confirm mini-prompt */}
      {showResetConfirm && (
        <div style={{
          background: '#FFF5F5', border: '1.5px solid #FEB2B2',
          borderRadius: 12, padding: '12px 16px', marginBottom: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8
        }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#C53030' }}>
            정말 초기화할까요? 저장된 진행도가 삭제됩니다.
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => { resetGame(); setShowResetConfirm(false); }}
              style={{
                background: '#E53E3E', color: '#fff', border: 'none',
                borderRadius: 8, padding: '4px 10px', fontSize: '0.75rem',
                fontWeight: 700, cursor: 'pointer'
              }}
            >
              초기화
            </button>
            <button
              onClick={() => setShowResetConfirm(false)}
              style={{
                background: '#EDF2F7', color: '#718096', border: 'none',
                borderRadius: 8, padding: '4px 10px', fontSize: '0.75rem',
                fontWeight: 700, cursor: 'pointer'
              }}
            >
              취소
            </button>
          </div>
        </div>
      )}

      {/* Page content */}
      {currentPage === 'farm'    && <FarmScreen />}
      {currentPage === 'shop'    && <ShopScreen />}
      {currentPage === 'arcade'  && <ArcadeScreen />}

      <BottomNav />

      {/* Global Modals */}
      <FeedbackModal />
      <DeathModal />
      <MinigameModal />
    </div>
  );
};

// ─── Root ─────────────────────────────────────────────────────────────────────
const AppContent: React.FC = () => {
  const { state } = useGame();
  return state.hasStarted ? <MainGameScreen /> : <SetupScreen />;
};

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

export default App;
