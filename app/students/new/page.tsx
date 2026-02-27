"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import apiClient from "@/lib/api/client";
import StudentForm, { type StudentFormValues, GRADE_POINTS } from "@/components/students/StudentForm";
import PageHeader from "@/components/layout/PageHeader";

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
    <div className="max-w-2xl">
      <PageHeader title="Add Student" description="Create a new student record" />
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <StudentForm onSubmit={handleSubmit} submitLabel="Create Student" loading={loading} />
      </div>
    </div>
  );
}
