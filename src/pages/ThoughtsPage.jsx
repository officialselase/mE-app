import React, { useState, useEffect } from "react";

const ThoughtsPage = ({ setCurrentPage, currentPage }) => {
  useEffect(() => {
    if (currentPage === "thoughts") {
      window.scrollTo(0, 0);
    }
  }, [currentPage]);

  // Blog post data
  const blogPosts = [
    {
      id: 1,
      title: "RxCare",
      excerpt:
        "Neonatal seizures are a silent threat in places like Ghana, often missed due to a lack of diagnostic tools...",
      content: "Full write-up about RxCare... (your long text here)",
      date: "October 14, 2024",
      image: "https://source.unsplash.com/random/400x200/?healthcare",
    },
    {
      id: 2,
      title: "OSINT: Capabilities and Applications",
      excerpt:
        "OSINT leverages publicly accessible data for insights across intelligence, law enforcement, and more...",
      content: "Full write-up about OSINT...",
      date: "August 7, 2017",
      image: "https://source.unsplash.com/random/400x200/?intelligence",
    },
    {
      id: 3,
      title: "Adapting to an AI-Integrated Future",
      excerpt:
        "AI is reshaping our world, demanding new skills like prompting to stay relevant in a tech-driven future...",
      content: "Full write-up about AI...",
      date: "March 23, 2013",
      image: "https://source.unsplash.com/random/400x200/?technology",
    },
    {
      id: 4,
      title: "A Song of Ice and Fire",
      excerpt:
        "George R.R. Martin's saga deconstructs power and morality, with Robb Stark's arc as a tragic lesson...",
      content: "Full write-up about ASOIAF...",
      date: "May 31, 2015",
      image: "https://source.unsplash.com/random/400x200/?fantasy",
    },
  ];

  // Featured (pick a few)
  const featuredPosts = [blogPosts[1], blogPosts[2], blogPosts[3]];

  // Restored original gallery images
  const galleryImages = [
    "public/images/Carespot back.png",
    "public/images/Carespot logo - IG --1.jpg",
    "public/images/Carespot logo - IG -.jpg",
    "public/images/Carespot logo - IG.jpg",
    "public/images/Carespot logo.png",
    "public/images/coding class-1.jpg",
    "public/images/coding class-2.jpg",
    "public/images/Mr ICT uni(2)(1).jpg",
  ];

  const [selectedPost, setSelectedPost] = useState(null);

  return (
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
            {blogPosts.map((post) => (
              <div
                key={post.id}
                className="bg-gray-50 border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer"
                onClick={() => setSelectedPost(post)}
              >
                <div className="w-full h-48">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-semibold mb-2">{post.title}</h2>
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  <p className="text-sm text-gray-400">{post.date}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Featured Sidebar */}
          <aside className="space-y-6">
            <h3 className="text-xl font-bold border-b border-gray-200 pb-2">
              Featured
            </h3>
            {featuredPosts.map((post) => (
              <div
                key={post.id}
                className="border-b border-gray-200 pb-4 last:border-0 cursor-pointer"
                onClick={() => setSelectedPost(post)}
              >
                <h4 className="text-lg font-medium">{post.title}</h4>
                <p className="text-sm text-gray-500">{post.date}</p>
              </div>
            ))}
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
              <p className="text-gray-700 leading-relaxed">
                {selectedPost.content}
              </p>
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
            <img
              src="public/under-construction.gif"
              alt="Under Construction GIF"
              className="ml-2 w-6 h-6 inline-block"
            />
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {galleryImages.map((src, index) => (
              <div key={index} className="overflow-hidden rounded-lg shadow-sm">
                <img
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
  );
};

export default ThoughtsPage;
