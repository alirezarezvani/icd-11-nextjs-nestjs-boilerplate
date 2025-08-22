import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
  CircularProgress,
  Link,
  Divider,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Security,
  MedicalServices,
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useAuth } from '../../hooks/useAuth';
import { loginSchema, LoginFormData } from './validation';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
  redirectTo?: string;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToRegister,
  redirectTo = '/dashboard',
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

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 480,
          width: '100%',
          boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 64,
                height: 64,
                backgroundColor: 'primary.main',
                borderRadius: '50%',
                mb: 2,
              }}
            >
              <MedicalServices sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              {t('auth:login.title', 'Welcome Back')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('auth:login.subtitle', 'Sign in to your ICD-11 Healthcare Platform account')}
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>

            {/* Email Field */}
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={t('auth:fields.email', 'Email Address')}
                  type="email"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  sx={{ mb: 3 }}
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

            {/* Password Field */}
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={t('auth:fields.password', 'Password')}
                  type={showPassword ? 'text' : 'password'}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Security color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleTogglePasswordVisibility}
                          edge="end"
                          aria-label="toggle password visibility"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            {/* Remember Me & Forgot Password */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
              }}
            >
              <Controller
                name="rememberMe"
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={<Checkbox {...field} checked={field.value} />}
                    label={t('auth:fields.rememberMe', 'Remember me')}
                  />
                )}
              />
              <Link
                href="/auth/forgot-password"
                variant="body2"
                sx={{ textDecoration: 'none' }}
              >
                {t('auth:login.forgotPassword', 'Forgot password?')}
              </Link>
            </Box>

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={!isValid || isLoading}
              sx={{
                py: 1.5,
                mb: 3,
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 600,
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                t('auth:actions.signIn', 'Sign In')
              )}
            </Button>

            {/* Divider */}
            <Divider sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                {t('auth:login.newToPlatform', 'New to the platform?')}
              </Typography>
            </Divider>

            {/* Switch to Register */}
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={onSwitchToRegister}
              sx={{
                py: 1.5,
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 600,
              }}
            >
              {t('auth:login.createAccount', 'Create Account')}
            </Button>
          </Box>

          {/* Security Notice */}
          <Box
            sx={{
              mt: 4,
              p: 2,
              backgroundColor: 'grey.50',
              borderRadius: 2,
              textAlign: 'center',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {t('auth:security.notice', '🔒 Your data is protected with enterprise-grade security')}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginForm;