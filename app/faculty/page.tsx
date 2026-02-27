"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import useSWR, { mutate } from "swr";
import apiClient, { fetcher } from "@/lib/api/client";
import type { Student, Course, Faculty, PaginatedResponse } from "@/types";
import PageHeader from "@/components/layout/PageHeader";
import Modal from "@/components/ui/Modal";
import Badge from "@/components/ui/Badge";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface FacultyWithStats extends Faculty {
  courses: Course[];
  studentCount: number;
}

// ── Assign Student Form ────────────────────────────────────────────────────────
interface AssignFormValues {
  studentId: string;
  courseId: string;
  semester: string;
}

function AssignStudentForm({
  facultyCourses,
  onClose,
}: {
  facultyCourses: Course[];
  onClose: () => void;
}) {
  const { data: res } = useSWR<PaginatedResponse<Student>>("/students?limit=100", fetcher);
  const students = res?.data ?? [];
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AssignFormValues>({
    defaultValues: { studentId: "", courseId: "", semester: "Fall 2025" },
  });

  async function onSubmit(data: AssignFormValues) {
    await apiClient.post("/enrollments", data);
    await mutate((key: string) => key?.startsWith("/students"), undefined, { revalidate: true });
    onClose();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Student *</label>
        <select
          {...register("studentId", { required: "Select a student" })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">Select student...</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>{s.name} ({s.studentCode})</option>
          ))}
        </select>
        {errors.studentId && <p className="text-xs text-red-500 mt-1">{errors.studentId.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Course *</label>
        <select
          {...register("courseId", { required: "Select a course" })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">Select course...</option>
          {facultyCourses.map((c) => (
            <option key={c.id} value={c.id}>{c.code} — {c.title}</option>
          ))}
        </select>
        {errors.courseId && <p className="text-xs text-red-500 mt-1">{errors.courseId.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Semester *</label>
        <input
          {...register("semester", { required: "Semester is required" })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Fall 2025"
        />
        {errors.semester && <p className="text-xs text-red-500 mt-1">{errors.semester.message}</p>}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Enrolling..." : "Enroll Student"}
        </button>
      </div>
    </form>
  );
}

// ── Bulk Enroll Form ───────────────────────────────────────────────────────────
interface BulkEnrollRow { studentId: string; courseId: string; semester: string }
interface BulkEnrollValues { rows: BulkEnrollRow[] }

function BulkEnrollForm({ onClose }: { onClose: () => void }) {
  const { data: res } = useSWR<PaginatedResponse<Student>>("/students?limit=100", fetcher);
  const students = res?.data ?? [];
  const { data: courses = [] } = useSWR<Course[]>("/courses", fetcher);
  const { control, register, handleSubmit, formState: { errors, isSubmitting } } = useForm<BulkEnrollValues>({
    defaultValues: { rows: [{ studentId: "", courseId: "", semester: "Fall 2025" }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "rows" });

  async function onSubmit(data: BulkEnrollValues) {
    await Promise.all(data.rows.map((row) => apiClient.post("/enrollments", row)));
    await mutate((key: string) => key?.startsWith("/students"), undefined, { revalidate: true });
    onClose();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {fields.map((field, index) => (
          <div key={field.id} className="p-3 bg-gray-50 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Row {index + 1}</span>
              {fields.length > 1 && (
                <button type="button" onClick={() => remove(index)} className="text-gray-400 hover:text-red-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <select
              {...register(`rows.${index}.studentId`, { required: "Required" })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select student...</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.studentCode})</option>)}
            </select>
            {errors.rows?.[index]?.studentId && <p className="text-xs text-red-500">{errors.rows[index].studentId?.message}</p>}

            <select
              {...register(`rows.${index}.courseId`, { required: "Required" })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select course...</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.code} — {c.title}</option>)}
            </select>
            {errors.rows?.[index]?.courseId && <p className="text-xs text-red-500">{errors.rows[index].courseId?.message}</p>}

            <input
              {...register(`rows.${index}.semester`, { required: "Required" })}
              placeholder="Fall 2025"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.rows?.[index]?.semester && <p className="text-xs text-red-500">{errors.rows[index].semester?.message}</p>}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => append({ studentId: "", courseId: "", semester: "Fall 2025" })}
        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Row
      </button>

      <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Enrolling..." : `Enroll ${fields.length} Student${fields.length > 1 ? "s" : ""}`}
        </button>
      </div>
    </form>
  );
}

// ── Bulk Grade Update Form ─────────────────────────────────────────────────────
const LETTER_GRADES = ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"];
const GRADE_POINTS: Record<string, number> = {
  A: 4.0, "A-": 3.7, "B+": 3.3, B: 3.0, "B-": 2.7,
  "C+": 2.3, C: 2.0, "C-": 1.7, D: 1.0, F: 0.0,
};

interface BulkGradeRow { studentId: string; courseId: string; letterGrade: string }
interface BulkGradeValues { rows: BulkGradeRow[] }

function BulkGradeForm({ onClose }: { onClose: () => void }) {
  const { data: res } = useSWR<PaginatedResponse<Student>>("/students?limit=100", fetcher);
  const students = res?.data ?? [];
  const { data: courses = [] } = useSWR<Course[]>("/courses", fetcher);
  const { control, register, handleSubmit, formState: { errors, isSubmitting } } = useForm<BulkGradeValues>({
    defaultValues: { rows: [{ studentId: "", courseId: "", letterGrade: "B" }] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "rows" });

  async function onSubmit(data: BulkGradeValues) {
    const payload = data.rows.map((row) => ({
      ...row,
      numericGrade: GRADE_POINTS[row.letterGrade] ?? 0,
      semester: "Fall 2025",
    }));
    await apiClient.post("/grades/bulk", { grades: payload });
    await mutate((key: string) => key?.startsWith("/students"), undefined, { revalidate: true });
    onClose();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {fields.map((field, index) => (
          <div key={field.id} className="p-3 bg-gray-50 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Row {index + 1}</span>
              {fields.length > 1 && (
                <button type="button" onClick={() => remove(index)} className="text-gray-400 hover:text-red-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <select
              {...register(`rows.${index}.studentId`, { required: "Required" })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select student...</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.studentCode})</option>)}
            </select>
            {errors.rows?.[index]?.studentId && <p className="text-xs text-red-500">{errors.rows[index].studentId?.message}</p>}

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <select
                  {...register(`rows.${index}.courseId`, { required: "Required" })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Select course...</option>
                  {courses.map((c) => <option key={c.id} value={c.id}>{c.code} — {c.title}</option>)}
                </select>
                {errors.rows?.[index]?.courseId && <p className="text-xs text-red-500">{errors.rows[index].courseId?.message}</p>}
              </div>
              <div>
                <select
                  {...register(`rows.${index}.letterGrade`, { required: true })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {LETTER_GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => append({ studentId: "", courseId: "", letterGrade: "B" })}
        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Row
      </button>

      <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? "Updating..." : `Update ${fields.length} Grade${fields.length > 1 ? "s" : ""}`}
        </button>
      </div>
    </form>
  );
}

// ── Main Faculty Page ──────────────────────────────────────────────────────────
type ModalType = "assign" | "bulk-enroll" | "bulk-grade" | null;

export default function FacultyPage() {
  const { data: faculty = [], isLoading } = useSWR<FacultyWithStats[]>("/faculty", fetcher);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyWithStats | null>(null);

  function openAssign(f: FacultyWithStats) {
    setSelectedFaculty(f);
    setActiveModal("assign");
  }

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader title="Faculty" description={`${faculty.length} faculty member${faculty.length !== 1 ? "s" : ""}`}>
        <button
          onClick={() => setActiveModal("bulk-enroll")}
          className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50"
        >
          Bulk Enroll
        </button>
        <button
          onClick={() => setActiveModal("bulk-grade")}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
        >
          Bulk Grade Update
        </button>
      </PageHeader>

      {/* Faculty Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {faculty.map((f) => (
          <div key={f.id} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                  {f.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{f.name}</p>
                  <p className="text-xs text-gray-400">{f.title}</p>
                </div>
              </div>
              <Badge label={f.department} variant="blue" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-lg font-bold text-gray-800">{f.courses.length}</p>
                <p className="text-xs text-gray-400">Courses</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-lg font-bold text-gray-800">{f.studentCount}</p>
                <p className="text-xs text-gray-400">Students</p>
              </div>
            </div>

            {/* Courses list */}
            {f.courses.length > 0 && (
              <div className="space-y-1">
                {f.courses.map((c) => (
                  <div key={c.id} className="flex items-center justify-between text-sm">
                    <span className="font-mono text-xs text-blue-600 font-semibold">{c.code}</span>
                    <span className="text-gray-600 text-xs truncate mx-2 flex-1">{c.title}</span>
                    <span className="text-xs text-gray-400">{c.credits} cr</span>
                  </div>
                ))}
              </div>
            )}

            {/* Email */}
            <p className="text-xs text-gray-400">{f.email}</p>

            {/* Actions */}
            <div className="pt-2 border-t border-gray-100">
              <button
                onClick={() => openAssign(f)}
                className="w-full px-3 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                Assign Student to Course
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modals */}
      <Modal
        isOpen={activeModal === "assign"}
        onClose={() => { setActiveModal(null); setSelectedFaculty(null); }}
        title={`Assign Student — ${selectedFaculty?.name ?? ""}`}
        size="md"
      >
        {selectedFaculty && (
          <AssignStudentForm
            facultyCourses={selectedFaculty.courses}
            onClose={() => { setActiveModal(null); setSelectedFaculty(null); }}
          />
        )}
      </Modal>

      <Modal
        isOpen={activeModal === "bulk-enroll"}
        onClose={() => setActiveModal(null)}
        title="Bulk Enroll Students"
        size="md"
      >
        <BulkEnrollForm onClose={() => setActiveModal(null)} />
      </Modal>

      <Modal
        isOpen={activeModal === "bulk-grade"}
        onClose={() => setActiveModal(null)}
        title="Bulk Grade Update"
        size="md"
      >
        <BulkGradeForm onClose={() => setActiveModal(null)} />
      </Modal>
    </div>
  );
}
