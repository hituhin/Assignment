"use client";

import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface DepartmentDonutChartProps {
  data: { department: string; count: number }[];
}

export default function DepartmentDonutChart({ data }: DepartmentDonutChartProps) {
  const options: ApexCharts.ApexOptions = {
    chart: { type: "donut", fontFamily: "inherit" },
    labels: data.map((d) => d.department),
    colors: ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ef4444", "#06b6d4"],
    legend: { position: "bottom", fontSize: "12px" },
    dataLabels: { enabled: true, formatter: (v: number) => `${Math.round(v)}%` },
    plotOptions: { pie: { donut: { size: "60%" } } },
    tooltip: { y: { formatter: (v) => `${v} enrollment${v !== 1 ? "s" : ""}` } },
  };

  return (
    <Chart
      options={options}
      series={data.map((d) => d.count)}
      type="donut"
      height={280}
      width="100%"
    />
  );
}
