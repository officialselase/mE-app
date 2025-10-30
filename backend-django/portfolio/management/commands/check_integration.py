from django.core.management.base import BaseCommand
from portfolio.models import Project, Thought, WorkExperience
from shop.models import Product
from learn.models import Course, LearnInquiry
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Check the integration status of the portfolio backend'

    def handle(self, *args, **options):
        self.stdout.write('🔍 Checking Portfolio Backend Integration...\n')
        
        # Check users
        user_count = User.objects.count()
        admin_count = User.objects.filter(is_superuser=True).count()
        self.stdout.write(f'👥 Users: {user_count} total, {admin_count} admins')
        
        # Check portfolio data
        project_count = Project.objects.count()
        thought_count = Thought.objects.count()
        work_count = WorkExperience.objects.count()
        
        self.stdout.write(f'📁 Portfolio Data:')
        self.stdout.write(f'   - Projects: {project_count}')
        self.stdout.write(f'   - Thoughts: {thought_count}')
        self.stdout.write(f'   - Work Experience: {work_count}')
        
        # Check shop data
        product_count = Product.objects.count()
        self.stdout.write(f'🛒 Shop Data:')
        self.stdout.write(f'   - Products: {product_count}')
        
        # Check learn data
        course_count = Course.objects.count()
        inquiry_count = LearnInquiry.objects.count()
        self.stdout.write(f'📚 Learn Data:')
        self.stdout.write(f'   - Courses: {course_count}')
        self.stdout.write(f'   - Inquiries: {inquiry_count}')
        
        # Check for featured content
        featured_projects = Project.objects.filter(featured=True).count()
        featured_thoughts = Thought.objects.filter(featured=True).count()
        self.stdout.write(f'⭐ Featured Content:')
        self.stdout.write(f'   - Featured Projects: {featured_projects}')
        self.stdout.write(f'   - Featured Thoughts: {featured_thoughts}')
        
        # Integration status
        total_content = project_count + thought_count + work_count + product_count + course_count
        
        if total_content > 0:
            self.stdout.write(self.style.SUCCESS('\n✅ Integration Status: READY'))
            self.stdout.write('🚀 Your portfolio backend is ready for frontend integration!')
            self.stdout.write('\n📋 Next Steps:')
            self.stdout.write('1. Start the Django server: python manage.py runserver')
            self.stdout.write('2. Start the React frontend: npm run dev')
            self.stdout.write('3. Visit http://localhost:5173 to see your portfolio')
            self.stdout.write('4. Admin panel: http://localhost:8000/admin/')
        else:
            self.stdout.write(self.style.WARNING('\n⚠️  Integration Status: NEEDS DATA'))
            self.stdout.write('Run: python manage.py populate_data')
        
        self.stdout.write('\n🔗 API Endpoints Available:')
        endpoints = [
            'http://localhost:8000/api/health/',
            'http://localhost:8000/api/portfolio/projects/',
            'http://localhost:8000/api/portfolio/thoughts/',
            'http://localhost:8000/api/portfolio/work/',
            'http://localhost:8000/api/shop/products/',
            'http://localhost:8000/api/learn/courses/',
            'http://localhost:8000/api/auth/register/',
            'http://localhost:8000/api/auth/login/',
        ]
        
        for endpoint in endpoints:
            self.stdout.write(f'   - {endpoint}')
        
        self.stdout.write('\n🎉 Integration check complete!')