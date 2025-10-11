import React, { memo } from 'react';
import OptimizedImage from './OptimizedImage';

/**
 * Memoized ProjectCard component for performance optimization
 */
const ProjectCard = memo(({ project, onClick, className = '' }) => {
  return (
    <div
      className={`block text-inherit no-hover relative project-card cursor-pointer p-3 rounded-lg text-left ${className}`}
      onClick={onClick}
    >
      {project.images && project.images.length > 0 && (
        <div className="w-full h-48 mb-4">
          <OptimizedImage
            src={project.images[0]}
            alt={project.title}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      )}
      
      <h3 className="text-xl font-semibold mb-2 text-white">
        {project.title}
      </h3>
      
      <p className="text-gray-300 mb-4 line-clamp-3">
        {project.description}
      </p>
      
      {project.technologies && project.technologies.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {project.technologies.map((tech, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full"
            >
              {tech}
            </span>
          ))}
        </div>
      )}
      
      <div className="flex gap-2">
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            GitHub
          </a>
        )}
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            Live Demo
          </a>
        )}
      </div>
    </div>
  );
});

ProjectCard.displayName = 'ProjectCard';

export default ProjectCard;