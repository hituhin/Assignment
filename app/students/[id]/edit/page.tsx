"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { mutate } from "swr";
import useSWR from "swr";
import apiClient, { fetcher } from "@/lib/api/client";
import StudentForm, { type StudentFormValues, GRADE_POINTS } from "@/components/students/StudentForm";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { Grade } from "@/types";

interface StudentDetail {
  student: StudentFormValues & { id: string };
  grades: Grade[];
}

export default function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { data, isLoading } = useSWR<StudentDetail>(`/students/${id}`, fetcher);

  if (isLoading || !data) return <LoadingSpinner />;

  const defaultValues: Partial<StudentFormValues> = {
    ...data.student,
    grades: data.grades.map((g) => ({ courseId: g.courseId, letterGrade: g.letterGrade })),
  };

  const handleSubmit = async (formData: StudentFormValues) => {
    setLoading(true);
    try {
      const { grades, ...studentData } = formData;
      await apiClient.put(`/students/${id}`, studentData);

      if (grades.length > 0) {
        await apiClient.post("/grades/bulk", {
          grades: grades.map((g) => ({
            studentId: id,
            courseId: g.courseId,
            letterGrade: g.letterGrade,
            numericGrade: GRADE_POINTS[g.letterGrade] ?? 0,
          })),
        });
      }

      mutate((key: string) => key.startsWith("/students"), undefined, { revalidate: true });
      router.push(`/students/${id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/students/${id}`}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Edit Student</h1>
          <p className="text-xs text-gray-500 mt-0.5">{data.student.name}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <StudentForm defaultValues={defaultValues} onSubmit={handleSubmit} submitLabel="Update Student" loading={loading} />
      </div>
    </div>
  );
}
