/**
 * GameModals.tsx — Feedback Modals
 *
 * Three modals:
 * 1. FeedbackModal — shows WhileAwayReport (Layer 1) and/or SessionResultReport (Layer 2)
 * 2. DeathModal — layered cause explanation
 * 3. MinigameModal — educational quiz
 */
import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import {
  AlertCircle, RotateCcw, ShieldAlert, Sparkles, BookOpen,
  Clock, Droplet, Activity, Info, Trophy, TrendingDown, Zap, Wind, Heart
} from 'lucide-react';
import type { StatChange, WhileAwayReport, SessionResultReport } from '../types/game';

// ─── Cause-tag colours ────────────────────────────────────────────────────────
const CAUSE_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  passive_neglect: { bg: '#FFF5F5', text: '#C53030', label: '방치' },
  active_care:     { bg: '#EBF8FF', text: '#2B6CB0', label: '케어' },
  event_driven:    { bg: '#FFFBEB', text: '#92400E', label: '이벤트' },
  trait_effect:    { bg: '#FAF5FF', text: '#553C9A', label: '특성' },
  recovery:        { bg: '#F0FFF4', text: '#276749', label: '회복' },
  natural:         { bg: '#F7FAFC', text: '#4A5568', label: '자연' },
};

// ─── Severity colours ─────────────────────────────────────────────────────────
const SEV_CONFIG = {
  mild:     { bg: '#F0FFF4', border: '#9AE6B4', icon: '🌿', barColor: '#48BB78' },
  moderate: { bg: '#FFFBEB', border: '#FBD38D', icon: '💧', barColor: '#ECC94B' },
  severe:   { bg: '#FFF5F5', border: '#FEB2B2', icon: '😟', barColor: '#FC8181' },
  critical: { bg: '#FFF5F5', border: '#FC8181', icon: '🥀', barColor: '#E53E3E' },
};

// ─── Stat icon helper ─────────────────────────────────────────────────────────
function StatIcon({ stat }: { stat: StatChange['stat'] }) {
  switch (stat) {
    case 'waterLevel':    return <Droplet size={11} color="#4299E1" />;
    case 'stress':        return <Wind    size={11} color="#805AD5" />;
    case 'stamina':       return <Heart   size={11} color="#F56565" />;
    case 'diseaseRisk':   return <AlertCircle size={11} color="#E53E3E" />;
    case 'growthProgress':return <Zap     size={11} color="#48BB78" />;
    case 'neglectLevel':  return <TrendingDown size={11} color="#ED8936" />;
    default:              return null;
  }
}

// ─── StatChange row ───────────────────────────────────────────────────────────
const StatChangeRow: React.FC<{ change: StatChange }> = ({ change }) => {
  const cfg = CAUSE_COLORS[change.cause] ?? CAUSE_COLORS['natural'];
  const isPositive = change.delta > 0;
  const isGood = (change.stat === 'waterLevel' || change.stat === 'stamina' || change.stat === 'growthProgress') && isPositive
    || (change.stat === 'stress' || change.stat === 'diseaseRisk' || change.stat === 'neglectLevel') && !isPositive;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '5px 8px', borderRadius: 8,
      background: cfg.bg,
      marginBottom: 3,
    }}>
      <StatIcon stat={change.stat} />
      <span style={{ flex: 1, fontSize: '0.72rem', color: '#2D3748' }}>{change.label}</span>
      <span style={{
        fontSize: '0.62rem', fontWeight: 900, padding: '1px 6px',
        borderRadius: 6, background: cfg.bg, color: cfg.text,
        border: `1px solid ${cfg.text}30`
      }}>
        {cfg.label}
      </span>
      <span style={{
        fontSize: '0.72rem', fontWeight: 900,
        color: isGood ? '#48BB78' : '#E53E3E',
        minWidth: 32, textAlign: 'right'
      }}>
        {isPositive ? '+' : ''}{change.delta.toFixed(0)}
      </span>
    </div>
  );
};

