import { query, queryOne } from '../config/database.js';
import User from '../models/User.js';

async function seedCourses() {
  try {
    console.log('🌱 Seeding courses...');

    // Create an instructor user if it doesn't exist
    let instructor = await User.findByEmail('instructor@example.com');
    
    if (!instructor) {
      console.log('Creating instructor user...');
      instructor = await User.create({
        email: 'instructor@example.com',
        password: 'InstructorPass123',
        displayName: 'John Instructor',
        role: 'instructor'
      });
      console.log('✅ Instructor user created');
    } else {
      console.log('✅ Instructor user already exists');
    }

    // Check if courses already exist
    const existingCourses = query('SELECT COUNT(*) as count FROM courses', []);
    const existingLessons = query('SELECT COUNT(*) as count FROM lessons', []);
    
    if (existingCourses.rows[0].count > 0 && existingLessons.rows[0].count > 0) {
      console.log('✅ Courses and lessons already exist, skipping seed');
      return;
    }
    
    const shouldCreateCourses = existingCourses.rows[0].count === 0;

    // Sample courses data
    const courses = [
      {
        title: 'Introduction to React',
        description: 'Learn the fundamentals of React.js including components, state management, and hooks. Perfect for beginners who want to start building modern web applications.',
        instructor_id: instructor.id
      },
      {
        title: 'Advanced JavaScript',
        description: 'Master advanced JavaScript concepts including closures, prototypes, async/await, and ES6+ features. Take your JavaScript skills to the next level.',
        instructor_id: instructor.id
      },
      {
        title: 'Node.js Backend Development',
        description: 'Build robust backend applications with Node.js, Express, and databases. Learn API development, authentication, and deployment strategies.',
        instructor_id: instructor.id
      },
      {
        title: 'Full-Stack Web Development',
        description: 'Complete full-stack development course covering React, Node.js, databases, and deployment. Build real-world applications from start to finish.',
        instructor_id: instructor.id
      },
      {
        title: 'Python for Beginners',
        description: 'Start your programming journey with Python. Learn syntax, data structures, functions, and object-oriented programming concepts.',
        instructor_id: instructor.id
      },
      {
        title: 'Mobile App Development with React Native',
        description: 'Build cross-platform mobile applications using React Native. Learn navigation, state management, and native device features.',
        instructor_id: instructor.id
      }
    ];

    // Insert courses only if they don't exist
    if (shouldCreateCourses) {
      const insertSql = `
        INSERT INTO courses (title, description, instructor_id)
        VALUES (?, ?, ?)
      `;

      for (const course of courses) {
        query(insertSql, [course.title, course.description, course.instructor_id]);
        console.log(`✅ Created course: ${course.title}`);
      }
    } else {
      console.log('✅ Courses already exist, skipping course creation');
    }

    // Create some sample lessons for the "Introduction to React" course
    const firstCourse = queryOne('SELECT * FROM courses WHERE title = ? LIMIT 1', ['Introduction to React']);
    
    if (firstCourse) {
      const lessons = [
        {
          title: 'What is React?',
          content: 'Introduction to React and its core concepts.',
          course_id: firstCourse.id,
          order_index: 1
        },
        {
          title: 'Components and JSX',
          content: 'Learn how to create components and use JSX syntax.',
          course_id: firstCourse.id,
          order_index: 2
        },
        {
          title: 'State and Props',
          content: 'Understanding state management and component communication.',
          course_id: firstCourse.id,
          order_index: 3
        }
      ];

      const lessonSql = `
        INSERT INTO lessons (title, content, course_id, order_index)
        VALUES (?, ?, ?, ?)
      `;

      for (const lesson of lessons) {
        query(lessonSql, [lesson.title, lesson.content, lesson.course_id, lesson.order_index]);
        console.log(`✅ Created lesson: ${lesson.title}`);
      }

      // Create sample assignments for the lessons
      const createdLessons = query('SELECT * FROM lessons WHERE course_id = ? ORDER BY order_index', [firstCourse.id]);
      
      if (createdLessons.rows.length > 0) {
        const assignments = [
          {
            title: 'Create Your First React Component',
            description: 'Build a simple React component that displays your name and favorite programming language.',
            lesson_id: createdLessons.rows[0].id,
            required: 1
          },
          {
            title: 'Build a Counter App',
            description: 'Create a counter application using React state. Include increment, decrement, and reset functionality.',
            lesson_id: createdLessons.rows[1].id,
            required: 1
          },
          {
            title: 'Props Practice',
            description: 'Create a parent component that passes data to child components using props.',
            lesson_id: createdLessons.rows[2].id,
            required: 0
          }
        ];

        const assignmentSql = `
          INSERT INTO assignments (title, description, lesson_id, required)
          VALUES (?, ?, ?, ?)
        `;

        for (const assignment of assignments) {
          query(assignmentSql, [assignment.title, assignment.description, assignment.lesson_id, assignment.required]);
          console.log(`✅ Created assignment: ${assignment.title}`);
        }
      }
    }

    console.log('🎉 Course seeding completed successfully!');
    console.log(`📚 Created ${courses.length} courses with lessons and assignments`);
    
  } catch (error) {
    console.error('❌ Error seeding courses:', error);
    process.exit(1);
  }
}

// Run the seed function
seedCourses();