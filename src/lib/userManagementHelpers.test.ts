import { describe, expect, it } from 'vitest';

import { UserProfileRole } from './supabase';
import {
  DEFAULT_NEW_USER_FORM,
  getRoleInfo,
  getUserStatusInfo,
} from './userManagementHelpers';

describe('userManagementHelpers', () => {
  it('provides stable default values for the new-user form', () => {
    expect(DEFAULT_NEW_USER_FORM).toEqual({
      full_name: '',
      email: '',
      password: '',
      phone: '',
      role: UserProfileRole.Operario,
    });
  });

  it('returns role info for canonical and fallback roles', () => {
    expect(getRoleInfo(UserProfileRole.Admin)).toEqual({
      label: 'Admin',
      desc: 'Acceso total',
      color: 'bg-purple-100 text-purple-800',
    });
    expect(getRoleInfo(UserProfileRole.Vendedor)).toEqual({
      label: 'Vendedor',
      desc: 'CRM/Simulador',
      color: 'bg-blue-100 text-blue-800',
    });
    expect(getRoleInfo('usuario')).toEqual({
      label: 'Usuario',
      desc: 'Usuario',
      color: 'bg-gray-100 text-gray-800',
    });
  });

  it('returns the right visual state for active and inactive users', () => {
    expect(getUserStatusInfo(true)).toEqual({
      label: 'Activo',
      color: 'bg-[#10b981]/10 text-[#10b981]',
    });
    expect(getUserStatusInfo(false)).toEqual({
      label: 'Inactivo',
      color: 'bg-gray-500/10 text-gray-400',
    });
  });
});
