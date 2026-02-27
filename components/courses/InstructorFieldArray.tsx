"use client";

import { useFieldArray, type Control, type FieldErrors } from "react-hook-form";
import type { CourseFormValues } from "./CourseForm";

interface InstructorFieldArrayProps {
  control: Control<CourseFormValues>;
  errors: FieldErrors<CourseFormValues>;
  faculty: { id: string; name: string; title: string }[];
}

export default function InstructorFieldArray({ control, errors, faculty }: InstructorFieldArrayProps) {
  const { fields, append, remove } = useFieldArray({ control, name: "instructorIds" });

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">Instructors</label>
        <button
          type="button"
          onClick={() => append({ value: "" })}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Instructor
        </button>
      </div>

      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-start gap-2">
            <div className="flex-1">
              <select
                {...control.register(`instructorIds.${index}.value`, { required: "Instructor required" })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select instructor</option>
                {faculty.map((f) => (
                  <option key={f.id} value={f.id}>{f.name} — {f.title}</option>
                ))}
              </select>
              {errors.instructorIds?.[index]?.value && (
                <p className="text-xs text-red-500 mt-1">{errors.instructorIds[index].value?.message}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => remove(index)}
              className="p-2 text-gray-400 hover:text-red-500"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
        {fields.length === 0 && (
          <p className="text-sm text-gray-400 italic py-1">No instructors added. Click "Add Instructor" above.</p>
        )}
      </div>
    </div>
  );
}
