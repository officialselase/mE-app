from django.contrib import admin
from .models import Product, Cart, Order

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ['title', 'price', 'currency', 'stock', 'category', 'featured', 'created_at']
    list_filter = ['featured', 'category', 'created_at']
    search_fields = ['title', 'description', 'category']
    list_editable = ['price', 'stock', 'featured']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'category', 'featured')
        }),
        ('Media', {
            'fields': ('featured_image', 'images')
        }),
        ('Pricing & Inventory', {
            'fields': ('price', 'currency', 'stock')
        }),
    )

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['user', 'items_count', 'created_at', 'updated_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['user__email', 'user__display_name']
    readonly_fields = ['created_at', 'updated_at']
    
    def items_count(self, obj):
        return len(obj.items)
    items_count.short_description = 'Items Count'

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'total', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['user__email', 'user__display_name', 'payment_reference']
    list_editable = ['status']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    
    fieldsets = (
        ('Order Information', {
            'fields': ('user', 'status', 'payment_reference')
        }),
        ('Items & Pricing', {
            'fields': ('items', 'subtotal', 'tax', 'shipping', 'total')
        }),
        ('Shipping', {
            'fields': ('shipping_address',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )