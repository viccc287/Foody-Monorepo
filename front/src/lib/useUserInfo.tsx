// src/hooks/useUserInfo.ts

import { useState, useEffect } from 'react';
import TokenService from '@/services/tokenService';

export type UserRole = 'manager' | 'cashier' | 'waiter' | 'cook';

export interface UserInfo {
  role?: UserRole;
  email?: string;
  name?: string;
  lastName?: string;
  id?: number;
}

export const rolesMap: Record<UserRole, string> = {
  manager: "Administrador",
  cashier: "Cajero",
  waiter: "Mesero",
  cook: "Cocinero",
};

export const useUserInfo = () => {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(TokenService.getUserInfo());

  useEffect(() => {
    const updatedUserInfo = TokenService.getUserInfo();
    setUserInfo(updatedUserInfo);
  }, []);

  const isRole = (role: UserRole) => userInfo?.role === role;

  const hasAnyRole = (roles: UserRole[]) => {
    if (!userInfo?.role) return false;
    return roles.includes(userInfo.role as UserRole);
  };

  const isElevatedUser = hasAnyRole(['manager', 'cashier']);

  return {
    userInfo,
    isRole,
    hasAnyRole,
    isElevatedUser,
    roleDisplay: userInfo?.role ? rolesMap[userInfo.role as UserRole] : undefined
  };
};