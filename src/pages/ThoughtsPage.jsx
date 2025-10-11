import React, { useState, useEffect } from "react";
import useThoughts from "../hooks/useThoughts";
import SkeletonLoader from "../components/SkeletonLoader";
import OptimizedImage from "../components/OptimizedImage";
import MetaTags from "../components/MetaTags";
import StructuredData, { createBlogPostSchema } from "../components/StructuredData";

export const thoughtsSummary = `
The Thoughts page is Selase's writing space. It features essays,
reflections, and commentary on technology, creativity, fair pay for
artists, and his personal journey. It gives visitors a window into
his values and perspectives.
`;

const ThoughtsPage = ({ setCurrentPage, currentPage }) => {
  const [page, setPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState(null);

  // Fetch thoughts with pagination
  const { thoughts, loading, error, refetch } = useThoughts({ page, limit: 10 });

  // Featured posts (first 3 thoughts)
  const featuredPosts = thoughts.slice(0, 3);

  useEffect(() => {
    if (currentPage === "thoughts") {
      window.scrollTo(0, 0);
    }
  }, [currentPage]);

  const handleNextPage = () => {
    setPage((prev) => prev + 1);
    window.scrollTo(0, 0);
  };

  const handlePrevPage = () => {
    setPage((prev) => Math.max(1, prev - 1));
    window.scrollTo(0, 0);
  };

  // Restored original gallery images
  const galleryImages = [
    "/images/Carespot back.png",
    "/images/Carespot logo - IG --1.jpg",
    "/images/Carespot logo - IG -.jpg",
    "/images/Carespot logo - IG.jpg",
    "/images/Carespot logo.png",
    "/images/coding class-1.jpg",
    "/images/coding class-2.jpg",
    "/images/Mr ICT uni(2)(1).jpg",
  ];

  return (
    <>
      <MetaTags
        title="Thoughts - Ransford Antwi"
        description="Read Ransford Antwi's thoughts and insights on software development, technology, creativity, and professional growth. Explore essays and reflections from an experienced developer."
        keywords="thoughts, blog, essays, software development, technology insights, programming, Ransford Antwi"
        url={`${window.location.origin}/thoughts`}
      />
      {selectedPost && (
        <StructuredData data={createBlogPostSchema(selectedPost)} />
      )}
      <div className="flex flex-col min-h-full bg-white text-gray-900 font-sans antialiased">
      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold mb-4">Welcome to my Mind</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the things i find truly intriguing, enough that i write
            about them. From groundbreaking projects to unique thoughts, i take
            pride in sharing ideas that inspire.
          </p>
        </div>

        {/* Blog layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Blog Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Loading State */}
            {loading && thoughts.length === 0 && (
              <SkeletonLoader type="card" count={3} />
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={refetch}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors duration-200"
                >
                  Retry
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && thoughts.length === 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
                <h2 className="text-2xl font-semibold mb-2">No Thoughts Yet</h2>
                <p className="text-gray-600">Check back soon for new articles!</p>
              </div>
            )}

            {/* Thoughts List */}
            {!loading && !error && thoughts.length > 0 && (
              <>
                {thoughts.map((post) => (
                  <div
                    key={post.id}
                    className="bg-gray-50 border border-gray-200 rounded-xl shadow-sm thought-card cursor-pointer"
                    onClick={() => setSelectedPost(post)}
                  >
                    {post.images && post.images.length > 0 && (
                      <div className="w-full h-48">
                        <OptimizedImage
                          src={post.images[0]}
                          alt={post.title}
                          className="w-full h-full object-cover rounded-t-xl"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h2 className="text-2xl font-semibold mb-2">{post.title}</h2>
                      <p className="text-gray-600 mb-4">{post.snippet}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-400">
                          {new Date(post.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex gap-2">
                            {post.tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Pagination Controls */}
                <div className="flex justify-center items-center gap-4 mt-8">
                  <button
                    onClick={handlePrevPage}
                    disabled={page === 1}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-gray-600">Page {page}</span>
                  <button
                    onClick={handleNextPage}
                    disabled={thoughts.length < 10}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Featured Sidebar */}
          <aside className="space-y-6">
            <h3 className="text-xl font-bold border-b border-gray-200 pb-2">
              Featured
            </h3>
            {loading && <SkeletonLoader type="list" count={3} />}
            {!loading && featuredPosts.length > 0 && (
              <>
                {featuredPosts.map((post) => (
                  <div
                    key={post.id}
                    className="border-b border-gray-200 pb-4 last:border-0 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors duration-200"
                    onClick={() => setSelectedPost(post)}
                  >
                    <h4 className="text-lg font-medium">{post.title}</h4>
                    <p className="text-sm text-gray-500">
                      {new Date(post.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                ))}
              </>
            )}
          </aside>
        </div>

        {/* Modal for Blog Details */}
        {selectedPost && (
          <div
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40"
            onClick={() => setSelectedPost(null)}
          >
            <div
              className="bg-white p-8 rounded-xl shadow-lg max-w-3xl w-full mx-4 overflow-y-auto max-h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-3xl font-bold mb-4">{selectedPost.title}</h2>
              <p className="text-sm text-gray-500 mb-6">
                {new Date(selectedPost.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {selectedPost.content}
              </div>
              {selectedPost.tags && selectedPost.tags.length > 0 && (
                <div className="flex gap-2 mt-6">
                  {selectedPost.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <button
                className="mt-6 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200"
                onClick={() => setSelectedPost(null)}
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Gallery Section */}
        <section className="mt-20 pt-12 border-t border-gray-200">
          <h2 className="text-3xl font-bold mb-6 text-gray-900 text-center">
            Gallery
          </h2>
          <p className="text-base text-gray-500 mb-8 flex justify-center items-center">
            🚧 Under construction!
            <OptimizedImage
              src="/under-construction.gif"
              alt="Under Construction GIF"
              className="ml-2 w-6 h-6 inline-block"
              lazy={false}
            />
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {galleryImages.map((src, index) => (
              <div key={index} className="overflow-hidden rounded-lg shadow-sm">
                <OptimizedImage
                  src={src}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
    </>
  );
};

export default ThoughtsPage;
