// src/pages/ProjectsRepo.jsx
import React, { useState } from "react";

const categories = ["Project", "Exercise", "Test", "GitHub Repo"];

const ProjectsRepo = () => {
  const [submissions, setSubmissions] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    link: "",
    category: "Project",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.link) return;

    setSubmissions([...submissions, { ...formData, id: Date.now() }]);
    setFormData({ name: "", link: "", category: "Project" });
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center p-6">
      <h1 className="text-4xl font-bold mb-6">📂 Student Project Repository</h1>

      {/* Submission Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-xl mb-10"
      >
        <h2 className="text-2xl font-semibold mb-4">Submit Your Work</h2>

        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
          className="w-full p-2 mb-3 rounded bg-gray-900 text-white border border-gray-600"
        />

        <input
          type="url"
          name="link"
          placeholder="Link to project/exercise/test/repo"
          value={formData.link}
          onChange={handleChange}
          className="w-full p-2 mb-3 rounded bg-gray-900 text-white border border-gray-600"
        />

        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full p-2 mb-4 rounded bg-gray-900 text-white border border-gray-600"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <button
          type="submit"
          className="px-6 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-500 transition"
        >
          Submit
        </button>
      </form>

      {/* Display Submissions */}
      <div className="w-full max-w-3xl">
        {categories.map((cat) => (
          <div key={cat} className="mb-8">
            <h3 className="text-2xl font-semibold mb-3">{cat}s</h3>
            <ul className="space-y-2">
              {submissions
                .filter((s) => s.category === cat)
                .map((s) => (
                  <li
                    key={s.id}
                    className="bg-gray-800 p-4 rounded-lg shadow flex justify-between items-center"
                  >
                    <span>
                      <strong>{s.name}</strong> →{" "}
                      <a
                        href={s.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-400 hover:underline"
                      >
                        {s.link}
                      </a>
                    </span>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectsRepo;
