// ============================================
// INTEL OPS PLATFORM - MAIN APP
// ============================================

import { useState, useEffect } from 'react';
import { 
  Shield, 
  LayoutDashboard, 
  Map, 
  Target, 
  Search, 
  Brain, 
  Share2, 
  Network, 
  Settings, 
  Bell, 
  Command,
  ChevronRight,
  LogOut,
  User,
  Filter,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

// Store hooks
import { 
  useAuthStore, 
  useLayoutStore, 
  useNotificationStore,
  useFilterStore,
  useMissionStore,
  useObjectStore,
  useEventStore
} from '@/store';

// Mock data
import { 
  mockMissions, 
  mockObjects, 
  mockEvents, 
  mockNotifications
} from '@/data/mockData';

// Pages
import DashboardPage from '@/pages/Dashboard';
import MissionsPage from '@/pages/Missions';
import MapPage from '@/pages/Map';
import ObjectsPage from '@/pages/Objects';
import SearchPage from '@/pages/Search';
import PredictionsPage from '@/pages/Predictions';
import LinkAnalysisPage from '@/pages/LinkAnalysis';
import NetworkPage from '@/pages/Network';
import SettingsPage from '@/pages/Settings';

// Components
import GlobalFilters from '@/components/GlobalFilters';
import CommandPalette from '@/components/CommandPalette';
import NotificationPanel from '@/components/NotificationPanel';
import LoginForm from '@/components/LoginForm';

type PageType = 'dashboard' | 'missions' | 'map' | 'objects' | 'search' | 'predictions' | 'link-analysis' | 'network' | 'settings';

interface NavItem {
  id: PageType;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'missions', label: 'Missions', icon: Target, badge: 2 },
  { id: 'map', label: 'Map Tracking', icon: Map },
  { id: 'objects', label: 'Objects', icon: Eye, badge: 3 },
  { id: 'search', label: 'Intelligence Search', icon: Search },
  { id: 'predictions', label: 'Predictions', icon: Brain },
  { id: 'link-analysis', label: 'Link Analysis', icon: Share2 },
  { id: 'network', label: 'Network Analysis', icon: Network },
];

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [showFilters, setShowFilters] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  
  const { user, isAuthenticated, logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useLayoutStore();
  const { unreadCount } = useNotificationStore();
  const { filters } = useFilterStore();

  // Initialize mock data
  useEffect(() => {
    if (isAuthenticated) {
      useMissionStore.getState().setMissions(mockMissions);
      useObjectStore.getState().setObjects(mockObjects);
      useEventStore.getState().setEvents(mockEvents);
      mockNotifications.forEach(n => useNotificationStore.getState().addNotification(n));
      toast.success('Welcome to IntelOps Platform', {
        description: 'All systems operational. Data loaded successfully.',
      });
    }
  }, [isAuthenticated]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            setShowCommandPalette(true);
            break;
          case 'f':
            e.preventDefault();
            setShowFilters(!showFilters);
            break;
          case 'b':
            e.preventDefault();
            toggleSidebar();
            break;
        }
      }
      if (e.key === 'Escape') {
        setShowCommandPalette(false);
        setShowFilters(false);
        setShowNotifications(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showFilters, toggleSidebar]);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'missions':
        return <MissionsPage />;
      case 'map':
        return <MapPage />;
      case 'objects':
        return <ObjectsPage />;
      case 'search':
        return <SearchPage />;
      case 'predictions':
        return <PredictionsPage />;
      case 'link-analysis':
        return <LinkAnalysisPage />;
      case 'network':
        return <NetworkPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background grid-pattern flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">IntelOps Platform</h1>
            <p className="text-muted-foreground">Intelligence Operations & Analysis System</p>
          </div>
          <LoginForm />
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <aside 
          className={`fixed left-0 top-0 h-full bg-sidebar border-r border-sidebar-border z-40 transition-all duration-300 ${
            sidebarCollapsed ? 'w-16' : 'w-64'
          }`}
        >
          {/* Logo */}
          <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-primary-foreground" />
              </div>
              {!sidebarCollapsed && (
                <div className="overflow-hidden">
                  <h1 className="font-bold text-sidebar-foreground whitespace-nowrap">IntelOps</h1>
                  <p className="text-[10px] text-sidebar-foreground/60 whitespace-nowrap">v2.4.1</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <ScrollArea className="h-[calc(100vh-4rem)]">
            <div className="p-2 space-y-1">
              {navItems.map((item) => (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setCurrentPage(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors ${
                        currentPage === item.id
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                      }`}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!sidebarCollapsed && (
                        <>
                          <span className="flex-1 text-left text-sm">{item.label}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </button>
                  </TooltipTrigger>
                  {sidebarCollapsed && (
                    <TooltipContent side="right" className="flex items-center gap-2">
                      {item.label}
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </TooltipContent>
                  )}
                </Tooltip>
              ))}
            </div>

            <Separator className="my-4 bg-sidebar-border" />

            {/* Quick Actions */}
            <div className="px-3 mb-2">
              {!sidebarCollapsed && (
                <p className="text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider mb-2">
                  Quick Actions
                </p>
              )}
              <div className="space-y-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setShowFilters(true)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                    >
                      <Filter className="w-4 h-4" />
                      {!sidebarCollapsed && <span className="text-sm">Global Filters</span>}
                    </button>
                  </TooltipTrigger>
                  {sidebarCollapsed && <TooltipContent side="right">Global Filters</TooltipContent>}
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => setShowCommandPalette(true)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                    >
                      <Command className="w-4 h-4" />
                      {!sidebarCollapsed && (
                        <div className="flex-1 flex items-center justify-between">
                          <span className="text-sm">Command</span>
                          <kbd className="text-[10px] bg-sidebar-accent px-1.5 py-0.5 rounded">⌘K</kbd>
                        </div>
                      )}
                    </button>
                  </TooltipTrigger>
                  {sidebarCollapsed && <TooltipContent side="right">Command Palette</TooltipContent>}
                </Tooltip>
              </div>
            </div>
          </ScrollArea>

          {/* Collapse Button */}
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-20 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <ChevronRight className={`w-3 h-3 transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
          </button>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          {/* Header */}
          <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30">
            <div className="h-full px-4 flex items-center justify-between">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">Platform</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground font-medium capitalize">
                  {currentPage.replace('-', ' ')}
                </span>
              </div>

              {/* Right Actions */}
              <div className="flex items-center gap-2">
                {/* Global Filter Indicator */}
                {(filters.missions.length > 0 || filters.objectTypes.length > 0 || filters.timeRange.start) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFilters(true)}
                    className="gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    <span className="text-xs">Filters Active</span>
                    <Badge variant="secondary" className="text-xs ml-1">
                      {filters.missions.length + filters.objectTypes.length + (filters.timeRange.start ? 1 : 0)}
                    </Badge>
                  </Button>
                )}

                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={user?.avatar} />
                        <AvatarFallback>{user?.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="hidden md:block text-left">
                        <p className="text-sm font-medium">{user?.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setCurrentPage('settings')}>
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setCurrentPage('settings')}>
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="p-4">
            {renderPage()}
          </div>
        </main>

        {/* Global Filters Panel */}
        <Dialog open={showFilters} onOpenChange={setShowFilters}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Global Filters
              </DialogTitle>
            </DialogHeader>
            <GlobalFilters onClose={() => setShowFilters(false)} />
          </DialogContent>
        </Dialog>

        {/* Command Palette */}
        <CommandPalette 
          open={showCommandPalette} 
          onClose={() => setShowCommandPalette(false)}
          onNavigate={(page) => {
            setCurrentPage(page as PageType);
            setShowCommandPalette(false);
          }}
        />

        {/* Notification Panel */}
        <NotificationPanel 
          open={showNotifications} 
          onClose={() => setShowNotifications(false)} 
        />
      </div>
    </TooltipProvider>
  );
}

// Dropdown Menu Components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default App;
