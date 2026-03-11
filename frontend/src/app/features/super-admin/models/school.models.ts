export type SchoolStatus = 'active' | 'inactive' | 'suspended';
export type EducationLevel = 'ecd' | 'primary' | 'secondary' | 'combined';

export interface SubscriptionPlan {
    id: number;
    name: string;
    slug?: string;
    description?: string;
    max_students: number;
    max_teachers: number;
    max_storage_gb?: number;
    features: string[];
    price_monthly: number;
    price_yearly?: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Location {
    id: number;
    name: string;
}

export interface School {
    id: string;
    name: string;
    slug: string;
    email: string;
    phone: string;
    address: string;
    country_id?: number;
    state_id?: number;
    city_id?: number;
    logo?: string;
    website?: string;
    education_level?: EducationLevel;
    educationLevel?: EducationLevel;
    status: SchoolStatus;
    subscription_plan_id?: number;
    subscriptionPlanId?: number;
    subscriptionPlan?: SubscriptionPlan;
    country?: Location;
    state?: Location;
    city?: Location;
    max_students?: number;
    maxStudents?: number;
    max_teachers?: number;
    maxTeachers?: number;
    studentCount: number;
    teacherCount: number;
    created_at?: string;
    createdAt?: string;
    updated_at?: string;
    updatedAt?: string;
}

export interface CreateSchoolPayload {
    name: string;
    email: string;
    phone?: string;
    address?: string;
    country_id?: number;
    state_id?: number;
    city_id?: number;
    website?: string;
    education_level?: EducationLevel;
    max_students?: number;
    max_teachers?: number;
    subscription_plan_id?: number;
}

export interface UpdateSchoolPayload extends Partial<CreateSchoolPayload> {
    status?: SchoolStatus;
}

export interface CreatePlanPayload {
    name: string;
    max_students: number;
    max_teachers: number;
    features: string[];
    price_monthly: number;
    price_yearly?: number;
    max_storage_gb?: number;
    description?: string;
}

export interface PlatformStats {
    totalSchools: number;
    activeSchools: number;
    totalStudents: number;
    totalTeachers: number;
    totalParents: number;
    schoolsByPlan: { planName: string; count: number }[];
    recentSchools: School[];
}

export interface SchoolRole {
    id: number;
    name: string;
    display_name: string;
}

export interface SchoolUser {
    id: number;
    name: string;
    email: string;
    phone?: string;
    is_active: boolean;
    roles: SchoolRole[];
    created_at: string;
}

export interface CreateSchoolUserPayload {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role_ids: number[];
}

export interface PaginatedResponse<T> {
    success: boolean;
    message: string;
    data: {
        data: T[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}
