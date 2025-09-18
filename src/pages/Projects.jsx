// src/pages/Projects.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Project data with hero images (placeholders from Unsplash)
const projects = [
  {
    id: 0,
    title: "Introduction to My Projects",
    description:
      "Discover my passion projects and experiments that blend creativity, technology, and problem-solving. From interactive apps to innovative tools, each one tells a story of exploration and innovation.",
    heroImage: "/src/assets/images/intro-hero.jpg",
    github: "#",
    demo: "#",
    isIntro: true,
  },
  {
    id: 1,
    title: "Mr. ICT",
    description:
      "An interactive coding tutorial platform that lets learners pause a video and experiment with the code being taught—right in the same interface.",
    heroImage: "/src/assets/images/mr-ict.jpg",
    github: "##",
    demo: "https://youtu.be/TBdZsbNG8Z0?si=C0XGbGCjqFmPy8Js",
  },
  {
    id: 2,
    title: "SwapWing",
    description:
      "A sharing economy app for bartering goods and services—no money involved.",
    heroImage: "/src/assets/images/swapwing.jpg",
    github: "https://github.com/woedy/swapwing",
    demo: "https://youtu.be/lvjfaL-MHiw?si=2EU9zhbYU5rUjfLq",
  },
  {
    id: 3,
    title: "Smart ELection Ledger System (SELS)",
    description:
      "An election reporting app that collects real-time data directly from the field.",
    heroImage: "/src/assets/images/sels.jpg",
    github: "##",
    demo: "https://www.youtube.com/watch?v=yourDemoID2",
  },
  {
    id: 4,
    title: "Zamio",
    description:
      "An app that helps artists get paid fairly when their music is played on radio or TV.",
    heroImage: "/src/assets/images/zamio.jpg",
    github: "##",
    demo: "##",
  },
  {
    id: 5,
    title: "Alumni App",
    description:
      "A simple app to help former students stay connected—across years, programs, and campuses.",
    heroImage: "/src/assets/images/alumni.jpg",
    github: "##",
    demo: "##",
  },
  {
    id: 6,
    title: "Weekend Chef",
    description: "A sharing economy platform for home kitchens.",
    heroImage: "/src/assets/images/chef.jpg",
    github: "##",
    demo: "##",
  },
  {
    id: 7,
    title: "Messibo",
    description: "Testing a VoIP API framework.",
    heroImage: "/src/assets/images/voip.jpg",
    github: "##",
    demo: "##",
  },
  {
    id: 8,
    title: "Mind Canvas",
    description:
      "A creative app that transforms kids drawings to interactive stories.",
    heroImage: "/src/assets/images/mind.jpg",
    github: "#",
    demo: "#",
  },
  {
    id: 9,
    title: "Ghana Cancer Support Group App (My Storms End)",
    description:
      "An app to help cancer patients, survivors and caregivers connect, share resources, and find support.",
    heroImage: "/src/assets/images/cancer.jpg",
    github: "#",
    demo: "#",
  },
];

const Projects = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () =>
    setCurrentSlide((prev) => (prev + 1) % projects.length);
  const handlePrev = () =>
    setCurrentSlide((prev) => (prev - 1 + projects.length) % projects.length);
  const handleNavigate = (page) => {
    navigate(`/${page === "home" ? "" : page}`);
    window.scrollTo(0, 0);
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-900">
      {/* Custom Navigation (minimal, top-right, inspired by PageHeader but sleek) */}
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
        {projects.map((project) => (
          <div
            key={project.id}
            className="w-full h-full flex-shrink-0 relative bg-cover bg-center"
            style={{ backgroundImage: `url(${project.heroImage})` }}
          >
            {/* Overlay for readability */}
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-center text-white max-w-4xl mx-auto px-6">
                <h2 className="text-5xl font-bold mb-4">{project.title}</h2>
                <p className="text-xl mb-8 leading-relaxed">
                  {project.description}
                </p>
                {!project.isIntro && (
                  <div className="flex justify-center space-x-6">
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200"
                    >
                      GitHub
                    </a>
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200"
                    >
                      Demo
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Carousel Controls (Prev/Next) */}
      <button
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full z-10 transition-all duration-200"
        onClick={handlePrev}
      >
        ←
      </button>
      <button
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full z-10 transition-all duration-200"
        onClick={handleNext}
      >
        →
      </button>

      {/* Scroll Indicators (Dots) */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {projects.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-200 ${
              index === currentSlide ? "bg-yellow-300" : "bg-gray-500"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Projects;
