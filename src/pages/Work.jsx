import React, { useState, useEffect } from "react";
import useWorkExperience from "../hooks/useWorkExperience";
import SkeletonLoader from "../components/SkeletonLoader";
import MetaTags from "../components/MetaTags";

export const workSummary = `
The Work page presents Selase's professional projects and collaborations.
It shows his technical engineering side, with details of coding,
design, and innovation contributions. Visitors see the scope of his
real-world impact through this page.
`;

const Work = ({ setCurrentPage, currentPage }) => {
  const [selectedWork, setSelectedWork] = useState(null);

  // Fetch work experience from API
  const { workExperience, loading, error, refetch } = useWorkExperience();

  useEffect(() => {
    if (currentPage === "work") {
      window.scrollTo(0, 0);
    }
  }, [currentPage]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "Present";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  // Format duration string
  const formatDuration = (work) => {
    const start = formatDate(work.startDate);
    const end = work.current ? "Present" : formatDate(work.endDate);
    return `${start} – ${end}`;
  };

  return (
    <>
      <MetaTags
        title="Work Experience - Ransford Antwi"
        description="Discover Ransford Antwi's professional work experience and career journey. Learn about his roles, projects, and contributions in software development and engineering."
        keywords="work experience, career, professional experience, software engineer, full stack developer, Ransford Antwi"
        url={`${window.location.origin}/work`}
      />
      <div
        className="flex flex-col min-h-screen bg-amber-800 text-gray-100"
      style={{ position: "relative", overflow: "hidden" }}
    >
      {/* Case Study Grid */}
      <section className="py-12 px-4 sm:px-6 md:px-8 flex-grow">
        <div className="w-full max-w-screen-xl mx-auto">
          <h1 className="sr-only">Work Experience - Ransford Antwi</h1>
          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-gray-800 rounded-lg overflow-hidden shadow-md p-4"
                >
                  <SkeletonLoader type="card" count={1} />
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-900 border border-red-700 rounded-lg p-8 text-center max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-4">Error Loading Work Experience</h2>
              <p className="text-red-200 mb-6">{error}</p>
              <button
                onClick={refetch}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors duration-200"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && workExperience.length === 0 && (
            <div className="bg-gray-800 rounded-lg p-12 text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold mb-4 text-yellow-300">
                No Work Experience Yet
              </h2>
              <p className="text-xl text-gray-300">
                Check back soon for updates!
              </p>
            </div>
          )}

          {/* Work Experience Grid */}
          {!loading && !error && workExperience.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {workExperience.map((work, index) => (
                <div
                  key={work.id || index}
                  className="bg-gray-800 rounded-lg overflow-hidden shadow-md work-card cursor-pointer"
                  onClick={() => setSelectedWork(work)}
                >
                  {/* Hero Image Placeholder */}
                  <div
                    className="h-48 bg-cover bg-center"
                    style={{
                      backgroundImage: work.images?.[0]
                        ? `url(${work.images[0]})`
                        : `url(https://source.unsplash.com/random/400x300/?${work.company
                            .toLowerCase()
                            .replace(" ", "")})`,
                    }}
                  >
                    <div className="h-full bg-black bg-opacity-40 flex items-center justify-center">
                      <h3 className="text-3xl font-bold text-yellow-300 text-center px-4">
                        {work.position}
                      </h3>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-xl text-gray-400">
                      {work.company}
                    </p>
                    <p className="text-sm text-gray-500 mb-2">
                      {formatDuration(work)}
                    </p>
                    <p className="text-lg text-gray-300 mt-2 line-clamp-3">
                      {work.description}
                    </p>
                    {work.technologies && work.technologies.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {work.technologies.slice(0, 3).map((tech, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
                          >
                            {tech}
                          </span>
                        ))}
                        {work.technologies.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{work.technologies.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Modal for Detailed View */}
      {selectedWork && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-30"
          onClick={() => setSelectedWork(null)}
        >
          <div
            className="bg-gray-900 p-6 rounded-lg max-w-2xl mx-4 overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-4xl font-bold text-yellow-300 mb-4">
              {selectedWork.position}
            </h2>
            <p className="text-xl text-gray-400 mb-2">
              {selectedWork.company}
            </p>
            <p className="text-lg text-gray-500 mb-4">
              {formatDuration(selectedWork)}
            </p>
            <p className="text-2xl text-gray-300 leading-relaxed mb-6">
              {selectedWork.description}
            </p>
            {selectedWork.technologies && selectedWork.technologies.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-yellow-300 mb-3">
                  Technologies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedWork.technologies.map((tech, idx) => (
                    <span
                      key={idx}
                      className="bg-gray-700 text-gray-200 px-3 py-1 rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <button
              className="mt-6 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold rounded-lg transition-colors duration-200"
              onClick={() => setSelectedWork(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default Work;
