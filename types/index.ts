export interface Student {
  id: string;
  name: string;
  email: string;
  studentCode: string;
  enrollmentYear: number;
  department: string;
  status: "active" | "inactive";
}

export interface Course {
  id: string;
  title: string;
  code: string;
  description: string;
  credits: number;
  semester: string;
  department: string;
  instructorIds: string[];
  maxCapacity: number;
}

export interface Faculty {
  id: string;
  name: string;
  email: string;
  department: string;
  title: string;
  courseIds: string[];
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrolledAt: string;
  semester: string;
}

export interface Grade {
  id: string;
  studentId: string;
  courseId: string;
  enrollmentId: string;
  letterGrade: string;
  numericGrade: number;
  semester: string;
}

export interface StudentWithGPA extends Student {
  gpa: number;
  enrollmentCount: number;
}

export interface CourseWithStats extends Course {
  enrollmentCount: number;
  instructors: Faculty[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface DashboardStats {
  totalStudents: number;
  totalCourses: number;
  totalFaculty: number;
  topStudents: StudentWithGPA[];
  popularCourses: CourseWithStats[];
}
