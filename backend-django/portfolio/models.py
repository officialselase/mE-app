from django.db import models
from django.contrib.auth import get_user_model
import os

User = get_user_model()

def project_image_upload_path(instance, filename):
    """Generate upload path for project images"""
    return f'projects/{instance.id}/{filename}'

class Project(models.Model):
    """Portfolio Project model"""
    title = models.CharField(max_length=200)
    description = models.TextField()
    long_description = models.TextField(blank=True, null=True)
    featured_image = models.ImageField(upload_to=project_image_upload_path, blank=True, null=True)
    images = models.JSONField(default=list, blank=True, help_text="Additional image URLs")
    technologies = models.JSONField(default=list, blank=True)
    github_url = models.URLField(blank=True, null=True)
    live_url = models.URLField(blank=True, null=True)
    featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'projects'
        ordering = ['-created_at']
        verbose_name = 'Project'
        verbose_name_plural = 'Projects'
    
    def __str__(self):
        return self.title

def thought_image_upload_path(instance, filename):
    """Generate upload path for thought images"""
    return f'thoughts/{instance.id}/{filename}'

class Thought(models.Model):
    """Blog thoughts/posts model"""
    title = models.CharField(max_length=200)
    snippet = models.TextField()
    content = models.TextField()
    featured_image = models.ImageField(upload_to=thought_image_upload_path, blank=True, null=True)
    date = models.DateField()
    featured = models.BooleanField(default=False)
    tags = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'thoughts'
        ordering = ['-date']
        verbose_name = 'Thought'
        verbose_name_plural = 'Thoughts'
    
    def __str__(self):
        return self.title

def work_image_upload_path(instance, filename):
    """Generate upload path for work experience images"""
    return f'work/{instance.id}/{filename}'

class WorkExperience(models.Model):
    """Work experience model"""
    company = models.CharField(max_length=200)
    position = models.CharField(max_length=200)
    description = models.TextField()
    company_logo = models.ImageField(upload_to=work_image_upload_path, blank=True, null=True)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    current = models.BooleanField(default=False)
    technologies = models.JSONField(default=list, blank=True)
    display_order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'work_experience'
        ordering = ['display_order', '-start_date']
        verbose_name = 'Work Experience'
        verbose_name_plural = 'Work Experience'
    
    def __str__(self):
        return f"{self.position} at {self.company}"