"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api/client";
import { exportCsv } from "@/lib/utils/csv";
import type { StudentWithGPA } from "@/types";
import PageHeader from "@/components/layout/PageHeader";
import DataTable, { type Column } from "@/components/ui/DataTable";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import GradeDistributionChart from "@/components/charts/GradeDistributionChart";
import DepartmentDonutChart from "@/components/charts/DepartmentDonutChart";
import { cn } from "@/lib/utils/cn";

interface CourseEnrollment {
  id: string; code: string; title: string; department: string;
  semester: string; credits: number; maxCapacity: number;
  enrollmentCount: number; fillPct: number; instructors: string[];
}

interface ReportsData {
  allStudents: (StudentWithGPA & { enrollmentCount: number })[];
  gradeDistribution: { grade: string; count: number }[];
  departmentEnrollment: { department: string; count: number }[];
  courseEnrollment: CourseEnrollment[];
}

function DownloadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

const TABS = [
  { key: "students", label: "Student GPA Report" },
  { key: "courses", label: "Course Enrollment Report" },
] as const;

type TabKey = typeof TABS[number]["key"];

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("students");
  const { data, isLoading } = useSWR<ReportsData>("/reports", fetcher);

  if (isLoading || !data) return <LoadingSpinner />;

  const { allStudents, gradeDistribution, departmentEnrollment, courseEnrollment } = data;

  const totalEnrollments = departmentEnrollment.reduce((s, d) => s + d.count, 0);
  const avgGPA = allStudents.length
    ? (allStudents.reduce((s, st) => s + st.gpa, 0) / allStudents.length).toFixed(2)
    : "N/A";
  const topGrade = gradeDistribution.reduce((a, b) => (b.count > a.count ? b : a), gradeDistribution[0]);

  // ── Student table columns ──────────────────────────────────────────────────
  const studentColumns: Column<StudentWithGPA & { enrollmentCount: number }>[] = [
    {
      key: "rank",
      header: "#",
      render: (_, i) => <span className="font-bold text-gray-400 text-sm w-5 block">{(i ?? 0) + 1}</span>,
    },
    {
      key: "name",
      header: "Student",
      render: (s) => (
        <div>
          <p className="text-sm font-medium text-gray-900">{s.name}</p>
          <p className="text-xs text-gray-400">{s.studentCode}</p>
        </div>
      ),
    },
    {
      key: "department",
      header: "Department",
      render: (s) => <span className="text-sm text-gray-600">{s.department}</span>,
    },
    {
      key: "status",
      header: "Status",
      render: (s) => <Badge label={s.status} variant={s.status === "active" ? "green" : "gray"} />,
    },
    {
      key: "courses",
      header: "Courses",
      render: (s) => <span className="text-sm text-gray-600 text-center block">{s.enrollmentCount}</span>,
    },
    {
      key: "gpa",
      header: "GPA",
      render: (s) => (
        <span className={`text-sm font-bold ${s.gpa >= 3.5 ? "text-green-600" : s.gpa >= 3.0 ? "text-blue-600" : s.gpa > 0 ? "text-orange-500" : "text-gray-400"}`}>
          {s.gpa > 0 ? s.gpa.toFixed(2) : "N/A"}
        </span>
      ),
    },
  ];

  // ── Course enrollment table columns ───────────────────────────────────────
  const courseColumns: Column<CourseEnrollment>[] = [
    {
      key: "rank",
      header: "#",
      render: (_, i) => <span className="font-bold text-gray-400 text-sm w-5 block">{(i ?? 0) + 1}</span>,
    },
    {
      key: "course",
      header: "Course",
      render: (c) => (
        <div>
          <p className="text-sm font-medium text-gray-900">{c.title}</p>
          <p className="text-xs text-gray-400">{c.code} · {c.semester}</p>
        </div>
      ),
    },
    {
      key: "department",
      header: "Department",
      render: (c) => <span className="text-sm text-gray-600">{c.department}</span>,
    },
    {
      key: "instructors",
      header: "Instructors",
      render: (c) => (
        <span className="text-sm text-gray-600">
          {c.instructors.length > 0 ? c.instructors.join(", ") : <span className="text-gray-300">—</span>}
        </span>
      ),
    },
    {
      key: "credits",
      header: "Credits",
      render: (c) => <span className="text-sm text-gray-600 text-center block">{c.credits}</span>,
    },
    {
      key: "enrollment",
      header: "Enrolled / Capacity",
      render: (c) => (
        <div className="min-w-30">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-gray-800">
              {c.enrollmentCount}
              <span className="text-gray-400 font-normal"> / {c.maxCapacity}</span>
            </span>
            <span className={`text-xs font-medium ml-2 ${c.fillPct >= 90 ? "text-red-500" : c.fillPct >= 70 ? "text-amber-500" : "text-green-600"}`}>
              {c.fillPct}%
            </span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${c.fillPct >= 90 ? "bg-red-500" : c.fillPct >= 70 ? "bg-amber-400" : "bg-green-500"}`}
              style={{ width: `${Math.min(c.fillPct, 100)}%` }}
            />
          </div>
        </div>
      ),
    },
  ];

  function handleExportStudents() {
    exportCsv("student_gpa_report.csv", allStudents.map((s, i) => ({
      Rank: i + 1,
      Name: s.name,
      Email: s.email,
      "Student Code": s.studentCode,
      Department: s.department,
      Status: s.status,
      "Enrollment Year": s.enrollmentYear,
      "Enrolled Courses": s.enrollmentCount,
      GPA: s.gpa > 0 ? s.gpa.toFixed(2) : "N/A",
    })));
  }

  function handleExportCourses() {
    exportCsv("course_enrollment_report.csv", courseEnrollment.map((c, i) => ({
      Rank: i + 1,
      Code: c.code,
      Title: c.title,
      Department: c.department,
      Semester: c.semester,
      Credits: c.credits,
      "Enrolled Students": c.enrollmentCount,
      "Max Capacity": c.maxCapacity,
      "Fill %": `${c.fillPct}%`,
      Instructors: c.instructors.join("; "),
    })));
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Reports & Analytics" description="Academic performance insights and data exports" />

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">{allStudents.length}</p>
          <p className="text-xs text-gray-400 mt-1">Total Students</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{avgGPA}</p>
          <p className="text-xs text-gray-400 mt-1">Average GPA</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">{totalEnrollments}</p>
          <p className="text-xs text-gray-400 mt-1">Total Enrollments</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-amber-500">{topGrade?.grade ?? "—"}</p>
          <p className="text-xs text-gray-400 mt-1">Most Common Grade</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Grade Distribution</h2>
          <GradeDistributionChart data={gradeDistribution.filter((d) => d.count > 0)} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Enrollments by Department</h2>
          <DepartmentDonutChart data={departmentEnrollment} />
        </div>
      </div>

      {/* Tab View */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Tab Headers */}
        <div className="flex border-b border-gray-200">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "flex-1 sm:flex-none px-6 py-3.5 text-sm font-medium transition-colors border-b-2 -mb-px",
                activeTab === tab.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              {tab.label}
            </button>
          ))}
          {/* Export button pushed to the right */}
          <div className="flex-1 flex items-center justify-end px-4">
            <button
              onClick={activeTab === "students" ? handleExportStudents : handleExportCourses}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <DownloadIcon />
              Export CSV
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "students" && (
          <DataTable
            columns={studentColumns}
            data={allStudents}
            rowKey={(s) => s.id}
            emptyText="No student data."
          />
        )}

        {activeTab === "courses" && (
          <DataTable
            columns={courseColumns}
            data={courseEnrollment}
            rowKey={(c) => c.id}
            emptyText="No course data."
          />
        )}
      </div>
    </div>
  );
}
