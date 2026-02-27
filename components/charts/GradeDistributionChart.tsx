"use client";

import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface GradeDistributionChartProps {
  data: { grade: string; count: number }[];
}

export default function GradeDistributionChart({ data }: GradeDistributionChartProps) {
  const options: ApexCharts.ApexOptions = {
    chart: { type: "bar", toolbar: { show: false }, fontFamily: "inherit" },
    plotOptions: { bar: { borderRadius: 4, columnWidth: "60%" } },
    dataLabels: { enabled: false },
    xaxis: { categories: data.map((d) => d.grade) },
    yaxis: { title: { text: "Students" }, min: 0, tickAmount: 4 },
    fill: {
      colors: data.map((d) =>
        d.grade.startsWith("A") ? "#22c55e" :
        d.grade.startsWith("B") ? "#3b82f6" :
        d.grade.startsWith("C") ? "#f59e0b" : "#ef4444"
      ),
    },
    grid: { borderColor: "#f1f5f9" },
    tooltip: { y: { formatter: (v) => `${v} student${v !== 1 ? "s" : ""}` } },
  };

  return (
    <Chart
      options={options}
      series={[{ name: "Students", data: data.map((d) => d.count) }]}
      type="bar"
      height={260}
      width="100%"
    />
  );
}
