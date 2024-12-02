const ProgressColor = {
  VERY_LOW: "bg-red-500",
  LOW: "bg-amber-500",
  REGULAR: "bg-yellow-500",
  HIGH: "bg-lime-500",
  MAX: "bg-green-500",
};

export const getProgressColor = (progress: number) =>
  progress < 25
    ? ProgressColor.VERY_LOW
    : progress < 50
    ? ProgressColor.LOW
    : progress < 75
    ? ProgressColor.REGULAR
    : progress < 100
    ? ProgressColor.HIGH
    : ProgressColor.MAX;
