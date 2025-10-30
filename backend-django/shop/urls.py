from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'products', views.ProductViewSet)
router.register(r'orders', views.OrderViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('cart/', views.CartView.as_view(), name='cart'),
    path('payment/initialize/', views.PaymentInitializeView.as_view(), name='payment-initialize'),
    path('payment/verify/', views.PaymentVerifyView.as_view(), name='payment-verify'),
]