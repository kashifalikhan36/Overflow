'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Moon,
  Sun,
  Monitor,
  Bell,
  Globe,
  Download,
  Upload,
  Trash2,
  Shield,
  User,
  Database,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { usePreferences } from '@/context/preferences-context';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { theme, setTheme } = useTheme();
  const { showImages, setShowImages, showEffects, setShowEffects } =
    usePreferences();
  const [notifications, setNotifications] = useState(true);
  const [autoSync, setAutoSync] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  const sections = [
    {
      id: 'appearance',
      title: 'Appearance',
      icon: Monitor,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Theme</h4>
              <p className="text-sm text-muted-foreground">
                Choose your preferred color scheme
              </p>
            </div>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {themeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className="h-4 w-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Show image previews</h4>
              <p className="text-sm text-muted-foreground">
                Toggle to hide image thumbnails across the app
              </p>
            </div>
            <Switch
              checked={showImages}
              onCheckedChange={(v) => setShowImages(!!v)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Show decorative effects</h4>
              <p className="text-sm text-muted-foreground">
                Enable subtle decorative background effects (e.g. meteors)
              </p>
            </div>
            <Switch
              checked={showEffects}
              onCheckedChange={(v) => setShowEffects(!!v)}
            />
          </div>
        </div>
      ),
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Push Notifications</h4>
              <p className="text-sm text-muted-foreground">
                Receive notifications for reminders
              </p>
            </div>
            <Switch
              checked={notifications}
              onCheckedChange={setNotifications}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Email Notifications</h4>
              <p className="text-sm text-muted-foreground">
                Get email updates for shared notes
              </p>
            </div>
            <Switch checked={false} onCheckedChange={() => {}} />
          </div>
        </div>
      ),
    },
    {
      id: 'sync',
      title: 'Sync & Backup',
      icon: Database,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Auto Sync</h4>
              <p className="text-sm text-muted-foreground">
                Automatically sync across devices
              </p>
            </div>
            <Switch checked={autoSync} onCheckedChange={setAutoSync} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Offline Mode</h4>
              <p className="text-sm text-muted-foreground">
                Work without internet connection
              </p>
            </div>
            <Switch checked={offlineMode} onCheckedChange={setOfflineMode} />
          </div>
          <div className="space-y-2 pt-2 border-t">
            <Button variant="outline" className="w-full justify-start">
              <Download className="h-4 w-4 mr-2" />
              Export All Notes
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Upload className="h-4 w-4 mr-2" />
              Import Notes
            </Button>
          </div>
        </div>
      ),
    },
    {
      id: 'account',
      title: 'Account',
      icon: User,
      content: (
        <div className="space-y-4">
          <div className="p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <User className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h4 className="font-medium">John Doe</h4>
                <p className="text-sm text-muted-foreground">john@example.com</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <Shield className="h-4 w-4 mr-2" />
              Privacy Settings
            </Button>
            <Button variant="destructive" className="w-full justify-start">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </div>
      ),
    },
  ];

  const [activeSection, setActiveSection] = useState('appearance');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-6 min-h-[500px]">
          {/* Sidebar */}
          <div className="w-48 shrink-0 border-r pr-6">
            <nav className="space-y-1">
              {sections.map((section) => (
                <motion.button
                  key={section.id}
                  whileHover={{ x: 4 }}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all",
                    activeSection === section.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted/50"
                  )}
                >
                  <section.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{section.title}</span>
                </motion.button>
              ))}
            </nav>

            <div className="mt-6 pt-6 border-t">
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>Version 1.0.0</p>
                <p>Build 2025.01.01</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1">
            {sections.map((section) => (
              <motion.div
                key={section.id}
                initial={false}
                animate={{
                  opacity: activeSection === section.id ? 1 : 0,
                  display: activeSection === section.id ? 'block' : 'none',
                }}
                transition={{ duration: 0.2 }}
              >
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">{section.title}</h2>
                    <p className="text-sm text-muted-foreground">
                      Manage your {section.title.toLowerCase()} preferences
                    </p>
                  </div>
                  {section.content}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center pt-6 border-t">
          <div className="flex items-center gap-2">
            <Badge variant="outline">PRO</Badge>
            <span className="text-xs text-muted-foreground">
              All features unlocked
            </span>
          </div>
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}