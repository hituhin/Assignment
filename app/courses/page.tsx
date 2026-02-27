"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR, { mutate } from "swr";
import apiClient, { fetcher } from "@/lib/api/client";
import type { CourseWithStats } from "@/types";
import PageHeader from "@/components/layout/PageHeader";
import DataTable, { type Column } from "@/components/ui/DataTable";
import SearchInput from "@/components/ui/SearchInput";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

const DEPARTMENTS = ["", "Computer Science", "Mathematics", "Physics", "Chemistry", "Biology", "Engineering"];

export default function CoursesPage() {
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (department) params.set("department", department);

  const key = `/courses?${params.toString()}`;
  const { data: courses = [], isLoading } = useSWR<CourseWithStats[]>(key, fetcher);

  async function handleDelete() {
    if (!deleteId) return;
    await apiClient.delete(`/courses/${deleteId}`);
    setDeleteId(null);
    mutate(key);
  }

  const columns: Column<CourseWithStats>[] = [
    {
      key: "code",
      header: "Code",
      render: (c) => <span className="font-mono text-sm font-semibold text-blue-600">{c.code}</span>,
    },
    {
      key: "title",
      header: "Course Title",
      render: (c) => (
        <div>
          <p className="text-sm font-medium text-gray-800">{c.title}</p>
          <p className="text-xs text-gray-400">{c.semester}</p>
        </div>
      ),
    },
    { key: "department", header: "Department", render: (c) => <span className="text-sm text-gray-600">{c.department}</span> },
    {
      key: "credits",
      header: "Credits",
      render: (c) => <span className="text-sm text-gray-600 text-center block">{c.credits}</span>,
    },
    {
      key: "instructors",
      header: "Instructors",
      render: (c) => (
        <div className="text-sm text-gray-600">
          {c.instructors.length === 0 ? (
            <span className="text-gray-400">—</span>
          ) : (
            c.instructors.map((f) => f.name).join(", ")
          )}
        </div>
      ),
    },
    {
      key: "enrollmentCount",
      header: "Enrolled",
      render: (c) => (
        <span className="text-sm font-medium text-gray-700">
          {c.enrollmentCount} / {c.maxCapacity}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (c) => (
        <div className="flex items-center gap-2 justify-end">
          <Link
            href={`/courses/${c.id}/edit`}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Edit
          </Link>
          <button
            onClick={() => setDeleteId(c.id)}
            className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Courses" description={`${courses.length} course${courses.length !== 1 ? "s" : ""} found`}>
        <Link
          href="/courses/new"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          + Add Course
        </Link>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 max-w-xs">
          <SearchInput placeholder="Search by title or code..." onChange={setSearch} />
        </div>
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {DEPARTMENTS.map((d) => <option key={d} value={d}>{d || "All Departments"}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <DataTable
          columns={columns}
          data={courses}
          isLoading={isLoading}
          rowKey={(c) => c.id}
          emptyText="No courses found."
        />
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Course"
        message="This will permanently remove the course and all associated enrollments and grades."
      />
    </div>
  );
}
