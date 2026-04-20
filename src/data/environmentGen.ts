export const generateEnvironment = (day: number): import('../types/game').Environment => {
  const isCold = day === 3 || day === 7;
  const isCloudy = day % 4 === 0;

  return {
    temperature: isCold ? 2 : (Math.floor(Math.random() * 10) + 15), // Normal 15-25, cold ~2
    sunlight: isCloudy ? 'cloudy' : (Math.random() > 0.8 ? 'rainy' : 'sunny'),
    diseasePressure: isCloudy ? 20 : 5,
    specialEvent: isCold ? {
      id: 'cold_snap',
      title: 'Sudden Cold Snap',
      type: 'danger',
      description: 'Temperature drastically dropped! Watch out for cold stress.'
    } : undefined
  };
};
