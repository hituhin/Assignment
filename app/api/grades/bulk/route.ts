import { NextRequest, NextResponse } from "next/server";
import { getStore, generateId } from "@/lib/db/store";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const store = getStore();
  const POINTS: Record<string, number> = {
    A: 4.0, "A-": 3.7, "B+": 3.3, B: 3.0, "B-": 2.7,
    "C+": 2.3, C: 2.0, "C-": 1.7, D: 1.0, F: 0.0,
  };

  for (const item of body.grades ?? []) {
    const idx = store.grades.findIndex(
      (g) => g.studentId === item.studentId && g.courseId === item.courseId
    );
    if (idx !== -1) {
      store.grades[idx] = {
        ...store.grades[idx],
        letterGrade: item.letterGrade,
        numericGrade: POINTS[item.letterGrade] ?? item.numericGrade,
      };
    } else {
      store.grades.push({
        id: generateId("g"),
        studentId: item.studentId,
        courseId: item.courseId,
        enrollmentId: item.enrollmentId ?? "",
        letterGrade: item.letterGrade,
        numericGrade: POINTS[item.letterGrade] ?? 0,
        semester: item.semester ?? "Fall 2024",
      });
    }
  }

  return NextResponse.json({ success: true });
}
