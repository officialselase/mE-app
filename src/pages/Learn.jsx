// src/pages/Learn.jsx
import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import VideoPlayer from "../components/VideoPlayer"; // ✅ Your component
import "../styles/GamePlayground.css";

const Learn = ({ setCurrentPage, currentPage }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    studentName: "",
    parentContact: "",
    parentEmail: "",
    age: "",
    classType: "",
    classOption: "",
  });
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleChange = useCallback((e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    setIsPopupOpen(true);

    setTimeout(() => setIsPopupOpen(false), 3000);

    setFormData({
      studentName: "",
      parentContact: "",
      parentEmail: "",
      age: "",
      classType: "",
      classOption: "",
    });
  }, []);

  const sections = useMemo(
    () => [
      // Hero
      {
        id: "hero",
        content: (
          <section className="bg-white py-20 text-center">
            <div className="max-w-4xl mx-auto px-6">
              <img
                src="https://cdn.dribbble.com/userupload/20477400/file/original-c84e51367767f2a7c485a43d820bde27.gif"
                alt="Learning Animation"
                className="w-full max-h-96 object-contain mx-auto mb-10"
              />
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                Learn, Grow, Build Your Future
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Coding is more than just syntax. It’s creativity, problem
                solving, and building ideas that matter. Start your journey
                today.
              </p>
            </div>
          </section>
        ),
      },
      // Mission
      {
        id: "mission",
        content: (
          <section className="bg-gray-50 py-20">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 px-6 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Our Mission
                </h2>
                <p className="text-lg text-gray-700 leading-relaxed">
                  We’re on a mission to empower the next generation of tech
                  leaders. By providing accessible, engaging coding education,
                  we help students unlock potential and create meaningful
                  digital futures.
                </p>
              </div>
              <img
                src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800"
                alt="Students coding"
                className="rounded-lg shadow-md"
              />
            </div>
          </section>
        ),
      },
      // Why Code
      {
        id: "why-code",
        content: (
          <section className="bg-white py-20">
            <div className="max-w-5xl mx-auto px-6 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Learn to Code?
              </h2>
              <p className="text-lg text-gray-700 max-w-3xl mx-auto leading-relaxed">
                Coding unlocks creativity, critical thinking, and endless career
                opportunities. From building apps to designing games, coding
                gives you the power to shape the digital world around you.
              </p>
            </div>
          </section>
        ),
      },
      // Video
      {
        id: "video-demo",
        content: (
          <section className="bg-gray-50 py-20">
            <div className="max-w-4xl mx-auto text-center px-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                See Coding in Action
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Watch our interactive platform in action. Learn by doing, not
                just watching.
              </p>
              <VideoPlayer videoUrl="https://youtu.be/TBdZsbNG8Z0?si=C0XGbGCjqFmPy8Js" />
            </div>
          </section>
        ),
      },
      // Form
      {
        id: "form",
        content: (
          <section className="bg-blue-600 py-20 text-white text-center">
            <div className="max-w-3xl mx-auto px-6">
              <h2 className="text-3xl font-bold mb-6">
                Ready to Join Our Coding Community?
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleChange}
                  placeholder="Your Name"
                  className="w-full p-3 rounded text-black"
                  required
                />
                <input
                  name="parentEmail"
                  value={formData.parentEmail}
                  onChange={handleChange}
                  placeholder="Your Email"
                  type="email"
                  className="w-full p-3 rounded text-black"
                  required
                />
                <select
                  name="classType"
                  value={formData.classType}
                  onChange={handleChange}
                  className="w-full p-3 rounded text-black"
                  required
                >
                  <option value="">Select Course</option>
                  <option value="web">Web Development</option>
                  <option value="react">React Frontend</option>
                  <option value="django">Django Backend</option>
                  <option value="flutter">Flutter Mobile</option>
                  <option value="scratch programming">
                    Scratch programming for kids
                  </option>
                </select>
                <button
                  type="submit"
                  className="bg-white text-blue-600 font-semibold py-3 px-6 rounded shadow hover:bg-gray-100 transition"
                >
                  Join Now
                </button>
              </form>

              {/* ✅ Your contact details */}
              <div className="mt-10 bg-white text-blue-600 rounded-lg shadow p-6">
                <h3 className="text-xl font-bold mb-2">
                  For now please Reach Out Directly let us discuss what best
                  suits you or your child.
                </h3>
                <p className="text-gray-800">
                  Call me <strong>Selase K. Agbai</strong>, Senior Developer at
                  Fiberwave Ghana LTD <br />
                  📞{" "}
                  <a href="tel:+233555964195" className="underline">
                    +233 55 596 4195
                  </a>{" "}
                  <br />
                  💬{" "}
                  <a
                    href="https://wa.me/233555964195"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    WhatsApp me
                  </a>{" "}
                  to join our ever-growing community.
                </p>
              </div>

              {isPopupOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                  <div className="bg-white p-6 rounded-lg shadow-lg max-w-md text-center">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                      Thank You!
                    </h3>
                    <p className="text-gray-700">
                      Your registration has been received. We’ll contact you
                      soon!
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        ),
      },
      // Projects CTA
      {
        id: "projects-cta",
        content: (
          <section className="bg-white py-20 text-center">
            <div className="max-w-5xl mx-auto px-6">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Showcase Your Work
              </h2>
              <p className="text-lg text-gray-700 mb-6">
                Upload links to your projects, exercises, tests, and GitHub
                repositories. Share your progress and get feedback.
              </p>
              <button
                onClick={() => navigate("/projects-repo")}
                className="px-6 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-full shadow-lg hover:bg-indigo-500 transition-transform duration-200"
              >
                🚀 Go to Student Repository →
              </button>
            </div>
          </section>
        ),
      },
    ],
    [handleSubmit, handleChange, navigate]
  );

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-900 font-sans antialiased">
      <main className="flex-grow">
        {sections.map((section) => (
          <div key={section.id}>{section.content}</div>
        ))}
      </main>
    </div>
  );
};

export default Learn;
