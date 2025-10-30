// Portfolio context data for AI chat
export const portfolioContext = {
  projects: [
    {
      title: "Django Portfolio Backend",
      description: "A comprehensive Django REST API backend powering this portfolio website with authentication, content management, and learning platform features.",
      technologies: ["Django", "Django REST Framework", "JWT", "SQLite", "PostgreSQL"],
      type: "Backend API"
    },
    {
      title: "React Portfolio Frontend", 
      description: "Modern React frontend with Tailwind CSS, featuring responsive design, performance optimization, and accessibility compliance.",
      technologies: ["React", "Vite", "Tailwind CSS", "Three.js", "Axios"],
      type: "Frontend Application"
    },
    {
      title: "Learning Management System",
      description: "Full-featured LMS with course enrollment, lesson tracking, assignment submissions, and peer collaboration features.",
      technologies: ["React", "Django", "JWT Authentication", "File Uploads"],
      type: "Full-Stack Application"
    },
    {
      title: "E-commerce Platform",
      description: "Complete e-commerce solution with product management, shopping cart, and order processing (coming soon).",
      technologies: ["React", "Django", "Payment Integration", "Inventory Management"],
      type: "E-commerce Application"
    }
  ],
  
  skills: {
    frontend: ["React", "JavaScript", "TypeScript", "HTML5", "CSS3", "Tailwind CSS", "Three.js", "Vite"],
    backend: ["Django", "Django REST Framework", "Node.js", "Express", "Python", "JavaScript"],
    database: ["PostgreSQL", "SQLite", "MongoDB", "Redis"],
    tools: ["Git", "Docker", "AWS", "Vercel", "Netlify", "Postman", "VS Code"],
    concepts: ["REST APIs", "JWT Authentication", "Responsive Design", "Performance Optimization", "Accessibility", "SEO"]
  },
  
  experience: {
    current: "Full-Stack Developer focused on modern web technologies",
    expertise: "Building scalable web applications with React and Django",
    passion: "Creating user-friendly interfaces and robust backend systems",
    learning: "Continuously exploring new technologies and best practices"
  },
  
  contact: {
    approach: "Open to discussing new opportunities and collaborations",
    interests: "Full-stack development, mentoring, and innovative web solutions"
  }
};