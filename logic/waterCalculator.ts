type Gender = 'female' | 'male';
type ActivityLevel = 'low' | 'medium' | 'high';

export function calculateDailyWaterGoal(
  weight: string | number | null,
  gender: Gender | string | null,
  activityLevel: ActivityLevel | string | null
) {
  if (!weight || !gender || !activityLevel) {
    return 2000;
  }

  const weightNumber = Number(weight);

  if (!weightNumber) {
    return 2000;
  }

  const baseGoal = gender === 'female' ? weightNumber * 30 : weightNumber * 35;

  if (activityLevel === 'medium') {
    return baseGoal + 500;
  }

  if (activityLevel === 'high') {
    return baseGoal + 1000;
  }

  return baseGoal;
}
