type Gender = 'female' | 'male';
type ActivityLevel = 'low' | 'medium' | 'high';

export function calculateDailyWaterGoal(
  weight: string | number | null,
  gender: Gender | string | null,
  activityLevel: ActivityLevel | string | null,
  age?: string | number | null
) {
  if (!weight || !gender || !activityLevel) {
    return 2000;
  }

  const weightNumber = Number(weight);

  if (!weightNumber) {
    return 2000;
  }

  let dailyGoal = gender === 'female' ? weightNumber * 30 : weightNumber * 35;

  if (activityLevel === 'medium') {
    dailyGoal += 500;
  }

  if (activityLevel === 'high') {
    dailyGoal += 1000;
  }

  const ageNumber = Number(age);

  if (age !== null && age !== undefined && age !== '' && ageNumber >= 0) {
    if (ageNumber < 18 || ageNumber >= 65) {
      return Math.round(dailyGoal * 0.9);
    }
  }

  return dailyGoal;
}
