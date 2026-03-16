export interface TeacherProfile {
    id: number;
    user_id: number;
    employee_number: string | null;
    qualification: string | null;
    specialization: string | null;
    join_date: string | null;
    is_active: boolean;
}

export interface Teacher {
    id: number;
    name: string;
    email: string;
    phone?: string;
    is_active: boolean;
    role?: { name: string; display_name: string };
    teacherProfile?: TeacherProfile;
    created_at: string;
}

export interface StudentProfile {
    id: number;
    user_id: number;
    student_number: string | null;
    date_of_birth: string | null;
    gender: string | null;
    class_id: number | null;
    parent_id: number | null;
    admission_date: string | null;
    is_active: boolean;
}

export interface Student {
    id: number;
    name: string;
    email: string;
    phone?: string;
    is_active: boolean;
    role?: { name: string };
    studentProfile?: StudentProfile;
    created_at: string;
}

export interface GuardianProfile {
    id: number;
    user_id: number;
    relationship: string;
    is_active: boolean;
}

export interface Guardian {
    id: number;
    name: string;
    email: string;
    phone?: string;
    is_active: boolean;
    guardianProfile?: GuardianProfile;
    linkedStudents?: Student[];
    created_at: string;
}

export interface PaginatedUsersResponse<T> {
    data: {
        data: T[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}
