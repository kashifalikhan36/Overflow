'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Share2, 
  Copy, 
  Check, 
  Globe, 
  Lock, 
  Eye, 
  Edit3,
  X,
  Crown,
  Shield,
  Mail,
  Link2,
  Clock,
  Activity
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Note, Collaborator, NotePermission } from '@/types/note';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface CollaborationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: Note;
  onUpdateNote: (note: Partial<Note>) => void;
}

interface ShareLink {
  id: string;
  url: string;
  permission: NotePermission;
  expiresAt?: string;
  createdAt: string;
  usageCount: number;
  maxUses?: number;
}

interface ActivityEntry {
  id: string;
  type: 'edit' | 'comment' | 'share' | 'view' | 'permission_change';
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  timestamp: string;
  description: string;
  metadata?: any;
}

const permissionLabels = {
  view: { label: 'Can view', description: 'Can only view the note', icon: Eye },
  edit: { label: 'Can edit', description: 'Can view and edit the note', icon: Edit3 },
  full: { label: 'Full access', description: 'Can edit and manage sharing', icon: Crown },
};

export function CollaborationModal({ open, onOpenChange, note, onUpdateNote }: CollaborationModalProps) {
  const [activeTab, setActiveTab] = useState('collaborators');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePermission, setInvitePermission] = useState<NotePermission>('edit');
  const [isInviting, setIsInviting] = useState(false);
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [publicPermission, setPublicPermission] = useState<NotePermission>('view');
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [linkCopied, setLinkCopied] = useState<string | null>(null);

  // Mock data - in real implementation, this would come from your backend
  const mockCollaborators: Collaborator[] = note.collaborators || [];
  const mockActivities: ActivityEntry[] = [
    {
      id: '1',
      type: 'edit',
      user: { id: '1', name: 'John Doe', email: 'john@example.com', avatar: '/avatars/john.png' },
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      description: 'Edited note content',
    },
    {
      id: '2',  
      type: 'comment',
      user: { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      description: 'Added a comment',
    },
    {
      id: '3',
      type: 'share',
      user: { id: '3', name: 'Bob Wilson', email: 'bob@example.com' },
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      description: 'Shared note with team',
    },
  ];

  const mockShareLinks: ShareLink[] = [
    {
      id: '1',
      url: `https://overflow.app/shared/${note.id}/abc123`,
      permission: 'view',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      usageCount: 5,
      maxUses: 10,
    },
    {
      id: '2',
      url: `https://overflow.app/shared/${note.id}/def456`,
      permission: 'edit',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      usageCount: 2,
    },
  ];

  useEffect(() => {
    if (open) {
      // Load real data here
      setShareLinks(mockShareLinks);
      setActivities(mockActivities);
      setIsPublic(note.permissions !== 'private');
    }
  }, [open, note]);

  const handleInviteCollaborator = async () => {
    if (!inviteEmail.trim()) {
      toast.error('Please enter an email address');
      return;
    }

    setIsInviting(true);
    try {
      // Mock API call - replace with real implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newCollaborator: Collaborator = {
        userId: Date.now().toString(),
        permission: invitePermission,
        email: inviteEmail,
        name: inviteEmail.split('@')[0],
        avatar: undefined,
        invitedAt: new Date().toISOString(),
        status: 'pending',
      };

      onUpdateNote({
        collaborators: [...(note.collaborators || []), newCollaborator],
      });

      setInviteEmail('');
      toast.success(`Invitation sent to ${inviteEmail}`);
    } catch (error) {
      toast.error('Failed to send invitation');
    } finally {
      setIsInviting(false);
    }
  };

  const handleRemoveCollaborator = async (collaboratorUserId: string) => {
    try {
      const updatedCollaborators = note.collaborators?.filter(c => c.userId !== collaboratorUserId) || [];
      onUpdateNote({ collaborators: updatedCollaborators });
      toast.success('Collaborator removed');
    } catch (error) {
      toast.error('Failed to remove collaborator');
    }
  };

  const handlePermissionChange = async (collaboratorUserId: string, permission: NotePermission) => {
    try {
      const updatedCollaborators = note.collaborators?.map(c => 
        c.userId === collaboratorUserId ? { ...c, permission } : c
      ) || [];
      onUpdateNote({ collaborators: updatedCollaborators });
      toast.success('Permission updated');
    } catch (error) {
      toast.error('Failed to update permission');
    }
  };

  const handleCreateShareLink = async (permission: NotePermission, maxUses?: number, expiresIn?: number) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newLink: ShareLink = {
        id: Date.now().toString(),
        url: `https://overflow.app/shared/${note.id}/${Math.random().toString(36).substring(7)}`,
        permission,
        createdAt: new Date().toISOString(),
        usageCount: 0,
        maxUses,
        expiresAt: expiresIn ? new Date(Date.now() + expiresIn).toISOString() : undefined,
      };

      setShareLinks(prev => [...prev, newLink]);
      toast.success('Share link created');
    } catch (error) {
      toast.error('Failed to create share link');
    }
  };

  const handleCopyLink = async (url: string, linkId: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setLinkCopied(linkId);
      toast.success('Link copied to clipboard');
      setTimeout(() => setLinkCopied(null), 2000);
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleDeleteShareLink = async (linkId: string) => {
    try {
      setShareLinks(prev => prev.filter(link => link.id !== linkId));
      toast.success('Share link deleted');
    } catch (error) {
      toast.error('Failed to delete share link');
    }
  };

  const handleTogglePublic = async (isPublic: boolean) => {
    try {
      setIsPublic(isPublic);
      onUpdateNote({ 
        permissions: isPublic ? publicPermission : 'private' 
      });
      toast.success(isPublic ? 'Note is now public' : 'Note is now private');
    } catch (error) {
      toast.error('Failed to update note visibility');
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Share & Collaborate
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="collaborators">Collaborators</TabsTrigger>
            <TabsTrigger value="sharing">Share Links</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <div className="mt-6 h-[600px] overflow-y-auto">
            <TabsContent value="collaborators" className="space-y-6">
              {/* Invite Section */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Invite People</h3>
                <div className="flex gap-3">
                  <Input
                    placeholder="Enter email address"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleInviteCollaborator()}
                    className="flex-1"
                  />
                  <Select value={invitePermission} onValueChange={(value: NotePermission) => setInvitePermission(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(permissionLabels).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <config.icon className="h-4 w-4" />
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={handleInviteCollaborator} disabled={isInviting}>
                    {isInviting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                      />
                    ) : (
                      <UserPlus className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </Card>

              {/* Current Collaborators */}
              <div className="space-y-3">
                <h3 className="font-semibold">People with access</h3>
                
                {/* Owner */}
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="/avatars/owner.png" />
                        <AvatarFallback>YU</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">You</div>
                        <div className="text-sm text-muted-foreground">owner@example.com</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="gap-1">
                        <Crown className="h-3 w-3" />
                        Owner
                      </Badge>
                    </div>
                  </div>
                </Card>

                {/* Collaborators */}
                {mockCollaborators.map((collaborator) => (
                  <motion.div
                    key={collaborator.userId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={collaborator.avatar} />
                            <AvatarFallback>
                              {collaborator.name?.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{collaborator.name}</div>
                            <div className="text-sm text-muted-foreground">{collaborator.email}</div>
                            {collaborator.status === 'pending' && (
                              <Badge variant="outline" className="text-xs mt-1">
                                <Mail className="h-3 w-3 mr-1" />
                                Invited
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select 
                            value={collaborator.permission} 
                            onValueChange={(value: NotePermission) => handlePermissionChange(collaborator.userId, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(permissionLabels).map(([key, config]) => (
                                <SelectItem key={key} value={key}>
                                  <div className="flex items-center gap-2">
                                    <config.icon className="h-4 w-4" />
                                    {config.label}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveCollaborator(collaborator.userId)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}

                {mockCollaborators.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No collaborators yet</p>
                    <p className="text-sm">Invite people to start collaborating</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="sharing" className="space-y-6">
              {/* Create Share Link */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Create Share Link</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    onClick={() => handleCreateShareLink('view')}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View Only
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleCreateShareLink('edit')}
                    className="flex items-center gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    Can Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => handleCreateShareLink('view', 100, 7 * 24 * 60 * 60 * 1000)}
                    className="flex items-center gap-2"
                  >
                    <Clock className="h-4 w-4" />
                    Expires in 7 days
                  </Button>
                </div>
              </Card>

              {/* Existing Share Links */}
              <div className="space-y-3">
                <h3 className="font-semibold">Active Share Links</h3>
                
                {shareLinks.map((link) => (
                  <motion.div
                    key={link.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="gap-1">
                              {(() => {
                                const config = permissionLabels[link.permission as keyof typeof permissionLabels];
                                const Icon = config?.icon;
                                return (
                                  <>
                                    {Icon && <Icon className="h-3 w-3" />}
                                    {config?.label}
                                  </>
                                );
                              })()}
                            </Badge>
                            {link.expiresAt && (
                              <Badge variant="outline" className="text-xs">
                                Expires {formatTimeAgo(link.expiresAt)}
                              </Badge>
                            )}
                          </div>
                          <div className="font-mono text-sm text-muted-foreground truncate">
                            {link.url}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Used {link.usageCount} times
                            {link.maxUses && ` of ${link.maxUses}`}
                            {' • '}
                            Created {formatTimeAgo(link.createdAt)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyLink(link.url, link.id)}
                            className="gap-2"
                          >
                            {linkCopied === link.id ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                            Copy
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteShareLink(link.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}

                {shareLinks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Link2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>No share links created</p>
                    <p className="text-sm">Create a link to share this note</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              {/* Public Access */}
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Public Access</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Anyone with the link can access this note
                    </p>
                  </div>
                  <Switch
                    checked={isPublic}
                    onCheckedChange={handleTogglePublic}
                  />
                </div>

                {isPublic && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t"
                  >
                    <Label className="text-sm font-medium">Public Permission</Label>
                    <Select value={publicPermission} onValueChange={(value: NotePermission) => setPublicPermission(value)}>
                      <SelectTrigger className="w-full mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="view">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            Anyone can view
                          </div>
                        </SelectItem>
                        <SelectItem value="edit">
                          <div className="flex items-center gap-2">
                            <Edit3 className="h-4 w-4" />
                            Anyone can edit
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </motion.div>
                )}
              </Card>

              {/* Advanced Settings */}
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Advanced Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Allow downloads</Label>
                      <p className="text-sm text-muted-foreground">
                        Collaborators can download this note
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Require login to view</Label>
                      <p className="text-sm text-muted-foreground">
                        Viewers must sign in to access this note
                      </p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Track views</Label>
                      <p className="text-sm text-muted-foreground">
                        Keep track of who views this note
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Recent Activity</h3>
                <Button variant="outline" size="sm">
                  <Activity className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </div>

              <ScrollArea className="h-[500px]">
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <Card className="p-4">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8 mt-1">
                            <AvatarImage src={activity.user.avatar} />
                            <AvatarFallback className="text-xs">
                              {activity.user.name.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">
                                {activity.user.name}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {activity.type}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {activity.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {formatTimeAgo(activity.timestamp)}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>

        <Separator />

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {mockCollaborators.length + 1} people have access
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button onClick={() => handleCreateShareLink('view')}>
              <Share2 className="h-4 w-4 mr-2" />
              Share Note
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
