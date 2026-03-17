export interface LoginRequest {
    email: string;
    password: string;
}

export interface AuthRole {
    id: number;
    name: string;
    display_name: string;
}

export interface AuthUser {
    id: number;
    name: string;
    email: string;
    role: AuthRole | null;
    school_id: number | null;
    school_name: string | null;
    school_education_level: 'ecd' | 'primary' | 'secondary' | 'combined' | null;
    is_active: boolean;
    email_verified_at: string | null;
}

export interface AuthResponse {
    data: {
        user: AuthUser;
        token: string;
    };
}
