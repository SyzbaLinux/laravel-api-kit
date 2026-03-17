<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Enums\EducationLevel;
use App\Enums\SchoolStatus;
use App\Enums\SubjectLevel;
use App\Models\AcademicTerm;
use App\Models\AcademicYear;
use App\Models\Department;
use App\Models\Role;
use App\Models\School;
use App\Models\SchoolClass;
use App\Models\StudentProfile;
use App\Models\Subject;
use App\Models\SubscriptionPlan;
use App\Models\TeacherProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

final class SchoolSeeder extends Seeder
{
    public function run(): void
    {
        $plan = SubscriptionPlan::query()->where('slug', 'professional')->first();

        $schoolAdminRole = Role::query()->where('name', Role::SCHOOL_ADMIN)->firstOrFail();
        $teacherRole = Role::query()->where('name', Role::TEACHER)->firstOrFail();
        $studentRole = Role::query()->where('name', Role::STUDENT)->firstOrFail();

        $this->seedPrimarySchool($plan?->id, $schoolAdminRole, $teacherRole, $studentRole);
        $this->seedSecondarySchool($plan?->id, $schoolAdminRole, $teacherRole, $studentRole);
    }

    private function seedPrimarySchool(
        ?int $planId,
        Role $adminRole,
        Role $teacherRole,
        Role $studentRole,
    ): void {
        $school = School::query()->updateOrCreate(
            ['slug' => 'sunshine-primary'],
            [
                'name' => 'Sunshine Primary School',
                'slug' => 'sunshine-primary',
                'email' => 'info@sunshine-primary.test',
                'phone' => '+263771000001',
                'address' => '12 Jacaranda Avenue, Harare',
                'education_level' => EducationLevel::PRIMARY,
                'status' => SchoolStatus::ACTIVE,
                'subscription_plan_id' => $planId,
                'max_students' => 500,
                'max_teachers' => 50,
                'established_at' => '1995-01-15',
            ],
        );

        // School admin
        $admin = $this->createUser(
            name: 'Primary Admin',
            email: 'admin@sunshine-primary.test',
            roleId: $adminRole->id,
            schoolId: $school->id,
        );
        $admin->roles()->syncWithoutDetaching([$adminRole->id]);

        // Academic year with 3 terms
        $academicYear = $this->createAcademicYear($school->id, '2025');

        // 10 subjects (no departments for primary)
        $subjects = $this->createPrimarySubjects($school->id);

        // 10 teachers
        $teachers = $this->createTeachers($school->id, $teacherRole, 10, 'pri');

        // 5 classes, 2 teachers each as class teachers (first 5 teachers)
        $classes = $this->createPrimaryClasses($school->id, $academicYear->id, $teachers, $subjects);

        // 50 students — 10 per class
        $this->createStudents($school->id, $studentRole, $classes, $academicYear->id, 10, 'pri');
    }

    private function seedSecondarySchool(
        ?int $planId,
        Role $adminRole,
        Role $teacherRole,
        Role $studentRole,
    ): void {
        $school = School::query()->updateOrCreate(
            ['slug' => 'excellence-high'],
            [
                'name' => 'Excellence High School',
                'slug' => 'excellence-high',
                'email' => 'info@excellence-high.test',
                'phone' => '+263771000002',
                'address' => '45 Independence Way, Bulawayo',
                'education_level' => EducationLevel::SECONDARY,
                'status' => SchoolStatus::ACTIVE,
                'subscription_plan_id' => $planId,
                'max_students' => 500,
                'max_teachers' => 50,
                'established_at' => '1988-03-01',
            ],
        );

        // School admin
        $admin = $this->createUser(
            name: 'Secondary Admin',
            email: 'admin@excellence-high.test',
            roleId: $adminRole->id,
            schoolId: $school->id,
        );
        $admin->roles()->syncWithoutDetaching([$adminRole->id]);

        // Academic year with 3 terms
        $academicYear = $this->createAcademicYear($school->id, '2025');

        // 4 departments
        $departments = $this->createSecondaryDepartments($school->id);

        // 10 subjects distributed across departments
        $subjects = $this->createSecondarySubjects($school->id, $departments);

        // 10 teachers
        $teachers = $this->createTeachers($school->id, $teacherRole, 10, 'sec');

        // 5 classes (Form 1–5)
        $classes = $this->createSecondaryClasses($school->id, $academicYear->id, $teachers, $subjects);

        // 50 students — 10 per class
        $this->createStudents($school->id, $studentRole, $classes, $academicYear->id, 10, 'sec');
    }

