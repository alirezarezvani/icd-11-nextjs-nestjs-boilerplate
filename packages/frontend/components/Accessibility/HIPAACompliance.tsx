import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Security as SecurityIcon,
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  Assignment as AssignmentIcon,
  Check as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

interface HIPAAComplianceProps {
  organizationId: string;
  showDetails?: boolean;
}

interface ComplianceCheck {
  id: string;
  category: 'physical' | 'administrative' | 'technical';
  rule: string;
  description: string;
  status: 'compliant' | 'warning' | 'non-compliant';
  details: string;
  lastChecked: Date;
}

export function HIPAACompliance({ organizationId, showDetails = false }: HIPAAComplianceProps) {
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [auditTrail, setAuditTrail] = useState<any[]>([]);

  useEffect(() => {
    loadComplianceData();
  }, [organizationId]);

  const loadComplianceData = async () => {
    try {
      setIsLoading(true);
      
      // In a real implementation, this would fetch from the API
      // const response = await fetch(`/api/organizations/${organizationId}/hipaa-compliance`);
      // const data = await response.json();
      
      // Mock compliance data
      const mockChecks: ComplianceCheck[] = [
        {
          id: 'access-control',
          category: 'technical',
          rule: '§164.312(a)(1) - Access Control',
          description: 'Assign unique user identification, automatic logoff, and encryption',
          status: 'compliant',
          details: 'User authentication implemented with MFA, session timeouts configured',
          lastChecked: new Date(),
        },
        {
          id: 'audit-controls',
          category: 'technical',
          rule: '§164.312(b) - Audit Controls',
          description: 'Hardware, software, and procedures that record access to ePHI',
          status: 'compliant',
          details: 'Comprehensive audit logging implemented for all PHI access',
          lastChecked: new Date(),
        },
        {
          id: 'integrity',
          category: 'technical',
          rule: '§164.312(c)(1) - Integrity',
          description: 'ePHI must not be improperly altered or destroyed',
          status: 'compliant',
          details: 'Data integrity checks and backup procedures in place',
          lastChecked: new Date(),
        },
        {
          id: 'transmission-security',
          category: 'technical',
          rule: '§164.312(e)(1) - Transmission Security',
          description: 'Guard against unauthorized access to ePHI during transmission',
          status: 'compliant',
          details: 'End-to-end encryption for all data transmission',
          lastChecked: new Date(),
        },
        {
          id: 'minimum-necessary',
          category: 'administrative',
          rule: '§164.502(b) - Minimum Necessary',
          description: 'Limit access to minimum necessary PHI for intended purpose',
          status: 'warning',
          details: 'Role-based access implemented, review access permissions quarterly',
          lastChecked: new Date(),
        },
        {
          id: 'workstation-use',
          category: 'physical',
          rule: '§164.310(b) - Workstation Use',
          description: 'Specify proper functions and access controls for workstations',
          status: 'compliant',
          details: 'Workstation security policies enforced, screen locks configured',
          lastChecked: new Date(),
        },
        {
          id: 'device-controls',
          category: 'physical',
          rule: '§164.310(d)(1) - Device and Media Controls',
          description: 'Control receipt, removal, and disposal of hardware and media',
          status: 'compliant',
          details: 'Device inventory tracking and secure disposal procedures',
          lastChecked: new Date(),
        },
      ];

      setComplianceChecks(mockChecks);

      // Mock audit trail
      setAuditTrail([
        {
          timestamp: new Date(),
          action: 'PHI Access',
          user: 'dr.smith@healthcare.com',
          resource: 'Patient Record #12345',
          status: 'Success',
        },
        {
          timestamp: new Date(Date.now() - 3600000),
          action: 'Data Export',
          user: 'nurse.jones@healthcare.com',
          resource: 'ICD-11 Search Results',
          status: 'Success',
        },
      ]);

    } catch (error) {
      console.error('Failed to load compliance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: ComplianceCheck['status']) => {
    switch (status) {
      case 'compliant':
        return <CheckIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'non-compliant':
        return <ErrorIcon color="error" />;
      default:
        return <WarningIcon />;
    }
  };

  const getStatusColor = (status: ComplianceCheck['status']) => {
    switch (status) {
      case 'compliant':
        return 'success';
      case 'warning':
        return 'warning';
      case 'non-compliant':
        return 'error';
      default:
        return 'default';
    }
  };

  const complianceScore = Math.round(
    (complianceChecks.filter(c => c.status === 'compliant').length / complianceChecks.length) * 100
  );

  const criticalIssues = complianceChecks.filter(c => c.status === 'non-compliant').length;
  const warnings = complianceChecks.filter(c => c.status === 'warning').length;

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6">Loading HIPAA Compliance Status...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {/* Compliance Overview */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <SecurityIcon color="primary" />
            <Typography variant="h6">HIPAA Compliance Status</Typography>
            <Chip
              label={`${complianceScore}% Compliant`}
              color={complianceScore >= 95 ? 'success' : complianceScore >= 80 ? 'warning' : 'error'}
              variant="outlined"
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
            <Box>
              <Typography variant="h4" color="success.main">
                {complianceChecks.filter(c => c.status === 'compliant').length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Compliant Rules
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="h4" color="warning.main">
                {warnings}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Warnings
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="h4" color="error.main">
                {criticalIssues}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Critical Issues
              </Typography>
            </Box>
          </Box>

          {criticalIssues > 0 && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Critical HIPAA Compliance Issues Detected
              </Typography>
              <Typography variant="body2">
                There are {criticalIssues} critical compliance issues that require immediate attention
                to maintain HIPAA compliance and protect patient data.
              </Typography>
            </Alert>
          )}

          {warnings > 0 && criticalIssues === 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                HIPAA Compliance Warnings
              </Typography>
              <Typography variant="body2">
                There are {warnings} areas that should be reviewed to maintain optimal HIPAA compliance.
              </Typography>
            </Alert>
          )}

          {showDetails && (
            <Button
              variant="outlined"
              onClick={() => setDetailsOpen(true)}
              startIcon={<AssignmentIcon />}
            >
              View Detailed Report
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Compliance Rules */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            HIPAA Security Rule Compliance
          </Typography>
          
          <List>
            {complianceChecks.map((check) => (
              <ListItem key={check.id} divider>
                <ListItemIcon>
                  {getStatusIcon(check.status)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2">
                        {check.rule}
                      </Typography>
                      <Chip
                        label={check.category}
                        size="small"
                        variant="outlined"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {check.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Status: {check.details}
                      </Typography>
                    </Box>
                  }
                />
                <Chip
                  label={check.status.replace('-', ' ')}
                  size="small"
                  color={getStatusColor(check.status) as any}
                  sx={{ textTransform: 'capitalize' }}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Detailed Report Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AssignmentIcon />
            HIPAA Compliance Detailed Report
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Recent Audit Activity
          </Typography>
          
          <List dense>
            {auditTrail.map((entry, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <VisibilityIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={`${entry.action} - ${entry.resource}`}
                  secondary={`${entry.user} - ${entry.timestamp.toLocaleString()}`}
                />
                <Chip
                  label={entry.status}
                  size="small"
                  color={entry.status === 'Success' ? 'success' : 'error'}
                />
              </ListItem>
            ))}
          </List>

          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="body2">
              This organization maintains comprehensive audit logs for all PHI access and system activities
              as required by HIPAA Security Rule §164.312(b). All activities are logged with user identification,
              timestamps, and action details for compliance monitoring and incident investigation.
            </Typography>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>
            Close
          </Button>
          <Button variant="contained" startIcon={<AssignmentIcon />}>
            Export Report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}