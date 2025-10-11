import db from '../config/database.js';

console.log('🌱 Seeding database with sample data...');

try {
  // Insert sample projects
  console.log('Adding projects...');
  
  db.prepare(`INSERT INTO projects (title, description, images, technologies, github_url, live_url, featured) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
    'Portfolio Website',
    'A modern, responsive portfolio website built with React and Node.js',
    '["portfolio-preview.jpg"]',
    '["React", "Node.js", "SQLite", "Tailwind CSS"]',
    'https://github.com/ransford/portfolio',
    'https://ransfordantwi.dev',
    1
  );

  db.prepare(`INSERT INTO projects (title, description, images, technologies, github_url, live_url, featured) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
    'E-commerce Platform',
    'Full-stack e-commerce solution with payment integration',
    '["ecommerce-preview.jpg"]',
    '["React", "Express", "PostgreSQL", "Stripe"]',
    'https://github.com/ransford/ecommerce',
    'https://shop.example.com',
    1
  );

  db.prepare(`INSERT INTO projects (title, description, images, technologies, github_url, live_url, featured) VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
    'Task Management App',
    'Collaborative task management tool for teams',
    '["taskapp-preview.jpg"]',
    '["Vue.js", "Firebase", "Vuetify"]',
    'https://github.com/ransford/taskapp',
    null,
    0
  );

  // Insert sample thoughts
  console.log('Adding thoughts...');
  
  db.prepare(`INSERT INTO thoughts (title, snippet, content, date, featured, tags) VALUES (?, ?, ?, ?, ?, ?)`).run(
    'The Future of Web Development',
    'Exploring emerging trends and technologies shaping the web development landscape.',
    'Web development continues to evolve at a rapid pace. From the rise of AI-powered development tools to the growing importance of web performance and accessibility, developers need to stay current with the latest trends and best practices.',
    '2024-01-15',
    1,
    '["web development", "technology", "trends"]'
  );

  db.prepare(`INSERT INTO thoughts (title, snippet, content, date, featured, tags) VALUES (?, ?, ?, ?, ?, ?)`).run(
    'Building Scalable React Applications',
    'Best practices for structuring and organizing large React codebases.',
    'As React applications grow in complexity, proper architecture becomes crucial. This article explores patterns and strategies for building maintainable, scalable React applications.',
    '2024-01-10',
    1,
    '["React", "architecture", "best practices"]'
  );

  db.prepare(`INSERT INTO thoughts (title, snippet, content, date, featured, tags) VALUES (?, ?, ?, ?, ?, ?)`).run(
    'The Importance of Accessibility',
    'Why accessibility should be a priority in every web project.',
    'Web accessibility ensures that websites and applications are usable by everyone, including people with disabilities. Learn why accessibility matters and how to implement it effectively.',
    '2024-01-05',
    0,
    '["accessibility", "web design", "inclusive design"]'
  );

  // Insert sample work experience
  console.log('Adding work experience...');
  
  db.prepare(`INSERT INTO work_experience (company, position, description, start_date, end_date, current, technologies, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
    'Tech Innovations Inc.',
    'Senior Full Stack Developer',
    'Led development of scalable web applications using React, Node.js, and cloud technologies. Mentored junior developers and implemented best practices for code quality and performance.',
    '2022-03-01',
    null,
    1,
    '["React", "Node.js", "AWS", "PostgreSQL", "Docker"]',
    1
  );

  db.prepare(`INSERT INTO work_experience (company, position, description, start_date, end_date, current, technologies, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
    'Digital Solutions Ltd.',
    'Full Stack Developer',
    'Developed and maintained multiple client projects using modern web technologies. Collaborated with design and product teams to deliver high-quality user experiences.',
    '2020-06-15',
    '2022-02-28',
    0,
    '["Vue.js", "Express", "MongoDB", "Firebase"]',
    2
  );

  console.log('✅ Database seeded successfully!');
  
  // Verify counts
  const projectCount = db.prepare('SELECT COUNT(*) as count FROM projects').get();
  const thoughtCount = db.prepare('SELECT COUNT(*) as count FROM thoughts').get();
  const workCount = db.prepare('SELECT COUNT(*) as count FROM work_experience').get();
  
  console.log(`📊 Final counts:`);
  console.log(`   Projects: ${projectCount.count}`);
  console.log(`   Thoughts: ${thoughtCount.count}`);
  console.log(`   Work Experience: ${workCount.count}`);

} catch (error) {
  console.error('❌ Error:', error);
}