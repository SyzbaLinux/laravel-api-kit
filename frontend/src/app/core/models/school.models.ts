export type EducationLevel = 'ecd' | 'primary' | 'secondary' | 'combined';
export type SchoolStatus = 'active' | 'inactive' | 'suspended';

export interface SubscriptionPlan {
    id: number;
    name: string;
    slug: string;
    description?: string;
    max_students: number;
    max_teachers: number;
    max_storage_gb: number;
    features: string[];
    price_monthly: number;
    price_yearly: number;
    is_active: boolean;
}

export interface School {
    id: number;
    name: string;
    slug: string;
    email: string;
    phone?: string;
    address?: string;
    city?: string;
    province?: string;
    country: string;
    logo?: string;
    website?: string;
    education_level: EducationLevel;
    status: SchoolStatus;
    subscription_plan_id?: number;
    subscription_plan?: SubscriptionPlan;
    max_students: number;
    max_teachers: number;
    settings?: Record<string, unknown>;
    established_at?: string;
    created_at: string;
    updated_at: string;
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

export interface PlatformStats {
    total_schools: number;
    active_schools: number;
    total_students: number;
    total_teachers: number;
    schools_by_plan: { plan_name: string; count: number }[];
    recent_schools: School[];
}
