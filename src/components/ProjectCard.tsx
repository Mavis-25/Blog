
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Project } from '@/models/types';
import { Link } from 'react-router-dom';

interface ProjectCardProps {
  project: Project;
}

const ProjectCard = ({ project }: ProjectCardProps) => {
  const formattedDate = new Date(project.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
  });

  return (
    <Card className="firestack-card overflow-hidden h-full flex flex-col">
      {project.image && (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={project.image}
            alt={project.title}
            className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}
      <CardHeader className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xl font-semibold">{project.title}</h3>
          <span className="text-xs text-muted-foreground">{formattedDate}</span>
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0 flex-grow">
        <p className="text-muted-foreground mb-4 line-clamp-3">{project.description}</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {project.technologies.map((tech) => (
            <Badge key={tech} variant="outline" className="firestack-badge px-2 py-0.5">
              {tech}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-4 md:p-6 border-t bg-gray-50 flex justify-between">
        <Button asChild size="sm" variant="outline" className="border-firestack-primary text-firestack-primary hover:bg-firestack-muted">
          <Link to={`/projects/${project.id}`}>View Details</Link>
        </Button>
        {project.link && (
          <Button asChild size="sm" className="bg-firestack-primary hover:bg-firestack-accent text-white">
            <a href={project.link} target="_blank" rel="noopener noreferrer">
              View Project
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
