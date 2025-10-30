from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings

class HealthCheckView(APIView):
    """
    Health check endpoint for monitoring API status
    """
    permission_classes = []
    
    def get(self, request):
        return Response({
            'status': 'healthy',
            'message': 'Portfolio Backend API is running',
            'version': getattr(settings, 'VERSION', '1.0.0'),
            'debug': settings.DEBUG
        }, status=status.HTTP_200_OK)