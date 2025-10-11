import { Helmet } from "react-helmet-async";

const StructuredData = ({ data }) => {
  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(data)}
      </script>
    </Helmet>
  );
};

// Person schema for About page
export const createPersonSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Ransford Antwi",
  "jobTitle": "Full Stack Developer",
  "description": "Experienced full stack developer specializing in React, Node.js, and modern web technologies",
  "url": window.location.origin,
  "sameAs": [
    "https://github.com/ransfordantwi", // Update with actual URLs
    "https://linkedin.com/in/ransfordantwi",
    "https://twitter.com/ransfordantwi"
  ],
  "knowsAbout": [
    "JavaScript",
    "React",
    "Node.js",
    "Full Stack Development",
    "Web Development",
    "Software Engineering"
  ],
  "nationality": "Ghanaian",
  "worksFor": {
    "@type": "Organization",
    "name": "Freelance Developer"
  },
  "alumniOf": {
    "@type": "EducationalOrganization",
    "name": "University" // Update with actual education
  }
});

// Portfolio project schema
export const createProjectSchema = (project) => ({
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  "name": project.title,
  "description": project.description,
  "creator": {
    "@type": "Person",
    "name": "Ransford Antwi"
  },
  "dateCreated": project.createdAt,
  "url": project.liveUrl || project.githubUrl,
  "programmingLanguage": project.technologies,
  "codeRepository": project.githubUrl,
  "image": project.images?.[0]
});

// Blog post schema for thoughts
export const createBlogPostSchema = (thought) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": thought.title,
  "description": thought.snippet,
  "articleBody": thought.content,
  "author": {
    "@type": "Person",
    "name": "Ransford Antwi"
  },
  "datePublished": thought.date,
  "dateModified": thought.updatedAt || thought.date,
  "publisher": {
    "@type": "Person",
    "name": "Ransford Antwi"
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": `${window.location.origin}/thoughts`
  },
  "keywords": thought.tags?.join(", ")
});

// Website schema for homepage
export const createWebsiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Ransford Antwi Portfolio",
  "description": "Personal portfolio and blog of Ransford Antwi, full stack developer",
  "url": window.location.origin,
  "author": {
    "@type": "Person",
    "name": "Ransford Antwi"
  },
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${window.location.origin}/search?q={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  }
});

export default StructuredData;