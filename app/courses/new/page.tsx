"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import apiClient from "@/lib/api/client";
import PageHeader from "@/components/layout/PageHeader";
import CourseForm, { type CourseFormValues } from "@/components/courses/CourseForm";
import Link from "next/link";

export default function NewCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(data: CourseFormValues) {
    setLoading(true);
    try {
      const payload = {
        ...data,
        credits: Number(data.credits),
        maxCapacity: Number(data.maxCapacity),
        instructorIds: data.instructorIds.map((i) => i.value).filter(Boolean),
      };
      await apiClient.post("/courses", payload);
      await mutate((key: string) => key?.startsWith("/courses"), undefined, { revalidate: true });
      router.push("/courses");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="New Course" description="Add a new course to the system">
        <Link href="/courses" className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50">
          Cancel
        </Link>
      </PageHeader>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <CourseForm onSubmit={handleSubmit} submitLabel="Create Course" loading={loading} />
      </div>
    </div>
  );
}
