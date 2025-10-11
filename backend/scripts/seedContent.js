import db from '../config/database.js';

/**
 * Seed script to populate the database with sample content
 */

const seedProjects = () => {
  console.log('🌱 Seeding projects...');
  
  const projects = [
    {
      title: 'Portfolio Website',
      description: 'A modern, responsive portfolio website built with React and Node.js',
      long_description: 'This portfolio showcases my work as a full-stack developer, featuring a clean design, smooth animations, and a robust backend API.',
      images: JSON.stringify(['/images/portfolio-preview.jpg']),
      technologies: JSON.stringify(['React', 'Node.js', 'SQLite', 'Tailwind CSS']),
      github_url: 'https://github.com/ransford/portfolio',
      live_url: 'https://ransfordantwi.dev',
      featured: 1
    },
    {
      title: 'E-commerce Platform',
      description: 'Full-stack e-commerce solution with payment integration',
      long_description: 'A complete e-commerce platform with user authentication, product management, shopping cart, and Stripe payment integration.',
      images: JSON.stringify(['/images/ecommerce-preview.jpg']),
      technologies: JSON.stringify(['React', 'Express', 'PostgreSQL', 'Stripe']),
      github_url: 'https://github.com/ransford/ecommerce',
      live_url: 'https://shop.example.com',
      featured: 1
    },
    {
      title: 'Task Management App',
      description: 'Collaborative task management tool for teams',
      long_description: 'A productivity app that helps teams organize tasks, track progress, and collaborate effectively.',
      images: JSON.stringify(['/images/taskapp-preview.jpg']),
      technologies: JSON.stringify(['Vue.js', 'Firebase', 'Vuetify']),
      github_url: 'https://github.com/ransford/taskapp',
      live_url: null,
      featured: 0
    },
    {
      title: 'Weather Dashboard',
      description: 'Real-time weather monitoring dashboard',
      long_description: 'A responsive weather dashboard that displays current conditions and forecasts using external APIs.',
      images: JSON.stringify(['/images/weather-preview.jpg']),
      technologies: JSON.stringify(['JavaScript', 'Chart.js', 'OpenWeather API']),
      github_url: 'https://github.com/ransford/weather-dashboard',
      live_url: 'https://weather.example.com',
      featured: 0
    },
    {
      title: 'Learning Management System',
      description: 'Educational platform for online courses',
      long_description: 'A comprehensive LMS with course creation, student enrollment, progress tracking, and assignment submissions.',
      images: JSON.stringify(['/images/lms-preview.jpg']),
      technologies: JSON.stringify(['React', 'Node.js', 'MongoDB', 'Socket.io']),
      github_url: 'https://github.com/ransford/lms',
      live_url: null,
      featured: 1
    }
  ];

  const insertProject = db.prepare(`
    INSERT INTO projects (
      title, description, long_description, images, technologies,
      github_url, live_url, featured, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);

  projects.forEach(project => {
    insertProject.run(
      project.title,
      project.description,
      project.long_description,
      project.images,
      project.technologies,
      project.github_url,
      project.live_url,
      project.featured
    );
  });

  console.log(`✅ Seeded ${projects.length} projects`);
};

const seedThoughts = () => {
  console.log('🌱 Seeding thoughts...');
  
  const thoughts = [
    {
      title: 'The Future of Web Development',
      snippet: 'Exploring emerging trends and technologies shaping the web development landscape.',
      content: 'Web development continues to evolve at a rapid pace. From the rise of AI-powered development tools to the growing importance of web performance and accessibility, developers need to stay current with the latest trends and best practices.',
      date: '2024-01-15',
      featured: 1,
      tags: JSON.stringify(['web development', 'technology', 'trends'])
    },
    {
      title: 'Building Scalable React Applications',
      snippet: 'Best practices for structuring and organizing large React codebases.',
      content: 'As React applications grow in complexity, proper architecture becomes crucial. This article explores patterns and strategies for building maintainable, scalable React applications.',
      date: '2024-01-10',
      featured: 1,
      tags: JSON.stringify(['React', 'architecture', 'best practices'])
    },
    {
      title: 'The Importance of Accessibility in Modern Web Design',
      snippet: 'Why accessibility should be a priority in every web project.',
      content: 'Web accessibility ensures that websites and applications are usable by everyone, including people with disabilities. Learn why accessibility matters and how to implement it effectively.',
      date: '2024-01-05',
      featured: 0,
      tags: JSON.stringify(['accessibility', 'web design', 'inclusive design'])
    },
    {
      title: 'Optimizing Database Performance',
      snippet: 'Strategies for improving database query performance and scalability.',
      content: 'Database performance is critical for application success. This post covers indexing strategies, query optimization, and scaling techniques for better database performance.',
      date: '2023-12-28',
      featured: 0,
      tags: JSON.stringify(['database', 'performance', 'optimization'])
    },
    {
      title: 'Getting Started with TypeScript',
      snippet: 'A beginner-friendly introduction to TypeScript for JavaScript developers.',
      content: 'TypeScript adds static typing to JavaScript, helping catch errors early and improving code quality. Learn the basics and see why TypeScript is becoming the standard for modern web development.',
      date: '2023-12-20',
      featured: 1,
      tags: JSON.stringify(['TypeScript', 'JavaScript', 'programming'])
    },
    {
      title: 'Microservices vs Monoliths',
      snippet: 'Comparing architectural approaches for modern applications.',
      content: 'Choosing between microservices and monolithic architecture depends on various factors. This article examines the pros and cons of each approach.',
      date: '2023-12-15',
      featured: 0,
      tags: JSON.stringify(['architecture', 'microservices', 'monolith'])
    },
    {
      title: 'The Art of Code Reviews',
      snippet: 'How to conduct effective code reviews that improve code quality and team collaboration.',
      content: 'Code reviews are essential for maintaining code quality and sharing knowledge within development teams. Learn best practices for both giving and receiving code reviews.',
      date: '2023-12-10',
      featured: 0,
      tags: JSON.stringify(['code review', 'collaboration', 'best practices'])
    }
  ];

  const insertThought = db.prepare(`
    INSERT INTO thoughts (
      title, snippet, content, date, featured, tags, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);

  thoughts.forEach(thought => {
    insertThought.run(
      thought.title,
      thought.snippet,
      thought.content,
      thought.date,
      thought.featured,
      thought.tags
    );
  });

  console.log(`✅ Seeded ${thoughts.length} thoughts`);
};

const seedWorkExperience = () => {
  console.log('🌱 Seeding work experience...');
  
  const workExperience = [
    {
      company: 'Tech Innovations Inc.',
      position: 'Senior Full Stack Developer',
      description: 'Led development of scalable web applications using React, Node.js, and cloud technologies. Mentored junior developers and implemented best practices for code quality and performance.',
      start_date: '2022-03-01',
      end_date: null,
      current: 1,
      technologies: JSON.stringify(['React', 'Node.js', 'AWS', 'PostgreSQL', 'Docker']),
      display_order: 1
    },
    {
      company: 'Digital Solutions Ltd.',
      position: 'Full Stack Developer',
      description: 'Developed and maintained multiple client projects using modern web technologies. Collaborated with design and product teams to deliver high-quality user experiences.',
      start_date: '2020-06-15',
      end_date: '2022-02-28',
      current: 0,
      technologies: JSON.stringify(['Vue.js', 'Express', 'MongoDB', 'Firebase']),
      display_order: 2
    },
    {
      company: 'StartupXYZ',
      position: 'Frontend Developer',
      description: 'Built responsive web applications and mobile-first interfaces. Worked closely with UX designers to implement pixel-perfect designs and smooth user interactions.',
      start_date: '2019-01-10',
      end_date: '2020-06-10',
      current: 0,
      technologies: JSON.stringify(['JavaScript', 'React', 'SASS', 'Webpack']),
      display_order: 3
    }
  ];

  const insertWork = db.prepare(`
    INSERT INTO work_experience (
      company, position, description, start_date, end_date, current,
      technologies, display_order, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);

  workExperience.forEach(work => {
    insertWork.run(
      work.company,
      work.position,
      work.description,
      work.start_date,
      work.end_date,
      work.current,
      work.technologies,
      work.display_order
    );
  });

  console.log(`✅ Seeded ${workExperience.length} work experience entries`);
};

const seedAll = () => {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    db.prepare('DELETE FROM projects').run();
    db.prepare('DELETE FROM thoughts').run();
    db.prepare('DELETE FROM work_experience').run();
    
    // Seed new data
    seedProjects();
    seedThoughts();
    seedWorkExperience();
    
    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedAll();
}

export { seedAll, seedProjects, seedThoughts, seedWorkExperience };