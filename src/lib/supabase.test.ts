import { describe, expect, it } from 'vitest';

import { getUserRoleLabel, normalizeUserRole } from './supabase';

describe('supabase role helpers', () => {
  it('normalizes canonical and legacy roles', () => {
    expect(normalizeUserRole('admin')).toBe('admin');
    expect(normalizeUserRole('ADMIN')).toBe('admin');
    expect(normalizeUserRole('operario')).toBe('operario');
    expect(normalizeUserRole('operator')).toBe('operario');
    expect(normalizeUserRole('vendedor')).toBe('vendedor');
    expect(normalizeUserRole('VENTAS')).toBe('vendedor');
  });

  it('returns null for unsupported roles', () => {
    expect(normalizeUserRole('guest')).toBeNull();
    expect(normalizeUserRole(null)).toBeNull();
    expect(normalizeUserRole(undefined)).toBeNull();
  });

  it('maps role labels for UI usage', () => {
    expect(getUserRoleLabel('admin')).toBe('Administrador');
    expect(getUserRoleLabel('operator')).toBe('Operario');
    expect(getUserRoleLabel('VENTAS')).toBe('Vendedor');
    expect(getUserRoleLabel('unknown')).toBe('Usuario');
  });
});
