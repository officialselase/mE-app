from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticatedOrReadOnly, AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from .models import Project, Thought, WorkExperience
from .serializers import ProjectSerializer, ThoughtSerializer, WorkExperienceSerializer

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [AllowAny]  # Allow anyone to read projects
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['featured']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'title']
    ordering = ['-created_at']
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class ThoughtViewSet(viewsets.ModelViewSet):
    queryset = Thought.objects.all()
    serializer_class = ThoughtSerializer
    permission_classes = [AllowAny]  # Allow anyone to read thoughts
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['featured']
    search_fields = ['title', 'snippet', 'content']
    ordering_fields = ['date', 'created_at']
    ordering = ['-date']
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

class WorkExperienceViewSet(viewsets.ModelViewSet):
    queryset = WorkExperience.objects.all()
    serializer_class = WorkExperienceSerializer
    permission_classes = [AllowAny]  # Allow anyone to read work experience
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['display_order', 'start_date']
    ordering = ['display_order', '-start_date']
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context