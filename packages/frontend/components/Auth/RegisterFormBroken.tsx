/**
 * Register Form Component for ICD-11 Healthcare Platform
 * Professional healthcare-focused design with comprehensive validation
 */

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
  MenuItem,
  Chip,
  Stack,
  Divider,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Security,
  Person as PersonIcon,
  MedicalServices,
  Business,
  Assignment,
} from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import { useAuth } from '../../hooks/useAuth';
import { registerSchema, RegisterFormData, calculatePasswordStrength } from './validation';
import { UserRole } from '../../services/auth/auth.types';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
  redirectTo?: string;
}

const PasswordStrengthIndicator: React.FC<{ password: string }> = ({ password }) => {
  const { t } = useTranslation('auth');
  const strength = calculatePasswordStrength(password);

  if (!password) return null;

  const getStrengthColor = () => {
    switch (strength.strength) {
      case 'strong': return 'success';
      case 'good': return 'warning';
      case 'fair': return 'info';
      default: return 'error';
    }
  };

  return (
    <Box sx={{ mt: 1 }}>
      <Typography variant="caption" color="text.secondary">
        {t('auth:password.strength', 'Password Strength:')} 
        <Chip 
          label={strength.strength.toUpperCase()} 
          size="small" 
          color={getStrengthColor()}
          sx={{ ml: 1, fontSize: '0.7rem', height: '20px' }}
        />
      </Typography>
      
      {strength.feedback.length > 0 && (
        <Stack spacing={0.5} sx={{ mt: 0.5 }}>
          {strength.feedback.map((feedback, index) => (
            <Typography 
              key={index} 
              variant="caption" 
              color="text.secondary"
              sx={{ fontSize: '0.75rem' }}
            >
              • {feedback}
            </Typography>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onSwitchToLogin,
  redirectTo = '/dashboard',
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

  const watchedPassword = watch('password');
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
          maxWidth: 600,
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
              {t('auth:register.title', 'Join Healthcare Platform')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('auth:register.subtitle', 'Create your professional healthcare account')}
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Registration Form */}
          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            {/* Name Fields */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('auth:fields.firstName', 'First Name')}
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
                    fullWidth
                    label={t('auth:fields.lastName', 'Last Name')}
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                  />
                )}
              />
            </Box>

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

            {/* Role Field */}
            <Controller
              name="role"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  label={t('auth:fields.role', 'Professional Role')}
                  error={!!errors.role}
                  helperText={errors.role?.message}
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Assignment color="action" />
                      </InputAdornment>
                    ),
                  }}
                >
                  {roleOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            {/* Healthcare Professional Fields */}
            {isHealthcareRole && (
              <>
                <Controller
                  name="organizationId"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      label={t('auth:fields.organizationId', 'Organization ID')}
                      error={!!errors.organizationId}
                      helperText={errors.organizationId?.message || t('auth:fields.organizationHelp', 'Contact your organization administrator for this ID')}
                      sx={{ mb: 3 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Business color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                />

                <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                  <Controller
                    name="licenseNumber"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label={t('auth:fields.licenseNumber', 'License Number')}
                        error={!!errors.licenseNumber}
                        helperText={errors.licenseNumber?.message}
                      />
                    )}
                  />

                  <Controller
                    name="specialization"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label={t('auth:fields.specialization', 'Specialization')}
                        error={!!errors.specialization}
                        helperText={errors.specialization?.message}
                      />
                    )}
                  />
                </Box>
              </>
            )}

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
                  sx={{ mb: 1 }}
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

            <PasswordStrengthIndicator password={watchedPassword} />

            {/* Confirm Password Field */}
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={t('auth:fields.confirmPassword', 'Confirm Password')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  sx={{ mb: 3, mt: 2 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Security color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={handleToggleConfirmPasswordVisibility}
                          edge="end"
                          aria-label="toggle confirm password visibility"
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            {/* Terms and Conditions */}
            <Controller
              name="acceptTerms"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value} />}
                  label={
                    <Typography variant="body2">
                      {t('auth:register.acceptTerms', 'I agree to the Terms and Conditions and Privacy Policy')}
                    </Typography>
                  }
                  sx={{ mb: 3 }}
                />
              )}
            />

            {errors.acceptTerms && (
              <Typography variant="caption" color="error" sx={{ mb: 2, display: 'block' }}>
                {errors.acceptTerms.message}
              </Typography>
            )}

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
                t('auth:actions.createAccount', 'Create Account')
              )}
            </Button>

            {/* Divider */}
            <Divider sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                {t('auth:register.alreadyHaveAccount', 'Already have an account?')}
              </Typography>
            </Divider>

            {/* Switch to Login */}
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={onSwitchToLogin}
              sx={{
                py: 1.5,
                textTransform: 'none',
                fontSize: '1.1rem',
                fontWeight: 600,
              }}
            >
              {t('auth:register.signIn', 'Sign In Instead')}
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

export default RegisterForm;