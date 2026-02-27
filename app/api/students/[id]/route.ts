import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/db/store";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const store = getStore();
  const student = store.students.find((s) => s.id === id);
  if (!student) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const enrollments = store.enrollments.filter((e) => e.studentId === id).map((e) => ({
    ...e,
    course: store.courses.find((c) => c.id === e.courseId),
    grade: store.grades.find((g) => g.studentId === id && g.courseId === e.courseId),
  }));

  const grades = store.grades.filter((g) => g.studentId === id);
  return NextResponse.json({ student, enrollments, grades });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const store = getStore();
  const idx = store.students.findIndex((s) => s.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  store.students[idx] = { ...store.students[idx], ...body, id };
  return NextResponse.json(store.students[idx]);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const store = getStore();
  const idx = store.students.findIndex((s) => s.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  store.students.splice(idx, 1);
  store.enrollments = store.enrollments.filter((e) => e.studentId !== id);
  store.grades = store.grades.filter((g) => g.studentId !== id);
  return NextResponse.json({ success: true });
}
