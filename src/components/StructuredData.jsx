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
  "name": "Selase K.",
  "jobTitle": "Full Stack Developer",
  "description": "Experienced full stack developer specializing in React, Node.js, and modern web technologies",
  "url": window.location.origin,
  "sameAs": [
    "https://github.com/officialselase", // Update with actual URLs
    "https://linkedin.com/in/selase-agbai",
    "https://x.com/Sels_Officialgh"
  ],
  "knowsAbout": [
    "JavaScript",
    "React",
    "Node.js",
    "Full Stack Development",
    "Web Development",
    "Software Engineering",
    "DevOps",
    "Flutter Development"
  ],
  "nationality": "Ghanaian",
  "worksFor": {
    "@type": "Self Employed",
    "name": "Freelance Developer"
  },
  "alumniOf": {
    "@type": "Ghana Technology University College",
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
    "name": "Selase K."
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
    "name": "Selase K."
  },
  "datePublished": thought.date,
  "dateModified": thought.updatedAt || thought.date,
  "publisher": {
    "@type": "Person",
    "name": "Selase K."
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
  "name": "Selase K. Portfolio",
  "description": "Personal portfolio and blog of Selase K, full stack developer",
  "url": window.location.origin,
  "author": {
    "@type": "Person",
    "name": "Selase K."
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