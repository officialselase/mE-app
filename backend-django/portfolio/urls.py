from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'projects', views.ProjectViewSet)
router.register(r'thoughts', views.ThoughtViewSet)
router.register(r'work', views.WorkExperienceViewSet)

urlpatterns = [
    path('', include(router.urls)),
]