export function getWaterStatus(waterAmount: number, dailyGoal: number) {
  const progress = waterAmount / dailyGoal;

  if (progress < 0.5) {
    return {
      statusText: 'low',
      statusColor: 'red',
    };
  }

  if (progress < 1) {
    return {
      statusText: 'medium',
      statusColor: 'yellow',
    };
  }

  return {
    statusText: 'perfect',
    statusColor: 'green',
  };
}
