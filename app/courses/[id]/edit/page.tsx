"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR, { mutate } from "swr";
import Link from "next/link";
import apiClient, { fetcher } from "@/lib/api/client";
import PageHeader from "@/components/layout/PageHeader";
import CourseForm, { type CourseFormValues } from "@/components/courses/CourseForm";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import type { CourseWithStats } from "@/types";

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { data: course, isLoading } = useSWR<CourseWithStats>(`/courses/${id}`, fetcher);

  if (isLoading || !course) return <LoadingSpinner />;

  const defaultValues: Partial<CourseFormValues> = {
    title: course.title,
    code: course.code,
    description: course.description,
    credits: course.credits,
    semester: course.semester,
    department: course.department,
    maxCapacity: course.maxCapacity,
    instructorIds: course.instructorIds.map((id) => ({ value: id })),
  };

  async function handleSubmit(data: CourseFormValues) {
    setLoading(true);
    try {
      const payload = {
        ...data,
        credits: Number(data.credits),
        maxCapacity: Number(data.maxCapacity),
        instructorIds: data.instructorIds.map((i) => i.value).filter(Boolean),
      };
      await apiClient.put(`/courses/${id}`, payload);
      await mutate((key: string) => key?.startsWith("/courses"), undefined, { revalidate: true });
      router.push("/courses");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title={`Edit: ${course.title}`} description={course.code}>
        <Link href="/courses" className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50">
          Cancel
        </Link>
      </PageHeader>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <CourseForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
          loading={loading}
        />
      </div>
    </div>
  );
}
