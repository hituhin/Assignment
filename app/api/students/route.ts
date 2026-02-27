import { NextRequest, NextResponse } from "next/server";
import { getStore, generateId } from "@/lib/db/store";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search")?.toLowerCase() ?? "";
  const department = searchParams.get("department") ?? "";
  const status = searchParams.get("status") ?? "";
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.max(1, Number(searchParams.get("limit") ?? 8));

  let students = getStore().students;

  if (search) {
    students = students.filter(
      (s) =>
        s.name.toLowerCase().includes(search) ||
        s.email.toLowerCase().includes(search) ||
        s.studentCode.toLowerCase().includes(search)
    );
  }
  if (department) students = students.filter((s) => s.department === department);
  if (status) students = students.filter((s) => s.status === status);

  const total = students.length;
  const start = (page - 1) * limit;

  return NextResponse.json({ data: students.slice(start, start + limit), total, page, limit });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const store = getStore();
  const newStudent = { ...body, id: generateId("s") };
  store.students.push(newStudent);
  return NextResponse.json(newStudent, { status: 201 });
}
