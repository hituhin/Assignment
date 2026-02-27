"use client";

import { use } from "react";
import useSWR from "swr";
import Link from "next/link";
import { fetcher } from "@/lib/api/client";
import type { Grade } from "@/types";
import PageHeader from "@/components/layout/PageHeader";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface CourseEnrollment {
  id: string;
  courseId: string;
  course?: { title: string; code: string; credits: number };
  grade?: Grade;
}

interface StudentDetail {
  student: {
    id: string; name: string; email: string;
    studentCode: string; enrollmentYear: number;
    department: string; status: string;
  };
  enrollments: CourseEnrollment[];
  grades: Grade[];
}

function computeGPA(grades: Grade[]) {
  if (!grades.length) return "N/A";
  return (grades.reduce((s, g) => s + g.numericGrade, 0) / grades.length).toFixed(2);
}

export default function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading } = useSWR<StudentDetail>(`/students/${id}`, fetcher);

  if (isLoading || !data) return <LoadingSpinner />;
  const { student, enrollments, grades } = data;

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader title={student.name} description={student.studentCode}>
        <Link href={`/students/${id}/edit`} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">Edit</Link>
        <Link href="/students" className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50">Back</Link>
      </PageHeader>

      {/* Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div><p className="text-xs text-gray-400">Email</p><p className="text-sm font-medium">{student.email}</p></div>
        <div><p className="text-xs text-gray-400">Department</p><p className="text-sm font-medium">{student.department}</p></div>
        <div><p className="text-xs text-gray-400">Year</p><p className="text-sm font-medium">{student.enrollmentYear}</p></div>
        <div><p className="text-xs text-gray-400">Status</p><Badge label={student.status} variant={student.status === "active" ? "green" : "gray"} /></div>
      </div>

      {/* GPA summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{computeGPA(grades)}</p>
          <p className="text-xs text-gray-400 mt-1">GPA</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-800">{enrollments.length}</p>
          <p className="text-xs text-gray-400 mt-1">Enrolled Courses</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-800">{grades.length}</p>
          <p className="text-xs text-gray-400 mt-1">Graded</p>
        </div>
      </div>

      {/* Courses */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Enrolled Courses & Grades</h2>
        {enrollments.length === 0 ? (
          <p className="text-sm text-gray-400">No courses enrolled yet.</p>
        ) : (
          <div className="space-y-3">
            {enrollments.map((e) => (
              <div key={e.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-800">{e.course?.title ?? e.courseId}</p>
                  <p className="text-xs text-gray-400">{e.course?.code} · {e.course?.credits ?? "—"} credits</p>
                </div>
                <div className="text-right">
                  {e.grade ? (
                    <>
                      <span className={`text-sm font-bold ${e.grade.numericGrade >= 3.5 ? "text-green-600" : e.grade.numericGrade >= 3.0 ? "text-blue-600" : "text-orange-500"}`}>
                        {e.grade.letterGrade}
                      </span>
                      <p className="text-xs text-gray-400">{e.grade.numericGrade.toFixed(1)}</p>
                    </>
                  ) : (
                    <span className="text-xs text-gray-400">No grade</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
