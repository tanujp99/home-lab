import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  GitBranch,
  Layers,
  Link2,
  Server,
  Settings,
  FileText,
  AlertTriangle,
  Database,
  Rocket,
  PlaneTakeoff,
  Layout,
  ShieldCheck,
  XCircle
} from 'lucide-react';

interface SidebarProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export default function Sidebar({ mobileMenuOpen, setMobileMenuOpen }: SidebarProps) {
  const [location] = useLocation();
  
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const sidebarClass = cn(
    "bg-card border-r border-border overflow-y-auto",
    mobileMenuOpen 
      ? "fixed inset-0 z-50 w-64 block" 
      : "hidden md:block md:w-64"
  );

  return (
    <>
      {/* Backdrop for mobile menu */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      <aside className={sidebarClass}>
        {/* Mobile close button */}
        {mobileMenuOpen && (
          <div className="absolute top-4 right-4 md:hidden">
            <button 
              onClick={closeMobileMenu}
              className="text-muted-foreground hover:text-foreground"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>
        )}

        <div className="px-4 py-5 flex items-center border-b border-border">
          <div className="flex items-center space-x-2">
            <div className="bg-primary rounded-md p-1">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                className="h-5 w-5 text-white"
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M12 2 2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-xl font-semibold">KubeOrchestra</span>
          </div>
        </div>
        
        <div className="py-4">
          <div className="px-4 py-2 text-xs uppercase tracking-wider text-muted-foreground">Overview</div>
          <NavItem 
            href="/" 
            icon={<BarChart3 className="mr-3 h-5 w-5" />} 
            label="Dashboard" 
            isActive={location === '/'} 
            onClick={closeMobileMenu}
          />
          <NavItem 
            href="/clusters/1" 
            icon={<Layout className="mr-3 h-5 w-5" />} 
            label="Cluster Overview" 
            isActive={location.startsWith('/clusters/')} 
            onClick={closeMobileMenu}
          />
          <NavItem 
            href="/topology/1" 
            icon={<GitBranch className="mr-3 h-5 w-5" />} 
            label="Topology" 
            isActive={location.startsWith('/topology/')} 
            onClick={closeMobileMenu}
          />
          
          <div className="px-4 py-2 mt-3 text-xs uppercase tracking-wider text-muted-foreground">Resources</div>
          <NavItem 
            href="/nodes/1" 
            icon={<Server className="mr-3 h-5 w-5" />} 
            label="Nodes" 
            isActive={location.startsWith('/nodes/')} 
            onClick={closeMobileMenu}
          />
          <NavItem 
            href="#" 
            icon={<Layers className="mr-3 h-5 w-5" />} 
            label="Pods" 
            isActive={false} 
            onClick={closeMobileMenu}
          />
          <NavItem 
            href="#" 
            icon={<Link2 className="mr-3 h-5 w-5" />} 
            label="Services" 
            isActive={false} 
            onClick={closeMobileMenu}
          />
          <NavItem 
            href="#" 
            icon={<Database className="mr-3 h-5 w-5" />} 
            label="Volumes" 
            isActive={false} 
            onClick={closeMobileMenu}
          />
          
          <div className="px-4 py-2 mt-3 text-xs uppercase tracking-wider text-muted-foreground">Deployments</div>
          <NavItem 
            href="#" 
            icon={<Rocket className="mr-3 h-5 w-5" />} 
            label="Applications" 
            isActive={false} 
            onClick={closeMobileMenu}
          />
          <NavItem 
            href="#" 
            icon={<PlaneTakeoff className="mr-3 h-5 w-5" />} 
            label="Deployments" 
            isActive={false} 
            onClick={closeMobileMenu}
          />
          <NavItem 
            href="#" 
            icon={<Settings className="mr-3 h-5 w-5" />} 
            label="ConfigMaps" 
            isActive={false} 
            onClick={closeMobileMenu}
          />
          
          <div className="px-4 py-2 mt-3 text-xs uppercase tracking-wider text-muted-foreground">Observability</div>
          <NavItem 
            href="#" 
            icon={<BarChart3 className="mr-3 h-5 w-5" />} 
            label="Metrics" 
            isActive={false} 
            onClick={closeMobileMenu}
          />
          <NavItem 
            href="#" 
            icon={<FileText className="mr-3 h-5 w-5" />} 
            label="Logs" 
            isActive={false} 
            onClick={closeMobileMenu}
          />
          <NavItem 
            href="#" 
            icon={<AlertTriangle className="mr-3 h-5 w-5" />} 
            label="Alerts" 
            isActive={false} 
            onClick={closeMobileMenu}
          />
          
          <div className="px-4 py-2 mt-3 text-xs uppercase tracking-wider text-muted-foreground">Security</div>
          <NavItem 
            href="#" 
            icon={<ShieldCheck className="mr-3 h-5 w-5" />} 
            label="Network Policies" 
            isActive={false} 
            onClick={closeMobileMenu}
          />
        </div>
      </aside>
    </>
  );
}

interface NavItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

function NavItem({ href, icon, label, isActive, onClick }: NavItemProps) {
  return (
    <Link href={href}>
      <a 
        className={cn(
          "flex items-center px-4 py-2.5 text-sm",
          isActive 
            ? "text-foreground bg-accent border-l-2 border-primary" 
            : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
        )}
        onClick={onClick}
      >
        {icon}
        <span>{label}</span>
      </a>
    </Link>
  );
}
