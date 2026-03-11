export interface User {
    id: number;
    name: string;
    email: string;
    role?: string;
}

export interface Department {
    id: number;
    name: string;
    description: string | null;
    school_id: number;
    hod_id: number | null;
    hod?: User;
    subjects_count?: number;
    created_at: string;
    updated_at: string;
}

export interface Subject {
    id: number;
    name: string;
    code: string;
    description: string | null;
    department_id: number | null;
    school_id: number;
    education_level: 'ecd' | 'primary' | 'secondary' | 'all';
    is_active: boolean;
    department?: Department;
    created_at: string;
    updated_at: string;
}

export interface AcademicYear {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    is_current: boolean;
    school_id: number;
    terms?: AcademicTerm[];
    created_at: string;
    updated_at: string;
}

export interface AcademicTerm {
    id: number;
    name: string;
    academic_year_id: number;
    start_date: string;
    end_date: string;
    is_current: boolean;
    academicYear?: AcademicYear;
    created_at: string;
    updated_at: string;
}

export interface SchoolClass {
    id: number;
    name: string;
    grade_level: string;
    stream: string | null;
    capacity: number;
    class_teacher_id: number | null;
    school_id: number;
    academic_year_id: number | null;
    classTeacher?: User;
    academicYear?: AcademicYear;
    subjects?: Subject[];
    students_count?: number;
    created_at: string;
    updated_at: string;
}

export interface Timetable {
    id: number;
    school_class_id: number;
    subject_id: number;
    teacher_id: number;
    academic_term_id: number;
    day_of_week: number; // 1=Mon ... 7=Sun
    start_time: string;
    end_time: string;
    schoolClass?: SchoolClass;
    subject?: Subject;
    teacher?: User;
    academicTerm?: AcademicTerm;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}
