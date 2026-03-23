// ============================================
// INTEL OPS PLATFORM - COMMAND PALETTE
// ============================================

import { useState, useEffect } from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from '@/components/ui/command';
import {
  LayoutDashboard,
  Map,
  Target,
  Search,
  Brain,
  Share2,
  Network,
  Settings,
  User,
  FileText,
  Bell,
  Filter,
  LogOut,
  Plus,
  Eye,
  BarChart3,
  Globe,
  Zap,
  Clock,
  Bookmark,
  HelpCircle,
  Keyboard,
  Ship,
} from 'lucide-react';
import { useAuthStore, useMissionStore, useObjectStore } from '@/store';
import { toast } from 'sonner';

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
}

export default function CommandPalette({ open, onClose, onNavigate }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const { logout } = useAuthStore();
  const { missions } = useMissionStore();
  const { objects } = useObjectStore();

  // Clear search when opening
  useEffect(() => {
    if (open) {
      setSearch('');
    }
  }, [open]);

  const navigationCommands = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, shortcut: '⌘D' },
    { id: 'missions', label: 'Missions', icon: Target, shortcut: '⌘M' },
    { id: 'map', label: 'Map Tracking', icon: Map, shortcut: '⌘G' },
    { id: 'objects', label: 'Objects', icon: Eye, shortcut: '⌘O' },
    { id: 'search', label: 'Intelligence Search', icon: Search, shortcut: '⌘F' },
    { id: 'predictions', label: 'Predictions', icon: Brain, shortcut: '⌘P' },
    { id: 'link-analysis', label: 'Link Analysis', icon: Share2 },
    { id: 'network', label: 'Network Analysis', icon: Network },
    { id: 'settings', label: 'Settings', icon: Settings, shortcut: '⌘,' },
    { id: 'units', label: 'Units Catalog', icon: Ship, shortcut: '⌘U' }
  ];

  const actionCommands = [
    { 
      id: 'new-mission', 
      label: 'Create New Mission', 
      icon: Plus,
      action: () => toast.info('Create Mission', { description: 'Mission creation dialog would open' })
    },
    { 
      id: 'new-object', 
      label: 'Add New Object', 
      icon: Plus,
      action: () => toast.info('Add Object', { description: 'Object creation dialog would open' })
    },
    { 
      id: 'global-filters', 
      label: 'Open Global Filters', 
      icon: Filter, 
      shortcut: '⌘⇧F',
      action: () => toast.info('Global Filters', { description: 'Filter panel would open' })
    },
    { 
      id: 'notifications', 
      label: 'View Notifications', 
      icon: Bell,
      action: () => toast.info('Notifications', { description: 'Notification panel would open' })
    },
    { 
      id: 'reports', 
      label: 'Generate Report', 
      icon: FileText,
      action: () => toast.info('Generate Report', { description: 'Report generation dialog would open' })
    },
    { 
      id: 'bookmarks', 
      label: 'View Bookmarks', 
      icon: Bookmark,
      action: () => toast.info('Bookmarks', { description: 'Bookmarks panel would open' })
    },
  ];

  const quickCommands = [
    { 
      id: 'refresh', 
      label: 'Refresh Data', 
      icon: Zap, 
      shortcut: '⌘R',
      action: () => toast.success('Data refreshed', { description: 'All data has been refreshed' })
    },
    { 
      id: 'fullscreen', 
      label: 'Toggle Fullscreen', 
      icon: Globe, 
      shortcut: 'F11',
      action: () => document.documentElement.requestFullscreen()
    },
    { 
      id: 'help', 
      label: 'Help & Documentation', 
      icon: HelpCircle, 
      shortcut: '?',
      action: () => toast.info('Help', { description: 'Documentation would open' })
    },
    { 
      id: 'shortcuts', 
      label: 'Keyboard Shortcuts', 
      icon: Keyboard,
      action: () => toast.info('Shortcuts', { description: 'Keyboard shortcuts dialog would open' })
    },
  ];

  const handleSelect = (commandId: string, action?: () => void) => {
    if (action) {
      action();
    } else if (navigationCommands.find(c => c.id === commandId)) {
      onNavigate(commandId);
    }
    onClose();
  };

  return (
    <CommandDialog open={open} onOpenChange={onClose}>
      <CommandInput 
        placeholder="Type a command or search..." 
        value={search}
        onValueChange={setSearch}
      />
      <CommandList className="max-h-[60vh]">
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Navigation */}
        <CommandGroup heading="Navigation">
          {navigationCommands.map((cmd) => (
            <CommandItem
              key={cmd.id}
              onSelect={() => handleSelect(cmd.id)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <cmd.icon className="w-4 h-4 text-muted-foreground" />
              <span className="flex-1">{cmd.label}</span>
              {cmd.shortcut && (
                <CommandShortcut>{cmd.shortcut}</CommandShortcut>
              )}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Quick Actions */}
        <CommandGroup heading="Actions">
          {actionCommands.map((cmd) => (
            <CommandItem
              key={cmd.id}
              onSelect={() => handleSelect(cmd.id, cmd.action)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <cmd.icon className="w-4 h-4 text-muted-foreground" />
              <span className="flex-1">{cmd.label}</span>
              {cmd.shortcut && (
                <CommandShortcut>{cmd.shortcut}</CommandShortcut>
              )}
            </CommandItem>
          ))}
        </CommandGroup>

        {/* Recent Missions */}
        {missions.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Recent Missions">
              {missions.slice(0, 5).map((mission) => (
                <CommandItem
                  key={mission.id}
                  onSelect={() => {
                    onNavigate('missions');
                    onClose();
                  }}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Target className="w-4 h-4 text-muted-foreground" />
                  <span className="flex-1">{mission.name}</span>
                  <span 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: mission.color }}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {/* Recent Objects */}
        {objects.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Recent Objects">
              {objects.slice(0, 5).map((obj) => (
                <CommandItem
                  key={obj.id}
                  onSelect={() => {
                    onNavigate('objects');
                    onClose();
                  }}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  <span className="flex-1">{obj.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">{obj.type}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        <CommandSeparator />

        {/* Quick Commands */}
        <CommandGroup heading="Quick Commands">
          {quickCommands.map((cmd) => (
            <CommandItem
              key={cmd.id}
              onSelect={() => handleSelect(cmd.id, cmd.action)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <cmd.icon className="w-4 h-4 text-muted-foreground" />
              <span className="flex-1">{cmd.label}</span>
              {cmd.shortcut && (
                <CommandShortcut>{cmd.shortcut}</CommandShortcut>
              )}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Account */}
        <CommandGroup heading="Account">
          <CommandItem
            onSelect={() => {
              onNavigate('settings');
              onClose();
            }}
            className="flex items-center gap-2 cursor-pointer"
          >
            <User className="w-4 h-4 text-muted-foreground" />
            <span className="flex-1">Profile Settings</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              logout();
              onClose();
            }}
            className="flex items-center gap-2 cursor-pointer text-destructive"
          >
            <LogOut className="w-4 h-4" />
            <span className="flex-1">Logout</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
