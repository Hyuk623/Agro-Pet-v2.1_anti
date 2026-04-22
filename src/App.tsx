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
  const { startGame } = useGame();
  const [name, setName] = React.useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(name.trim() !== '') {
      startGame(name.trim());
    }
  };

  return (
    <div className="flex-col items-center justify-center p-4 app-container" style={{ textAlign: 'center', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: 360 }}>
        <h1 className="mb-4" style={{ color: 'var(--primary)' }}>Agro Buddy</h1>
        <p className="mb-4 text-muted">A strawberry farming adventure</p>
        
        <form onSubmit={onSubmit}>
           <input 
             className="input-field mb-4 text-center" 
             placeholder="Give your crop a name..." 
             value={name} 
             onChange={e => setName(e.target.value)} 
             autoFocus 
             maxLength={15}
           />
           <button className="btn btn-primary w-full p-4" disabled={name.trim() === ''} type="submit">
             Start Growing
           </button>
        </form>
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
