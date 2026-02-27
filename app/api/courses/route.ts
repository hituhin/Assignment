import { NextResponse } from "next/server";
import { getStore } from "@/lib/db/store";

export async function GET() {
  const store = getStore();
  const courses = store.courses.map((course) => ({
    ...course,
    enrollmentCount: store.enrollments.filter((e) => e.courseId === course.id).length,
    instructors: store.faculty.filter((f) => course.instructorIds.includes(f.id)),
  }));
  return NextResponse.json(courses);
}
