import { SystemAnnouncement } from './supabase';

export interface AnnouncementFormValues {
  title: string;
  message: string;
  urgency: string;
  target_role: string;
}

export interface AnnouncementUrgencyDisplay {
  containerClass: string;
  iconName: 'alert' | 'bell' | 'info';
}

export const DEFAULT_ANNOUNCEMENT_FORM: AnnouncementFormValues = {
  title: '',
  message: '',
  urgency: 'informative',
  target_role: '',
};

export const buildAnnouncementReadSet = (
  reads: Array<{ announcement_id: string }>,
): Set<string> => {
  return new Set(reads.map((read) => read.announcement_id));
};

export const markAnnouncementRead = (reads: Set<string>, announcementId: string): Set<string> => {
  const next = new Set(reads);
  next.add(announcementId);
  return next;
};

export const getAnnouncementUrgencyDisplay = (urgency: string): AnnouncementUrgencyDisplay => {
  switch (urgency) {
    case 'urgent':
      return { containerClass: 'bg-red-900/30 border-red-500', iconName: 'alert' };
    case 'important':
      return { containerClass: 'bg-yellow-900/30 border-yellow-500', iconName: 'bell' };
    default:
      return { containerClass: 'bg-blue-900/30 border-blue-500', iconName: 'info' };
  }
};

export const isAnnouncementUnread = (reads: Set<string>, announcement: Pick<SystemAnnouncement, 'id'>): boolean => {
  return !reads.has(announcement.id);
};
