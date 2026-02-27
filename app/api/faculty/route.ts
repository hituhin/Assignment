import { NextRequest, NextResponse } from "next/server";
import { getStore, generateId } from "@/lib/db/store";

export async function GET() {
  const store = getStore();

  const enriched = store.faculty.map((f) => ({
    ...f,
    courses: store.courses.filter((c) => f.courseIds.includes(c.id)),
    studentCount: store.enrollments.filter((e) => f.courseIds.includes(e.courseId)).length,
  }));

  return NextResponse.json(enriched);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const store = getStore();
  const newFaculty = { ...body, id: generateId("f"), courseIds: body.courseIds ?? [] };
  store.faculty.push(newFaculty);

  // Link faculty to courses (add to instructorIds)
  newFaculty.courseIds.forEach((cid: string) => {
    const course = store.courses.find((c) => c.id === cid);
    if (course && !course.instructorIds.includes(newFaculty.id)) {
      course.instructorIds.push(newFaculty.id);
    }
  });

  return NextResponse.json(newFaculty, { status: 201 });
}
