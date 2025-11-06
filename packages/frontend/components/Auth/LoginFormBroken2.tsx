/**
 * Simple Login Form Component for ICD-11 Healthcare Platform
 */

import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Security,
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useAuth } from '../../hooks/useAuth';
import { loginSchema, LoginFormData } from './validation';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
  redirectTo?: string;
  isModal?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToRegister,
  redirectTo = '/dashboard',
  isModal = false,
}) => {
  const { t } = useTranslation(['common', 'auth']);
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await login(data);
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(redirectTo);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (isModal) {
    return (
      <Box 
        component="form" 
        onSubmit={handleSubmit(onSubmit)} 
        sx={{ 
          p: 4, 
          maxWidth: 400, 
          mx: 'auto',
          backgroundColor: 'white',
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center">
          {t('auth:login.title', 'Welcome Back')}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          {t('auth:login.subtitle', 'Sign in to your ICD-11 Healthcare Platform account')}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              margin="normal"
              required
              fullWidth
              id="email"
              label={t('auth:fields.email', 'Email Address')}
              type="email"
              autoComplete="email"
              autoFocus
              error={!!errors.email}
              helperText={errors.email?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              margin="normal"
              required
              fullWidth
              id="password"
              label={t('auth:fields.password', 'Password')}
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              error={!!errors.password}
              helperText={errors.password?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Security color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={t('auth:actions.togglePassword', 'Toggle password visibility')}
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

        <Controller
          name="rememberMe"
          control={control}
          render={({ field: { value, onChange } }) => (
            <FormControlLabel
              control={
                <Checkbox
                  checked={value}
                  onChange={(e) => onChange(e.target.checked)}
                  color="primary"
                />
              }
              label={t('auth:fields.rememberMe', 'Remember me')}
              sx={{ mt: 1, mb: 2 }}
            />
          )}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={!isValid || isLoading}
          sx={{
            mt: 3,
            mb: 2,
            py: 1.5,
            position: 'relative',
          }}
        >
          {isLoading && (
            <CircularProgress
              size={20}
              sx={{
                position: 'absolute',
                left: '50%',
                marginLeft: '-10px',
              }}
            />
          )}
          {t('auth:actions.signIn', 'Sign In')}
        </Button>

        <Box textAlign="center">
          <Button
            variant="text"
            color="primary"
            onClick={onSwitchToRegister}
            sx={{ textTransform: 'none' }}
          >
            {t('auth:login.noAccount', "Don't have an account? Sign up")}
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1, maxWidth: 400, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        {t('auth:login.title', 'Welcome Back')}
      </Typography>
      
      <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
        {t('auth:login.subtitle', 'Sign in to your ICD-11 Healthcare Platform account')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            margin="normal"
            required
            fullWidth
            id="email"
            label={t('auth:fields.email', 'Email Address')}
            type="email"
            autoComplete="email"
            autoFocus
            error={!!errors.email}
            helperText={errors.email?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        )}
      />

      <Controller
        name="password"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            margin="normal"
            required
            fullWidth
            id="password"
            label={t('auth:fields.password', 'Password')}
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            error={!!errors.password}
            helperText={errors.password?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Security color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={t('auth:actions.togglePassword', 'Toggle password visibility')}
                    onClick={handleTogglePasswordVisibility}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        )}
      />

      <Controller
        name="rememberMe"
        control={control}
        render={({ field: { value, onChange } }) => (
          <FormControlLabel
            control={
              <Checkbox
                checked={value}
                onChange={(e) => onChange(e.target.checked)}
                color="primary"
              />
            }
            label={t('auth:fields.rememberMe', 'Remember me')}
            sx={{ mt: 1, mb: 2 }}
          />
        )}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={!isValid || isLoading}
        sx={{
          mt: 3,
          mb: 2,
          py: 1.5,
          position: 'relative',
        }}
      >
        {isLoading && (
          <CircularProgress
            size={20}
            sx={{
              position: 'absolute',
              left: '50%',
              marginLeft: '-10px',
            }}
          />
        )}
        {t('auth:actions.signIn', 'Sign In')}
      </Button>

      <Box textAlign="center">
        <Button
          variant="text"
          color="primary"
          onClick={onSwitchToRegister}
          sx={{ textTransform: 'none' }}
        >
          {t('auth:login.noAccount', "Don't have an account? Sign up")}
        </Button>
      </Box>
    </Box>
  );
};

export default LoginForm;