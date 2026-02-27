"use client";

import dynamic from "next/dynamic";
import type { CourseWithStats } from "@/types";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function EnrollmentBarChart({ courses }: { courses: CourseWithStats[] }) {
  const options: ApexCharts.ApexOptions = {
    chart: { type: "bar", toolbar: { show: false }, fontFamily: "inherit" },
    plotOptions: { bar: { borderRadius: 6, columnWidth: "50%" } },
    dataLabels: { enabled: false },
    xaxis: { categories: courses.map((c) => c.code) },
    yaxis: { title: { text: "Students" }, min: 0 },
    fill: { colors: ["#3B82F6"] },
    tooltip: {
      x: {
        formatter: (_v: number, opts?: { dataPointIndex?: number }) =>
          courses[opts?.dataPointIndex ?? 0]?.title ?? "",
      },
    },
    grid: { borderColor: "#f1f5f9" },
  };

  return (
    <Chart
      options={options}
      series={[{ name: "Enrollments", data: courses.map((c) => c.enrollmentCount) }]}
      type="bar"
      height={280}
      width="100%"
    />
  );
}
