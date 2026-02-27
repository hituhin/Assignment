import { NextRequest, NextResponse } from "next/server";
import { getStore } from "@/lib/db/store";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = getStore();
  const faculty = store.faculty.find((f) => f.id === id);
  if (!faculty) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    ...faculty,
    courses: store.courses.filter((c) => faculty.courseIds.includes(c.id)),
    studentCount: store.enrollments.filter((e) => faculty.courseIds.includes(e.courseId)).length,
  });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = getStore();
  const idx = store.faculty.findIndex((f) => f.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await request.json();
  const oldCourseIds: string[] = store.faculty[idx].courseIds ?? [];
  const newCourseIds: string[] = body.courseIds ?? oldCourseIds;

  store.faculty[idx] = { ...store.faculty[idx], ...body, id };

  // Sync instructorIds on courses
  oldCourseIds.forEach((cid) => {
    const course = store.courses.find((c) => c.id === cid);
    if (course) course.instructorIds = course.instructorIds.filter((fid) => fid !== id);
  });
  newCourseIds.forEach((cid) => {
    const course = store.courses.find((c) => c.id === cid);
    if (course && !course.instructorIds.includes(id)) course.instructorIds.push(id);
  });

  return NextResponse.json(store.faculty[idx]);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = getStore();
  const idx = store.faculty.findIndex((f) => f.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const courseIds = store.faculty[idx].courseIds ?? [];
  store.faculty.splice(idx, 1);

  // Remove from course instructorIds
  courseIds.forEach((cid: string) => {
    const course = store.courses.find((c) => c.id === cid);
    if (course) course.instructorIds = course.instructorIds.filter((fid) => fid !== id);
  });

  return NextResponse.json({ success: true });
}
