import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, PackagingDesign, User } from '../types.js';

interface ProjectContextType {
  projects: Project[];
  activeProject: Project | null;
  activeDesign: PackagingDesign | null;
  currentUser: User | null;
  isLoading: boolean;
  demoStep: number; // 0 = inactive, 1..9 = WOW demo steps
  setDemoStep: (step: number) => void;
  setActiveProject: (project: Project) => void;
  setActiveDesign: (design: PackagingDesign) => void;
  refreshProjects: () => Promise<void>;
  createProject: (data: any) => Promise<Project>;
  deleteProject: (id: string) => Promise<boolean>;
  duplicateProject: (id: string) => Promise<Project | null>;
  launchDemo: () => Promise<void>;
  updateActiveDesignMetrics: (updatedDesign: PackagingDesign) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProject, setActiveProjectState] = useState<Project | null>(null);
  const [activeDesign, setActiveDesignState] = useState<PackagingDesign | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: 'usr_demo_1',
    email: 'demo@ecopack.io',
    name: 'Alex Morgan',
    role: 'Chief Packaging Architect',
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [demoStep, setDemoStep] = useState<number>(0);

  const refreshProjects = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data: Project[] = await res.json();
        setProjects(data);

        // Keep or select active project
        if (!activeProject && data.length > 0) {
          const smartBottle = data.find(p => p.id === 'proj_smart_bottle') || data[0];
          setActiveProjectState(smartBottle);
          if (smartBottle.designs && smartBottle.designs.length > 0) {
            const defaultDesign = smartBottle.designs.find(d => d.name.includes('Hybrid')) || smartBottle.designs[0];
            setActiveDesignState(defaultDesign);
          }
        } else if (activeProject) {
          const updatedActive = data.find(p => p.id === activeProject.id);
          if (updatedActive) {
            setActiveProjectState(updatedActive);
            if (activeDesign) {
              const matchedDesign = updatedActive.designs.find(d => d.id === activeDesign.id);
              if (matchedDesign) setActiveDesignState(matchedDesign);
            }
          }
        }
      }
    } catch (err) {
      console.error('Failed to load projects from server:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshProjects();
  }, []);

  const setActiveProject = (project: Project) => {
    setActiveProjectState(project);
    if (project.designs && project.designs.length > 0) {
      const preferred = project.designs.find(d => d.id === project.selected_design_id) || project.designs[0];
      setActiveDesignState(preferred);
    }
  };

  const setActiveDesign = (design: PackagingDesign) => {
    setActiveDesignState(design);
  };

  const updateActiveDesignMetrics = (updatedDesign: PackagingDesign) => {
    setActiveDesignState(updatedDesign);
    if (activeProject) {
      const updatedDesigns = activeProject.designs.map(d => (d.id === updatedDesign.id ? updatedDesign : d));
      const updatedProj: Project = {
        ...activeProject,
        designs: updatedDesigns,
        updated_at: new Date().toISOString(),
      };
      setActiveProjectState(updatedProj);
      setProjects(prev => prev.map(p => (p.id === updatedProj.id ? updatedProj : p)));
    }
  };

  const createProject = async (data: any): Promise<Project> => {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create project');
    const newProject: Project = await res.json();
    setProjects(prev => [newProject, ...prev]);
    setActiveProject(newProject);
    return newProject;
  };

  const deleteProject = async (id: string): Promise<boolean> => {
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setProjects(prev => prev.filter(p => p.id !== id));
      if (activeProject?.id === id) {
        const remaining = projects.filter(p => p.id !== id);
        if (remaining.length > 0) setActiveProject(remaining[0]);
        else {
          setActiveProjectState(null);
          setActiveDesignState(null);
        }
      }
      return true;
    }
    return false;
  };

  const duplicateProject = async (id: string): Promise<Project | null> => {
    const res = await fetch(`/api/projects/${id}/duplicate`, { method: 'POST' });
    if (res.ok) {
      const dup: Project = await res.json();
      setProjects(prev => [dup, ...prev]);
      setActiveProject(dup);
      return dup;
    }
    return null;
  };

  const launchDemo = async () => {
    try {
      setIsLoading(true);
      await fetch('/api/demo/reset', { method: 'POST' });
      await refreshProjects();
      setDemoStep(1);
    } catch (err) {
      console.error('Failed to launch demo:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProject,
        activeDesign,
        currentUser,
        isLoading,
        demoStep,
        setDemoStep,
        setActiveProject,
        setActiveDesign,
        refreshProjects,
        createProject,
        deleteProject,
        duplicateProject,
        launchDemo,
        updateActiveDesignMetrics,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error('useProject must be used within a ProjectProvider');
  return context;
};
