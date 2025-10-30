from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.html import format_html
from .models import User, RefreshToken

@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Enhanced User Admin"""
    
    list_display = ('email', 'display_name', 'role', 'email_verified_badge', 'is_active', 'date_joined', 'last_login')
    list_filter = ('role', 'email_verified', 'is_active', 'is_staff', 'date_joined')
    search_fields = ('email', 'display_name', 'username')
    ordering = ('-date_joined',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('display_name', 'username', 'first_name', 'last_name')}),
        ('Permissions', {
            'fields': ('role', 'email_verified', 'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
        ('Additional info', {'fields': ('last_login_ip',)}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'display_name', 'username', 'password1', 'password2', 'role'),
        }),
    )
    
    def email_verified_badge(self, obj):
        if obj.email_verified:
            return format_html('<span style="color: green;">✓ Verified</span>')
        return format_html('<span style="color: red;">✗ Unverified</span>')
    email_verified_badge.short_description = 'Email Status'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related()

@admin.register(RefreshToken)
class RefreshTokenAdmin(admin.ModelAdmin):
    """Refresh Token Admin"""
    
    list_display = ('user', 'token_preview', 'expires_at', 'revoked', 'created_at')
    list_filter = ('revoked', 'created_at', 'expires_at')
    search_fields = ('user__email', 'user__display_name')
    readonly_fields = ('token', 'created_at')
    ordering = ('-created_at',)
    
    def token_preview(self, obj):
        return f"{obj.token[:20]}..." if obj.token else ""
    token_preview.short_description = 'Token Preview'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')