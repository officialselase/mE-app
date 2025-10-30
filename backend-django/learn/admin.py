from django.contrib import admin
from .models import Course, Lesson, Assignment, Submission, Enrollment, SubmissionComment, LearnInquiry

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ['title', 'instructor', 'lessons_count', 'created_at']
    list_filter = ['instructor', 'created_at']
    search_fields = ['title', 'description']
    ordering = ['-created_at']
    
    def lessons_count(self, obj):
        return obj.lessons.count()
    lessons_count.short_description = 'Lessons'

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ['title', 'course', 'order_index', 'created_at']
    list_filter = ['course', 'created_at']
    search_fields = ['title', 'content']
    list_editable = ['order_index']
    ordering = ['course', 'order_index']

@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ['title', 'lesson', 'type', 'required', 'due_date', 'created_at']
    list_filter = ['type', 'required', 'lesson__course', 'created_at']
    search_fields = ['title', 'description']
    list_editable = ['required']
    ordering = ['-created_at']

@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    list_display = ['assignment', 'student', 'is_public', 'submitted_at']
    list_filter = ['is_public', 'assignment__lesson__course', 'submitted_at']
    search_fields = ['assignment__title', 'student__display_name', 'notes']
    list_editable = ['is_public']
    ordering = ['-submitted_at']
    
    fieldsets = (
        ('Submission Info', {
            'fields': ('assignment', 'student', 'is_public')
        }),
        ('Links', {
            'fields': ('github_repo_url', 'live_preview_url')
        }),
        ('Notes', {
            'fields': ('notes',)
        }),
    )

@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ['user', 'course', 'progress_percentage', 'enrolled_at', 'last_accessed_at']
    list_filter = ['course', 'enrolled_at']
    search_fields = ['user__display_name', 'course__title']
    readonly_fields = ['enrolled_at', 'last_accessed_at']
    ordering = ['-enrolled_at']
    
    def progress_percentage(self, obj):
        total_lessons = obj.course.lessons.count()
        if total_lessons == 0:
            return "0%"
        completed_lessons = len(obj.completed_lessons)
        percentage = round((completed_lessons / total_lessons) * 100, 1)
        return f"{percentage}%"
    progress_percentage.short_description = 'Progress'

@admin.register(SubmissionComment)
class SubmissionCommentAdmin(admin.ModelAdmin):
    list_display = ['submission', 'user', 'created_at']
    list_filter = ['created_at']
    search_fields = ['content', 'user__display_name']
    ordering = ['-created_at']

@admin.register(LearnInquiry)
class LearnInquiryAdmin(admin.ModelAdmin):
    list_display = ['student_name', 'contact_email', 'course_type', 'status', 'created_at']
    list_filter = ['course_type', 'status', 'age_group', 'service_type', 'created_at']
    search_fields = ['student_name', 'contact_email', 'parent_guardian_name']
    list_editable = ['status']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Student Information', {
            'fields': ('student_name', 'age_group', 'experience_level', 'parent_guardian_name')
        }),
        ('Contact Information', {
            'fields': ('contact_email', 'contact_phone')
        }),
        ('Course Preferences', {
            'fields': ('course_type', 'service_type', 'preferred_schedule')
        }),
        ('Goals and Requirements', {
            'fields': ('learning_goals', 'has_computer', 'additional_notes')
        }),
        ('Status', {
            'fields': ('status',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at']