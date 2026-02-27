import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/db/store";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = getStore();
  const course = store.courses.find((c) => c.id === id);
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    ...course,
    enrollmentCount: store.enrollments.filter((e) => e.courseId === id).length,
    instructors: store.faculty.filter((f) => course.instructorIds.includes(f.id)),
  });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = getStore();
  const idx = store.courses.findIndex((c) => c.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  store.courses[idx] = { ...store.courses[idx], ...body, id };
  return NextResponse.json(store.courses[idx]);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = getStore();
  const idx = store.courses.findIndex((c) => c.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  store.courses.splice(idx, 1);

  // Cascade: remove enrollments and grades for this course
  const enrollmentIds = store.enrollments
    .filter((e) => e.courseId === id)
    .map((e) => e.id);
  store.enrollments = store.enrollments.filter((e) => e.courseId !== id);
  store.grades = store.grades.filter((g) => !enrollmentIds.includes(g.enrollmentId));

  // Remove courseId from faculty
  store.faculty.forEach((f) => {
    f.courseIds = f.courseIds.filter((cid) => cid !== id);
  });

  return NextResponse.json({ success: true });
}
