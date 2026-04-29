import React from 'react';
import { useGame } from '../context/GameContext';
import { Droplet, Heart, Wind, Zap, Clock, TrendingUp, TrendingDown } from 'lucide-react';

// ─── Animated Progress Bar ────────────────────────────────────────────────────
interface BarProps {
  value: number;
  color: string;
  warnColor?: string;
  /** If true, HIGH value is the danger (stress) */
  reverseWarning?: boolean;
  showValue?: boolean;
}

const ProgressBar: React.FC<BarProps> = ({
  value, color, warnColor = 'var(--danger)', reverseWarning = false, showValue = false
}) => {
  const pct = Math.max(0, Math.min(100, value));
  const isDanger = reverseWarning ? pct >= 70 : pct <= 25;
  const fill = isDanger ? warnColor : color;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}>
      <div style={{
        flex: 1, height: 10, background: '#E2E8F0',
        borderRadius: 10, overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: fill,
          transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          borderRadius: 10
        }} />
      </div>
      {showValue && (
        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#A0AEC0', minWidth: 26, textAlign: 'right' }}>
          {Math.round(pct)}
        </span>
      )}
    </div>
  );
};

// ─── Trend icon helper ────────────────────────────────────────────────────────
const Trend: React.FC<{ good: boolean }> = ({ good }) =>
  good
    ? <TrendingUp size={11} color="#48BB78" />
    : <TrendingDown size={11} color="#E53E3E" />;

// ─── Main StatusPanel ─────────────────────────────────────────────────────────
export const StatusPanel: React.FC = () => {
  const { state } = useGame();
  const { crop } = state;

  // Simple trend: compare last two care scores
  const history = crop.careQualityHistory;
  const lastScore = history.length > 0 ? history[history.length - 1] : null;
  const prevScore = history.length > 1 ? history[history.length - 2] : null;
  const trendUp   = lastScore !== null && prevScore !== null && lastScore >= prevScore;

  // Time since last session
  const hoursSince = (Date.now() - crop.lastSessionTime) / (1000 * 60 * 60);
  const timeLabel =
    hoursSince < 1   ? '방금 전' :
    hoursSince < 24  ? `${Math.floor(hoursSince)}시간 전` :
    `${Math.floor(hoursSince / 24)}일 전`;

  const rows = [
    {
      key: 'stamina',
      label: '체력',
      icon: <Heart size={15} color="var(--primary)" />,
      value: crop.stamina,
      color: 'var(--primary)',
      reverseWarning: false,
    },
    {
      key: 'water',
      label: '수분',
      icon: <Droplet size={15} color="var(--info)" />,
      value: crop.waterLevel,
      color: 'var(--info)',
      reverseWarning: false,
    },
    {
      key: 'stress',
      label: '스트레스',
      icon: <Wind size={15} color="#805AD5" />,
      value: crop.stress,
      color: '#805AD5',
      reverseWarning: true,
    },
    {
      key: 'growth',
      label: '성장률',
      icon: <Zap size={15} color="var(--secondary)" />,
      value: crop.growthProgress,
      color: 'var(--secondary)',
      reverseWarning: false,
    },
  ];

  return (
    <div className="glass-panel">
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>📊 내부 상태</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Clock size={12} color="#A0AEC0" />
          <span style={{ fontSize: '0.65rem', color: '#A0AEC0', fontWeight: 600 }}>{timeLabel}</span>
        </div>
      </div>

      {/* Stat bars */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {rows.map(row => (
          <div key={row.key} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 78, display: 'flex', alignItems: 'center',
              gap: 4, fontSize: '0.78rem', color: 'var(--text-muted)',
              flexShrink: 0
            }}>
              {row.icon}
              {row.label}
            </div>
            <ProgressBar
              value={row.value}
              color={row.color}
              reverseWarning={row.reverseWarning}
              showValue
            />
          </div>
        ))}
      </div>

      {/* Disease risk row */}
      {crop.diseaseRisk > 10 && (
        <div style={{
          marginTop: 12, paddingTop: 10,
          borderTop: '1px dashed #E2E8F0',
          display: 'flex', alignItems: 'center', gap: 10
        }}>
          <div style={{
            width: 78, fontSize: '0.78rem', color: '#E53E3E',
            fontWeight: 700, flexShrink: 0
          }}>
            🦠 병해 위험
          </div>
          <ProgressBar value={crop.diseaseRisk} color="#FC8181" warnColor="#E53E3E" reverseWarning showValue />
        </div>
      )}

      {/* Neglect level row — always shown so player sees passive decay pressure */}
      <div style={{
        marginTop: 10, paddingTop: 8,
        borderTop: '1px dashed #E2E8F0',
        display: 'flex', alignItems: 'center', gap: 10
      }}>
        <div style={{
          width: 78, fontSize: '0.78rem',
          color: crop.neglectLevel > 50 ? '#E53E3E' : crop.neglectLevel > 20 ? '#ED8936' : '#A0AEC0',
          fontWeight: crop.neglectLevel > 20 ? 800 : 600,
          flexShrink: 0
        }}>
          ⏱ 방치 수준
        </div>
        <ProgressBar
          value={crop.neglectLevel}
          color="#ED8936"
          warnColor="#E53E3E"
          reverseWarning
          showValue
        />
      </div>
      {crop.neglectLevel > 50 && (
        <div style={{
          marginTop: 6, padding: '6px 10px',
          background: '#FFF5F5', border: '1px solid #FEB2B2',
          borderRadius: 8, fontSize: '0.65rem', color: '#C53030', fontWeight: 700
        }}>
          ⚠️ 방치 수준이 높습니다. 좋은 케어를 연속으로 하면 회복됩니다.
        </div>
      )}

      {/* Session quality summary */}
      {lastScore !== null && (
        <div style={{
          marginTop: 12, paddingTop: 10,
          borderTop: '1px dashed #E2E8F0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            마지막 세션 케어 품질
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {prevScore !== null && <Trend good={trendUp} />}
            <span style={{
              fontSize: '0.8rem', fontWeight: 900,
              color: lastScore > 75 ? '#48BB78' : lastScore > 45 ? '#ECC94B' : '#E53E3E'
            }}>
              {Math.round(lastScore)}점
            </span>
          </div>
        </div>
      )}

      {/* Branch badge */}
      {crop.branch !== 'standard' && (
        <div style={{
          marginTop: 10,
          display: 'flex', justifyContent: 'center'
        }}>
          <span style={{
            fontSize: '0.65rem', fontWeight: 900,
            padding: '3px 10px', borderRadius: 20,
            background: crop.branch === 'optimal'   ? 'linear-gradient(135deg,#D69E2E,#ECC94B)' :
                        crop.branch === 'stunted'   ? '#E2E8F0' : '#FED7D7',
            color: crop.branch === 'optimal' ? '#fff' : '#718096'
          }}>
            {crop.branch === 'optimal'   ? '⭐ 최적 성장 중' :
             crop.branch === 'stunted'   ? '🐌 성장 정체' : '⚠️ 왜곡 성장'}
          </span>
        </div>
      )}
    </div>
  );
};
