import { describe, expect, it } from 'vitest';

import {
  buildAnnouncementReadSet,
  DEFAULT_ANNOUNCEMENT_FORM,
  getAnnouncementUrgencyDisplay,
  isAnnouncementUnread,
  markAnnouncementRead,
} from './announcementHelpers';

describe('announcementHelpers', () => {
  it('provides stable default announcement form values', () => {
    expect(DEFAULT_ANNOUNCEMENT_FORM).toEqual({
      title: '',
      message: '',
      urgency: 'informative',
      target_role: '',
    });
  });

  it('builds and updates the announcement read set immutably', () => {
    const reads = buildAnnouncementReadSet([
      { announcement_id: 'a-1' },
      { announcement_id: 'a-2' },
    ]);

    expect(Array.from(reads)).toEqual(['a-1', 'a-2']);
    expect(Array.from(markAnnouncementRead(reads, 'a-3'))).toEqual(['a-1', 'a-2', 'a-3']);
    expect(Array.from(reads)).toEqual(['a-1', 'a-2']);
  });

  it('maps urgency levels and unread state correctly', () => {
    expect(getAnnouncementUrgencyDisplay('urgent')).toEqual({
      containerClass: 'bg-red-900/30 border-red-500',
      iconName: 'alert',
    });
    expect(getAnnouncementUrgencyDisplay('important')).toEqual({
      containerClass: 'bg-yellow-900/30 border-yellow-500',
      iconName: 'bell',
    });
    expect(getAnnouncementUrgencyDisplay('informative')).toEqual({
      containerClass: 'bg-blue-900/30 border-blue-500',
      iconName: 'info',
    });
    expect(isAnnouncementUnread(new Set(['a-1']), { id: 'a-2' })).toBe(true);
    expect(isAnnouncementUnread(new Set(['a-1']), { id: 'a-1' })).toBe(false);
  });
});
