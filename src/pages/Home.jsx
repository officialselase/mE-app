import { useCallback } from "react";
import useProjects from "../hooks/useProjects";
import useThoughts from "../hooks/useThoughts";
import SkeletonLoader from "../components/SkeletonLoader";
import ErrorMessage from "../components/ErrorMessage";
import MetaTags from "../components/MetaTags";
import StructuredData, { createWebsiteSchema } from "../components/StructuredData";

export const homeSummary = `
The Home page is the landing space of Selase's portfolio.
It welcomes visitors warmly, highlights his creativity and values,
and introduces featured projects and writings.
It serves as the entry point to explore the rest of the site.
`;

const Home = ({ setCurrentPage, currentPage }) => {
  // Fetch latest 8 projects from API
  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
    refetch: refetchProjects,
  } = useProjects({ limit: 8 });

  // Fetch latest 7 thoughts from API
  const {
    thoughts,
    loading: thoughtsLoading,
    error: thoughtsError,
    refetch: refetchThoughts,
  } = useThoughts({ limit: 7 });

  // Memoized navigation handlers for performance
  const handleProjectsClick = useCallback(() => {
    setCurrentPage("projects");
  }, [setCurrentPage]);

  const handleThoughtsClick = useCallback(() => {
    setCurrentPage("thoughts");
  }, [setCurrentPage]);



  const handleLearnClick = useCallback(() => {
    setCurrentPage("learn");
  }, [setCurrentPage]);

  const handleShopClick = useCallback(() => {
    setCurrentPage("shop");
  }, [setCurrentPage]);



  return (
    <>
      <MetaTags
        title="Home - Ransford Antwi"
        description="Welcome to Ransford Antwi's portfolio. Experienced full stack developer specializing in React, Node.js, and modern web technologies. Explore my latest projects and thoughts on software development."
        keywords="Ransford Antwi, full stack developer, React developer, Node.js, JavaScript, portfolio, software engineer"
        url={window.location.origin}
      />
      <StructuredData data={createWebsiteSchema()} />
      <div className="flex flex-col min-h-full">
      <main className="flex-grow w-full max-w-screen-xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        <h1 className="sr-only">Ransford Antwi - Full Stack Developer Portfolio</h1>
        <section className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 text-gray-100 mt-4">
          {/* Projects Column */}
          <div className="col-span-1">
            <h2>
              <button
                onClick={handleProjectsClick}
                className="text-xl font-bold mb-6 text-yellow-300 p-0 bg-transparent border-none cursor-pointer outline-none text-left hover:underline"
              >
                Projects
              </button>
            </h2>

            {/* Loading State */}
            {projectsLoading && <SkeletonLoader type="card" count={3} />}

            {/* Error State */}
            {projectsError && (
              <ErrorMessage
                message={projectsError}
                onRetry={refetchProjects}
                type="api"
              />
            )}

            {/* Projects List */}
            {!projectsLoading && !projectsError && (
              <ul className="list-none m-0 p-0 flex flex-col space-y-6">
                {projects.map((item, index) => (
                  <li key={item.id || index}>
                    <div className="block text-inherit no-hover relative project-card cursor-pointer p-3 rounded-lg text-left">
                      <h3 className="text-lg font-medium mb-1 text-yellow-300">
                        {item.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-gray-400 mt-1">
                        {item.description}
                      </p>
                    </div>
                  </li>
                ))}
                <li>
                  <button
                    onClick={handleProjectsClick}
                    className="text-sm font-medium mt-4 bg-transparent border-none text-inherit cursor-pointer p-0 outline-none hover:underline transition-all duration-200"
                  >
                    See all projects →
                  </button>
                </li>
              </ul>
            )}
          </div>

          {/* Thoughts Column */}
          <div className="col-span-1">
            <h2>
              <button
                onClick={handleThoughtsClick}
                className="text-xl font-bold mb-6 text-yellow-300 p-0 bg-transparent border-none cursor-pointer outline-none text-left hover:underline"
              >
                Thoughts & ideas
              </button>
            </h2>

            {/* Loading State */}
            {thoughtsLoading && <SkeletonLoader type="card" count={3} />}

            {/* Error State */}
            {thoughtsError && (
              <ErrorMessage
                message={thoughtsError}
                onRetry={refetchThoughts}
                type="api"
              />
            )}

            {/* Thoughts List */}
            {!thoughtsLoading && !thoughtsError && (
              <ul className="list-none m-0 p-0 flex flex-col space-y-6">
                {thoughts.map((item, index) => (
                  <li key={item.id || index}>
                    <div className="block text-inherit no-hover relative thought-card cursor-pointer p-3 rounded-lg">
                      <h3 className="text-lg font-medium mb-1 text-yellow-300">
                        {item.title}
                      </h3>
                      {item.snippet && (
                        <p className="text-sm leading-relaxed text-gray-400 mt-1">
                          {item.snippet}
                        </p>
                      )}
                      {item.date && (
                        <p className="text-xs text-gray-500 mt-1">{item.date}</p>
                      )}
                    </div>
                  </li>
                ))}
                <li>
                  <button
                    onClick={handleThoughtsClick}
                    className="text-sm font-medium mt-4 bg-transparent border-none text-inherit cursor-pointer p-0 outline-none hover:underline transition-all duration-200"
                  >
                    Browse all articles →
                  </button>
                </li>
              </ul>
            )}
          </div>

          {/* Right Column: Bio and CTA boxes */}
          <div className="col-span-1 flex flex-col space-y-10">
            <p className="text-lg leading-relaxed font-normal">
              I'm a Ghanaian he/him living in Accra. I like to think of myself
              as a builder of worlds, <span className="s">worlds</span> Software
              is the medium through which I express myself.
            </p>

            {/* CTA 1: Learn React/Flutter */}
            <button
              onClick={handleLearnClick}
              className="block p-4 bg-gray-800 rounded-md text-inherit no-hover card-hover hover:bg-gray-700"
            >
              <p className="text-base font-normal text-gray-300">
                Learn React/Flutter
              </p>
              <p className="text-lg font-medium text-yellow-300 flex items-center justify-between mt-1">
                Register Now!
                <span className="ml-2 transition-transform duration-200 group-hover:translate-x-1">→</span>
              </p>
            </button>

            {/* CTA 2: Buy a nice poster */}
            <button
              onClick={handleShopClick}
              className="block p-4 bg-gray-800 rounded-md text-inherit no-hover card-hover hover:bg-gray-700"
            >
              <p className="text-lg font-medium text-yellow-300 flex items-center justify-between">
                Buy a nice poster
                <span className="ml-2 transition-transform duration-200 group-hover:translate-x-1">→</span>
              </p>
            </button>
          </div>
        </section>
      </main>
    </div>
    </>
  );
};

export default Home;
