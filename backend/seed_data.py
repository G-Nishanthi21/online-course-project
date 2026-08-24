import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from accounts.models import User
from courses.models import Category, Course, Section, Lesson

def seed():
    print("Seeding database...")

    # Create admin/instructor user
    instructor, _ = User.objects.get_or_create(
        username="instructor",
        defaults={
            "email": "instructor@learnhub.com",
            "first_name": "Sarah",
            "last_name": "Jenkins",
            "role": "instructor",
        }
    )
    if not instructor.check_password("admin123"):
        instructor.set_password("admin123")
        instructor.is_staff = True
        instructor.is_superuser = True
        instructor.save()

    # Create demo student user
    student, _ = User.objects.get_or_create(
        username="demo_student",
        defaults={
            "email": "student@learnhub.com",
            "first_name": "Alex",
            "last_name": "Rivera",
            "role": "student",
        }
    )
    if not student.check_password("student123"):
        student.set_password("student123")
        student.save()

    # Categories
    web_cat, _ = Category.objects.get_or_create(name="Web Development")
    ds_cat, _ = Category.objects.get_or_create(name="Data Science")
    design_cat, _ = Category.objects.get_or_create(name="UI/UX Design")

    # Course 1: Full-Stack Web Development
    c1, created1 = Course.objects.get_or_create(
        title="Full-Stack Web Development with React & Django",
        defaults={
            "description": "Master modern full-stack development from ground up. Build real-world APIs with Django REST Framework and dynamic frontend interfaces with React.",
            "instructor": instructor,
            "category": web_cat,
            "level": "intermediate",
            "price": 2499.00,
            "rating": 4.8,
            "students_count": 1420,
            "duration": "18 Hours",
            "image": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
        }
    )
    if created1 or Section.objects.filter(course=c1).count() == 0:
        s1 = Section.objects.create(course=c1, title="1. Introduction to Web Architecture & Setup", order=1)
        Lesson.objects.create(section=s1, title="Understanding Client-Server Architecture", description="Overview of HTTP requests, RESTful APIs, and frontend-backend separation.", video_url="https://www.w3schools.com/html/mov_bbb.mp4", duration="12 mins", order=1)
        Lesson.objects.create(section=s1, title="Setting up Django REST & React Environment", description="Configuring Python virtualenv, Django apps, Node.js and Vite.", video_url="https://www.w3schools.com/html/mov_bbb.mp4", duration="18 mins", order=2)

        s2 = Section.objects.create(course=c1, title="2. Backend APIs with Django REST Framework", order=2)
        Lesson.objects.create(section=s2, title="Designing Relational Models & Migrations", description="Defining Django ORM models, foreign keys, and unique indexes.", video_url="https://www.w3schools.com/html/mov_bbb.mp4", duration="25 mins", order=1)
        Lesson.objects.create(section=s2, title="Building Serializers and ModelViewSets", description="Exposing CRUD endpoints, nested serialization, and query parameters.", video_url="https://www.w3schools.com/html/mov_bbb.mp4", duration="30 mins", order=2)

        s3 = Section.objects.create(course=c1, title="3. Frontend Integration with React & State", order=3)
        Lesson.objects.create(section=s3, title="Consuming REST Endpoints using Axios/Fetch", description="Connecting React state and useEffect hooks with backend services.", video_url="https://www.w3schools.com/html/mov_bbb.mp4", duration="22 mins", order=1)

    # Course 2: Python Data Science
    c2, created2 = Course.objects.get_or_create(
        title="Python Data Science & Machine Learning Masterclass",
        defaults={
            "description": "Learn NumPy, Pandas, Matplotlib, Scikit-Learn, and Machine Learning algorithms to analyze complex datasets and make data-driven predictions.",
            "instructor": instructor,
            "category": ds_cat,
            "level": "beginner",
            "price": 1999.00,
            "rating": 4.9,
            "students_count": 2150,
            "duration": "24 Hours",
            "image": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
        }
    )
    if created2 or Section.objects.filter(course=c2).count() == 0:
        s1 = Section.objects.create(course=c2, title="1. Python Data Analysis Core", order=1)
        Lesson.objects.create(section=s1, title="NumPy Arrays & Vectorized Calculations", description="High-performance numerical computing with multidimensional arrays.", video_url="https://www.w3schools.com/html/mov_bbb.mp4", duration="15 mins", order=1)
        Lesson.objects.create(section=s1, title="Data Cleaning & Manipulation with Pandas", description="Handling missing values, grouping, merging, and filtering DataFrames.", video_url="https://www.w3schools.com/html/mov_bbb.mp4", duration="28 mins", order=2)

        s2 = Section.objects.create(course=c2, title="2. Applied Machine Learning", order=2)
        Lesson.objects.create(section=s2, title="Linear Regression & Predictive Modeling", description="Training regression models and evaluating RMSE and R-squared metrics.", video_url="https://www.w3schools.com/html/mov_bbb.mp4", duration="32 mins", order=1)

    # Course 3: UI/UX Design
    c3, created3 = Course.objects.get_or_create(
        title="UI/UX Design & Figma Prototyping Essentials",
        defaults={
            "description": "Design sleek, user-centric interfaces. Master wireframing, color theory, typography, components, and interactive high-fidelity Figma prototypes.",
            "instructor": instructor,
            "category": design_cat,
            "level": "beginner",
            "price": 1499.00,
            "rating": 4.7,
            "students_count": 980,
            "duration": "14 Hours",
            "image": "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=800&q=80",
        }
    )
    if created3 or Section.objects.filter(course=c3).count() == 0:
        s1 = Section.objects.create(course=c3, title="1. Design Systems & Visual Hierarchy", order=1)
        Lesson.objects.create(section=s1, title="Understanding Grid Systems & Spacing", description="Principles of spatial balance, 8pt grid, and visual alignment.", video_url="https://www.w3schools.com/html/mov_bbb.mp4", duration="14 mins", order=1)
        Lesson.objects.create(section=s1, title="Figma Interactive Prototyping", description="Connecting components with smooth micro-interactions and transitions.", video_url="https://www.w3schools.com/html/mov_bbb.mp4", duration="20 mins", order=2)

    print("Seed data completed successfully!")

if __name__ == "__main__":
    seed()
