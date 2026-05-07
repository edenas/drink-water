export function getWaterStatus(waterAmount: number, dailyGoal: number) {
  if (waterAmount > dailyGoal + 500) {
    return {
      statusText: 'careful',
      statusColor: '#0B3D5C',
    };
  }

  const progress = waterAmount / dailyGoal;

  if (progress < 0.5) {
    return {
      statusText: 'low',
      statusColor: '#D95A5A',
    };
  }

  if (progress < 0.8) {
    return {
      statusText: 'medium',
      statusColor: '#D4A017',
    };
  }

  if (progress < 0.95) {
    return {
      statusText: 'good',
      statusColor: '#2F8A5B',
    };
  }

  return {
    statusText: 'perfect',
    statusColor: '#00AEEF',
  };
}
