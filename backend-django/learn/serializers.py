from rest_framework import serializers
from .models import Course, Lesson, Assignment, Submission, Enrollment, SubmissionComment, LearnInquiry

class CourseSerializer(serializers.ModelSerializer):
    instructor_name = serializers.CharField(source='instructor.display_name', read_only=True)
    lessons_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = '__all__'
    
    def get_lessons_count(self, obj):
        return obj.lessons.count()

class LessonSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True)
    assignments_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Lesson
        fields = '__all__'
    
    def get_assignments_count(self, obj):
        return obj.assignments.count()

class AssignmentSerializer(serializers.ModelSerializer):
    lesson_title = serializers.CharField(source='lesson.title', read_only=True)
    course_title = serializers.CharField(source='lesson.course.title', read_only=True)
    submissions_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Assignment
        fields = '__all__'
    
    def get_submissions_count(self, obj):
        return obj.submissions.filter(is_public=True).count()

class SubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.display_name', read_only=True)
    assignment_title = serializers.CharField(source='assignment.title', read_only=True)
    comments_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Submission
        fields = '__all__'
        read_only_fields = ['student', 'submitted_at', 'updated_at']
    
    def get_comments_count(self, obj):
        return obj.comments.count()

class EnrollmentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='user.display_name', read_only=True)
    course_title = serializers.CharField(source='course.title', read_only=True)
    progress_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = Enrollment
        fields = '__all__'
        read_only_fields = ['user', 'enrolled_at', 'last_accessed_at']
    
    def get_progress_percentage(self, obj):
        total_lessons = obj.course.lessons.count()
        if total_lessons == 0:
            return 0
        completed_lessons = len(obj.completed_lessons)
        return round((completed_lessons / total_lessons) * 100, 2)

class SubmissionCommentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.display_name', read_only=True)
    
    class Meta:
        model = SubmissionComment
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']

class LearnInquirySerializer(serializers.ModelSerializer):
    class Meta:
        model = LearnInquiry
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at']
    
    def validate(self, data):
        # Custom validation for parent/guardian name
        age_group = data.get('age_group')
        parent_guardian_name = data.get('parent_guardian_name')
        
        if age_group in ['kids', 'teenagers'] and not parent_guardian_name:
            raise serializers.ValidationError({
                'parent_guardian_name': 'Parent/Guardian name is required for kids and teenagers.'
            })
        
        return data