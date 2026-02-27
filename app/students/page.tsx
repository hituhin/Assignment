"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetcher } from "@/lib/api/client";
import apiClient from "@/lib/api/client";
import type { Student, PaginatedResponse } from "@/types";
import DataTable, { type Column } from "@/components/ui/DataTable";
import Pagination from "@/components/ui/Pagination";
import PageHeader from "@/components/layout/PageHeader";
import SearchInput from "@/components/ui/SearchInput";
import Badge from "@/components/ui/Badge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

const DEPARTMENTS = ["Computer Science", "Mathematics", "Physics", "Chemistry", "Biology", "Engineering"];

export default function StudentsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [status, setStatus] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const params = new URLSearchParams({
    page: String(page), limit: "8",
    ...(search && { search }),
    ...(department && { department }),
    ...(status && { status }),
  });
  const swrKey = `/students?${params}`;
  const { data, isLoading } = useSWR<PaginatedResponse<Student>>(swrKey, fetcher);

  const resetPage = () => setPage(1);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/students/${deleteId}`);
      mutate(swrKey);
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const columns: Column<Student>[] = [
    {
      key: "name",
      header: "Student",
      render: (s) => (
        <div>
          <p className="font-medium text-gray-900">{s.name}</p>
          <p className="text-xs text-gray-400">{s.email}</p>
        </div>
      ),
    },
    { key: "code", header: "Code", render: (s) => <span className="font-mono text-xs">{s.studentCode}</span> },
    { key: "dept", header: "Department", render: (s) => s.department },
    { key: "year", header: "Year", render: (s) => s.enrollmentYear },
    { key: "status", header: "Status", render: (s) => <Badge label={s.status} variant={s.status === "active" ? "green" : "gray"} /> },
    {
      key: "actions",
      header: "",
      render: (s) => (
        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <Link href={`/students/${s.id}/edit`} className="text-xs text-blue-600 hover:underline font-medium">Edit</Link>
          <button onClick={() => setDeleteId(s.id)} className="text-xs text-red-500 hover:underline font-medium">Delete</button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Students" description={`${data?.total ?? 0} total students`}>
        <Link href="/students/new" className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
          + Add Student
        </Link>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="sm:w-64">
          <SearchInput placeholder="Search name, email, code..." value={search} onChange={(v) => { setSearch(v); resetPage(); }} />
        </div>
        <select
          value={department}
          onChange={(e) => { setDepartment(e.target.value); resetPage(); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Departments</option>
          {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); resetPage(); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <DataTable
          columns={columns}
          data={data?.data ?? []}
          isLoading={isLoading}
          rowKey={(s) => s.id}
          onRowClick={(s) => router.push(`/students/${s.id}`)}
          emptyText="No students found"
        />
        <Pagination page={page} total={data?.total ?? 0} limit={8} onPageChange={setPage} />
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Student"
        message="This will permanently remove the student and all associated grades."
        loading={deleting}
      />
    </div>
  );
}
