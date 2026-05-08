type Gender = 'female' | 'male';
type ActivityLevel = 'low' | 'medium' | 'high';

export function calculateDailyWaterGoal(
  weight: string | number | null,
  gender: Gender | string | null,
  activityLevel: ActivityLevel | string | null,
  age?: string | number | null
) {
  const weightNumber = Number(weight);
  let dailyGoal =
    weight !== null && weight !== undefined && weight !== '' && weightNumber > 0
      ? weightNumber * (gender === 'female' ? 30 : 35)
      : 2000;

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
