"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { mutate } from "swr";
import apiClient from "@/lib/api/client";
import CourseForm, { type CourseFormValues } from "@/components/courses/CourseForm";

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
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/courses"
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">New Course</h1>
          <p className="text-xs text-gray-500 mt-0.5">Add a new course to the system</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <CourseForm onSubmit={handleSubmit} submitLabel="Create Course" loading={loading} />
      </div>
    </div>
  );
}
