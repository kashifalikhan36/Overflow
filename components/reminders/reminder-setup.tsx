'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Reminder, RecurringPattern, Location } from '@/types/note';
import { 
  Clock, 
  MapPin, 
  Calendar as CalendarIcon, 
  Repeat, 
  Bell,
  X,
  Save,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ReminderSetupProps {
  reminder?: Reminder | null;
  onSave: (reminder: Reminder) => void;
  onRemove?: () => void;
  onCancel: () => void;
}

export function ReminderSetup({ reminder, onSave, onRemove, onCancel }: ReminderSetupProps) {
  const [type, setType] = useState<'time' | 'location'>(reminder?.type || 'time');
  const [title, setTitle] = useState(reminder?.title || '');
  const [description, setDescription] = useState(reminder?.description || '');
  const [date, setDate] = useState<Date | undefined>(
    reminder?.time ? new Date(reminder.time) : undefined
  );
  const [time, setTime] = useState(
    reminder?.time ? format(new Date(reminder.time), 'HH:mm') : '09:00'
  );
  const [location, setLocation] = useState<Location | undefined>(reminder?.location);
  const [recurring, setRecurring] = useState<RecurringPattern | undefined>(reminder?.recurring);
  const [hasRecurring, setHasRecurring] = useState(!!reminder?.recurring);

  const handleSave = () => {
    if (type === 'time' && !date) {
      return;
    }

    if (type === 'location' && !location) {
      return;
    }

    if (!title.trim()) {
      return;
    }

    const reminderDateTime = date && time ? 
      new Date(`${format(date, 'yyyy-MM-dd')}T${time}:00`) : 
      undefined;

    const newReminder: Reminder = {
      id: reminder?.id || Date.now().toString(),
      type,
      title: title.trim(),
      description: description.trim() || undefined,
      time: reminderDateTime?.toISOString(),
      location: type === 'location' ? location : undefined,
      recurring: hasRecurring ? recurring : undefined,
      notified: false,
      createdAt: reminder?.createdAt || new Date().toISOString(),
    };

    onSave(newReminder);
  };

  const handleLocationSearch = async (query: string) => {
    // This would integrate with a geocoding service like Google Maps
    // For now, we'll use a mock implementation
    if (query.trim()) {
      setLocation({
        latitude: 40.7128,
        longitude: -74.0060,
        address: query,
        radius: 100,
      });
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <h3 className="text-lg font-semibold">
            {reminder ? 'Edit Reminder' : 'Add Reminder'}
          </h3>
        </div>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs value={type} onValueChange={(value) => setType(value as 'time' | 'location')}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="time" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Time-based
          </TabsTrigger>
          <TabsTrigger value="location" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location-based
          </TabsTrigger>
        </TabsList>

        <div className="space-y-4 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="reminder-title">Reminder Title</Label>
            <Input
              id="reminder-title"
              placeholder="What should we remind you about?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="reminder-description">Description (Optional)</Label>
            <Input
              id="reminder-description"
              placeholder="Add more details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <TabsContent value="time" className="space-y-4 mt-0">
            {/* Date */}
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time */}
            <div className="space-y-2">
              <Label htmlFor="reminder-time">Time</Label>
              <Input
                id="reminder-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="location" className="space-y-4 mt-0">
            {/* Location Search */}
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                placeholder="Search for a location..."
                onBlur={(e) => handleLocationSearch(e.target.value)}
              />
              {location && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{location.address}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Radius */}
            {location && (
              <div className="space-y-2">
                <Label>Alert Radius</Label>
                <Select
                  value={location.radius?.toString() || '100'}
                  onValueChange={(value) => setLocation({
                    ...location,
                    radius: parseInt(value)
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="50">50 meters</SelectItem>
                    <SelectItem value="100">100 meters</SelectItem>
                    <SelectItem value="200">200 meters</SelectItem>
                    <SelectItem value="500">500 meters</SelectItem>
                    <SelectItem value="1000">1 kilometer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </TabsContent>

          {/* Recurring Options */}
          {type === 'time' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="recurring"
                  checked={hasRecurring}
                  onCheckedChange={setHasRecurring}
                />
                <Label htmlFor="recurring" className="flex items-center gap-2">
                  <Repeat className="h-4 w-4" />
                  Repeat reminder
                </Label>
              </div>

              {hasRecurring && (
                <div className="space-y-3 pl-6 border-l-2 border-muted">
                  <div className="space-y-2">
                    <Label>Repeat Every</Label>
                    <div className="flex gap-2">
                      <Select
                        value={recurring?.type || 'daily'}
                        onValueChange={(value) => setRecurring({
                          ...recurring,
                          type: value as RecurringPattern['type'],
                          interval: recurring?.interval || 1,
                        })}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Day(s)</SelectItem>
                          <SelectItem value="weekly">Week(s)</SelectItem>
                          <SelectItem value="monthly">Month(s)</SelectItem>
                          <SelectItem value="yearly">Year(s)</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        min="1"
                        max="99"
                        className="w-20"
                        value={recurring?.interval || 1}
                        onChange={(e) => setRecurring({
                          ...recurring,
                          type: recurring?.type || 'daily',
                          interval: parseInt(e.target.value) || 1,
                        })}
                      />
                    </div>
                  </div>

                  {recurring?.type === 'weekly' && (
                    <div className="space-y-2">
                      <Label>On Days</Label>
                      <div className="flex gap-1">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                          <Button
                            key={day}
                            variant={recurring.daysOfWeek?.includes(index) ? 'default' : 'outline'}
                            size="sm"
                            className="w-12 h-8 p-0 text-xs"
                            onClick={() => {
                              const currentDays = recurring.daysOfWeek || [];
                              const newDays = currentDays.includes(index)
                                ? currentDays.filter(d => d !== index)
                                : [...currentDays, index];
                              setRecurring({
                                ...recurring,
                                daysOfWeek: newDays,
                              });
                            }}
                          >
                            {day}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>End Date (Optional)</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !recurring?.endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {recurring?.endDate ? format(new Date(recurring.endDate), "PPP") : "Never ends"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={recurring?.endDate ? new Date(recurring.endDate) : undefined}
                          onSelect={(date) => setRecurring({
                            ...recurring,
                            type: recurring?.type || 'daily',
                            interval: recurring?.interval || 1,
                            endDate: date?.toISOString(),
                          })}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Tabs>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div>
          {onRemove && reminder && (
            <Button variant="destructive" size="sm" onClick={onRemove}>
              <Trash2 className="h-4 w-4 mr-2" />
              Remove
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!title.trim() || (type === 'time' && !date) || (type === 'location' && !location)}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Reminder
          </Button>
        </div>
      </div>
    </Card>
  );
}
