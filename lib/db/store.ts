import rawData from "@/data/db.json";
import type { Student, Course, Faculty, Enrollment, Grade } from "@/types";

interface StoreData {
  students: Student[];
  courses: Course[];
  faculty: Faculty[];
  enrollments: Enrollment[];
  grades: Grade[];
}

// Deep clone seed data into a module-level mutable store.
// Resets automatically on every server restart — no persistence needed.
let store: StoreData = JSON.parse(JSON.stringify(rawData)) as StoreData;

export function getStore(): StoreData {
  return store;
}

export function resetStore(): void {
  store = JSON.parse(JSON.stringify(rawData)) as StoreData;
}

export function generateId(prefix: string): string {
  return `${prefix}${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}
