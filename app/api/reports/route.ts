import { NextResponse } from "next/server";
import { getStore } from "@/lib/db/store";
import { computeGPA } from "@/lib/utils/gpa";

export async function GET() {
  const store = getStore();

  // All students sorted by GPA descending
  const allStudents = store.students
    .map((student) => {
      const grades = store.grades.filter((g) => g.studentId === student.id);
      const enrollmentCount = store.enrollments.filter((e) => e.studentId === student.id).length;
      return { ...student, gpa: computeGPA(grades), enrollmentCount };
    })
    .sort((a, b) => b.gpa - a.gpa);

  // Grade distribution (count of each letter grade across all grades)
  const gradeOrder = ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"];
  const gradeCounts: Record<string, number> = {};
  store.grades.forEach((g) => {
    gradeCounts[g.letterGrade] = (gradeCounts[g.letterGrade] ?? 0) + 1;
  });
  const gradeDistribution = gradeOrder.map((grade) => ({
    grade,
    count: gradeCounts[grade] ?? 0,
  }));

  // Enrollment by department
  const deptMap: Record<string, number> = {};
  store.enrollments.forEach((e) => {
    const student = store.students.find((s) => s.id === e.studentId);
    if (student) {
      deptMap[student.department] = (deptMap[student.department] ?? 0) + 1;
    }
  });
  const departmentEnrollment = Object.entries(deptMap).map(([department, count]) => ({
    department,
    count,
  }));

  // Course enrollment: courses sorted by enrollment count descending
  const courseEnrollment = store.courses.map((course) => {
    const enrollmentCount = store.enrollments.filter((e) => e.courseId === course.id).length;
    const instructors = store.faculty.filter((f) => course.instructorIds.includes(f.id));
    const fillPct = course.maxCapacity > 0 ? Math.round((enrollmentCount / course.maxCapacity) * 100) : 0;
    return {
      id: course.id,
      code: course.code,
      title: course.title,
      department: course.department,
      semester: course.semester,
      credits: course.credits,
      maxCapacity: course.maxCapacity,
      enrollmentCount,
      fillPct,
      instructors: instructors.map((f) => f.name),
    };
  }).sort((a, b) => b.enrollmentCount - a.enrollmentCount);

  return NextResponse.json({ allStudents, gradeDistribution, departmentEnrollment, courseEnrollment });
}
