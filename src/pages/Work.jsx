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

const Work = ({ setCurrentPage }) => {
  const [selectedWork, setSelectedWork] = useState(null);

  // Fetch work experience from API
  const { workExperience, loading, error, refetch } = useWorkExperience();

  useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

  // Format date for display (handle Django field names)
  const formatDate = (dateString) => {
    if (!dateString) { return "Present"; }
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
    });
  };

  // Format duration string (handle Django field names)
  const formatDuration = (work) => {
    const startDate = work.startDate || work.start_date || work.date_started;
    const endDate = work.endDate || work.end_date || work.date_ended;
    const isCurrent = work.current || work.is_current || work.is_active;
    
    const start = formatDate(startDate);
    const end = isCurrent ? "Present" : formatDate(endDate);
    return `${start} – ${end}`;
  };

  // Helper to format description into bullet points
  const formatDescription = (description) => {
    if (!description) {return [];}
    // Split by new lines or bullet points if present, otherwise split sentences
    const lines = description.split(/\n|•|\*|-/).filter(line => line.trim());
    return lines.length > 0 ? lines : [description];
  };

  return (
    <>
      <MetaTags
        title="Work Experience - Selase K"
        description="Discover Selase K's professional work experience and career journey. Learn about his roles, projects, and contributions in software development and engineering."
        keywords="work experience, career, professional experience, software engineer, full stack developer, Selase Kofi Agbai"
        url={`${window.location.origin}/work`}
      />
      <div
        className="flex flex-col min-h-screen bg-white text-gray-900"
        style={{ position: "relative", overflow: "hidden" }}
      >
        {/* Header */}
        <section className="py-16 px-4 sm:px-6 md:px-8">
          <div className="w-full max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Work Experience
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              A timeline of my professional journey and key contributions in software development and engineering.
            </p>
          </div>
        </section>

        {/* Work Experience List */}
        <section className="py-12 px-4 sm:px-6 md:px-8 flex-grow">
          <div className="w-full max-w-4xl mx-auto">
            {/* Loading State */}
            {loading && (
              <div className="space-y-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-6 shadow-sm">
                    <SkeletonLoader type="card" count={1} />
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-4 text-red-900">Error Loading Work Experience</h2>
                <p className="text-red-700 mb-6">
                  {error?.message || error || "Failed to load work experience from the server"}
                </p>
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
              <div className="bg-gray-50 rounded-lg p-12 text-center max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold mb-4 text-gray-900">
                  No Work Experience Yet
                </h2>
                <p className="text-xl text-gray-600">
                  Check back soon for updates!
                </p>
              </div>
            )}

            {/* Work Experience List */}
            {!loading && !error && workExperience.length > 0 && (
              <div className="space-y-8">
                {workExperience.map((work, index) => (
                  <div
                    key={work.id || index}
                    className="bg-gray-50 rounded-lg p-6 shadow-sm border-l-4 border-blue-600 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedWork(work)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          {work.position || work.job_title || work.title}
                        </h3>
                        <p className="text-lg text-blue-600 font-medium mt-1">
                          {work.company || work.company_name || work.employer}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500 text-right">
                        {work.location || work.city}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                      {formatDuration(work)}
                    </p>
                    <div className="text-gray-700 leading-relaxed">
                      {formatDescription(work.description || work.summary || work.responsibilities).map((point, idx) => (
                        <div key={idx} className="mb-2">
                          <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mr-3" />
                          {point.trim()}
                        </div>
                      ))}
                    </div>
                    {(work.technologies || work.tech_stack || work.skills) && 
                     (Array.isArray(work.technologies) ? work.technologies : work.tech_stack || work.skills)?.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {(Array.isArray(work.technologies) ? work.technologies : work.tech_stack || work.skills).slice(0, 5).map((tech, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                          >
                            {typeof tech === 'string' ? tech : tech.name || tech}
                          </span>
                        ))}
                        {(Array.isArray(work.technologies) ? work.technologies : work.tech_stack || work.skills).length > 5 && (
                          <span className="text-xs text-gray-500">
                            +{(Array.isArray(work.technologies) ? work.technologies : work.tech_stack || work.skills).length - 5} more
                          </span>
                        )}
                      </div>
                    )}
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
              className="bg-white p-8 rounded-lg max-w-2xl mx-4 overflow-y-auto max-h-[90vh] shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {selectedWork.position || selectedWork.job_title || selectedWork.title}
              </h2>
              <p className="text-xl text-blue-600 mb-2">
                {selectedWork.company || selectedWork.company_name || selectedWork.employer}
              </p>
              <p className="text-lg text-gray-600 mb-4">
                {formatDuration(selectedWork)} | {selectedWork.location || selectedWork.city}
              </p>
              <div className="text-gray-700 leading-relaxed mb-6">
                {formatDescription(selectedWork.description || selectedWork.summary || selectedWork.responsibilities).map((point, idx) => (
                  <div key={idx} className="mb-3">
                    <span className="inline-block w-2 h-2 bg-blue-600 rounded-full mr-3" />
                    {point.trim()}
                  </div>
                ))}
              </div>
              {(selectedWork.technologies || selectedWork.tech_stack || selectedWork.skills) && 
               (Array.isArray(selectedWork.technologies) ? selectedWork.technologies : selectedWork.tech_stack || selectedWork.skills)?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Technologies & Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {(Array.isArray(selectedWork.technologies) ? selectedWork.technologies : selectedWork.tech_stack || selectedWork.skills).map((tech, idx) => (
                      <span
                        key={idx}
                        className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                      >
                        {typeof tech === 'string' ? tech : tech.name || tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <button
                className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors duration-200"
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
