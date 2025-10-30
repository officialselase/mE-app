from rest_framework import serializers
from .models import Product, Cart, Order

class ProductSerializer(serializers.ModelSerializer):
    featured_image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = '__all__'
    
    def get_featured_image_url(self, obj):
        if obj.featured_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.featured_image.url)
            return obj.featured_image.url
        return None

class CartSerializer(serializers.ModelSerializer):
    items_count = serializers.SerializerMethodField()
    total_amount = serializers.SerializerMethodField()
    
    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'items_count', 'total_amount', 'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at', 'updated_at']
    
    def get_items_count(self, obj):
        return sum(item.get('quantity', 0) for item in obj.items)
    
    def get_total_amount(self, obj):
        total = 0
        for item in obj.items:
            try:
                product = Product.objects.get(id=item.get('product_id'))
                total += product.price * item.get('quantity', 0)
            except Product.DoesNotExist:
                continue
        return total

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']