// src/components/PageFooter.jsx
import React from "react";

const PageFooter = () => {
  return (
    <footer className="w-full max-w-screen-xl mx-auto px-4 sm:px-6 md:px-8 mt-16 pt-8 border-t border-gray-300">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-lg">
        {/* Column 1: Developer/Teacher */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Developer/Teacher</h2>
          <p>
            Things I enjoy developing: Web apps, Mobile apps.
            <br />
            Development Tools: Pen & Paper, Flutter, FlutterFlow, VScode,
            PyCharm, Android Studio, Git, Docker, Vite.
          </p>
          <p className="mt-4">
            Languages I Speak: Html, CSS, JavaScript, Python, Node.js(JavaScript
            runtime), Dart, SQL.
          </p>
          <p className="mt-4">
            Frameworks & Libraries: React, Django, Flutter.
          </p>
          <p className="mt-4">
            I am a believer in collaborative exchange of ideas, driven by deep
            passion for teaching. Sharing knowledge and best practices
            strengthens our collective capabilities. It's about building
            supportive communities where everyone feels empowered to learn and
            contribute. I am committed to helping the next generation of tech
            talent.
          </p>
        </div>

        {/* Column 2: Programming */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Programming</h2>
          <p>
            There are so many great programming languages. It would be hard to
            pick a favorite. Really, the craft of programming is 99% “the fuzzy
            parts”—concepts, data structures, best practices, people, culture
            and many other aspects that are agnostic to a particular programming
            language.
          </p>
          <p className="mt-4">
            Python – a language I genuinely find 'cool' for its incredible
            versatility. It's not just about writing clean, readable code; it's
            about the sheer breadth of what you can achieve. From architecting
            robust backends with Django that power dynamic applications, to
            delving into the fascinating world of AI and machine learning,
            Python acts as a powerful backbone. The ability to seamlessly
            connect a React frontend or a Flutter mobile app to a Python-driven
            backend creates a truly full-stack experience that I find incredibly
            rewarding. It’s this synergy between powerful frontend frameworks
            and robust backend logic that allows me to tackle diverse challenges
            and contribute meaningfully to innovative projects.
          </p>
        </div>

        {/* Column 3: Continuation of Programming */}
        <div>
          <p>
            Flutter's ability to build beautiful, natively compiled applications
            for mobile, web, and desktop from a single codebase is incredibly
            exciting, allowing for rapid iteration and stunning visuals. React's
            component-based architecture and efficient rendering make it a joy
            to build dynamic and responsive web interfaces. It makes both
            intuitive to work with.
          </p>
          <p className="mt-4">
            I am always amazed by the sheer power and elegance of Flutter and
            React. There's a unique satisfaction in seeing an idea come to life,
            whether it's through Flutter's pixel-perfect UI and blazing-fast hot
            reload, enabling me to iterate on mobile and cross-platform designs
            with incredible speed, or React's declarative approach, which makes
            building complex, interactive web experiences feel intuitive and
            manageable. The vast ecosystems surrounding both of these
            technologies mean there's always a solution or a library to explore,
            pushing the boundaries of what's possible.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default PageFooter;
