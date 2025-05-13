import { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, Menu, Search } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import useWebSocket from '@/hooks/useWebSocket';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [location, navigate] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pageTitle, setPageTitle] = useState('Dashboard');
  const { toast } = useToast();
  const { lastMessage } = useWebSocket();

  // Handle WebSocket messages for real-time alerts
  useEffect(() => {
    if (lastMessage && lastMessage.type === 'ALERT_CREATED') {
      const alert = lastMessage.alert;
      if (alert.severity === 'critical') {
        toast({
          title: alert.title,
          description: alert.description,
          variant: 'destructive',
        });
      }
    }
  }, [lastMessage, toast]);

  // Update page title based on the current location
  useEffect(() => {
    if (location === '/') {
      setPageTitle('Dashboard');
    } else if (location.startsWith('/clusters/')) {
      setPageTitle('Cluster Overview');
    } else if (location.startsWith('/topology/')) {
      setPageTitle('Network Topology');
    } else if (location.startsWith('/nodes/')) {
      setPageTitle('Nodes');
    } else {
      setPageTitle('KubeOrchestrator');
    }
  }, [location]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar for desktop */}
      <Sidebar 
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="bg-card border-b border-border py-3 px-4 flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon"
              className="md:hidden mr-4"
              onClick={toggleMobileMenu}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-medium">{pageTitle}</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                type="text" 
                placeholder="Search resources..." 
                className="bg-background pl-9 pr-4 w-64"
              />
            </div>
            
            <div className="flex items-center space-x-2 text-sm">
              <span className="flex items-center px-2 py-1 rounded-md bg-success-500 bg-opacity-20 text-success-500">
                <svg className="w-4 h-4 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                All Systems Operational
              </span>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-destructive"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <div className="p-2 font-semibold text-sm border-b">Notifications</div>
                <DropdownMenuItem className="flex flex-col items-start cursor-default p-3">
                  <div className="font-medium">High CPU Usage</div>
                  <div className="text-sm text-muted-foreground">Node worker-3 CPU usage over 95% for 10m</div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start cursor-default p-3">
                  <div className="font-medium">Pod Restart</div>
                  <div className="text-sm text-muted-foreground">Pod billing-service restarted 3 times</div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>JS</AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium hidden sm:inline">John Smith</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Help</DropdownMenuItem>
                <DropdownMenuItem>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-background">
          {children}
        </div>
      </main>
    </div>
  );
}
