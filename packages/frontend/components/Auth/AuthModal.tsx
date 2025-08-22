import React, { useState } from 'react';
import { Dialog } from '@mui/material';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

export type AuthModalMode = 'login' | 'register';

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  initialMode?: AuthModalMode;
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  open,
  onClose,
  initialMode = 'login',
  onSuccess,
}) => {
  const [mode, setMode] = useState<AuthModalMode>(initialMode);

  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    } else {
      onClose();
    }
  };

  const switchToLogin = () => setMode('login');
  const switchToRegister = () => setMode('register');

  // Reset mode when modal is opened/closed
  React.useEffect(() => {
    if (open) {
      setMode(initialMode);
    }
  }, [open, initialMode]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          backgroundColor: 'transparent',
          boxShadow: 'none',
          overflow: 'visible',
          padding: 0,
        },
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
      }}
    >
      {mode === 'login' ? (
        <LoginForm
          onSuccess={handleSuccess}
          onSwitchToRegister={switchToRegister}
          isModal={true}
        />
      ) : (
        <RegisterForm
          onSuccess={handleSuccess}
          onSwitchToLogin={switchToLogin}
          isModal={true}
        />
      )}
    </Dialog>
  );
};

export default AuthModal;