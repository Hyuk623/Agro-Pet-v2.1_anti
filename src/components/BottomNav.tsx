import React from 'react';
import { useGame } from '../context/GameContext';
import { Home, ShoppingBag, Gamepad2 } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { state, setCurrentPage } = useGame();
  const { currentPage } = state;

  return (
    <div className="glass-panel" style={{ 
      position: 'fixed', 
      bottom: 0, 
      left: 0, 
      right: 0, 
      margin: 0, 
      borderRadius: '16px 16px 0 0',
      padding: '8px 20px',
      display: 'flex',
      justifyContent: 'space-around',
      zIndex: 50,
      borderTop: '1px solid var(--glass-border)'
    }}>
      <button 
        className="flex-col items-center justify-center gap-1"
        onClick={() => setCurrentPage('farm')}
        style={{ 
          background: 'none', 
          border: 'none', 
          color: currentPage === 'farm' ? 'var(--primary)' : 'var(--text-muted)',
          cursor: 'pointer',
          flex: 1,
          transition: 'all 0.2s'
        }}
      >
        < Home size={24} />
        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Farm</span>
      </button>

      <button 
        className="flex-col items-center justify-center gap-1"
        onClick={() => setCurrentPage('arcade')}
        style={{ 
          background: 'none', 
          border: 'none', 
          color: currentPage === 'arcade' ? 'var(--primary)' : 'var(--text-muted)',
          cursor: 'pointer',
          flex: 1,
          transition: 'all 0.2s'
        }}
      >
        <Gamepad2 size={24} />
        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Arcade</span>
      </button>

      <button 
        className="flex-col items-center justify-center gap-1"
        onClick={() => setCurrentPage('shop')}
        style={{ 
          background: 'none', 
          border: 'none', 
          color: currentPage === 'shop' ? 'var(--primary)' : 'var(--text-muted)',
          cursor: 'pointer',
          flex: 1,
          transition: 'all 0.2s'
        }}
      >
        <ShoppingBag size={24} />
        <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Shop</span>
      </button>
    </div>
  );
};
