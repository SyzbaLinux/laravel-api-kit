import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface ChartDataPoint {
    name: string;
    count: number;
}

export interface GradeDataPoint {
    grade: string;
    count: number;
    capacity: number;
}

export interface LevelDataPoint {
    level: string;
    count: number;
}

export interface CurrentPeriod {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
}

export interface CurrentYear extends CurrentPeriod {
    terms_count: number;
}

export interface SchoolStats {
    students: number;
    teachers: number;
    departments: number;
    subjects: number;
    active_subjects: number;
    classes: number;
    timetable_entries: number;
    academic_years: number;
    terms: number;
    current_year: CurrentYear | null;
    current_term: CurrentPeriod | null;
    charts: {
        subjects_by_department: ChartDataPoint[];
        classes_by_grade: GradeDataPoint[];
        subjects_by_level: LevelDataPoint[];
    };
}

export interface TeacherScheduleEntry {
    id: number;
    start_time: string;
    end_time: string;
    subject: { id: number; name: string; code: string } | null;
    school_class: { id: number; name: string; grade_level: string } | null;
}

export interface TeacherClass {
    id: number;
    name: string;
    grade_level: string;
    students_count: number;
    subjects: { id: number; name: string; code: string }[];
}

export interface TeacherStats {
    classes_count: number;
    subjects_count: number;
    today_periods: number;
    students_count: number;
    current_year: CurrentPeriod | null;
    current_term: CurrentPeriod | null;
    today_schedule: TeacherScheduleEntry[];
    my_classes: TeacherClass[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = environment.apiUrl;

    getStats(): Observable<{ success: boolean; data: SchoolStats }> {
        return this.http.get<{ success: boolean; data: SchoolStats }>(`${this.baseUrl}/dashboard/stats`);
    }

    getTeacherStats(): Observable<{ success: boolean; data: TeacherStats }> {
        return this.http.get<{ success: boolean; data: TeacherStats }>(`${this.baseUrl}/dashboard/teacher-stats`);
    }
}
