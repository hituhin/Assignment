import { NextRequest, NextResponse } from "next/server";
import { getStore, generateId } from "@/lib/db/store";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.toLowerCase() ?? "";
  const department = searchParams.get("department") ?? "";

  const store = getStore();
  let courses = store.courses;

  if (search) {
    courses = courses.filter(
      (c) =>
        c.title.toLowerCase().includes(search) ||
        c.code.toLowerCase().includes(search)
    );
  }
  if (department) courses = courses.filter((c) => c.department === department);

  const enriched = courses.map((course) => ({
    ...course,
    enrollmentCount: store.enrollments.filter((e) => e.courseId === course.id).length,
    instructors: store.faculty.filter((f) => course.instructorIds.includes(f.id)),
  }));

  return NextResponse.json(enriched);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const store = getStore();
  const newCourse = { ...body, id: generateId("c") };
  store.courses.push(newCourse);
  return NextResponse.json(newCourse, { status: 201 });
}
