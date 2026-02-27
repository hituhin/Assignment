"use client";

import { useForm } from "react-hook-form";
import useSWR from "swr";
import { fetcher } from "@/lib/api/client";
import GradeFieldArray from "./GradeFieldArray";
import type { Course } from "@/types";

export interface StudentFormValues {
  name: string;
  email: string;
  studentCode: string;
  enrollmentYear: number;
  department: string;
  status: "active" | "inactive";
  grades: { courseId: string; letterGrade: string }[];
}

const DEPARTMENTS = ["Computer Science", "Mathematics", "Physics", "Chemistry", "Biology", "Engineering"];
const POINTS: Record<string, number> = {
  A: 4.0, "A-": 3.7, "B+": 3.3, B: 3.0, "B-": 2.7,
  "C+": 2.3, C: 2.0, "C-": 1.7, D: 1.0, F: 0.0,
};
export { POINTS as GRADE_POINTS };

interface StudentFormProps {
  defaultValues?: Partial<StudentFormValues>;
  onSubmit: (data: StudentFormValues) => Promise<void>;
  submitLabel?: string;
  loading?: boolean;
}

export default function StudentForm({ defaultValues, onSubmit, submitLabel = "Save", loading }: StudentFormProps) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<StudentFormValues>({
    defaultValues: {
      name: "", email: "", studentCode: "",
      enrollmentYear: new Date().getFullYear(),
      department: "Computer Science", status: "active", grades: [],
      ...defaultValues,
    },
  });

  const { data: courses = [] } = useSWR<Course[]>("/courses", fetcher);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
        <input
          {...register("name", { required: "Name is required", minLength: { value: 2, message: "Min 2 characters" } })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Alice Johnson"
        />
        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
        <input
          {...register("email", {
            required: "Email is required",
            pattern: { value: /^\S+@\S+\.\S+$/, message: "Invalid email" },
          })}
          type="email"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="alice@university.edu"
        />
        {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
      </div>

      {/* Code + Year */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Student Code *</label>
          <input
            {...register("studentCode", { required: "Code is required" })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="STU-011"
          />
          {errors.studentCode && <p className="text-xs text-red-500 mt-1">{errors.studentCode.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment Year *</label>
          <input
            {...register("enrollmentYear", {
              required: "Year is required",
              min: { value: 2000, message: "Min year 2000" },
              max: { value: new Date().getFullYear(), message: "Cannot be future year" },
              valueAsNumber: true,
            })}
            type="number"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.enrollmentYear && <p className="text-xs text-red-500 mt-1">{errors.enrollmentYear.message}</p>}
        </div>
      </div>

      {/* Department + Status */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
          <select
            {...register("department", { required: true })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            {...register("status")}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Dynamic grades */}
      <div className="pt-2 border-t border-gray-200">
        <GradeFieldArray control={control} errors={errors} courses={courses} />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading ? "Saving..." : submitLabel}
      </button>
    </form>
  );
}
