import React, { useState, useEffect } from "react";

export const workSummary = `
The Work page presents Selase’s professional projects and collaborations.
It shows his technical engineering side, with details of coding,
design, and innovation contributions. Visitors see the scope of his
real-world impact through this page.
`;

const Work = ({ setCurrentPage, currentPage, cartCount }) => {
  const workExperience = [
    {
      title: "Senior Developer",
      company: "Fiberwave Ltd",
      duration: "February 2025 – Present",
      description:
        "As a Senior Developer at Fiberwave Ltd, I am responsible for leading the development of scalable web applications, designing and implementing robust backend services, and mentoring junior developers. My role involves collaborating with cross-functional teams to define project requirements, conducting code reviews and ensuring best practices, and troubleshooting complex technical issues.",
    },
    {
      title: "Co-Founder/COO",
      company: "Weekend Chef",
      duration: "December 2024",
      description:
        "At Weekend Chef, I've been instrumental in shaping the user experience and business model. My responsibilities included UI/UX design using Figma to prototype mobile app flows, prioritizing simplicity for ordering and chef management. I also designed and developed the web landing page using HTML, CSS, JavaScript, and React, creating an engaging platform introduction. Key contributions also involved developing marketing strategies, designing the business model, implementing dynamic pricing logic, and optimizing chef, delivery, and customer workflows.",
    },
    {
      title: "Production Officer",
      company: "KATECHNOLOGIES",
      duration: "June 2024 – September 2024",
      description:
        "During my time at KATECHNOLOGIES, I performed complete knockdown (CKD) and semi-knockdown (SKD) assembly of laptops and tablets, ensuring precision and quality control. I conducted rework on defective units to meet performance standards and managed the activation and initial setup of devices for end-users. Additionally, I provided general IT support, troubleshooting hardware and software issues to maintain smooth operations.",
    },
    {
      title: "Co-Founder/CEO",
      company: "SamaLTE",
      duration: "September 2022 – Present",
      description:
        "As a Full Stack Developer at SamaLTE, I've led both front-end and back-end web application development using HTML, CSS, JavaScript, and the Django framework. A significant part of my role involves spearheading game development, overseeing scriptwriting and story development using Unity. I've successfully managed end-to-end project lifecycles, ensuring timely delivery, resource optimization, and strategic alignment. My work also includes rigorous software application testing to identify and report bugs, collaborating closely with design teams to ensure quality standards are met, and using Figma for mobile app flow prototyping.",
    },
    {
      title: "Service Desk Technician",
      company: "Ghana Revenue Authority (GRA)",
      duration: "August 2019 – August 2020",
      description:
        "At GRA, I provided frontline support to staff and clients, addressing technical issues, inquiries, and complaints. I utilized the 'Manage Engine' app to log and track user-reported incidents and requests, and managed password resets for staff using the 'Trips' app, adhering to security protocols. I maintained high customer service standards through clear communication regarding issue resolutions and ticket status. My role also involved using the 'Trips' app to assign new businesses to tax offices and collaborating with third-party vendors like GCNET for support and issue resolution across various applications.",
    },
    {
      title: "Teaching Assistant",
      company: "St Francis College of Education",
      duration: "May 2018 – August 2018",
      description:
        "As a Teaching Assistant, I conducted IT practical tutorials in the lab, providing hands-on guidance and assistance to students. I supported the assessment officer in filling out student assessments and uploading them to the UCC portal, ensuring accurate and timely submissions. I also conducted invigilation during exams, maintaining a secure and fair testing environment, and supported the head of IT with diverse tasks including new initiative implementation, technical assistance, and general troubleshooting.",
    },
  ];

  useEffect(() => {
    if (currentPage === "work") {
      window.scrollTo(0, 0);
    }
  }, [currentPage]);

  const [selectedWork, setSelectedWork] = useState(null);

  return (
    <div
      className="flex flex-col min-h-screen bg-amber-800 text-gray-100"
      style={{ position: "relative", overflow: "hidden" }}
    >
      {/* Case Study Grid */}
      <section className="py-12 px-4 sm:px-6 md:px-8 flex-grow">
        <div className="w-full max-w-screen-xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {workExperience.map((work, index) => (
            <div
              key={index}
              className="bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedWork(work)}
            >
              {/* Hero Image Placeholder */}
              <div
                className="h-48 bg-cover bg-center"
                style={{
                  backgroundImage: `url(https://source.unsplash.com/random/400x300/?${work.company
                    .toLowerCase()
                    .replace(" ", "")})`,
                }}
              >
                <div className="h-full bg-black bg-opacity-40 flex items-center justify-center">
                  <h3 className="text-3xl font-bold text-yellow-300 text-center px-4">
                    {work.title}
                  </h3>
                </div>
              </div>
              <div className="p-4">
                <p className="text-xl text-gray-400">
                  {work.company}, {work.duration}
                </p>
                <p className="text-lg text-gray-500 mt-2 line-clamp-3">
                  {work.description}
                </p>
              </div>
            </div>
          ))}
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
              {selectedWork.title}
            </h2>
            <p className="text-xl text-gray-400 mb-2">
              {selectedWork.company}, {selectedWork.duration}
            </p>
            <p className="text-2xl text-gray-300 leading-relaxed">
              {selectedWork.description}
            </p>
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
  );
};

export default Work;
