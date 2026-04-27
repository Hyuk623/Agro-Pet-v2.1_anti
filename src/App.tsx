import React from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { EnvironmentBoard } from './components/EnvironmentBoard';
import { CropVisual } from './components/CropVisual';
import { StatusPanel } from './components/StatusPanel';
import { ActionControls } from './components/ActionControls';
import { DeathModal, FeedbackModal, MinigameModal } from './components/GameModals';
import { Coins } from 'lucide-react';
import { BottomNav } from './components/BottomNav';
import { ShopScreen } from './components/ShopScreen';
import { ArcadeScreen } from './components/ArcadeScreen';

const SetupScreen: React.FC = () => {
  const { startGame, state } = useGame();
  const [name, setName] = React.useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(name.trim() !== '') {
      startGame(name.trim());
    }
  };

  return (
    <div className="flex-col items-center justify-center p-4 app-container" style={{ 
      textAlign: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #F6AD55 0%, #F687B3 100%)',
      minHeight: '100vh'
    }}>
      {/* Decorative Floating Elements */}
      <div className="animate-sway" style={{ position: 'absolute', top: '10%', left: '10%', fontSize: '2rem', opacity: 0.3 }}>🍓</div>
      <div className="animate-sway" style={{ position: 'absolute', bottom: '20%', right: '10%', fontSize: '2.5rem', opacity: 0.3, animationDelay: '1s' }}>🌿</div>
      
      <div className="glass-panel animate-pop" style={{ 
        width: '100%', 
        maxWidth: 380, 
        padding: '40px 30px',
        borderRadius: '30px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        border: '1px solid rgba(255,255,255,0.4)',
        background: 'rgba(255,255,255,0.85)'
      }}>
        {/* Character Branding */}
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
          textShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>Agro Buddy</h1>
        
        <p style={{ 
          color: '#718096', 
          fontSize: '1rem', 
          fontWeight: 600, 
          marginBottom: 30,
          letterSpacing: '0.5px'
        }}>Start your secret garden journey today</p>
        
        <form onSubmit={onSubmit}>
           <div style={{ position: 'relative', marginBottom: 20 }}>
             <input 
               className="input-field text-center" 
               placeholder="What is your crop's nickname?" 
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
                 color: '#D53F8C'
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
               color: '#fff'
             }}
           >
             Grow My Pet
           </button>
        </form>
        
        <div style={{ marginTop: 25, fontSize: '0.75rem', color: '#A0AEC0', fontWeight: 600 }}>
           v2.1 CHARACTER EDITION
        </div>
      </div>
    </div>
  );
};

const FarmScreen: React.FC = () => {
  return (
    <div className="animate-pop" style={{ marginBottom: 80 }}>
      <EnvironmentBoard />
      <CropVisual />
      <StatusPanel />
      <ActionControls />
    </div>
  );
};

const MainGameScreen: React.FC = () => {
  const { state } = useGame();
  const { currentPage } = state;

  return (
    <div className="app-container p-4">
      {/* Top Bar - Common to all play screens */}
      <div className="flex justify-between items-center mb-4">
         <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--primary)' }}>Agro Buddy</div>
         <div className="chip" style={{ background: '#FEFCBF', color: '#D69E2E', border: '1px solid #D69E2E', display: 'flex', gap: 6, alignItems: 'center' }}>
            <Coins size={16} /> {state.player.tokens}
         </div>
      </div>

      {/* Conditional Rendering based on current page */}
      {currentPage === 'farm' && <FarmScreen />}
      {currentPage === 'shop' && <ShopScreen />}
      {currentPage === 'arcade' && <ArcadeScreen />}

      <BottomNav />

      {/* Global Modals */}
      <FeedbackModal />
      <DeathModal />
      <MinigameModal />
    </div>
  );
};

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
