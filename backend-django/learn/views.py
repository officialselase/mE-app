from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.core.mail import send_mail
from django.conf import settings
from .models import Course, Lesson, Assignment, Submission, Enrollment, SubmissionComment, LearnInquiry
from .serializers import (
    CourseSerializer, LessonSerializer, AssignmentSerializer, 
    SubmissionSerializer, EnrollmentSerializer, SubmissionCommentSerializer, LearnInquirySerializer
)


class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing courses
    """
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [IsAuthenticated]


class LessonViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing lessons
    """
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        course_id = self.request.query_params.get('course_id', None)
        if course_id is not None:
            return Lesson.objects.filter(course_id=course_id).order_by('order_index')
        return Lesson.objects.all().order_by('course', 'order_index')


class AssignmentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing assignments
    """
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        lesson_id = self.request.query_params.get('lesson_id', None)
        if lesson_id is not None:
            return Assignment.objects.filter(lesson_id=lesson_id)
        return Assignment.objects.all()


class SubmissionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing submissions
    """
    queryset = Submission.objects.all()
    serializer_class = SubmissionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        if self.action == 'list':
            # Show public submissions or user's own submissions
            assignment_id = self.request.query_params.get('assignment_id', None)
            if assignment_id:
                return Submission.objects.filter(
                    assignment_id=assignment_id,
                    is_public=True
                ).order_by('-submitted_at')
            return Submission.objects.filter(student=self.request.user)
        return Submission.objects.filter(student=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(student=self.request.user)


class EnrollmentView(APIView):
    """
    Handle course enrollment
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, course_id):
        try:
            course = Course.objects.get(id=course_id)
            enrollment, created = Enrollment.objects.get_or_create(
                user=request.user,
                course=course
            )
            
            if created:
                message = 'Successfully enrolled in course'
                status_code = status.HTTP_201_CREATED
            else:
                message = 'Already enrolled in this course'
                status_code = status.HTTP_200_OK
                
            serializer = EnrollmentSerializer(enrollment)
            return Response({
                'message': message,
                'enrollment': serializer.data
            }, status=status_code)
            
        except Course.DoesNotExist:
            return Response({'error': 'Course not found'}, status=status.HTTP_404_NOT_FOUND)


class LessonCompleteView(APIView):
    """
    Mark lesson as complete
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request, lesson_id):
        try:
            lesson = Lesson.objects.get(id=lesson_id)
            enrollment = Enrollment.objects.get(
                user=request.user,
                course=lesson.course
            )
            
            if lesson_id not in enrollment.completed_lessons:
                enrollment.completed_lessons.append(lesson_id)
                enrollment.save()
                
            return Response({
                'message': 'Lesson marked as complete',
                'completed_lessons': enrollment.completed_lessons
            })
            
        except (Lesson.DoesNotExist, Enrollment.DoesNotExist):
            return Response({'error': 'Lesson or enrollment not found'}, status=status.HTTP_404_NOT_FOUND)


class SubmissionCommentsView(APIView):
    """
    Handle submission comments
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, submission_id):
        try:
            submission = Submission.objects.get(id=submission_id, is_public=True)
            comments = SubmissionComment.objects.filter(submission=submission).order_by('created_at')
            serializer = SubmissionCommentSerializer(comments, many=True)
            return Response(serializer.data)
        except Submission.DoesNotExist:
            return Response({'error': 'Submission not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def post(self, request, submission_id):
        try:
            submission = Submission.objects.get(id=submission_id, is_public=True)
            serializer = SubmissionCommentSerializer(data=request.data)
            if serializer.is_valid():
                serializer.save(user=request.user, submission=submission)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Submission.DoesNotExist:
            return Response({'error': 'Submission not found'}, status=status.HTTP_404_NOT_FOUND)


class EnrollmentsView(APIView):
    """
    Handle user enrollments listing
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        try:
            enrollments = Enrollment.objects.filter(user=request.user)
            serializer = EnrollmentSerializer(enrollments, many=True)
            return Response({
                'results': serializer.data,
                'count': enrollments.count()
            })
        except Exception as e:
            return Response({
                'error': 'Error fetching enrollments',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class LearnInquiryView(APIView):
    """
    Handle learning program inquiries and registrations
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        try:
            # Create inquiry using serializer with direct data mapping
            serializer = LearnInquirySerializer(data=request.data)
            if serializer.is_valid():
                inquiry = serializer.save()
                
                # Prepare email content
                subject = f'New Learning Program Inquiry - {inquiry.get_course_type_display()}'
                message = f"""
New learning program inquiry received:

Student Information:
- Name: {inquiry.student_name}
- Age Group: {inquiry.get_age_group_display()}
- Experience Level: {inquiry.get_experience_level_display()}

Contact Information:
- Email: {inquiry.contact_email}
- Phone: {inquiry.contact_phone or 'Not provided'}
- Parent/Guardian: {inquiry.parent_guardian_name or 'Not applicable'}

Course Preferences:
- Course Type: {inquiry.get_course_type_display()}
- Service Type: {inquiry.get_service_type_display()}
- Preferred Schedule: {inquiry.preferred_schedule or 'Not specified'}

Learning Goals: {inquiry.learning_goals or 'Not specified'}
Has Computer: {'Yes' if inquiry.has_computer else 'No'}
Additional Notes: {inquiry.additional_notes or 'None'}

Inquiry ID: {inquiry.id}
Submitted: {inquiry.created_at}

Please follow up with this inquiry.
                """
                
                # Send email notification (if email is configured)
                try:
                    if hasattr(settings, 'EMAIL_HOST') and settings.EMAIL_HOST:
                        send_mail(
                            subject,
                            message,
                            settings.DEFAULT_FROM_EMAIL,
                            [settings.DEFAULT_FROM_EMAIL],  # Send to admin
                            fail_silently=False,
                        )
                except Exception as e:
                    # Log email error but don't fail the request
                    print(f"Email sending failed: {e}")
                
                return Response({
                    'message': 'Thank you for your interest! We will contact you soon to discuss your learning journey.',
                    'status': 'success',
                    'inquiry_id': inquiry.id
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    'error': 'Please check the form for errors',
                    'details': serializer.errors
                }, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            return Response({
                'error': 'An error occurred while processing your inquiry',
                'details': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)