    private function createUser(string $name, string $email, int $roleId, int $schoolId): User
    {
        return User::query()->updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'email' => $email,
                'password' => Hash::make('password'),
                'role_id' => $roleId,
                'school_id' => $schoolId,
                'is_active' => true,
                'email_verified_at' => now(),
            ],
        );
    }

    private function createAcademicYear(int $schoolId, string $year): AcademicYear
    {
        /** @var AcademicYear $academicYear */
        $academicYear = AcademicYear::query()->updateOrCreate(
            ['school_id' => $schoolId, 'name' => "Academic Year {$year}"],
            [
                'name' => "Academic Year {$year}",
                'start_date' => "{$year}-01-13",
                'end_date' => "{$year}-12-05",
                'is_current' => true,
                'school_id' => $schoolId,
            ],
        );

        $terms = [
            ['name' => 'Term 1', 'start' => "{$year}-01-13", 'end' => "{$year}-04-11"],
            ['name' => 'Term 2', 'start' => "{$year}-05-06", 'end' => "{$year}-08-08"],
            ['name' => 'Term 3', 'start' => "{$year}-09-09", 'end' => "{$year}-12-05"],
        ];

        foreach ($terms as $i => $term) {
            AcademicTerm::query()->updateOrCreate(
                ['academic_year_id' => $academicYear->id, 'name' => $term['name']],
                [
                    'name' => $term['name'],
                    'academic_year_id' => $academicYear->id,
                    'start_date' => $term['start'],
                    'end_date' => $term['end'],
                    'is_current' => $i === 0,
                ],
            );
        }

        return $academicYear;
    }

    /**
     * @return array<int, Subject>
     */
    private function createPrimarySubjects(int $schoolId): array
    {
        $subjectData = [
            ['name' => 'English Language', 'code' => 'ENG'],
            ['name' => 'Mathematics', 'code' => 'MATH'],
            ['name' => 'Shona', 'code' => 'SHO'],
            ['name' => 'Environmental Science', 'code' => 'ENV'],
            ['name' => 'Social Studies', 'code' => 'SOC'],
            ['name' => 'Creative Arts', 'code' => 'ART'],
            ['name' => 'Physical Education', 'code' => 'PE'],
            ['name' => 'Religious & Moral Education', 'code' => 'RME'],
            ['name' => 'ICT', 'code' => 'ICT'],
            ['name' => 'Agriculture', 'code' => 'AGR'],
        ];

        $subjects = [];
        foreach ($subjectData as $data) {
            $subjects[] = Subject::query()->updateOrCreate(
                ['school_id' => $schoolId, 'code' => $data['code']],
                [
                    'name' => $data['name'],
                    'code' => $data['code'],
                    'school_id' => $schoolId,
                    'education_level' => SubjectLevel::PRIMARY,
                    'is_active' => true,
                ],
            );
        }

        return $subjects;
    }

    /**
     * @param  array<int, Department>  $departments
     * @return array<int, Subject>
     */
    private function createSecondarySubjects(int $schoolId, array $departments): array
    {
        // departments: [Sciences, Humanities, Mathematics, Languages]
        $subjectData = [
            ['name' => 'Biology', 'code' => 'BIO', 'dept' => 0],
            ['name' => 'Chemistry', 'code' => 'CHEM', 'dept' => 0],
            ['name' => 'Physics', 'code' => 'PHY', 'dept' => 0],
            ['name' => 'History', 'code' => 'HIST', 'dept' => 1],
            ['name' => 'Geography', 'code' => 'GEO', 'dept' => 1],
            ['name' => 'Combined Science', 'code' => 'CSCI', 'dept' => 0],
            ['name' => 'Mathematics', 'code' => 'MATH', 'dept' => 2],
            ['name' => 'Additional Mathematics', 'code' => 'AMATH', 'dept' => 2],
            ['name' => 'English Language', 'code' => 'ENG', 'dept' => 3],
            ['name' => 'Shona', 'code' => 'SHO', 'dept' => 3],
        ];

        $subjects = [];
        foreach ($subjectData as $data) {
            $subjects[] = Subject::query()->updateOrCreate(
                ['school_id' => $schoolId, 'code' => $data['code']],
                [
                    'name' => $data['name'],
                    'code' => $data['code'],
                    'school_id' => $schoolId,
                    'education_level' => SubjectLevel::SECONDARY,
                    'department_id' => $departments[$data['dept']]->id,
                    'is_active' => true,
                ],
            );
        }

        return $subjects;
    }

    /**
     * @return array<int, Department>
     */
    private function createSecondaryDepartments(int $schoolId): array
    {
        $deptData = [
            ['name' => 'Sciences', 'description' => 'Natural and applied sciences'],
            ['name' => 'Humanities', 'description' => 'Social sciences and humanities'],
            ['name' => 'Mathematics', 'description' => 'Pure and applied mathematics'],
            ['name' => 'Languages', 'description' => 'English and indigenous languages'],
        ];

        $departments = [];
        foreach ($deptData as $data) {
            $departments[] = Department::query()->updateOrCreate(
                ['school_id' => $schoolId, 'name' => $data['name']],
                [
                    'name' => $data['name'],
                    'description' => $data['description'],
                    'school_id' => $schoolId,
                ],
            );
        }

        return $departments;
    }

    /**
     * @return array<int, User>
     */
    private function createTeachers(int $schoolId, Role $teacherRole, int $count, string $prefix): array
    {
        $teachers = [];

        for ($i = 1; $i <= $count; $i++) {
            $num = str_pad((string) $i, 2, '0', STR_PAD_LEFT);
            $teacher = $this->createUser(
                name: "Teacher {$num} ({$prefix})",
                email: "teacher{$num}@{$prefix}.school.test",
                roleId: $teacherRole->id,
                schoolId: $schoolId,
            );
            $teacher->roles()->syncWithoutDetaching([$teacherRole->id]);

            TeacherProfile::query()->updateOrCreate(
                ['user_id' => $teacher->id],
                [
                    'user_id' => $teacher->id,
                    'school_id' => $schoolId,
                    'employee_number' => strtoupper($prefix).'-T'.$num,
                    'qualification' => 'B.Ed.',
                    'specialization' => 'General',
                    'join_date' => '2020-01-15',
                    'is_active' => true,
                ],
            );

            $teachers[] = $teacher;
        }

        return $teachers;
    }

    /**
     * @param  array<int, User>     $teachers
     * @param  array<int, Subject>  $subjects
     * @return array<int, SchoolClass>
     */
    private function createPrimaryClasses(
        int $schoolId,
        int $academicYearId,
        array $teachers,
        array $subjects,
    ): array {
        $classData = [
            ['name' => 'Grade 1', 'grade_level' => '1'],
            ['name' => 'Grade 2', 'grade_level' => '2'],
            ['name' => 'Grade 3', 'grade_level' => '3'],
            ['name' => 'Grade 4', 'grade_level' => '4'],
            ['name' => 'Grade 5', 'grade_level' => '5'],
        ];

        return $this->buildClasses($classData, $schoolId, $academicYearId, $teachers, $subjects);
    }

    /**
     * @param  array<int, User>     $teachers
     * @param  array<int, Subject>  $subjects
     * @return array<int, SchoolClass>
     */
    private function createSecondaryClasses(
        int $schoolId,
        int $academicYearId,
        array $teachers,
        array $subjects,
    ): array {
        $classData = [
            ['name' => 'Form 1', 'grade_level' => 'Form 1'],
            ['name' => 'Form 2', 'grade_level' => 'Form 2'],
            ['name' => 'Form 3', 'grade_level' => 'Form 3'],
            ['name' => 'Form 4', 'grade_level' => 'Form 4'],
            ['name' => 'Form 5', 'grade_level' => 'Form 5'],
        ];

        return $this->buildClasses($classData, $schoolId, $academicYearId, $teachers, $subjects);
    }

    /**
     * @param  array<int, array<string, string>>  $classData
     * @param  array<int, User>                   $teachers
     * @param  array<int, Subject>                $subjects
     * @return array<int, SchoolClass>
     */
    private function buildClasses(
        array $classData,
        int $schoolId,
        int $academicYearId,
        array $teachers,
        array $subjects,
    ): array {
        $classes = [];

        foreach ($classData as $index => $data) {
            $classTeacher = $teachers[$index] ?? null;

            /** @var SchoolClass $class */
            $class = SchoolClass::query()->updateOrCreate(
                [
                    'school_id' => $schoolId,
                    'name' => $data['name'],
                    'academic_year_id' => $academicYearId,
                ],
                [
                    'name' => $data['name'],
                    'grade_level' => $data['grade_level'],
                    'capacity' => 40,
                    'class_teacher_id' => $classTeacher?->id,
                    'school_id' => $schoolId,
                    'academic_year_id' => $academicYearId,
                ],
            );

            // Attach all subjects to the class, cycling through teachers
            $subjectSync = [];
            foreach ($subjects as $si => $subject) {
                $subjectSync[$subject->id] = ['teacher_id' => $teachers[$si % count($teachers)]->id];
            }
            $class->subjects()->sync($subjectSync);

            $classes[] = $class;
        }

        return $classes;
    }

    /**
     * @param  array<int, SchoolClass>  $classes
     */
    private function createStudents(
        int $schoolId,
        Role $studentRole,
        array $classes,
        int $academicYearId,
        int $perClass,
        string $prefix,
    ): void {
        $genders = ['male', 'female'];
        $counter = 1;

        foreach ($classes as $class) {
            for ($i = 1; $i <= $perClass; $i++) {
                $num = str_pad((string) $counter, 3, '0', STR_PAD_LEFT);
                $student = $this->createUser(
                    name: "Student {$num} ({$prefix})",
                    email: "student{$num}@{$prefix}.school.test",
                    roleId: $studentRole->id,
                    schoolId: $schoolId,
                );
                $student->roles()->syncWithoutDetaching([$studentRole->id]);

                StudentProfile::query()->updateOrCreate(
                    ['user_id' => $student->id],
                    [
                        'user_id' => $student->id,
                        'school_id' => $schoolId,
                        'student_number' => strtoupper($prefix).'-S'.$num,
                        'date_of_birth' => now()->subYears(rand(10, 18))->format('Y-m-d'),
                        'gender' => $genders[$counter % 2],
                        'class_id' => $class->id,
                        'admission_date' => '2025-01-13',
                        'is_active' => true,
                    ],
                );

                // Enroll in class
                $class->students()->syncWithoutDetaching([
                    $student->id => [
                        'academic_year_id' => $academicYearId,
                        'enrolled_at' => '2025-01-13',
                    ],
                ]);

                $counter++;
            }
        }
    }
}
