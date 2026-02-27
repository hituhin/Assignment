import type { Grade } from "@/types";

export function computeGPA(grades: Grade[]): number {
  if (grades.length === 0) return 0;
  const sum = grades.reduce((acc, g) => acc + g.numericGrade, 0);
  return Math.round((sum / grades.length) * 100) / 100;
}
