from rest_framework import serializers
from .models import Project, Thought, WorkExperience

class ProjectSerializer(serializers.ModelSerializer):
    featured_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = '__all__'
    
    def get_featured_image_url(self, obj):
        if obj.featured_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.featured_image.url)
            return obj.featured_image.url
        return None

class ThoughtSerializer(serializers.ModelSerializer):
    featured_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Thought
        fields = '__all__'
    
    def get_featured_image_url(self, obj):
        if obj.featured_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.featured_image.url)
            return obj.featured_image.url
        return None

class WorkExperienceSerializer(serializers.ModelSerializer):
    company_logo_url = serializers.SerializerMethodField()
    
    class Meta:
        model = WorkExperience
        fields = '__all__'
    
    def get_company_logo_url(self, obj):
        if obj.company_logo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.company_logo.url)
            return obj.company_logo.url
        return None