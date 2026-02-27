"use client";

import { useForm } from "react-hook-form";
import useSWR from "swr";
import { fetcher } from "@/lib/api/client";
import InstructorFieldArray from "./InstructorFieldArray";
import type { Faculty } from "@/types";

export interface CourseFormValues {
  title: string;
  code: string;
  description: string;
  credits: number;
  semester: string;
  department: string;
  maxCapacity: number;
  instructorIds: { value: string }[];
}

const DEPARTMENTS = ["Computer Science", "Mathematics", "Physics", "Chemistry", "Biology", "Engineering"];

interface CourseFormProps {
  defaultValues?: Partial<CourseFormValues>;
  onSubmit: (data: CourseFormValues) => Promise<void>;
  submitLabel?: string;
  loading?: boolean;
}

export default function CourseForm({ defaultValues, onSubmit, submitLabel = "Save", loading }: CourseFormProps) {
  const { register, handleSubmit, control, formState: { errors } } = useForm<CourseFormValues>({
    defaultValues: {
      title: "", code: "", description: "",
      credits: 3, semester: "Fall 2025",
      department: "Computer Science", maxCapacity: 30,
      instructorIds: [],
      ...defaultValues,
    },
  });

  const { data: faculty = [] } = useSWR<Faculty[]>("/faculty", fetcher);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Course Title *</label>
        <input
          {...register("title", { required: "Title is required", minLength: { value: 3, message: "Min 3 characters" } })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Data Structures"
        />
        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
      </div>

      {/* Code + Credits */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Course Code *</label>
          <input
            {...register("code", { required: "Code is required", pattern: { value: /^[A-Z]{2,6}\d{3,4}$/, message: "Format: CS301" } })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="CS301"
          />
          {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Credits *</label>
          <input
            {...register("credits", {
              required: "Credits required",
              min: { value: 1, message: "Min 1 credit" },
              max: { value: 6, message: "Max 6 credits" },
              valueAsNumber: true,
            })}
            type="number"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.credits && <p className="text-xs text-red-500 mt-1">{errors.credits.message}</p>}
        </div>
      </div>

      {/* Semester + Max Capacity */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Semester *</label>
          <input
            {...register("semester", { required: "Semester is required" })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Fall 2025"
          />
          {errors.semester && <p className="text-xs text-red-500 mt-1">{errors.semester.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Capacity *</label>
          <input
            {...register("maxCapacity", {
              required: "Capacity required",
              min: { value: 1, message: "Min 1" },
              max: { value: 500, message: "Max 500" },
              valueAsNumber: true,
            })}
            type="number"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.maxCapacity && <p className="text-xs text-red-500 mt-1">{errors.maxCapacity.message}</p>}
        </div>
      </div>

      {/* Department */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
        <select
          {...register("department", { required: true })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          {...register("description")}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Brief course description..."
        />
      </div>

      {/* Dynamic instructors */}
      <div className="pt-2 border-t border-gray-200">
        <InstructorFieldArray control={control} errors={errors} faculty={faculty} />
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
