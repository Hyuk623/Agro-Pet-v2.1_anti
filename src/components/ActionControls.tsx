import React from 'react';
import { useGame } from '../context/GameContext';
import { Droplet, Thermometer, Wind, Sun, Beaker, Shield, Bug, Flower2, Zap, Leaf } from 'lucide-react';

// ─── Label maps ───────────────────────────────────────────────────────────────
const LEVEL_LABELS: Record<string, string> = { low: '낮음', normal: '보통', high: '높음' };
const SWITCH_LABELS: Record<string, string> = { off: 'OFF', auto: '자동', on: 'ON' };

// ─── Control card definitions ─────────────────────────────────────────────────
const CONTROL_CARDS = [
  { id: 'water',       name: '급수',     icon: <Droplet size={18} />,    options: ['low','normal','high'], color: '#4299E1', labels: LEVEL_LABELS },
  { id: 'heat',        name: '가온',     icon: <Thermometer size={18} />, options: ['low','normal','high'], color: '#F56565', labels: LEVEL_LABELS },
  { id: 'ventilation', name: '환기',     icon: <Wind size={18} />,        options: ['low','normal','high'], color: '#48BB78', labels: LEVEL_LABELS },
  { id: 'light',       name: '보조조명', icon: <Sun size={18} />,         options: ['off','auto','on'],     color: '#ECC94B', labels: SWITCH_LABELS },
];

const ITEM_BUTTONS = [
  { id: 'nutrients',     name: '영양제',  icon: <Beaker  size={13} />, color: 'var(--primary)' },
  { id: 'coldProtectors',name: '방한재',  icon: <Shield  size={13} />, color: 'var(--info)'    },
  { id: 'fertilizer',   name: 'NPK액비', icon: <Flower2 size={13} />, color: '#9F7AEA'        },
  { id: 'pesticide',    name: '방제제',  icon: <Bug     size={13} />, color: '#D53F8C'        },
  { id: 'booster',      name: '성장촉진',icon: <Zap     size={13} />, color: '#ECC94B'        },
];

// ─── Component ────────────────────────────────────────────────────────────────
export const ActionControls: React.FC = () => {
  const { state, updateAction, runDay, useItem, interactWithCrop } = useGame();
  const { actions, player, crop } = state;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* ── 4-grid control cards ───────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
        {CONTROL_CARDS.map(card => {
          const curVal = actions[card.id as keyof typeof actions] as string;
          const isActive = curVal === 'high' || curVal === 'on';
          return (
            <div
              key={card.id}
              className="glass-panel"
              style={{
                margin: 0, padding: '10px 10px 8px',
                borderBottom: `3px solid ${isActive ? card.color : 'transparent'}`,
                transition: 'border-color 0.25s'
              }}
            >
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                color: card.color, marginBottom: 8
              }}>
                {card.icon}
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {card.name}
                </span>
              </div>

              {/* Option buttons */}
              <div style={{
                display: 'flex', gap: 3,
                background: '#F7FAFC', padding: 3, borderRadius: 8
              }}>
                {card.options.map(opt => {
                  const selected = curVal === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => updateAction(card.id as any, opt)}
                      style={{
                        flex: 1, padding: '5px 0', border: 'none',
                        borderRadius: 6,
                        fontSize: '0.68rem', fontWeight: 700,
                        cursor: 'pointer',
                        background: selected ? 'white' : 'transparent',
                        boxShadow: selected ? '0 2px 4px rgba(0,0,0,0.08)' : 'none',
                        color: selected ? card.color : 'var(--text-muted)',
                        transition: 'all 0.18s'
                      }}
                    >
                      {card.labels[opt] ?? opt}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Item inventory bar ─────────────────────────────────────────────── */}
      <div className="glass-panel" style={{ margin: 0 }}>
        <h4 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 10, fontWeight: 700 }}>
          🎒 사용 가능한 자재
        </h4>
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none' }}>
          {ITEM_BUTTONS.map(item => {
            const qty = player.inventory[item.id as keyof typeof player.inventory];
            const hasItem = qty > 0;
            return (
              <button
                key={item.id}
                onClick={() => useItem(item.id as any)}
                disabled={!hasItem}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '7px 11px', whiteSpace: 'nowrap',
                  borderRadius: 10, border: `1.5px solid ${hasItem ? item.color : '#E2E8F0'}`,
                  background: hasItem ? `${item.color}10` : 'transparent',
                  color: hasItem ? 'var(--text-main)' : 'var(--text-muted)',
                  fontSize: '0.72rem', fontWeight: 700,
                  opacity: hasItem ? 1 : 0.5,
                  cursor: hasItem ? 'pointer' : 'not-allowed',
                  transition: 'all 0.18s'
                }}
              >
                {item.icon}
                {item.name}
                <span style={{
                  background: hasItem ? item.color : '#E2E8F0',
                  color: '#fff', borderRadius: 6,
                  fontSize: '0.6rem', fontWeight: 900,
                  padding: '0 5px', lineHeight: '16px'
                }}>
                  {qty}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Play / interact ────────────────────────────────────────────────── */}
      <div className="glass-panel" style={{ margin: 0, border: '2px dashed #FED7E2' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ fontSize: '0.88rem', color: '#D53F8C', margin: 0, fontWeight: 800 }}>
              {crop.name || '친구'}와 놀기 🎈
            </h4>
            <p style={{ fontSize: '0.62rem', color: 'var(--text-muted)', margin: '3px 0 0' }}>
              스트레스 감소 · 친밀도 상승
            </p>
          </div>
          <button
            style={{
              padding: '10px 18px', borderRadius: 12, border: 'none',
              fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer',
              background: actions.play ? '#EDF2F7' : '#F687B3',
              color: actions.play ? '#A0AEC0' : '#fff',
              display: 'flex', alignItems: 'center', gap: 6,
              transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              transform: actions.play ? 'scale(0.97)' : 'scale(1)'
            }}
            onClick={() => interactWithCrop()}
          >
            <Leaf size={14} />
            {actions.play ? '놀아줬어요! ✅' : '놀기!'}
          </button>
        </div>
      </div>

      {/* ── Session complete button ────────────────────────────────────────── */}
      <button
        className="btn btn-primary w-full animate-float"
        style={{
          padding: '18px',
          fontSize: '1.05rem',
          fontWeight: 900,
          borderRadius: '18px',
          letterSpacing: '0.5px',
          background: 'linear-gradient(135deg, var(--primary), #38A169)',
          boxShadow: '0 8px 24px rgba(72, 187, 120, 0.35)',
          border: 'none',
          color: '#fff'
        }}
        onClick={runDay}
      >
        ✅ 케어 세션 완료
        <span style={{ opacity: 0.75, fontSize: '0.78rem', marginLeft: 8, fontWeight: 600 }}>
          세션 #{crop.day}
        </span>
      </button>
    </div>
  );
};
