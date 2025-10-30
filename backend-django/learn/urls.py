from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'courses', views.CourseViewSet)
router.register(r'lessons', views.LessonViewSet)
router.register(r'assignments', views.AssignmentViewSet)
router.register(r'submissions', views.SubmissionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('enrollments/', views.EnrollmentsView.as_view(), name='enrollments'),
    path('courses/<int:course_id>/enroll/', views.EnrollmentView.as_view(), name='course-enroll'),
    path('lessons/<int:lesson_id>/complete/', views.LessonCompleteView.as_view(), name='lesson-complete'),
    path('submissions/<int:submission_id>/comments/', views.SubmissionCommentsView.as_view(), name='submission-comments'),
    path('inquiry/', views.LearnInquiryView.as_view(), name='learn-inquiry'),
]