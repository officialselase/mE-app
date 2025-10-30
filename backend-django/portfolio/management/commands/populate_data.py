from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from portfolio.models import Project, Thought, WorkExperience
from shop.models import Product
from learn.models import Course, Lesson, Assignment
from datetime import date, datetime, timedelta

User = get_user_model()

class Command(BaseCommand):
    help = 'Populate database with sample data'

    def handle(self, *args, **options):
        self.stdout.write('Populating database with sample data...')
        
        # Create superuser if it doesn't exist
        if not User.objects.filter(is_superuser=True).exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@example.com',
                password='admin123',
                display_name='Admin User'
            )
            self.stdout.write('Created superuser: admin/admin123')
        
        # Create sample projects
        projects_data = [
            {
                'title': 'E-Commerce Platform',
                'description': 'A full-stack e-commerce solution built with React and Django',
                'long_description': 'This comprehensive e-commerce platform features user authentication, product catalog, shopping cart, payment integration, and admin dashboard. Built using modern web technologies for optimal performance and user experience.',
                'technologies': ['React', 'Django', 'PostgreSQL', 'Stripe', 'Tailwind CSS'],
                'github_url': 'https://github.com/example/ecommerce',
                'live_url': 'https://ecommerce-demo.com',
                'featured': True
            },
            {
                'title': 'Task Management App',
                'description': 'A collaborative task management application with real-time updates',
                'long_description': 'Team collaboration tool with drag-and-drop interface, real-time notifications, file attachments, and progress tracking. Supports multiple projects and team members.',
                'technologies': ['React', 'Node.js', 'Socket.io', 'MongoDB', 'Material-UI'],
                'github_url': 'https://github.com/example/taskmanager',
                'live_url': 'https://taskmanager-demo.com',
                'featured': False
            },
            {
                'title': 'Weather Dashboard',
                'description': 'Interactive weather dashboard with forecasting and location-based services',
                'long_description': 'Beautiful weather application with 7-day forecasts, interactive maps, weather alerts, and location-based recommendations. Features responsive design and offline capabilities.',
                'technologies': ['Vue.js', 'Express.js', 'OpenWeather API', 'Chart.js', 'PWA'],
                'github_url': 'https://github.com/example/weather',
                'live_url': 'https://weather-demo.com',
                'featured': True
            }
        ]
        
        for project_data in projects_data:
            project, created = Project.objects.get_or_create(
                title=project_data['title'],
                defaults=project_data
            )
            if created:
                self.stdout.write(f'Created project: {project.title}')
        
        # Create sample thoughts/blog posts
        thoughts_data = [
            {
                'title': 'The Future of Web Development',
                'snippet': 'Exploring emerging trends and technologies shaping the future of web development.',
                'content': '''The web development landscape is constantly evolving, with new frameworks, tools, and methodologies emerging regularly. In this post, I explore some of the most exciting trends that are shaping the future of web development.

**1. AI-Powered Development Tools**
Artificial intelligence is revolutionizing how we write code. From intelligent code completion to automated testing, AI tools are making developers more productive than ever.

**2. WebAssembly (WASM)**
WebAssembly is enabling high-performance applications to run in the browser, opening up new possibilities for web applications.

**3. Serverless Architecture**
The shift towards serverless computing is changing how we think about backend infrastructure and deployment.

**4. Progressive Web Apps (PWAs)**
PWAs continue to bridge the gap between web and native applications, providing app-like experiences through the browser.

The future of web development is bright, with these technologies enabling us to build faster, more efficient, and more engaging web experiences.''',
                'date': date.today() - timedelta(days=5),
                'tags': ['Web Development', 'Technology', 'Future', 'AI'],
                'featured': True
            },
            {
                'title': 'Building Scalable React Applications',
                'snippet': 'Best practices and patterns for building large-scale React applications.',
                'content': '''Building scalable React applications requires careful planning and adherence to best practices. Here are some key strategies I've learned from working on large-scale projects.

**Component Architecture**
- Keep components small and focused
- Use composition over inheritance
- Implement proper prop drilling solutions

**State Management**
- Choose the right state management solution
- Keep state as close to where it's needed as possible
- Use context wisely

**Performance Optimization**
- Implement code splitting
- Use React.memo and useMemo appropriately
- Optimize bundle sizes

**Testing Strategy**
- Write unit tests for business logic
- Use integration tests for user flows
- Implement visual regression testing

These practices have helped me build maintainable and performant React applications that can grow with business needs.''',
                'date': date.today() - timedelta(days=12),
                'tags': ['React', 'JavaScript', 'Architecture', 'Best Practices'],
                'featured': False
            },
            {
                'title': 'My Journey into Full-Stack Development',
                'snippet': 'Reflecting on my path from frontend to full-stack development and lessons learned.',
                'content': '''My journey into full-stack development has been both challenging and rewarding. Starting as a frontend developer, I gradually expanded my skills to include backend technologies and database management.

**The Frontend Foundation**
I began with HTML, CSS, and JavaScript, learning the fundamentals of user interface design and user experience. This foundation proved invaluable as I moved into more complex frontend frameworks.

**Expanding to Backend**
Learning backend development opened up new possibilities. Understanding server-side logic, APIs, and databases gave me a complete picture of web application development.

**Key Lessons Learned**
1. Start with the fundamentals
2. Build projects to reinforce learning
3. Don't be afraid to make mistakes
4. Stay curious and keep learning

**Current Focus**
Today, I work with modern technologies like React, Django, and cloud platforms, always striving to build better solutions and help others on their development journey.

The path to becoming a full-stack developer is unique for everyone, but the journey is always worth it.''',
                'date': date.today() - timedelta(days=20),
                'tags': ['Career', 'Learning', 'Full-Stack', 'Personal'],
                'featured': True
            }
        ]
        
        for thought_data in thoughts_data:
            thought, created = Thought.objects.get_or_create(
                title=thought_data['title'],
                defaults=thought_data
            )
            if created:
                self.stdout.write(f'Created thought: {thought.title}')
        
        # Create sample work experience
        work_data = [
            {
                'company': 'Fiberwave Ghana LTD',
                'position': 'Senior Full-Stack Developer',
                'description': 'Leading development of web applications using React, Django, and cloud technologies. Mentoring junior developers and architecting scalable solutions for enterprise clients.',
                'start_date': date(2022, 1, 1),
                'current': True,
                'technologies': ['React', 'Django', 'PostgreSQL', 'AWS', 'Docker'],
                'display_order': 1
            },
            {
                'company': 'Tech Solutions Inc',
                'position': 'Frontend Developer',
                'description': 'Developed responsive web applications using modern JavaScript frameworks. Collaborated with design teams to implement pixel-perfect user interfaces.',
                'start_date': date(2020, 6, 1),
                'end_date': date(2021, 12, 31),
                'current': False,
                'technologies': ['React', 'Vue.js', 'TypeScript', 'SASS', 'Webpack'],
                'display_order': 2
            },
            {
                'company': 'StartupXYZ',
                'position': 'Junior Web Developer',
                'description': 'Built and maintained company website and internal tools. Gained experience in full-stack development and agile methodologies.',
                'start_date': date(2019, 3, 1),
                'end_date': date(2020, 5, 31),
                'current': False,
                'technologies': ['HTML', 'CSS', 'JavaScript', 'PHP', 'MySQL'],
                'display_order': 3
            }
        ]
        
        for work_item in work_data:
            work, created = WorkExperience.objects.get_or_create(
                company=work_item['company'],
                position=work_item['position'],
                defaults=work_item
            )
            if created:
                self.stdout.write(f'Created work experience: {work.position} at {work.company}')
        
        # Create sample products
        products_data = [
            {
                'title': 'Web Development Course',
                'description': 'Complete web development course covering HTML, CSS, JavaScript, React, and Node.js',
                'price': 299.99,
                'category': 'Education',
                'stock': 100,
                'featured': True
            },
            {
                'title': 'Code Review Service',
                'description': 'Professional code review service to improve your code quality and learn best practices',
                'price': 99.99,
                'category': 'Service',
                'stock': 50,
                'featured': False
            },
            {
                'title': 'Portfolio Template',
                'description': 'Modern, responsive portfolio template built with React and Tailwind CSS',
                'price': 49.99,
                'category': 'Template',
                'stock': 200,
                'featured': True
            }
        ]
        
        for product_data in products_data:
            product, created = Product.objects.get_or_create(
                title=product_data['title'],
                defaults=product_data
            )
            if created:
                self.stdout.write(f'Created product: {product.title}')
        
        # Create sample courses
        admin_user = User.objects.filter(is_superuser=True).first()
        if admin_user:
            courses_data = [
                {
                    'title': 'Introduction to Web Development',
                    'description': 'Learn the fundamentals of web development including HTML, CSS, and JavaScript',
                    'instructor': admin_user
                },
                {
                    'title': 'React for Beginners',
                    'description': 'Master React.js from basics to advanced concepts with hands-on projects',
                    'instructor': admin_user
                },
                {
                    'title': 'Full-Stack Development with Django',
                    'description': 'Build complete web applications using Django REST framework and React',
                    'instructor': admin_user
                }
            ]
            
            for course_data in courses_data:
                course, created = Course.objects.get_or_create(
                    title=course_data['title'],
                    defaults=course_data
                )
                if created:
                    self.stdout.write(f'Created course: {course.title}')
                    
                    # Add sample lessons for each course
                    lessons_data = [
                        {
                            'title': f'{course.title} - Lesson 1: Getting Started',
                            'content': f'Introduction to {course.title.lower()} and setting up your development environment.',
                            'order_index': 1
                        },
                        {
                            'title': f'{course.title} - Lesson 2: Core Concepts',
                            'content': f'Understanding the fundamental concepts and principles of {course.title.lower()}.',
                            'order_index': 2
                        },
                        {
                            'title': f'{course.title} - Lesson 3: Hands-on Practice',
                            'content': f'Building your first project with {course.title.lower()}.',
                            'order_index': 3
                        }
                    ]
                    
                    for lesson_data in lessons_data:
                        lesson, lesson_created = Lesson.objects.get_or_create(
                            course=course,
                            title=lesson_data['title'],
                            defaults={
                                'content': lesson_data['content'],
                                'order_index': lesson_data['order_index']
                            }
                        )
                        if lesson_created:
                            self.stdout.write(f'  Created lesson: {lesson.title}')
                            
                            # Add sample assignment for each lesson
                            assignment, assignment_created = Assignment.objects.get_or_create(
                                lesson=lesson,
                                title=f'Assignment: {lesson.title}',
                                defaults={
                                    'description': f'Complete the exercises for {lesson.title}',
                                    'instructions': 'Follow the lesson content and complete all exercises. Submit your code via GitHub repository.',
                                    'type': 'project',
                                    'required': True
                                }
                            )
                            if assignment_created:
                                self.stdout.write(f'    Created assignment: {assignment.title}')
        
        self.stdout.write(self.style.SUCCESS('Successfully populated database with sample data!'))
        self.stdout.write('You can now:')
        self.stdout.write('1. Access Django admin at http://localhost:8000/admin/ (admin/admin123)')
        self.stdout.write('2. View API endpoints at http://localhost:8000/api/')
        self.stdout.write('3. Test the frontend integration')