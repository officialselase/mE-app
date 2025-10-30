from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from .models import User, RefreshToken
import jwt
from django.conf import settings
from datetime import datetime, timedelta, timezone

class RegisterView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        data = request.data
        
        # Validation
        if User.objects.filter(email=data.get('email')).exists():
            return Response({'error': 'Email already exists'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create user
        user = User.objects.create(
            email=data.get('email'),
            username=data.get('email'),  # Use email as username
            display_name=data.get('displayName'),
            password=make_password(data.get('password'))
        )
        
        return Response({
            'message': 'User created successfully',
            'user': {
                'id': user.id,
                'email': user.email,
                'displayName': user.display_name
            }
        }, status=status.HTTP_201_CREATED)

class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        user = authenticate(username=email, password=password)
        if not user:
            return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Generate JWT tokens
        now = datetime.now(timezone.utc)
        access_token = jwt.encode({
            'user_id': user.id,
            'exp': now + timedelta(seconds=settings.JWT_ACCESS_TOKEN_LIFETIME)
        }, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
        
        refresh_token = jwt.encode({
            'user_id': user.id,
            'exp': now + timedelta(seconds=settings.JWT_REFRESH_TOKEN_LIFETIME)
        }, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
        
        # Save refresh token
        RefreshToken.objects.create(
            user=user,
            token=refresh_token,
            expires_at=now + timedelta(seconds=settings.JWT_REFRESH_TOKEN_LIFETIME)
        )
        
        return Response({
            'access_token': access_token,
            'refresh_token': refresh_token,
            'expires_in': settings.JWT_ACCESS_TOKEN_LIFETIME,  # Add expiry info
            'user': {
                'id': user.id,
                'email': user.email,
                'displayName': user.display_name,
                'role': user.role
            }
        })

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # Revoke refresh tokens
        RefreshToken.objects.filter(user=request.user).update(revoked=True)
        return Response({'message': 'Logged out successfully'})

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'email': user.email,
            'displayName': user.display_name,
            'role': user.role,
            'emailVerified': user.email_verified
        })

class RefreshTokenView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        refresh_token = request.data.get('refresh_token')
        
        try:
            payload = jwt.decode(refresh_token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
            user = User.objects.get(id=payload['user_id'])
            
            # Check if token exists and is not revoked
            token_obj = RefreshToken.objects.filter(user=user, token=refresh_token, revoked=False).first()
            if not token_obj:
                return Response({'error': 'Invalid refresh token'}, status=status.HTTP_401_UNAUTHORIZED)
            
            # Generate new access token
            access_token = jwt.encode({
                'user_id': user.id,
                'exp': datetime.now(timezone.utc) + timedelta(seconds=settings.JWT_ACCESS_TOKEN_LIFETIME)
            }, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
            
            return Response({
                'access_token': access_token,
                'expires_in': settings.JWT_ACCESS_TOKEN_LIFETIME
            })
            
        except jwt.ExpiredSignatureError:
            return Response({'error': 'Refresh token expired'}, status=status.HTTP_401_UNAUTHORIZED)
        except (jwt.InvalidTokenError, User.DoesNotExist):
            return Response({'error': 'Invalid refresh token'}, status=status.HTTP_401_UNAUTHORIZED)