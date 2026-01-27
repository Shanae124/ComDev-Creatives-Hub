'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/lib/auth-store';
import { 
  Globe, Mail, Shield, Bell, Palette, Database, 
  Zap, Lock, FileText, Download, Upload, Trash2,
  Save, RefreshCw, CheckCircle2
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface SystemSettings {
  site_name: string;
  site_url: string;
  site_description: string;
  support_email: string;
  timezone: string;
  language: string;
  allow_registration: boolean;
  require_email_verification: boolean;
  maintenance_mode: boolean;
  maintenance_message: string;
  max_upload_size: number;
  session_timeout: number;
  enable_ssl: boolean;
  enable_analytics: boolean;
  analytics_code: string;
}

interface EmailSettings {
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  smtp_encryption: string;
  from_email: string;
  from_name: string;
  test_email: string;
}

interface SecuritySettings {
  password_min_length: number;
  password_require_uppercase: boolean;
  password_require_lowercase: boolean;
  password_require_numbers: boolean;
  password_require_special: boolean;
  max_login_attempts: number;
  lockout_duration: number;
  two_factor_enabled: boolean;
  session_remember_days: number;
}

interface NotificationSettings {
  email_notifications: boolean;
  enrollment_notifications: boolean;
  assignment_notifications: boolean;
  grade_notifications: boolean;
  announcement_notifications: boolean;
  digest_frequency: string;
  push_notifications: boolean;
}

export default function SystemSettingsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    site_name: 'ProtexxaLearn',
    site_url: 'https://protexxalearn.com',
    site_description: 'Enterprise Learning Management System',
    support_email: 'support@protexxalearn.com',
    timezone: 'America/New_York',
    language: 'en',
    allow_registration: true,
    require_email_verification: true,
    maintenance_mode: false,
    maintenance_message: 'Site is under maintenance. Please check back soon.',
    max_upload_size: 500,
    session_timeout: 480,
    enable_ssl: true,
    enable_analytics: false,
    analytics_code: ''
  });

  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    smtp_host: '',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    smtp_encryption: 'tls',
    from_email: 'noreply@protexxalearn.com',
    from_name: 'ProtexxaLearn',
    test_email: ''
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    password_min_length: 8,
    password_require_uppercase: true,
    password_require_lowercase: true,
    password_require_numbers: true,
    password_require_special: true,
    max_login_attempts: 5,
    lockout_duration: 15,
    two_factor_enabled: false,
    session_remember_days: 30
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email_notifications: true,
    enrollment_notifications: true,
    assignment_notifications: true,
    grade_notifications: true,
    announcement_notifications: true,
    digest_frequency: 'daily',
    push_notifications: false
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const token = authStore.getState().token;
      const response = await fetch('http://localhost:3001/api/settings/system', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.system) setSystemSettings(data.system);
        if (data.email) setEmailSettings(data.email);
        if (data.security) setSecuritySettings(data.security);
        if (data.notifications) setNotificationSettings(data.notifications);
      }
    } catch (error) {
      console.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSystemSettings = async () => {
    setSaving(true);
    try {
      const token = authStore.getState().token;
      const response = await fetch('http://localhost:3001/api/settings/system', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(systemSettings)
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'System settings saved successfully'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save system settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const saveEmailSettings = async () => {
    setSaving(true);
    try {
      const token = authStore.getState().token;
      const response = await fetch('http://localhost:3001/api/settings/email', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(emailSettings)
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Email settings saved successfully'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save email settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const testEmailConnection = async () => {
    if (!emailSettings.test_email) {
      toast({
        title: 'Error',
        description: 'Please enter a test email address',
        variant: 'destructive'
      });
      return;
    }

    setTesting(true);
    try {
      const token = authStore.getState().token;
      const response = await fetch('http://localhost:3001/api/settings/email/test', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          ...emailSettings, 
          test_email: emailSettings.test_email 
        })
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Test email sent successfully! Check your inbox.'
        });
      } else {
        throw new Error('Test failed');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send test email',
        variant: 'destructive'
      });
    } finally {
      setTesting(false);
    }
  };

  const saveSecuritySettings = async () => {
    setSaving(true);
    try {
      const token = authStore.getState().token;
      const response = await fetch('http://localhost:3001/api/settings/security', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(securitySettings)
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Security settings saved successfully'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save security settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const saveNotificationSettings = async () => {
    setSaving(true);
    try {
      const token = authStore.getState().token;
      const response = await fetch('http://localhost:3001/api/settings/notifications', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(notificationSettings)
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Notification settings saved successfully'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save notification settings',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const clearCache = async () => {
    try {
      const token = authStore.getState().token;
      await fetch('http://localhost:3001/api/settings/cache/clear', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      toast({
        title: 'Success',
        description: 'Cache cleared successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clear cache',
        variant: 'destructive'
      });
    }
  };

  const exportSettings = async () => {
    try {
      const token = authStore.getState().token;
      const response = await fetch('http://localhost:3001/api/settings/export', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `protexxalearn-settings-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: 'Success',
          description: 'Settings exported successfully'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export settings',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return <div className="p-8">Loading settings...</div>;
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground mt-2">
            Configure global system settings and preferences
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={exportSettings}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={clearCache}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Clear Cache
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">
            <Globe className="w-4 h-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="w-4 h-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <Zap className="w-4 h-4 mr-2" />
            Advanced
          </TabsTrigger>
        </TabsList>

        {/* GENERAL SETTINGS */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Site Information</CardTitle>
              <CardDescription>Basic site configuration and branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="site_name">Site Name *</Label>
                  <Input
                    id="site_name"
                    value={systemSettings.site_name}
                    onChange={(e) => setSystemSettings({ ...systemSettings, site_name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="site_url">Site URL *</Label>
                  <Input
                    id="site_url"
                    value={systemSettings.site_url}
                    onChange={(e) => setSystemSettings({ ...systemSettings, site_url: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="site_description">Site Description</Label>
                <Textarea
                  id="site_description"
                  value={systemSettings.site_description}
                  onChange={(e) => setSystemSettings({ ...systemSettings, site_description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="support_email">Support Email</Label>
                  <Input
                    id="support_email"
                    type="email"
                    value={systemSettings.support_email}
                    onChange={(e) => setSystemSettings({ ...systemSettings, support_email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select 
                    value={systemSettings.timezone}
                    onValueChange={(value) => setSystemSettings({ ...systemSettings, timezone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Registration & Access</CardTitle>
              <CardDescription>User registration and access controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Public Registration</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow users to self-register for accounts
                  </p>
                </div>
                <Switch
                  checked={systemSettings.allow_registration}
                  onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, allow_registration: checked })}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Email Verification</Label>
                  <p className="text-sm text-muted-foreground">
                    Users must verify their email before accessing the system
                  </p>
                </div>
                <Switch
                  checked={systemSettings.require_email_verification}
                  onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, require_email_verification: checked })}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="session_timeout">Session Timeout (minutes)</Label>
                <Input
                  id="session_timeout"
                  type="number"
                  min="15"
                  max="1440"
                  value={systemSettings.session_timeout}
                  onChange={(e) => setSystemSettings({ ...systemSettings, session_timeout: parseInt(e.target.value) })}
                />
                <p className="text-sm text-muted-foreground">
                  Automatically log out inactive users after this duration
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Maintenance Mode</CardTitle>
              <CardDescription>Enable maintenance mode to prevent access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Disable site access for all users except admins
                  </p>
                </div>
                <Switch
                  checked={systemSettings.maintenance_mode}
                  onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, maintenance_mode: checked })}
                />
              </div>

              {systemSettings.maintenance_mode && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="maintenance_message">Maintenance Message</Label>
                    <Textarea
                      id="maintenance_message"
                      value={systemSettings.maintenance_message}
                      onChange={(e) => setSystemSettings({ ...systemSettings, maintenance_message: e.target.value })}
                      rows={3}
                      placeholder="Site is under maintenance..."
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={saveSystemSettings} disabled={saving}>
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save General Settings
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        {/* EMAIL SETTINGS */}
        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SMTP Configuration</CardTitle>
              <CardDescription>Configure email delivery settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp_host">SMTP Host *</Label>
                  <Input
                    id="smtp_host"
                    value={emailSettings.smtp_host}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtp_host: e.target.value })}
                    placeholder="smtp.gmail.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp_port">SMTP Port *</Label>
                  <Input
                    id="smtp_port"
                    type="number"
                    value={emailSettings.smtp_port}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtp_port: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp_username">SMTP Username</Label>
                  <Input
                    id="smtp_username"
                    value={emailSettings.smtp_username}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtp_username: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smtp_password">SMTP Password</Label>
                  <Input
                    id="smtp_password"
                    type="password"
                    value={emailSettings.smtp_password}
                    onChange={(e) => setEmailSettings({ ...emailSettings, smtp_password: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtp_encryption">Encryption</Label>
                <Select 
                  value={emailSettings.smtp_encryption}
                  onValueChange={(value) => setEmailSettings({ ...emailSettings, smtp_encryption: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="tls">TLS</SelectItem>
                    <SelectItem value="ssl">SSL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Email From Settings</CardTitle>
              <CardDescription>Configure sender information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="from_email">From Email *</Label>
                  <Input
                    id="from_email"
                    type="email"
                    value={emailSettings.from_email}
                    onChange={(e) => setEmailSettings({ ...emailSettings, from_email: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="from_name">From Name *</Label>
                  <Input
                    id="from_name"
                    value={emailSettings.from_name}
                    onChange={(e) => setEmailSettings({ ...emailSettings, from_name: e.target.value })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Email</CardTitle>
              <CardDescription>Send a test email to verify settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="test_email">Test Email Address</Label>
                  <Input
                    id="test_email"
                    type="email"
                    value={emailSettings.test_email}
                    onChange={(e) => setEmailSettings({ ...emailSettings, test_email: e.target.value })}
                    placeholder="test@example.com"
                  />
                </div>
                <Button 
                  onClick={testEmailConnection}
                  disabled={testing}
                  className="self-end"
                >
                  {testing ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Test
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={saveEmailSettings} disabled={saving}>
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Email Settings
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        {/* SECURITY SETTINGS */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Password Policy</CardTitle>
              <CardDescription>Configure password requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password_min_length">Minimum Password Length</Label>
                <Input
                  id="password_min_length"
                  type="number"
                  min="6"
                  max="32"
                  value={securitySettings.password_min_length}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, password_min_length: parseInt(e.target.value) })}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Require Uppercase Letters</Label>
                  <Switch
                    checked={securitySettings.password_require_uppercase}
                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, password_require_uppercase: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Require Lowercase Letters</Label>
                  <Switch
                    checked={securitySettings.password_require_lowercase}
                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, password_require_lowercase: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Require Numbers</Label>
                  <Switch
                    checked={securitySettings.password_require_numbers}
                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, password_require_numbers: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Require Special Characters</Label>
                  <Switch
                    checked={securitySettings.password_require_special}
                    onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, password_require_special: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Login Security</CardTitle>
              <CardDescription>Protect against brute force attacks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="max_login_attempts">Max Login Attempts</Label>
                  <Input
                    id="max_login_attempts"
                    type="number"
                    min="3"
                    max="10"
                    value={securitySettings.max_login_attempts}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, max_login_attempts: parseInt(e.target.value) })}
                  />
                  <p className="text-sm text-muted-foreground">
                    Lock account after this many failed attempts
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lockout_duration">Lockout Duration (minutes)</Label>
                  <Input
                    id="lockout_duration"
                    type="number"
                    min="5"
                    max="60"
                    value={securitySettings.lockout_duration}
                    onChange={(e) => setSecuritySettings({ ...securitySettings, lockout_duration: parseInt(e.target.value) })}
                  />
                  <p className="text-sm text-muted-foreground">
                    How long to lock the account
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Require 2FA for all users
                  </p>
                </div>
                <Switch
                  checked={securitySettings.two_factor_enabled}
                  onCheckedChange={(checked) => setSecuritySettings({ ...securitySettings, two_factor_enabled: checked })}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="session_remember_days">Remember Me Duration (days)</Label>
                <Input
                  id="session_remember_days"
                  type="number"
                  min="1"
                  max="90"
                  value={securitySettings.session_remember_days}
                  onChange={(e) => setSecuritySettings({ ...securitySettings, session_remember_days: parseInt(e.target.value) })}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={saveSecuritySettings} disabled={saving}>
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Security Settings
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        {/* NOTIFICATION SETTINGS */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Configure which events trigger email notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable email notifications globally
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.email_notifications}
                  onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, email_notifications: checked })}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Enrollment Notifications</Label>
                  <Switch
                    checked={notificationSettings.enrollment_notifications}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, enrollment_notifications: checked })}
                    disabled={!notificationSettings.email_notifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Assignment Notifications</Label>
                  <Switch
                    checked={notificationSettings.assignment_notifications}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, assignment_notifications: checked })}
                    disabled={!notificationSettings.email_notifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Grade Notifications</Label>
                  <Switch
                    checked={notificationSettings.grade_notifications}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, grade_notifications: checked })}
                    disabled={!notificationSettings.email_notifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label>Announcement Notifications</Label>
                  <Switch
                    checked={notificationSettings.announcement_notifications}
                    onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, announcement_notifications: checked })}
                    disabled={!notificationSettings.email_notifications}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="digest_frequency">Digest Frequency</Label>
                <Select 
                  value={notificationSettings.digest_frequency}
                  onValueChange={(value) => setNotificationSettings({ ...notificationSettings, digest_frequency: value })}
                  disabled={!notificationSettings.email_notifications}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="realtime">Real-time</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  How often to send notification digests
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Push Notifications</CardTitle>
              <CardDescription>Browser push notifications for real-time updates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable browser push notifications
                  </p>
                </div>
                <Switch
                  checked={notificationSettings.push_notifications}
                  onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, push_notifications: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={saveNotificationSettings} disabled={saving}>
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Notification Settings
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        {/* ADVANCED SETTINGS */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Resources</CardTitle>
              <CardDescription>Configure system resource limits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="max_upload_size">Max Upload Size (MB)</Label>
                <Input
                  id="max_upload_size"
                  type="number"
                  min="1"
                  max="1000"
                  value={systemSettings.max_upload_size}
                  onChange={(e) => setSystemSettings({ ...systemSettings, max_upload_size: parseInt(e.target.value) })}
                />
                <p className="text-sm text-muted-foreground">
                  Maximum file size for uploads (SCORM, documents, etc.)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>Configure analytics and tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Analytics</Label>
                  <p className="text-sm text-muted-foreground">
                    Track user activity and generate insights
                  </p>
                </div>
                <Switch
                  checked={systemSettings.enable_analytics}
                  onCheckedChange={(checked) => setSystemSettings({ ...systemSettings, enable_analytics: checked })}
                />
              </div>

              {systemSettings.enable_analytics && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="analytics_code">Analytics Code (Google Analytics, etc.)</Label>
                    <Textarea
                      id="analytics_code"
                      value={systemSettings.analytics_code}
                      onChange={(e) => setSystemSettings({ ...systemSettings, analytics_code: e.target.value })}
                      rows={4}
                      placeholder="Paste your tracking code here..."
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cache Management</CardTitle>
              <CardDescription>Manage system cache and performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Clear System Cache</Label>
                  <p className="text-sm text-muted-foreground">
                    Clear all cached data to improve performance
                  </p>
                </div>
                <Button variant="outline" onClick={clearCache}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Cache
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Backup & Export</CardTitle>
              <CardDescription>Export settings for backup or migration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Export All Settings</Label>
                  <p className="text-sm text-muted-foreground">
                    Download all system settings as JSON
                  </p>
                </div>
                <Button variant="outline" onClick={exportSettings}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
