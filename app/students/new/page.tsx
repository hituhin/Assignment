"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { mutate } from "swr";
import apiClient from "@/lib/api/client";
import StudentForm, { type StudentFormValues, GRADE_POINTS } from "@/components/students/StudentForm";

export default function NewStudentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: StudentFormValues) => {
    setLoading(true);
    try {
      const { grades, ...studentData } = data;
      const res = await apiClient.post("/students", studentData);
      const newStudent = res.data;

      if (grades.length > 0) {
        await apiClient.post("/grades/bulk", {
          grades: grades.map((g) => ({
            studentId: newStudent.id,
            courseId: g.courseId,
            letterGrade: g.letterGrade,
            numericGrade: GRADE_POINTS[g.letterGrade] ?? 0,
          })),
        });
      }

      mutate((key: string) => key.startsWith("/students"), undefined, { revalidate: true });
      router.push("/students");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/students"
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Add Student</h1>
          <p className="text-xs text-gray-500 mt-0.5">Create a new student record</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <StudentForm onSubmit={handleSubmit} submitLabel="Create Student" loading={loading} />
      </div>
    </div>
  );
}
