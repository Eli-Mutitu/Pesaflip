'use client';

import React, { useEffect, useState } from 'react';
import { Bell, AlertCircle, Info } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  isNotificationSupported, 
  hasNotificationPermission, 
  requestNotificationPermission,
  NotificationPreferences,
  getNotificationPreferences,
  saveNotificationPreferences,
  DEFAULT_NOTIFICATION_PREFERENCES,
} from '@/lib/notificationService';

interface NotificationSettingsProps {
  className?: string;
}

/**
 * Component for managing notification preferences
 */
export default function NotificationSettings({ className = '' }: NotificationSettingsProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFERENCES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;
    
    // Check if browser supports notifications
    const supported = isNotificationSupported();
    setIsSupported(supported);
    
    if (supported) {
      // Check current permission status
      setPermission(Notification.permission);
      
      // Load saved preferences
      const savedPreferences = getNotificationPreferences();
      setPreferences(savedPreferences);
    }
  }, []);

  // Request notification permissions
  const handleRequestPermission = async () => {
    setLoading(true);
    try {
      const granted = await requestNotificationPermission();
      setPermission(granted ? 'granted' : 'denied');
    } finally {
      setLoading(false);
    }
  };

  // Update preference toggle
  const handlePreferenceChange = (key: keyof NotificationPreferences) => {
    const updatedPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };
    
    setPreferences(updatedPreferences);
    saveNotificationPreferences(updatedPreferences);
  };

  // Enable all notifications
  const handleEnableAll = () => {
    const allEnabled = {
      enableNewInvoice: true,
      enablePaymentReminders: true,
      enableExpenseTips: true,
    };
    
    setPreferences(allEnabled);
    saveNotificationPreferences(allEnabled);
  };

  // Disable all notifications
  const handleDisableAll = () => {
    const allDisabled = {
      enableNewInvoice: false,
      enablePaymentReminders: false,
      enableExpenseTips: false,
    };
    
    setPreferences(allDisabled);
    saveNotificationPreferences(allDisabled);
  };

  if (!isSupported) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Notifications not supported</AlertTitle>
        <AlertDescription>
          Your browser does not support notifications. Please use a modern browser to enable this feature.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          <span>Notification Settings</span>
        </CardTitle>
        <CardDescription>
          Configure which notifications you want to receive
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {permission !== 'granted' && (
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertTitle>Permission Required</AlertTitle>
            <AlertDescription className="flex flex-col gap-2">
              <p>Browser notifications are currently disabled.</p>
              <Button 
                onClick={handleRequestPermission} 
                disabled={loading}
                size="sm"
                className="w-fit"
              >
                {loading ? 'Requesting...' : 'Enable Notifications'}
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="new-invoice" className="font-medium">New Invoice Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when a new invoice is created
              </p>
            </div>
            <Switch
              id="new-invoice"
              checked={preferences.enableNewInvoice}
              onCheckedChange={() => handlePreferenceChange('enableNewInvoice')}
              disabled={permission !== 'granted'}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="payment-reminders" className="font-medium">Payment Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Get notified about upcoming and overdue payments
              </p>
            </div>
            <Switch
              id="payment-reminders"
              checked={preferences.enablePaymentReminders}
              onCheckedChange={() => handlePreferenceChange('enablePaymentReminders')}
              disabled={permission !== 'granted'}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="expense-tips" className="font-medium">Expense Tracking Tips</Label>
              <p className="text-sm text-muted-foreground">
                Receive helpful tips to improve your expense tracking
              </p>
            </div>
            <Switch
              id="expense-tips"
              checked={preferences.enableExpenseTips}
              onCheckedChange={() => handlePreferenceChange('enableExpenseTips')}
              disabled={permission !== 'granted'}
            />
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleDisableAll}
          disabled={permission !== 'granted'}
        >
          Disable All
        </Button>
        <Button 
          size="sm"
          onClick={handleEnableAll}
          disabled={permission !== 'granted'}
        >
          Enable All
        </Button>
      </CardFooter>
    </Card>
  );
} 