/**
 * Simple Register Form Component for ICD-11 Healthcare Platform
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
  MenuItem,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Security,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useAuth } from '../../hooks/useAuth';
import { registerSchema, RegisterFormData } from './validation';
import { UserRole } from '../../services/auth/auth.types';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
  redirectTo?: string;
  isModal?: boolean;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onSwitchToLogin,
  redirectTo = '/dashboard',
  isModal = false,
}) => {
  const { t } = useTranslation(['common', 'auth']);
  const router = useRouter();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      role: UserRole.USER,
      organizationId: '',
      licenseNumber: '',
      specialization: '',
      acceptTerms: false,
    },
  });

  const watchedRole = watch('role');

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await register(data);
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(redirectTo);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    { value: UserRole.USER, label: t('auth:roles.user', 'General User') },
    { value: UserRole.HEALTHCARE_PROVIDER, label: t('auth:roles.provider', 'Healthcare Provider') },
    { value: UserRole.ORG_ADMIN, label: t('auth:roles.admin', 'Organization Admin') },
  ];

  const isHealthcareRole = watchedRole === UserRole.HEALTHCARE_PROVIDER || watchedRole === UserRole.ORG_ADMIN;

  if (isModal) {
    return (
      <Box 
        component="form" 
        onSubmit={handleSubmit(onSubmit)} 
        sx={{ 
          p: 4, 
          maxWidth: 500, 
          mx: 'auto',
          backgroundColor: 'white',
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          maxHeight: '80vh',
          overflow: 'auto',
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center">
          {t('auth:register.title', 'Create Account')}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          {t('auth:register.subtitle', 'Join our healthcare platform')}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Controller
            name="firstName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                margin="normal"
                required
                fullWidth
                id="firstName"
                label={t('auth:fields.firstName', 'First Name')}
                autoComplete="given-name"
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          <Controller
            name="lastName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                margin="normal"
                required
                fullWidth
                id="lastName"
                label={t('auth:fields.lastName', 'Last Name')}
                autoComplete="family-name"
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
              />
            )}
          />
        </Box>

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
          name="role"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              select
              margin="normal"
              required
              fullWidth
              id="role"
              label={t('auth:fields.role', 'Professional Role')}
              error={!!errors.role}
              helperText={errors.role?.message}
            >
              {roleOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        {isHealthcareRole && (
          <Controller
            name="organizationId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                margin="normal"
                fullWidth
                id="organizationId"
                label={t('auth:fields.organizationId', 'Organization ID (Optional)')}
                error={!!errors.organizationId}
                helperText={errors.organizationId?.message || t('auth:fields.organizationHelp', 'Contact your organization administrator for this ID')}
              />
            )}
          />
        )}

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
              autoComplete="new-password"
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
          name="confirmPassword"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              margin="normal"
              required
              fullWidth
              id="confirmPassword"
              label={t('auth:fields.confirmPassword', 'Confirm Password')}
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Security color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={t('auth:actions.toggleConfirmPassword', 'Toggle confirm password visibility')}
                      onClick={handleToggleConfirmPasswordVisibility}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

        <Controller
          name="acceptTerms"
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
              label={
                <Typography variant="body2">
                  {t('auth:register.agreeToTerms', 'I agree to the')}{' '}
                  <Button variant="text" sx={{ p: 0, textTransform: 'none', textDecoration: 'underline' }}>
                    {t('auth:register.termsAndConditions', 'Terms and Conditions')}
                  </Button>
                </Typography>
              }
              sx={{ mt: 1, mb: 2, alignItems: 'flex-start' }}
            />
          )}
        />

        {errors.acceptTerms && (
          <Typography variant="caption" color="error" sx={{ mb: 1, display: 'block' }}>
            {errors.acceptTerms.message}
          </Typography>
        )}

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
          {t('auth:actions.createAccount', 'Create Account')}
        </Button>

        <Box textAlign="center">
          <Button
            variant="text"
            color="primary"
            onClick={onSwitchToLogin}
            sx={{ textTransform: 'none' }}
          >
            {t('auth:register.hasAccount', 'Already have an account? Sign in')}
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1, maxWidth: 500, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        {t('auth:register.title', 'Create Account')}
      </Typography>
      
      <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
        {t('auth:register.subtitle', 'Join our healthcare platform')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Controller
          name="firstName"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              margin="normal"
              required
              fullWidth
              id="firstName"
              label={t('auth:fields.firstName', 'First Name')}
              autoComplete="given-name"
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

        <Controller
          name="lastName"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              margin="normal"
              required
              fullWidth
              id="lastName"
              label={t('auth:fields.lastName', 'Last Name')}
              autoComplete="family-name"
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
            />
          )}
        />
      </Box>

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
        name="role"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            select
            margin="normal"
            required
            fullWidth
            id="role"
            label={t('auth:fields.role', 'Professional Role')}
            error={!!errors.role}
            helperText={errors.role?.message}
          >
            {roleOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        )}
      />

      {isHealthcareRole && (
        <Controller
          name="organizationId"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              margin="normal"
              fullWidth
              id="organizationId"
              label={t('auth:fields.organizationId', 'Organization ID (Optional)')}
              error={!!errors.organizationId}
              helperText={errors.organizationId?.message || t('auth:fields.organizationHelp', 'Contact your organization administrator for this ID')}
            />
          )}
        />
      )}

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
            autoComplete="new-password"
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
        name="confirmPassword"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            margin="normal"
            required
            fullWidth
            id="confirmPassword"
            label={t('auth:fields.confirmPassword', 'Confirm Password')}
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Security color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={t('auth:actions.toggleConfirmPassword', 'Toggle confirm password visibility')}
                    onClick={handleToggleConfirmPasswordVisibility}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        )}
      />

      <Controller
        name="acceptTerms"
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
            label={
              <Typography variant="body2">
                {t('auth:register.agreeToTerms', 'I agree to the')}{' '}
                <Button variant="text" sx={{ p: 0, textTransform: 'none', textDecoration: 'underline' }}>
                  {t('auth:register.termsAndConditions', 'Terms and Conditions')}
                </Button>
              </Typography>
            }
            sx={{ mt: 1, mb: 2, alignItems: 'flex-start' }}
          />
        )}
      />

      {errors.acceptTerms && (
        <Typography variant="caption" color="error" sx={{ mb: 1, display: 'block' }}>
          {errors.acceptTerms.message}
        </Typography>
      )}

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
        {t('auth:actions.createAccount', 'Create Account')}
      </Button>

      <Box textAlign="center">
        <Button
          variant="text"
          color="primary"
          onClick={onSwitchToLogin}
          sx={{ textTransform: 'none' }}
        >
          {t('auth:register.hasAccount', 'Already have an account? Sign in')}
        </Button>
      </Box>
    </Box>
  );
};

export default RegisterForm;