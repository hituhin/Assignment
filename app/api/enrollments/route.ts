import { NextRequest, NextResponse } from "next/server";
import { getStore, generateId } from "@/lib/db/store";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const store = getStore();

  const exists = store.enrollments.find(
    (e) => e.studentId === body.studentId && e.courseId === body.courseId
  );
  if (exists) return NextResponse.json({ error: "Already enrolled" }, { status: 409 });

  const enrollment = {
    id: generateId("e"),
    studentId: body.studentId,
    courseId: body.courseId,
    enrolledAt: new Date().toISOString().split("T")[0],
    semester: body.semester ?? "Fall 2024",
  };
  store.enrollments.push(enrollment);
  return NextResponse.json(enrollment, { status: 201 });
}
