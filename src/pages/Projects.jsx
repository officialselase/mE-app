import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useProjects from "../hooks/useProjects";
import SkeletonLoader from "../components/SkeletonLoader";
import MetaTags from "../components/MetaTags";
import StructuredData, { createProjectSchema } from "../components/StructuredData";

export const projectsSummary = `
The Projects page showcases Selase's technical portfolio and creative work.
It features a carousel of projects with detailed descriptions, technologies used,
and links to live demos and source code. Each project demonstrates his skills
in web development, design, and problem-solving.
`;

const Projects = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [page, setPage] = useState(1);

  // Fetch all projects with pagination from Django API
  const { projects, pagination, loading, error, refetch } = useProjects({ page, limit: 20 });

  const handleNext = () =>
    setCurrentSlide((prev) => (prev + 1) % projects.length);
  const handlePrev = () =>
    setCurrentSlide((prev) => (prev - 1 + projects.length) % projects.length);
  const handleNavigate = (page) => {
    navigate(`/${page === "home" ? "" : page}`);
    window.scrollTo(0, 0);
  };

  const handleLoadMore = () => {
    if (pagination?.hasNext) {
      setPage((prev) => prev + 1);
    }
  };

  // Helper function to get YouTube video ID from URL
  const getYouTubeVideoId = (url) => {
    if (!url) {return null;}
    const urlObj = new URL(url);
    if (urlObj.hostname === "youtu.be") {
      return urlObj.pathname.slice(1);
    } else if (urlObj.hostname === "www.youtube.com" || urlObj.hostname === "youtube.com") {
      return urlObj.searchParams.get("v");
    }
    return null;
  };

  // Loading state
  if (loading && projects.length === 0) {
    return (
      <div className="relative w-full h-screen overflow-hidden bg-gray-900">
        <nav className="absolute top-4 right-4 z-20 flex flex-col space-y-2">
          {["home", "about", "work", "thoughts", "shop", "cart", "learn"].map(
            (page) => (
              <button
                key={page}
                onClick={() => handleNavigate(page)}
                className="px-4 py-2 text-gray-100 hover:text-yellow-300 font-medium text-base bg-transparent border-none cursor-pointer relative hover:underline transition-all duration-200 outline-none"
              >
                {page.charAt(0).toUpperCase() + page.slice(1)}
              </button>
            )
          )}
        </nav>
        <div className="flex items-center justify-center h-full">
          <div className="text-white text-center max-w-2xl px-6">
            <SkeletonLoader type="card" count={3} />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="relative w-full h-screen overflow-hidden bg-gray-900">
        <nav className="absolute top-4 right-4 z-20 flex flex-col space-y-2">
          {["home", "about", "work", "thoughts", "shop", "cart", "learn"].map(
            (page) => (
              <button
                key={page}
                onClick={() => handleNavigate(page)}
                className="px-4 py-2 text-gray-100 hover:text-yellow-300 font-medium text-base bg-transparent border-none cursor-pointer relative hover:underline transition-all duration-200 outline-none"
              >
                {page.charAt(0).toUpperCase() + page.slice(1)}
              </button>
            )
          )}
        </nav>
        <div className="flex items-center justify-center h-full">
          <div className="text-white text-center max-w-2xl px-6">
            <h2 className="text-3xl font-bold mb-4">Error Loading Projects</h2>
            <p className="text-xl mb-8">
              {error?.message || error || "Failed to load projects from the server"}
            </p>
            <button
              onClick={refetch}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!loading && projects.length === 0) {
    return (
      <div className="relative w-full h-screen overflow-hidden bg-gray-900">
        <nav className="absolute top-4 right-4 z-20 flex flex-col space-y-2">
          {["home", "about", "work", "thoughts", "shop", "cart", "learn"].map(
            (page) => (
              <button
                key={page}
                onClick={() => handleNavigate(page)}
                className="px-4 py-2 text-gray-100 hover:text-yellow-300 font-medium text-base bg-transparent border-none cursor-pointer relative hover:underline transition-all duration-200 outline-none"
              >
                {page.charAt(0).toUpperCase() + page.slice(1)}
              </button>
            )
          )}
        </nav>
        <div className="flex items-center justify-center h-full">
          <div className="text-white text-center max-w-2xl px-6">
            <h2 className="text-3xl font-bold mb-4">No Projects Yet</h2>
            <p className="text-xl">Check back soon for exciting projects!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <MetaTags
        title="Projects - Selase K"
        description="Explore Selase K's portfolio of web development projects. See live demos and source code for React applications, full-stack solutions, and creative web experiences."
        keywords="projects, portfolio, React projects, web development, full stack, JavaScript, Node.js, Selase Kofi Agbai"
        url={`${window.location.origin}/projects`}
      />
      {projects.length > 0 && (
        <StructuredData data={createProjectSchema(projects[currentSlide])} />
      )}
      <div className="relative w-full h-screen overflow-hidden bg-gray-900">
      <h1 className="sr-only">Projects Portfolio - Selase K</h1>
      {/* Custom Navigation */}
      <nav className="absolute top-4 right-4 z-20 flex flex-col space-y-2">
        {["home", "about", "work", "thoughts", "shop", "cart", "learn"].map(
          (page) => (
            <button
              key={page}
              onClick={() => handleNavigate(page)}
              className="px-4 py-2 text-gray-100 hover:text-yellow-300 font-medium text-base bg-transparent border-none cursor-pointer relative hover:underline transition-all duration-200 outline-none"
            >
              {page.charAt(0).toUpperCase() + page.slice(1)}
            </button>
          )
        )}
      </nav>

      {/* Fullscreen Carousel */}
      <div
        className="absolute inset-0 flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {projects.map((project) => {
          const demoUrl = project.liveUrl || project.live_url || project.demo_url;
          const githubUrl = project.githubUrl || project.github_url || project.repository_url;
          const videoId = getYouTubeVideoId(demoUrl);
          const hasVideo = videoId;

          return (
            <div
              key={project.id}
              className="w-full h-full flex-shrink-0 relative"
            >
              {/* Background Video or Image */}
              {hasVideo ? (
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&modestbranding=1&rel=0`}
                  title={`${project.title} Demo Video`}
                  className="absolute inset-0 w-full h-full object-cover"
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              ) : (
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: (project.featured_image_url || project.featured_image || project.images?.[0] || project.image)
                      ? `url(${project.featured_image_url || project.featured_image || project.images?.[0] || project.image})`
                      : `url(/images/default-project.jpg)`,
                  }}
                />
              )}
              {/* Overlay for readability */}
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-center text-white max-w-4xl mx-auto px-6">
                  <h2 className="text-5xl font-bold mb-4">{project.title}</h2>
                  <p className="text-xl mb-8 leading-relaxed">
                    {project.description || project.long_description || project.summary}
                  </p>
                  <div className="flex justify-center space-x-6">
                    {githubUrl && githubUrl !== "#" && (
                      <a
                        href={githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200"
                      >
                        GitHub
                      </a>
                    )}
                    {demoUrl && demoUrl !== "#" && (
                      <a
                        href={demoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200"
                      >
                        Demo
                      </a>
                    )}
                  </div>
                  {(project.technologies || project.tech_stack) && 
                   (Array.isArray(project.technologies) ? project.technologies : project.tech_stack)?.length > 0 && (
                    <div className="mt-6 flex flex-wrap justify-center gap-2">
                      {(Array.isArray(project.technologies) ? project.technologies : project.tech_stack).map((tech, index) => (
                        <span
                          key={index}
                          className="bg-gray-700 text-gray-200 px-3 py-1 rounded-full text-sm"
                        >
                          {typeof tech === 'string' ? tech : tech.name || tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Carousel Controls (Prev/Next) */}
      {projects.length > 1 && (
        <>
          <button
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full z-10 transition-all duration-200"
            onClick={handlePrev}
            aria-label="Previous project"
          >
            ←
          </button>
          <button
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full z-10 transition-all duration-200"
            onClick={handleNext}
            aria-label="Next project"
          >
            →
          </button>
        </>
      )}

      {/* Scroll Indicators (Dots) */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {projects.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentSlide ? "bg-yellow-300" : "bg-gray-500"
            }`}
            aria-label={`Go to project ${index + 1}`}
          />
        ))}
      </div>

      {/* Pagination Info */}
      {pagination && (
        <div className="absolute bottom-4 right-4 text-white text-sm bg-black bg-opacity-50 px-3 py-1 rounded z-10">
          {pagination.count} total projects
        </div>
      )}

      {/* Load More Button */}
      {pagination?.hasNext && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 z-10">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-2 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
    </>
  );
};

export default Projects;
