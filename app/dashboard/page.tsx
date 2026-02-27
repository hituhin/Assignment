"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api/client";
import type { DashboardStats, StudentWithGPA, CourseWithStats } from "@/types";
import StatCard from "@/components/ui/StatCard";
import DataTable, { type Column } from "@/components/ui/DataTable";
import PageHeader from "@/components/layout/PageHeader";
import EnrollmentBarChart from "@/components/charts/EnrollmentBarChart";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function DashboardPage() {
  const { data, isLoading } = useSWR<DashboardStats>("/dashboard", fetcher);

  if (isLoading || !data) return <LoadingSpinner />;

  const leaderboardColumns: Column<StudentWithGPA>[] = [
    {
      key: "rank",
      header: "#",
      render: (_, i) => <span className="font-bold text-gray-400">{(i ?? 0) + 1}</span>,
    },
    {
      key: "name",
      header: "Student",
      render: (s) => (
        <div>
          <p className="font-medium text-gray-900">{s.name}</p>
          <p className="text-xs text-gray-400">{s.studentCode}</p>
        </div>
      ),
    },
    { key: "dept", header: "Department", render: (s) => s.department },
    {
      key: "gpa",
      header: "GPA",
      render: (s) => (
        <span className={`font-bold ${s.gpa >= 3.5 ? "text-green-600" : s.gpa >= 3.0 ? "text-blue-600" : "text-orange-500"}`}>
          {s.gpa.toFixed(2)}
        </span>
      ),
    },
    { key: "courses", header: "Courses", render: (s) => s.enrollmentCount },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Academic performance overview" />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Students"
          value={data.totalStudents}
          color="blue"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
        />
        <StatCard
          title="Total Courses"
          value={data.totalCourses}
          color="green"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
        />
        <StatCard
          title="Total Faculty"
          value={data.totalFaculty}
          color="purple"
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
        />
      </div>

      {/* Chart + popular courses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Course Enrollments</h2>
          <EnrollmentBarChart courses={data.popularCourses as CourseWithStats[]} />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Most Popular Courses</h2>
          <div className="space-y-3">
            {data.popularCourses.map((course, i) => (
              <div key={course.id} className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{course.title}</p>
                  <p className="text-xs text-gray-400">{course.code}</p>
                </div>
                <span className="text-sm font-semibold text-blue-600">{course.enrollmentCount} students</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-base font-semibold text-gray-800 mb-4">Top Students by GPA</h2>
        <DataTable
          columns={leaderboardColumns}
          data={data.topStudents as StudentWithGPA[]}
          rowKey={(s) => s.id}
          emptyText="No student data found"
        />
      </div>
    </div>
  );
}
