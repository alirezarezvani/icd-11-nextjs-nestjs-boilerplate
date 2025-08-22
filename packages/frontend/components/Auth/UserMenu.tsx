import React, { useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Divider,
  ListItemIcon,
  Chip,
  alpha,
} from '@mui/material';
import {
  Person as PersonIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Dashboard as DashboardIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../services/auth/auth.types';

interface UserMenuProps {
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
  onDashboardClick?: () => void;
}

const getRoleColor = (role: UserRole): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (role) {
    case UserRole.SUPER_ADMIN:
      return 'error';
    case UserRole.ORG_ADMIN:
      return 'warning';
    case UserRole.HEALTHCARE_PROVIDER:
      return 'info';
    default:
      return 'default';
  }
};

const getRoleLabel = (role: UserRole, t: any): string => {
  switch (role) {
    case UserRole.SUPER_ADMIN:
      return t('auth:roles.superAdmin', 'Super Admin');
    case UserRole.ORG_ADMIN:
      return t('auth:roles.admin', 'Organization Admin');
    case UserRole.HEALTHCARE_PROVIDER:
      return t('auth:roles.provider', 'Healthcare Provider');
    default:
      return t('auth:roles.user', 'User');
  }
};

export const UserMenu: React.FC<UserMenuProps> = ({
  onProfileClick,
  onSettingsClick,
  onDashboardClick,
}) => {
  const { t } = useTranslation(['common', 'auth']);
  const { user, logout, logoutAll } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatches
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
  };

  const handleLogoutAll = async () => {
    handleMenuClose();
    await logoutAll();
  };

  const handleMenuItemClick = (action?: () => void) => {
    handleMenuClose();
    action?.();
  };

  if (!user || !isMounted) return null;

  const userInitials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();

  return (
    <Box>
      <IconButton
        onClick={handleMenuOpen}
        sx={{
          p: 0,
          backgroundColor: alpha('#fff', 0.1),
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          '&:hover': {
            backgroundColor: alpha('#fff', 0.2),
          },
        }}
      >
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: 'primary.main',
            fontSize: '1rem',
            fontWeight: 600,
          }}
        >
          {userInitials}
        </Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 280,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px',
            boxShadow: '0 16px 32px rgba(0, 0, 0, 0.1)',
          },
        }}
      >
        {/* User Info Header */}
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle1" fontWeight={600}>
            {user.firstName} {user.lastName}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {user.email}
          </Typography>
          <Chip
            label={getRoleLabel(user.role, t)}
            color={getRoleColor(user.role)}
            size="small"
            variant="outlined"
          />
        </Box>

        <Divider />

        {/* Menu Items */}
        {user.role !== UserRole.USER && (
          <MenuItem onClick={() => handleMenuItemClick(onDashboardClick)}>
            <ListItemIcon>
              <DashboardIcon fontSize="small" />
            </ListItemIcon>
            {t('common:navigation.dashboard', 'Dashboard')}
          </MenuItem>
        )}

        <MenuItem onClick={() => handleMenuItemClick(onProfileClick)}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          {t('common:navigation.profile', 'Profile')}
        </MenuItem>

        <MenuItem onClick={() => handleMenuItemClick(onSettingsClick)}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          {t('common:navigation.settings', 'Settings')}
        </MenuItem>

        <Divider />

        {/* Security Section */}
        <MenuItem onClick={handleLogoutAll}>
          <ListItemIcon>
            <SecurityIcon fontSize="small" />
          </ListItemIcon>
          {t('auth:actions.logoutAll', 'Sign out all devices')}
        </MenuItem>

        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          {t('auth:actions.logout', 'Sign out')}
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default UserMenu;