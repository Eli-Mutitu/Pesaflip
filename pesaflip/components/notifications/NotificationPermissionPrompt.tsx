'use client';

import React, { useEffect, useState } from 'react';
import { Bell, BellOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  isNotificationSupported, 
  hasNotificationPermission, 
  requestNotificationPermission 
} from '@/lib/notificationService';

interface NotificationPermissionPromptProps {
  className?: string;
  onDismiss?: () => void;
}

/**
 * Component that prompts the user to enable browser notifications
 */
export default function NotificationPermissionPrompt({
  className = '',
  onDismiss
}: NotificationPermissionPromptProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check for notification support and permission on mount
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;
    
    // Check if browser supports notifications
    const supported = isNotificationSupported();
    setIsSupported(supported);
    
    if (supported) {
      // Check current permission status
      setPermission(Notification.permission);
      
      // Check if the prompt has been previously dismissed
      const hasBeenDismissed = localStorage.getItem('notification_prompt_dismissed');
      if (hasBeenDismissed) {
        setDismissed(true);
      }
    }
  }, []);

  // Handle enable notifications button click
  const handleEnableClick = async () => {
    setLoading(true);
    try {
      const granted = await requestNotificationPermission();
      setPermission(granted ? 'granted' : 'denied');
    } finally {
      setLoading(false);
    }
  };

  // Handle dismiss button click
  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('notification_prompt_dismissed', 'true');
    if (onDismiss) {
      onDismiss();
    }
  };

  // Don't render if notifications are not supported,
  // the permission is already granted, or the prompt has been dismissed
  if (!isSupported || permission === 'granted' || dismissed) {
    return null;
  }

  return (
    <div className={`bg-muted/80 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-md mx-auto flex items-start gap-3 ${className}`}>
      <div className="flex-shrink-0 mt-1">
        <Bell className="h-5 w-5 text-primary" />
      </div>
      
      <div className="flex-grow">
        <h3 className="font-medium text-sm">Enable notifications</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Get notified about new invoices, payment reminders, and helpful expense tracking tips.
        </p>
        
        <div className="flex items-center gap-2">
          <Button 
            size="sm" 
            onClick={handleEnableClick}
            disabled={loading}
          >
            {loading ? 'Enabling...' : 'Enable notifications'}
          </Button>
          
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleDismiss}
          >
            Not now
          </Button>
        </div>
      </div>
      
      <button 
        onClick={handleDismiss}
        className="flex-shrink-0 text-muted-foreground hover:text-foreground"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
} 