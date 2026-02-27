import { NextResponse } from "next/server";
import { getStore } from "@/lib/db/store";
import { computeGPA } from "@/lib/utils/gpa";

export async function GET() {
  const store = getStore();

  const studentsWithGPA = store.students.map((student) => {
    const grades = store.grades.filter((g) => g.studentId === student.id);
    const enrollmentCount = store.enrollments.filter((e) => e.studentId === student.id).length;
    return { ...student, gpa: computeGPA(grades), enrollmentCount };
  });

  const topStudents = [...studentsWithGPA].sort((a, b) => b.gpa - a.gpa).slice(0, 5);

  const popularCourses = store.courses
    .map((course) => {
      const enrollmentCount = store.enrollments.filter((e) => e.courseId === course.id).length;
      const instructors = store.faculty.filter((f) => course.instructorIds.includes(f.id));
      return { ...course, enrollmentCount, instructors };
    })
    .sort((a, b) => b.enrollmentCount - a.enrollmentCount);

  return NextResponse.json({
    totalStudents: store.students.length,
    totalCourses: store.courses.length,
    totalFaculty: store.faculty.length,
    topStudents,
    popularCourses,
  });
}
