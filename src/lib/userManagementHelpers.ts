import { getUserRoleLabel, UserProfileRole } from './supabase';

export interface NewUserFormValues {
  full_name: string;
  email: string;
  password: string;
  phone: string;
  role: UserProfileRole;
}

export interface RoleInfo {
  label: string;
  desc: string;
  color: string;
}

export interface UserStatusInfo {
  label: string;
  color: string;
}

export const DEFAULT_NEW_USER_FORM: NewUserFormValues = {
  full_name: '',
  email: '',
  password: '',
  phone: '',
  role: UserProfileRole.Operario,
};

export const getRoleInfo = (role: string): RoleInfo => {
  switch (role) {
    case UserProfileRole.Admin:
      return { label: 'Admin', desc: 'Acceso total', color: 'bg-purple-100 text-purple-800' };
    case UserProfileRole.Vendedor:
      return { label: 'Vendedor', desc: 'CRM/Simulador', color: 'bg-blue-100 text-blue-800' };
    case UserProfileRole.Operario:
      return { label: 'Operario', desc: 'Producción/Inventario', color: 'bg-[#10b981]/10 text-[#10b981]' };
    default:
      return { label: getUserRoleLabel(role), desc: 'Usuario', color: 'bg-gray-100 text-gray-800' };
  }
};

export const getUserStatusInfo = (isActive: boolean): UserStatusInfo => {
  return isActive
    ? { label: 'Activo', color: 'bg-[#10b981]/10 text-[#10b981]' }
    : { label: 'Inactivo', color: 'bg-gray-500/10 text-gray-400' };
};
