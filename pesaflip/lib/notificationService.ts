'use client';

/**
 * Notification types supported by the application
 */
export enum NotificationType {
  NEW_INVOICE = 'new_invoice',
  PAYMENT_REMINDER = 'payment_reminder',
  EXPENSE_TIP = 'expense_tip',
}

/**
 * Notification payload structure
 */
export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: any;
  requireInteraction?: boolean;
}

/**
 * Check if the Notification API is available in the browser
 */
export function isNotificationSupported(): boolean {
  return 'Notification' in window;
}

/**
 * Check if user has granted permission for notifications
 */
export function hasNotificationPermission(): boolean {
  if (!isNotificationSupported()) {
    return false;
  }
  return Notification.permission === 'granted';
}

/**
 * Request permission to show notifications
 * @returns Promise resolving to true if permission is granted, false otherwise
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) {
    console.warn('Notifications are not supported in this browser');
    return false;
  }

  if (hasNotificationPermission()) {
    return true;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

/**
 * Show a browser notification
 * @param payload Notification payload
 * @returns The Notification object if successful, null otherwise
 */
export function showNotification(payload: NotificationPayload): Notification | null {
  if (!hasNotificationPermission()) {
    console.warn('Notification permission not granted');
    return null;
  }

  try {
    const notification = new Notification(payload.title, {
      body: payload.body,
      icon: payload.icon || '/icons/pesaflip-logo.png', // Default icon
      tag: payload.tag,
      data: payload.data,
      requireInteraction: payload.requireInteraction || false,
    });

    // Add event listeners for notification interactions
    notification.onclick = (event) => {
      console.log('Notification clicked:', event);
      window.focus();
      notification.close();
      
      // Handle specific actions based on the notification data
      if (payload.data?.url) {
        window.location.href = payload.data.url;
      }
    };

    notification.onclose = (event) => {
      console.log('Notification closed:', event);
    };

    notification.onerror = (event) => {
      console.error('Notification error:', event);
    };

    return notification;
  } catch (error) {
    console.error('Error showing notification:', error);
    return null;
  }
}

/**
 * Show an invoice creation notification
 * @param invoiceNumber The invoice number
 * @param clientName The client name
 * @param amount The invoice amount
 */
export function showNewInvoiceNotification(
  invoiceNumber: string,
  clientName: string,
  amount: string,
  invoiceId?: string
): Notification | null {
  return showNotification({
    title: 'New Invoice Created',
    body: `Invoice ${invoiceNumber} for ${amount} to ${clientName} has been created.`,
    tag: `invoice-${invoiceNumber}`,
    requireInteraction: false,
    data: {
      type: NotificationType.NEW_INVOICE,
      invoiceId,
      url: invoiceId ? `/dashboard/invoices/${invoiceId}` : '/dashboard/invoices',
    },
  });
}

/**
 * Show a payment reminder notification
 * @param invoiceNumber The invoice number
 * @param clientName The client name
 * @param dueDate The due date
 * @param amount The invoice amount
 * @param isOverdue Whether the invoice is overdue
 */
export function showPaymentReminderNotification(
  invoiceNumber: string,
  clientName: string,
  dueDate: string,
  amount: string,
  isOverdue: boolean = false,
  invoiceId?: string
): Notification | null {
  const title = isOverdue
    ? `OVERDUE: Invoice ${invoiceNumber} Payment Required`
    : `Payment Reminder: Invoice ${invoiceNumber}`;
    
  const body = isOverdue
    ? `Invoice ${invoiceNumber} for ${amount} to ${clientName} was due on ${dueDate} and is now overdue.`
    : `Invoice ${invoiceNumber} for ${amount} to ${clientName} is due on ${dueDate}.`;

  return showNotification({
    title,
    body,
    tag: `payment-reminder-${invoiceNumber}`,
    requireInteraction: isOverdue, // Require interaction for overdue invoices
    data: {
      type: NotificationType.PAYMENT_REMINDER,
      invoiceId,
      isOverdue,
      url: invoiceId ? `/dashboard/invoices/${invoiceId}` : '/dashboard/invoices',
    },
  });
}

/**
 * Show an expense tracking tip notification
 * @param tipTitle The tip title
 * @param tipBody The tip body
 */
export function showExpenseTipNotification(
  tipTitle: string,
  tipBody: string
): Notification | null {
  return showNotification({
    title: `Expense Tip: ${tipTitle}`,
    body: tipBody,
    tag: `expense-tip-${Date.now()}`,
    requireInteraction: false,
    data: {
      type: NotificationType.EXPENSE_TIP,
      url: '/dashboard/expenses',
    },
  });
}

// Predefined expense tips
export const EXPENSE_TIPS = [
  {
    title: 'Track Receipts Promptly',
    body: 'Record expenses as soon as they occur to ensure nothing is missed. Try using the camera upload feature for quick receipt scanning.',
  },
  {
    title: 'Categorize Consistently',
    body: 'Use consistent categories for your expenses to make financial analysis and tax preparation easier.',
  },
  {
    title: 'Review Weekly',
    body: 'Set aside time each week to review expenses and ensure everything is properly categorized.',
  },
  {
    title: 'Separate Business & Personal',
    body: 'Maintain separate accounts for business and personal expenses to simplify accounting and tax preparation.',
  },
  {
    title: 'Use the Mobile App',
    body: 'Track expenses on-the-go with our mobile app to ensure you never miss recording an important business expense.',
  },
];

/**
 * Show a random expense tracking tip notification
 */
export function showRandomExpenseTipNotification(): Notification | null {
  const randomTip = EXPENSE_TIPS[Math.floor(Math.random() * EXPENSE_TIPS.length)];
  return showExpenseTipNotification(randomTip.title, randomTip.body);
}

/**
 * Storage key for notification preferences
 */
const NOTIFICATION_PREFERENCES_KEY = 'pesaflip_notification_preferences';

/**
 * User notification preferences
 */
export interface NotificationPreferences {
  enableNewInvoice: boolean;
  enablePaymentReminders: boolean;
  enableExpenseTips: boolean;
}

/**
 * Default notification preferences
 */
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  enableNewInvoice: true,
  enablePaymentReminders: true,
  enableExpenseTips: true,
};

/**
 * Save notification preferences to local storage
 * @param preferences Notification preferences
 */
export function saveNotificationPreferences(preferences: NotificationPreferences): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(NOTIFICATION_PREFERENCES_KEY, JSON.stringify(preferences));
  }
}

/**
 * Get notification preferences from local storage
 * @returns Notification preferences
 */
export function getNotificationPreferences(): NotificationPreferences {
  if (typeof window === 'undefined') {
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }
  
  const saved = localStorage.getItem(NOTIFICATION_PREFERENCES_KEY);
  if (!saved) {
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }
  
  try {
    return { ...DEFAULT_NOTIFICATION_PREFERENCES, ...JSON.parse(saved) };
  } catch (error) {
    console.error('Error parsing notification preferences:', error);
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }
} 