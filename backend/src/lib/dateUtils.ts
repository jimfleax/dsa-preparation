export const calculateIsDue = (
  lastAttemptedDate: Date | string,
  reviewDurationDays: number | null | undefined,
): boolean => {
  if (!reviewDurationDays) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastAttempt = new Date(lastAttemptedDate);
  lastAttempt.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - lastAttempt.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  return diffDays >= reviewDurationDays;
};
