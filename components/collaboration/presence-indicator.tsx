'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Edit3, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ActiveUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  cursor?: { x: number; y: number };
  selection?: { start: number; end: number };
  isEditing: boolean;
  color: string;
  lastSeen: string;
}

interface PresenceIndicatorProps {
  noteId: string;
  className?: string;
  maxVisible?: number;
}

// Mock colors for different users
const userColors = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', 
  '#22c55e', '#10b981', '#06b6d4', '#3b82f6', 
  '#6366f1', '#8b5cf6', '#d946ef', '#ec4899'
];

export function PresenceIndicator({ noteId, className, maxVisible = 3 }: PresenceIndicatorProps) {
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Mock active users - in real implementation, this would come from your real-time service
  const mockActiveUsers: ActiveUser[] = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      avatar: '/avatars/john.png',
      isEditing: true,
      color: userColors[0],
      lastSeen: new Date().toISOString(),
      cursor: { x: 120, y: 200 },
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      isEditing: false,
      color: userColors[1],
      lastSeen: new Date(Date.now() - 30000).toISOString(),
    },
    {
      id: '3',
      name: 'Bob Wilson',
      email: 'bob@example.com',
      avatar: '/avatars/bob.png',
      isEditing: false,
      color: userColors[2],
      lastSeen: new Date(Date.now() - 60000).toISOString(),
    },
    {
      id: '4',
      name: 'Alice Johnson',
      email: 'alice@example.com',
      isEditing: true,
      color: userColors[3],
      lastSeen: new Date().toISOString(),
      cursor: { x: 300, y: 150 },
    },
    {
      id: '5',
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      isEditing: false,
      color: userColors[4],
      lastSeen: new Date(Date.now() - 120000).toISOString(),
    },
  ];

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setActiveUsers(mockActiveUsers.slice(0, Math.floor(Math.random() * 4) + 1));
    }, 3000);

    // Initial load
    setActiveUsers(mockActiveUsers.slice(0, 3));

    return () => clearInterval(interval);
  }, [noteId]);

  const visibleUsers = isExpanded ? activeUsers : activeUsers.slice(0, maxVisible);
  const hiddenCount = activeUsers.length - maxVisible;
  const editingUsers = activeUsers.filter(user => user.isEditing);
  const viewingUsers = activeUsers.filter(user => !user.isEditing);

  if (activeUsers.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Active Status Badge */}
      {editingUsers.length > 0 && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-1"
        >
          <Badge variant="secondary" className="gap-1 text-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {editingUsers.length} editing
          </Badge>
        </motion.div>
      )}

      {/* User Avatars */}
      <div className="flex -space-x-2">
        <AnimatePresence>
          {visibleUsers.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ 
                delay: index * 0.1,
                type: "spring",
                stiffness: 300,
                damping: 20
              }}
              className="relative"
            >
              <Tooltip>
                <TooltipTrigger>
                  <Avatar 
                    className={cn(
                      "h-6 w-6 border-2 ring-2 ring-background",
                      user.isEditing ? "border-green-500" : "border-muted"
                    )}
                    style={{ 
                      borderColor: user.isEditing ? '#22c55e' : undefined 
                    }}
                  >
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback 
                      className="text-xs font-medium text-white"
                      style={{ backgroundColor: user.color }}
                    >
                      {user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Status indicator */}
                  <div className={cn(
                    "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background",
                    user.isEditing ? "bg-green-500" : "bg-blue-500"
                  )}>
                    {user.isEditing ? (
                      <Edit3 className="w-1.5 h-1.5 text-white m-0.5" />
                    ) : (
                      <Eye className="w-1.5 h-1.5 text-white m-0.5" />
                    )}
                  </div>
                </TooltipTrigger>
                
                <TooltipContent side="top" className="max-w-xs">
                  <div className="text-center">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                    <div className="text-xs mt-1">
                      {user.isEditing ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <Edit3 className="w-3 h-3" />
                          Currently editing
                        </span>
                      ) : (
                        <span className="text-blue-600 flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          Viewing
                        </span>
                      )}
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Show more indicator */}
        {hiddenCount > 0 && !isExpanded && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={() => setIsExpanded(true)}
            className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-medium hover:bg-muted/80 transition-colors"
          >
            +{hiddenCount}
          </motion.button>
        )}
      </div>

      {/* Live cursors - would be positioned absolutely over the note content */}
      {activeUsers
        .filter(user => user.cursor && user.isEditing)
        .map(user => (
          <motion.div
            key={`cursor-${user.id}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="fixed pointer-events-none z-50"
            style={{
              left: user.cursor!.x,
              top: user.cursor!.y,
              color: user.color
            }}
          >
            <div className="flex items-center gap-1">
              <div 
                className="w-5 h-5 transform rotate-12 rounded-tl-md rounded-br-md"
                style={{ backgroundColor: user.color }}
              />
              <div 
                className="px-2 py-1 rounded text-xs text-white font-medium whitespace-nowrap"
                style={{ backgroundColor: user.color }}
              >
                {user.name}
              </div>
            </div>
          </motion.div>
        ))
      }
    </div>
  );
}

export function CollaborationStatus({ noteId, className }: { noteId: string; className?: string }) {
  const [status, setStatus] = useState<'private' | 'shared' | 'public'>('private');
  const [collaboratorCount, setCollaboratorCount] = useState(0);

  // Mock status - in real implementation, this would come from your note data
  useEffect(() => {
    // Simulate changing status
    const statuses: Array<'private' | 'shared' | 'public'> = ['private', 'shared', 'public'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    setStatus(randomStatus);
    setCollaboratorCount(randomStatus === 'private' ? 0 : Math.floor(Math.random() * 5) + 1);
  }, [noteId]);

  const statusConfig = {
    private: {
      icon: User,
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
      label: 'Private'
    },
    shared: {
      icon: User,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      label: `Shared with ${collaboratorCount}`
    },
    public: {
      icon: Eye,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      label: 'Public'
    }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge 
      variant="secondary" 
      className={cn(
        "gap-1 text-xs",
        config.color,
        config.bgColor,
        className
      )}
    >
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  );
}
