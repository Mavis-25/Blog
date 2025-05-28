
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/Layout';
import { useData } from '@/context/DataContext';
import QRCodeGenerator from '@/components/QRCodeGenerator';

const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { getProject } = useData();
  const navigate = useNavigate();
  
  const project = getProject(id ?? '');
  
  if (!project) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Project not found</h1>
          <p className="mb-6">The project you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/projects')}>Back to Projects</Button>
        </div>
      </Layout>
    );
  }
  
  const formattedDate = new Date(project.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  const projectUrl = window.location.href;

  return (
    <Layout>
      <div className="container py-8">
        <article className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{project.title}</h1>
            <p className="text-muted-foreground mb-6">Added on {formattedDate}</p>
            
            {project.image && (
              <img
                src={project.image}
                alt={project.title}
                className="w-full h-auto aspect-video object-cover rounded-lg mb-6"
              />
            )}
            
            <div className="flex flex-wrap gap-2 mb-6">
              {project.technologies.map((tech) => (
                <Badge key={tech} variant="outline">
                  {tech}
                </Badge>
              ))}
            </div>
          </header>
          
          <div className="prose max-w-none mb-8">
            <h2 className="text-2xl font-semibold mb-4">About this project</h2>
            <p className="mb-4">{project.description}</p>
          </div>
          
          {project.link && (
            <div className="mb-8">
              <Button asChild>
                <a href={project.link} target="_blank" rel="noopener noreferrer">
                  View Project
                </a>
              </Button>
            </div>
          )}
          
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Share this project</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <QRCodeGenerator 
                  value={projectUrl} 
                  title="Share This Project"
                  description="Scan to view this project"
                />
              </div>
            </div>
          </div>
        </article>
      </div>
    </Layout>
  );
};

export default ProjectDetail;
