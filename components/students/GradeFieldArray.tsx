"use client";

import { useFieldArray, type Control, type FieldErrors } from "react-hook-form";
import type { StudentFormValues } from "./StudentForm";

const LETTER_GRADES = ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D", "F"];

interface GradeFieldArrayProps {
  control: Control<StudentFormValues>;
  errors: FieldErrors<StudentFormValues>;
  courses: { id: string; title: string; code: string }[];
}

export default function GradeFieldArray({ control, errors, courses }: GradeFieldArrayProps) {
  const { fields, append, remove } = useFieldArray({ control, name: "grades" });

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">Grades</label>
        <button
          type="button"
          onClick={() => append({ courseId: "", letterGrade: "" })}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Grade
        </button>
      </div>

      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
            <div className="flex-1 min-w-0">
              <select
                {...control.register(`grades.${index}.courseId`, { required: "Please select a course" })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.code} — {c.title}</option>
                ))}
              </select>
              {errors.grades?.[index]?.courseId && (
                <p className="text-xs text-red-500 mt-1">{errors.grades[index].courseId?.message}</p>
              )}
            </div>
            <div className="w-32">
              <select
                {...control.register(`grades.${index}.letterGrade`, { required: "Please select a grade" })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">Select grade</option>
                {LETTER_GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
              {errors.grades?.[index]?.letterGrade && (
                <p className="text-xs text-red-500 mt-1">{errors.grades[index].letterGrade?.message}</p>
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
          <p className="text-sm text-gray-400 italic py-1">No grades added. Click "Add Grade" above.</p>
        )}
      </div>
    </div>
  );
}
