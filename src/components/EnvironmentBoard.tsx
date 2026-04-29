import React from 'react';
import { useGame } from '../context/GameContext';
import { Thermometer, Sun, Cloud, CloudRain, Wind, AlertTriangle, ShieldCheck, Biohazard } from 'lucide-react';

const OPTIMAL_TEMP: [number, number] = [15, 25]; // Strawberry ideal range

function getTempStatus(temp: number): { color: string; label: string } {
  if (temp < 5)  return { color: '#4299E1', label: '동해 위험' };
  if (temp < 10) return { color: '#63B3ED', label: '저온 주의' };
  if (temp < 15) return { color: '#90CDF4', label: '약간 서늘' };
  if (temp <= 25) return { color: '#48BB78', label: '최적 온도' };
  if (temp <= 30) return { color: '#F6AD55', label: '약간 더움' };
  return { color: '#F56565', label: '고온 위험' };
}

const SunlightIcon: React.FC<{ sunlight: string; size?: number }> = ({ sunlight, size = 28 }) => {
  if (sunlight === 'sunny')  return <Sun  size={size} color="#F6E05E" />;
  if (sunlight === 'rainy')  return <CloudRain size={size} color="#4299E1" />;
  return <Cloud size={size} color="#A0AEC0" />;
};

const SUNLIGHT_LABELS: Record<string, string> = {
  sunny: '맑음 ☀️',
  cloudy: '흐림 ☁️',
  rainy: '비 🌧️',
};

export const EnvironmentBoard: React.FC = () => {
  const { state } = useGame();
  const { environment, player, crop } = state;

  const tempStatus = getTempStatus(environment.temperature);
  const isProtected = player.activeBuffs.coldProtectionDays > 0;

  // Disease pressure visual
  const pressureLevel =
    environment.diseasePressure > 7 ? { label: '높음', color: '#E53E3E' } :
    environment.diseasePressure > 4 ? { label: '보통', color: '#ED8936' } :
    { label: '낮음', color: '#48BB78' };

  return (
    <div className="glass-panel" style={{ padding: '14px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
          🌍 오늘의 환경 — 세션 {crop.day}
        </h3>
        {isProtected && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            background: '#EBF8FF', border: '1px solid #90CDF4',
            borderRadius: 20, padding: '3px 10px',
            fontSize: '0.65rem', fontWeight: 800, color: '#2B6CB0'
          }}>
            <ShieldCheck size={11} /> 방한 보호 중
          </div>
        )}
      </div>

      {/* 3-column cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>

        {/* Temperature */}
        <div style={{
          background: 'rgba(255,255,255,0.75)', borderRadius: 12,
          padding: '10px 6px', textAlign: 'center',
          border: `2px solid ${tempStatus.color}22`
        }}>
          <Thermometer color={tempStatus.color} size={26} style={{ margin: '0 auto 4px' }} />
          <div style={{ fontSize: '1.35rem', fontWeight: 900, lineHeight: 1 }}>
            {environment.temperature}°
          </div>
          <div style={{
            fontSize: '0.6rem', fontWeight: 800, marginTop: 4,
            color: tempStatus.color
          }}>
            {tempStatus.label}
          </div>
          {isProtected && environment.temperature < 10 && (
            <div style={{ fontSize: '0.55rem', color: '#2B6CB0', marginTop: 2 }}>→ 18° (보호)</div>
          )}
        </div>

        {/* Sunlight */}
        <div style={{
          background: 'rgba(255,255,255,0.75)', borderRadius: 12,
          padding: '10px 6px', textAlign: 'center'
        }}>
          <SunlightIcon sunlight={environment.sunlight} size={26} />
          <div style={{ fontSize: '0.85rem', fontWeight: 800, marginTop: 4 }}>
            {SUNLIGHT_LABELS[environment.sunlight] ?? environment.sunlight}
          </div>
          <div style={{ fontSize: '0.6rem', color: '#A0AEC0', marginTop: 2 }}>
            {environment.sunlight === 'sunny'  ? '광합성 +' :
             environment.sunlight === 'rainy'  ? '병해 위험 ↑' : '보통'}
          </div>
        </div>

        {/* Disease pressure / Event */}
        <div style={{
          background: environment.specialEvent ? '#FFF5F5' : 'rgba(255,255,255,0.75)',
          borderRadius: 12, padding: '10px 6px', textAlign: 'center',
          border: environment.specialEvent ? '1.5px solid #FEB2B2' : 'none'
        }}>
          {environment.specialEvent ? (
            <>
              <AlertTriangle color="#E53E3E" size={26} style={{ margin: '0 auto 4px' }} />
              <div style={{ fontSize: '0.7rem', fontWeight: 900, color: '#C53030', lineHeight: 1.2 }}>
                {environment.specialEvent.title}
              </div>
            </>
          ) : (
            <>
              <Biohazard
                size={26}
                color={pressureLevel.color}
                style={{ margin: '0 auto 4px' }}
              />
              <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>병해압</div>
              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: pressureLevel.color, marginTop: 2 }}>
                {pressureLevel.label}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Optimal range hint */}
      <div style={{
        marginTop: 10, paddingTop: 8, borderTop: '1px dashed #E2E8F0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <span style={{ fontSize: '0.62rem', color: '#A0AEC0' }}>
          🍓 딸기 적정 온도: {OPTIMAL_TEMP[0]}°C – {OPTIMAL_TEMP[1]}°C
        </span>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <Wind size={11} color="#A0AEC0" />
          <span style={{ fontSize: '0.62rem', color: '#A0AEC0' }}>
            병해압 {environment.diseasePressure.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );
};
