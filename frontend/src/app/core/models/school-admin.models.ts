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
    pivot?: { teacher_id: number | null };
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
    class_teacher?: User;
    academic_year?: AcademicYear;
    subjects?: Subject[];
    students?: User[];
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

export interface GradeRange {
    id: number;
    grading_scale_id: number;
    grade_letter: string;
    min_mark: number;
    max_mark: number;
    descriptor: string | null;
    points: number | null;
}

export interface GradingScale {
    id: number;
    name: string;
    is_default: boolean;
    grade_ranges?: GradeRange[];
    grade_ranges_count?: number;
    created_at?: string;
    updated_at?: string;
}

export interface AssessmentType {
    id: number;
    name: string;
    category: 'continuous_assessment' | 'examination';
    weight: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface Assessment {
    id: number;
    title: string;
    assessment_type_id: number;
    subject_id: number;
    school_class_id: number;
    academic_term_id: number;
    max_score: number;
    date: string | null;
    teacher_id: number | null;
    assessment_type?: AssessmentType;
    subject?: Subject;
    school_class?: SchoolClass;
    teacher?: User;
    created_at?: string;
    updated_at?: string;
}

export interface Mark {
    id?: number;
    assessment_id: number;
    student_id: number;
    score: number;
    comment: string | null;
    student?: User;
}

export interface MarkEntry {
    student_id: number;
    student_name: string;
    mark_id: number | null;
    score: number | null;
    comment: string | null;
}

export interface SubjectResult {
    id: number;
    student_id: number;
    subject_id: number;
    school_class_id: number;
    academic_term_id: number;
    ca_score: number | null;
    exam_score: number | null;
    final_mark: number | null;
    grade_letter: string | null;
    points: number | null;
    teacher_comment: string | null;
    teacher_id: number | null;
    subject?: Subject;
    student?: User;
    subject_name?: string;
    subject_code?: string;
}

export interface ReportCardSummary {
    id: number;
    student_id: number;
    school_class_id: number;
    academic_term_id: number;
    status: 'draft' | 'approved' | 'published';
    total_marks: number | null;
    average: number | null;
    position: number | null;
    class_teacher_comment: string | null;
    promotion_status: string | null;
    approved_at: string | null;
    published_at: string | null;
    student?: User;
}

export interface ReportCardDetail {
    report_card: ReportCardSummary;
    student: { id: number; name: string; student_number: string | null; };
    class: { id: number; name: string; grade_level: string; };
    term: { id: number; name: string; };
    academic_year: { id: number; name: string; };
    subject_results: Array<SubjectResult & { subject_name: string; subject_code: string; }>;
    class_teacher?: User;
    class_teacher_comment: string | null;
    class_size: number;
    attendance: { total_days: number | null; present: number | null; absent: number | null; };
}
