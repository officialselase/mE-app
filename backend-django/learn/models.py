from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Course(models.Model):
    """Course model"""
    title = models.CharField(max_length=200)
    description = models.TextField()
    instructor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='courses_taught')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'courses'
        ordering = ['-created_at']
        verbose_name = 'Course'
        verbose_name_plural = 'Courses'
    
    def __str__(self):
        return self.title

class Lesson(models.Model):
    """Lesson model"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='lessons')
    title = models.CharField(max_length=200)
    content = models.TextField()
    video_url = models.URLField(blank=True, null=True)
    order_index = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'lessons'
        ordering = ['course', 'order_index']
        verbose_name = 'Lesson'
        verbose_name_plural = 'Lessons'
    
    def __str__(self):
        return f"{self.course.title} - {self.title}"

class Assignment(models.Model):
    """Assignment model"""
    
    TYPE_CHOICES = [
        ('project', 'Project'),
        ('exercise', 'Exercise'),
        ('reading', 'Reading'),
    ]
    
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name='assignments')
    title = models.CharField(max_length=200)
    description = models.TextField()
    instructions = models.TextField(blank=True)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='project')
    due_date = models.DateTimeField(blank=True, null=True)
    required = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'assignments'
        ordering = ['lesson', 'created_at']
        verbose_name = 'Assignment'
        verbose_name_plural = 'Assignments'
    
    def __str__(self):
        return f"{self.lesson.course.title} - {self.title}"

class Enrollment(models.Model):
    """Course Enrollment model"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='enrollments')
    completed_lessons = models.JSONField(default=list)
    enrolled_at = models.DateTimeField(auto_now_add=True)
    last_accessed_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'enrollments'
        unique_together = ['user', 'course']
        ordering = ['-enrolled_at']
        verbose_name = 'Enrollment'
        verbose_name_plural = 'Enrollments'
    
    def __str__(self):
        return f"{self.user.display_name} - {self.course.title}"

class Submission(models.Model):
    """Assignment Submission model"""
    assignment = models.ForeignKey(Assignment, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submissions')
    github_repo_url = models.URLField(blank=True, null=True)
    live_preview_url = models.URLField(blank=True, null=True)
    notes = models.TextField(blank=True)
    is_public = models.BooleanField(default=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'submissions'
        unique_together = ['assignment', 'student']
        ordering = ['-submitted_at']
        verbose_name = 'Submission'
        verbose_name_plural = 'Submissions'
    
    def __str__(self):
        return f"{self.student.display_name} - {self.assignment.title}"

class SubmissionComment(models.Model):
    """Submission Comment model"""
    submission = models.ForeignKey(Submission, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='submission_comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'submission_comments'
        ordering = ['created_at']
        verbose_name = 'Submission Comment'
        verbose_name_plural = 'Submission Comments'
    
    def __str__(self):
        return f"Comment by {self.user.display_name}"

class LearnInquiry(models.Model):
    """Learning Program Inquiry model for form submissions"""
    
    AGE_GROUP_CHOICES = [
        ('kids', 'Kids (6-12 years)'),
        ('teenagers', 'Teenagers (13-17 years)'),
        ('adults', 'Adults (18+ years)'),
    ]
    
    COURSE_TYPE_CHOICES = [
        ('scratch', 'Scratch Programming (Block-based)'),
        ('web_basics', 'Web Development Basics'),
        ('react_frontend', 'React Frontend Development'),
        ('django_backend', 'Django Backend Development'),
        ('full_stack', 'Full Stack Development'),
        ('mobile_flutter', 'Mobile Development with Flutter'),
        ('python_basics', 'Python Programming Basics'),
        ('javascript_basics', 'JavaScript Programming Basics'),
    ]
    
    SERVICE_TYPE_CHOICES = [
        ('group_class', 'Group Classes'),
        ('private_tutoring', 'Private Tutoring'),
        ('mentoring', 'Mentoring Sessions'),
        ('workshop', 'One-time Workshop'),
    ]
    
    EXPERIENCE_LEVEL_CHOICES = [
        ('beginner', 'Complete Beginner'),
        ('some_experience', 'Some Experience'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]
    
    # Student Information
    student_name = models.CharField(max_length=200)
    age_group = models.CharField(max_length=20, choices=AGE_GROUP_CHOICES)
    experience_level = models.CharField(max_length=20, choices=EXPERIENCE_LEVEL_CHOICES, default='beginner')
    
    # Contact Information
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=20, blank=True)
    parent_guardian_name = models.CharField(max_length=200, blank=True, help_text="Required for kids and teenagers")
    
    # Course Preferences
    course_type = models.CharField(max_length=50, choices=COURSE_TYPE_CHOICES)
    service_type = models.CharField(max_length=20, choices=SERVICE_TYPE_CHOICES)
    preferred_schedule = models.CharField(max_length=100, blank=True, help_text="e.g., Weekends, Evenings, Flexible")
    
    # Goals and Additional Information
    learning_goals = models.TextField(blank=True, help_text="What do you hope to achieve?")
    additional_notes = models.TextField(blank=True)
    has_computer = models.BooleanField(default=True, help_text="Do you have access to a computer/laptop?")
    
    # Status tracking
    STATUS_CHOICES = [
        ('new', 'New'),
        ('contacted', 'Contacted'),
        ('scheduled', 'Scheduled'),
        ('enrolled', 'Enrolled'),
        ('declined', 'Declined'),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'learn_inquiries'
        ordering = ['-created_at']
        verbose_name = 'Learn Inquiry'
        verbose_name_plural = 'Learn Inquiries'
    
    def __str__(self):
        return f"{self.student_name} - {self.get_course_type_display()} ({self.get_age_group_display()})"
    
    def clean(self):
        from django.core.exceptions import ValidationError
        # Require parent/guardian name for kids and teenagers
        if self.age_group in ['kids', 'teenagers'] and not self.parent_guardian_name:
            raise ValidationError({
                'parent_guardian_name': 'Parent/Guardian name is required for kids and teenagers.'
            })