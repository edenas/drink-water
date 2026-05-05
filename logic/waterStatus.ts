export function getWaterStatus(waterAmount: number, dailyGoal: number) {
  const progress = waterAmount / dailyGoal;

  if (progress < 0.5) {
    return {
      statusText: 'low',
      statusColor: '#D95A5A',
    };
  }

  if (progress < 1) {
    return {
      statusText: 'medium',
      statusColor: '#D4A017',
    };
  }

  return {
    statusText: 'perfect',
    statusColor: '#2F8A5B',
  };
}
