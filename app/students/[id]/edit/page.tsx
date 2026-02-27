"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import useSWR from "swr";
import apiClient, { fetcher } from "@/lib/api/client";
import StudentForm, { type StudentFormValues, GRADE_POINTS } from "@/components/students/StudentForm";
import PageHeader from "@/components/layout/PageHeader";
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
    <div className="max-w-2xl">
      <PageHeader title="Edit Student" description={data.student.name} />
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <StudentForm defaultValues={defaultValues} onSubmit={handleSubmit} submitLabel="Update Student" loading={loading} />
      </div>
    </div>
  );
}