// ─── WhileAway Section ────────────────────────────────────────────────────────
const WhileAwaySection: React.FC<{ report: WhileAwayReport }> = ({ report }) => {
  const [expanded, setExpanded] = useState(false);
  const sev = SEV_CONFIG[report.severity as keyof typeof SEV_CONFIG] ?? SEV_CONFIG['mild'];
  const hasChanges = report.changes.length > 0;

  return (
    <div style={{
      background: sev.bg, border: `1.5px solid ${sev.border}`,
      borderRadius: 12, padding: '12px', marginBottom: 10,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <Clock size={13} color="#718096" />
        <span style={{ fontSize: '0.62rem', fontWeight: 900, color: '#718096' }}>
          방치된 동안 (실시간 영향)
        </span>
      </div>

      <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2D3748', margin: '0 0 4px' }}>
        {sev.icon} {report.headline}
      </p>

      {report.advice && (
        <p style={{ fontSize: '0.72rem', color: '#718096', margin: '0 0 6px', fontStyle: 'italic' }}>
          → {report.advice}
        </p>
      )}

      {/* Collapsible stat changes */}
      {hasChanges && (
        <>
          <button
            onClick={() => setExpanded(e => !e)}
            style={{
              background: 'none', border: 'none', padding: 0,
              fontSize: '0.65rem', color: '#A0AEC0', cursor: 'pointer',
              fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4
            }}
          >
            {expanded ? '▲' : '▼'} 세부 변화 {report.changes.length}건
          </button>

          {expanded && (
            <div style={{ marginTop: 6 }}>
              {report.changes.map((ch, i) => <StatChangeRow key={i} change={ch} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ─── Session Result Section ───────────────────────────────────────────────────
const SessionSection: React.FC<{ report: SessionResultReport }> = ({ report }) => {
  const [expanded, setExpanded] = useState(false);
  const branchColor = report.branch === 'optimal' ? '#D69E2E'
    : report.branch === 'stunted' ? '#E53E3E' : '#319795';

  return (
    <div style={{
      background: '#EBF8FF', border: '1.5px solid #BEE3F8',
      borderRadius: 12, padding: '12px', marginBottom: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
        <Activity size={13} color="#3182CE" />
        <span style={{ fontSize: '0.62rem', fontWeight: 900, color: '#2B6CB0' }}>
          이번 세션 (내 케어 결과)
        </span>
        <span style={{
          marginLeft: 'auto', fontSize: '0.6rem', fontWeight: 900,
          padding: '1px 7px', borderRadius: 10,
          background: branchColor, color: '#fff'
        }}>
          {report.branch === 'optimal' ? '최적 🌟' : report.branch === 'stunted' ? '정체 🛑' : '표준 🌿'}
        </span>
      </div>

      <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#2C5282', margin: '0 0 6px' }}>
        {report.headline}
      </p>

      {/* Quality bar */}
      <div style={{ marginBottom: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
          <span style={{ fontSize: '0.62rem', color: '#4299E1', fontWeight: 700 }}>케어 품질</span>
          <span style={{
            fontSize: '0.72rem', fontWeight: 900,
            color: report.careQuality > 75 ? '#48BB78' : report.careQuality > 45 ? '#ECC94B' : '#E53E3E'
          }}>
            {report.careQuality}점
          </span>
        </div>
        <div style={{ height: 6, background: '#BEE3F8', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 4,
            width: `${report.careQuality}%`,
            background: report.careQuality > 75 ? '#48BB78' : report.careQuality > 45 ? '#ECC94B' : '#E53E3E',
            transition: 'width 0.6s ease'
          }} />
        </div>
      </div>

      {/* Lesson */}
      {report.lesson && (
        <div style={{
          display: 'flex', gap: 6, alignItems: 'flex-start',
          background: '#FEFCE8', border: '1px solid #FDE68A',
          borderRadius: 8, padding: '7px 9px', marginBottom: 6
        }}>
          <Info size={12} color="#D97706" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: '0.7rem', color: '#92400E', margin: 0 }}>{report.lesson}</p>
        </div>
      )}

      {/* Collapsible cause-tagged changes */}
      {report.changes.length > 0 && (
        <>
          <button
            onClick={() => setExpanded(e => !e)}
            style={{
              background: 'none', border: 'none', padding: 0,
              fontSize: '0.65rem', color: '#4299E1', cursor: 'pointer',
              fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4
            }}
          >
            {expanded ? '▲' : '▼'} 변화 원인 {report.changes.length}건 보기
          </button>
          {expanded && (
            <div style={{ marginTop: 6 }}>
              {report.changes.map((ch, i) => <StatChangeRow key={i} change={ch} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
};

// ─── FeedbackModal ────────────────────────────────────────────────────────────
export const FeedbackModal: React.FC = () => {
  const { state, closeFeedback } = useGame();
  const { dayFeedback, crop } = state;
  if (!dayFeedback) return null;

  const isNeglect = !!dayFeedback.whileAwayReport &&
    dayFeedback.whileAwayReport.severity !== 'none';
  const isWarning = dayFeedback.isWarning;

  const borderColor = isNeglect
    ? (SEV_CONFIG[dayFeedback.whileAwayReport!.severity as keyof typeof SEV_CONFIG]?.border ?? '#FEB2B2')
    : isWarning ? 'var(--warning)' : 'var(--success)';

  return (
    <div className="modal-overlay">
      <div className="glass-panel animate-pop p-4" style={{
        background: '#fff', border: `2px solid ${borderColor}`,
        maxWidth: 360, width: '100%', maxHeight: '85vh', overflowY: 'auto'
      }}>
        {/* Header */}
        <div className="text-center mb-3">
          <div style={{ fontSize: '2rem', marginBottom: 4 }}>
            {isNeglect ? (SEV_CONFIG[dayFeedback.whileAwayReport!.severity as keyof typeof SEV_CONFIG]?.icon ?? '🌿') :
              isWarning ? '⚠️' : '✨'}
          </div>
          <h3 style={{ margin: 0, fontWeight: 900, color: '#2D3748', fontSize: '1.1rem' }}>
            {dayFeedback.title}
          </h3>
          {!isNeglect && (
            <p style={{ fontSize: '0.8rem', color: '#718096', margin: '4px 0 0' }}>
              {dayFeedback.desc}
            </p>
          )}
        </div>

        {/* Layer 1: While-away report */}
        {dayFeedback.whileAwayReport && dayFeedback.whileAwayReport.severity !== 'none' && (
          <WhileAwaySection report={dayFeedback.whileAwayReport} />
        )}

        {/* Layer 2: Session result */}
        {dayFeedback.sessionResult && (
          <SessionSection report={dayFeedback.sessionResult} />
        )}

        {/* Fallback plain text */}
        {!dayFeedback.whileAwayReport && !dayFeedback.sessionResult && (
          <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#4A5568', marginBottom: 12 }}>
            {dayFeedback.desc}
          </p>
        )}

        {/* Token gain */}
        {dayFeedback.tokensGained && dayFeedback.tokensGained > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            background: '#FEFCBF', border: '1px solid #ECC94B', borderRadius: 10,
            padding: '7px 14px', marginBottom: 10
          }}>
            <Trophy size={15} color="#D69E2E" />
            <span style={{ fontWeight: 900, color: '#B7791F', fontSize: '0.88rem' }}>
              +{dayFeedback.tokensGained} 토큰 획득!
            </span>
          </div>
        )}

        {/* Quick stat glance */}
        <div style={{
          display: 'flex', justifyContent: 'space-around',
          background: '#F7FAFC', borderRadius: 10, padding: '8px 0', marginBottom: 12
        }}>
          {[
            { label: '💧 수분', v: Math.round(crop.waterLevel),  invert: false },
            { label: '❤️ 체력', v: Math.round(crop.stamina),     invert: false },
            { label: '⚡ 스트레스', v: Math.round(crop.stress), invert: true  },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '0.8rem', fontWeight: 900,
                color: s.invert ? (s.v > 60 ? '#E53E3E' : '#48BB78') : (s.v < 30 ? '#E53E3E' : '#48BB78')
              }}>{s.v}</div>
              <div style={{ fontSize: '0.58rem', color: '#A0AEC0', marginTop: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <button
          className="btn w-full"
          style={{
            background: isNeglect && (dayFeedback.whileAwayReport?.severity === 'severe' || dayFeedback.whileAwayReport?.severity === 'critical')
              ? 'linear-gradient(135deg, #E53E3E, #C53030)'
              : isWarning ? 'var(--warning)' : 'var(--primary)',
            color: '#fff', fontWeight: 800, borderRadius: 14, padding: '13px'
          }}
          onClick={closeFeedback}
        >
          {isNeglect ? '🌱 작물 돌보러 가기' : '계속하기'}
        </button>
      </div>
    </div>
  );
};

// ─── DeathModal ───────────────────────────────────────────────────────────────
export const DeathModal: React.FC = () => {
  const { state, recoverFromCheckpoint, resetGame } = useGame();
  const { deathReason, player } = state;
  if (!deathReason) return null;

  return (
    <div className="modal-overlay">
      <div className="glass-panel animate-pop p-4" style={{
        background: '#fff', maxWidth: 400, width: '100%', border: '2px solid var(--danger)'
      }}>
        <div className="text-center mb-4">
          <ShieldAlert size={48} color="var(--danger)" style={{ margin: '0 auto' }} />
          <h2 className="mt-2" style={{ color: 'var(--danger)' }}>작물이 시들었어요 💔</h2>
          <p style={{ fontWeight: 700, fontSize: '1rem', color: '#2D3748' }}>{deathReason.main}</p>
        </div>

        {/* Layered cause breakdown */}
        <div style={{
          background: '#FFF5F5', border: '1px solid #FEB2B2',
          borderRadius: 12, padding: 14, marginBottom: 12
        }}>
          <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#E53E3E', marginBottom: 6 }}>
            ☠️ 사망 원인 (복합)
          </div>
          <p style={{ fontSize: '0.82rem', color: '#742A2A', margin: '0 0 4px' }}>
            <strong>직접 원인:</strong> {deathReason.secondary}
          </p>
          {deathReason.neglectContribution && (
            <p style={{ fontSize: '0.78rem', color: '#9B2C2C', margin: '4px 0 0' }}>
              <strong>방치 기여:</strong> {deathReason.neglectContribution}
            </p>
          )}
        </div>

        {/* Learning note */}
        <div style={{
          background: '#EBF8FF', border: '1px solid #BEE3F8',
          borderRadius: 12, padding: 14, marginBottom: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <BookOpen size={14} color="#2B6CB0" />
            <span style={{ fontSize: '0.7rem', fontWeight: 900, color: '#2B6CB0' }}>학습 포인트</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#2C5282', margin: 0 }}>{deathReason.lesson}</p>
          <p style={{ fontSize: '0.75rem', color: '#4A5568', margin: '6px 0 0' }}>{deathReason.actions}</p>
        </div>

        <div className="flex-col gap-2">
          <button
            className="btn btn-primary"
            onClick={recoverFromCheckpoint}
            disabled={player.tokens < 2 || state.checkpoints.length === 0}
            style={{
              background: player.tokens >= 2 && state.checkpoints.length > 0
                ? 'linear-gradient(135deg, #4CAF50, #2E7D32)'
                : '#E2E8F0',
              color: player.tokens >= 2 && state.checkpoints.length > 0 ? '#fff' : '#A0AEC0'
            }}
          >
            <RotateCcw size={14} style={{ marginRight: 6 }} />
            체크포인트 복구 (토큰 2개) — 현재 {player.tokens}개
          </button>
          <button
            className="btn btn-outline"
            onClick={resetGame}
            style={{ color: '#718096', border: '1.5px solid #E2E8F0' }}
          >
            새 작물 시작하기
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── MinigameModal ────────────────────────────────────────────────────────────
export const MinigameModal: React.FC = () => {
  const { state, completeMinigame } = useGame();
  const [answered, setAnswered] = useState(false);
  const [correct, setCorrect] = useState(false);

  if (!state.minigameActive) return null;

  const handleAnswer = (isCorrect: boolean) => {
    setAnswered(true);
    setCorrect(isCorrect);
    setTimeout(() => {
      completeMinigame(isCorrect);
      setAnswered(false);
    }, 1600);
  };

  const options = [
    { label: '낮은 가온 (Low Heat)', correct: false },
    { label: '강한 가온 (High Heat)', correct: true },
    { label: '환기 최대 (Max Ventilation)', correct: false },
  ];

  return (
    <div className="modal-overlay">
      <div className="glass-panel animate-pop p-4 text-center" style={{
        background: '#fff', border: '2px solid #805AD5', maxWidth: 340
      }}>
        <div style={{ fontSize: '2rem', marginBottom: 8 }}>🧠</div>
        <h2 className="mb-1" style={{ color: '#805AD5' }}>농업 퀴즈!</h2>
        <p style={{ fontSize: '0.75rem', color: '#718096', marginBottom: 14 }}>정답 → 토큰 +1 🎁</p>
        <p style={{ fontWeight: 700, fontSize: '0.95rem', color: '#2D3748', marginBottom: 16 }}>
          외부 기온이 3°C일 때 딸기에 가장 적합한 대응은?
        </p>

        {!answered ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {options.map(opt => (
              <button
                key={opt.label}
                style={{
                  background: '#EDF2F7', color: '#2D3748',
                  border: '1.5px solid #E2E8F0', borderRadius: 12,
                  padding: '12px', fontWeight: 700, cursor: 'pointer',
                  fontSize: '0.88rem'
                }}
                onClick={() => handleAnswer(opt.correct)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        ) : (
          <div style={{
            padding: 20, borderRadius: 16,
            background: correct ? '#F0FFF4' : '#FFF5F5',
            border: `2px solid ${correct ? '#9AE6B4' : '#FEB2B2'}`
          }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>{correct ? '🎉' : '😅'}</div>
            <p style={{ fontWeight: 800, color: correct ? '#276749' : '#C53030', margin: 0 }}>
              {correct
                ? '정답! 3°C 저온에는 강한 가온이 필요해요. +1 토큰!'
                : '아쉬워요! 3°C의 저온에서는 가온을 강화해야 냉해를 막을 수 있어요.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
