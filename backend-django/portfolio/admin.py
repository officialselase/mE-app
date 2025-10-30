from django.contrib import admin
from .models import Project, Thought, WorkExperience

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['title', 'featured', 'created_at']
    list_filter = ['featured', 'created_at']
    search_fields = ['title', 'description']
    list_editable = ['featured']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'long_description', 'featured')
        }),
        ('Media', {
            'fields': ('featured_image', 'images'),
            'description': 'Upload a featured image or add additional image URLs in the images field (JSON format)'
        }),
        ('Technical Details', {
            'fields': ('technologies', 'github_url', 'live_url'),
            'description': 'Technologies should be a JSON list like ["React", "Django", "PostgreSQL"]'
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        if obj:  # Editing an existing object
            return ['created_at', 'updated_at']
        return []

@admin.register(Thought)
class ThoughtAdmin(admin.ModelAdmin):
    list_display = ['title', 'date', 'featured', 'created_at']
    list_filter = ['featured', 'date', 'created_at']
    search_fields = ['title', 'snippet', 'content']
    list_editable = ['featured']
    ordering = ['-date']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'snippet', 'content', 'date', 'featured')
        }),
        ('Media', {
            'fields': ('featured_image',)
        }),
        ('Categorization', {
            'fields': ('tags',)
        }),
    )

@admin.register(WorkExperience)
class WorkExperienceAdmin(admin.ModelAdmin):
    list_display = ['position', 'company', 'start_date', 'end_date', 'current', 'display_order']
    list_filter = ['current', 'start_date']
    search_fields = ['company', 'position', 'description']
    list_editable = ['display_order', 'current']
    ordering = ['display_order', '-start_date']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('company', 'position', 'description', 'display_order')
        }),
        ('Media', {
            'fields': ('company_logo',)
        }),
        ('Duration', {
            'fields': ('start_date', 'end_date', 'current')
        }),
        ('Technical Details', {
            'fields': ('technologies',)
        }),
    )