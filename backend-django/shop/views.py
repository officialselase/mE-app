from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Product, Order, Cart
from .serializers import ProductSerializer, OrderSerializer, CartSerializer


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing products
    """
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = []  # Allow anyone to read products
    
    def get_queryset(self):
        queryset = Product.objects.all()
        featured = self.request.query_params.get('featured', None)
        if featured is not None:
            queryset = queryset.filter(featured=True)
        return queryset.order_by('-created_at')
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class CartView(APIView):
    """
    Handle cart operations
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)
    
    def post(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        product_id = request.data.get('product_id')
        quantity = request.data.get('quantity', 1)
        
        try:
            product = Product.objects.get(id=product_id)
            
            # Add or update item in cart
            cart_items = cart.items.copy()
            item_found = False
            
            for item in cart_items:
                if item.get('product_id') == product_id:
                    item['quantity'] = item.get('quantity', 0) + quantity
                    item_found = True
                    break
            
            if not item_found:
                cart_items.append({
                    'product_id': product_id,
                    'product_title': product.title,
                    'product_price': float(product.price),
                    'quantity': quantity
                })
            
            cart.items = cart_items
            cart.save()
            
            serializer = CartSerializer(cart, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)
    
    def patch(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        item_id = request.data.get('item_id')
        quantity = request.data.get('quantity', 1)
        
        cart_items = cart.items.copy()
        for item in cart_items:
            if item.get('product_id') == item_id:
                if quantity <= 0:
                    cart_items.remove(item)
                else:
                    item['quantity'] = quantity
                break
        
        cart.items = cart_items
        cart.save()
        
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)
    
    def delete(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        item_id = request.data.get('item_id')
        
        cart_items = cart.items.copy()
        cart.items = [item for item in cart_items if item.get('product_id') != item_id]
        cart.save()
        
        serializer = CartSerializer(cart, context={'request': request})
        return Response(serializer.data)


class OrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing orders
    """
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class PaymentInitializeView(APIView):
    """
    Initialize Paystack payment
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # TODO: Implement Paystack payment initialization
        return Response({
            'message': 'Payment initialization not implemented yet',
            'status': 'coming_soon'
        })


class PaymentVerifyView(APIView):
    """
    Verify Paystack payment
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # TODO: Implement Paystack payment verification
        return Response({
            'message': 'Payment verification not implemented yet',
            'status': 'coming_soon'
        })