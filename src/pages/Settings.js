import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from 'react-hot-toast';
import { Save, Settings as SettingsIcon, Mail, ShieldAlert, Server, ToggleLeft, ToggleRight } from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    notification_email: '',
    enable_email_notifications: false,
    sender_email: '',
    smtp_host: '',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    smtp_secure: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.getNotificationSettings();
      if (response.data && response.data.success) {
        // Retain empty string if password comes masked
        const fetchedData = response.data.data;
        setSettings({
          ...fetchedData,
          smtp_password: fetchedData.smtp_password === '••••••••' ? '' : fetchedData.smtp_password
        });
      } else {
        toast.error('Failed to parse settings data');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings from server');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value, 10) || 0 : value
    }));
  };

  const handleToggleChange = (name) => {
    setSettings(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      // Clean request payload: don't send dummy password values
      const payload = { ...settings };
      if (payload.smtp_password === '') {
        delete payload.smtp_password; // Let backend retain existing password
      }

      const response = await settingsAPI.updateNotificationSettings(payload);
      if (response.data && response.data.success) {
        toast.success('Notification settings saved successfully');
        // Update state with new details
        const fetchedData = response.data.data;
        setSettings({
          ...fetchedData,
          smtp_password: '' // Mask input field again
        });
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(error.response?.data?.error || 'An error occurred while saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading notification settings..." />;
  }

  return (
    <div className="dashboard-page">
      <div className="container-sm">
        <div className="page-header">
          <div className="page-header-content">
            <div className="page-title-section">
              <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <SettingsIcon size={28} />
                <span>Notification Setup</span>
              </h1>
              <p className="page-description">
                Configure your system notification settings, email alerts, and SMTP server rules.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* General Notifications Card */}
          <div className="card">
            <h3 className="form-section-title">
              <Mail size={20} />
              General Notification Rules
            </h3>
            
            <div className="form-group" style={{ marginBottom: 'var(--space-6)' }}>
              <div 
                onClick={() => handleToggleChange('enable_email_notifications')}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--gray-50)',
                  border: '1px solid var(--gray-200)',
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--gray-900)' }}>Email Alerts on New Enquiry</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--gray-600)', marginTop: '2px' }}>
                    Send an automatic notification email to the admin when a visitor submits a contact/enquiry form.
                  </div>
                </div>
                <div>
                  {settings.enable_email_notifications ? (
                    <ToggleRight size={44} style={{ color: 'var(--primary-600)' }} />
                  ) : (
                    <ToggleLeft size={44} style={{ color: 'var(--gray-400)' }} />
                  )}
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label form-label-required">Recipient Notification Email</label>
              <input
                type="email"
                name="notification_email"
                value={settings.notification_email}
                onChange={handleInputChange}
                className="form-input"
                placeholder="admin@goldensuccessksa.com"
                required={settings.enable_email_notifications}
              />
              <small style={{ color: 'var(--gray-500)', marginTop: '4px', display: 'block' }}>
                The email address where visitor enquiry reports will be forwarded.
              </small>
            </div>
          </div>

          {/* SMTP Server Configuration Card */}
          <div className="card">
            <h3 className="form-section-title">
              <Server size={20} />
              SMTP Mailing Server Setup
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: 'var(--space-6)' }}>
              Configure your custom SMTP settings to enable the backend to send outbound notification emails.
            </p>

            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">SMTP Host Server</label>
                <input
                  type="text"
                  name="smtp_host"
                  value={settings.smtp_host}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="smtp.gmail.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label">SMTP Port</label>
                <input
                  type="number"
                  name="smtp_port"
                  value={settings.smtp_port}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="587"
                />
              </div>
            </div>

            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Sender Email Address (From)</label>
                <input
                  type="email"
                  name="sender_email"
                  value={settings.sender_email}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="noreply@goldensuccessksa.com"
                />
              </div>

              <div className="form-group">
                <label className="form-label">SMTP Authentication Username</label>
                <input
                  type="text"
                  name="smtp_username"
                  value={settings.smtp_username}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="user@gmail.com"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">SMTP Password</label>
              <input
                type="password"
                name="smtp_password"
                value={settings.smtp_password}
                onChange={handleInputChange}
                className="form-input"
                placeholder="••••••••••••••••"
              />
              <small style={{ color: 'var(--gray-500)', marginTop: '4px', display: 'block' }}>
                Leave empty to retain the previously configured SMTP password.
              </small>
            </div>

            <div className="form-group" style={{ marginTop: 'var(--space-4)', marginBottom: 0 }}>
              <div 
                onClick={() => handleToggleChange('smtp_secure')}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--gray-50)',
                  border: '1px solid var(--gray-200)',
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', color: 'var(--gray-900)' }}>
                    <ShieldAlert size={16} style={{ color: 'var(--primary-600)' }} />
                    <span>Use SSL/TLS Connection (Port 465)</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--gray-600)', marginTop: '2px' }}>
                    Enable if your SMTP provider explicitly mandates a secure SSL/TLS connection (commonly port 465). Standard TLS (port 587) will use STARTTLS automatically.
                  </div>
                </div>
                <div>
                  {settings.smtp_secure ? (
                    <ToggleRight size={44} style={{ color: 'var(--primary-600)' }} />
                  ) : (
                    <ToggleLeft size={44} style={{ color: 'var(--gray-400)' }} />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions" style={{ borderTop: 'none', paddingTop: 0 }}>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={saving}
              style={{ minWidth: '160px' }}
            >
              {saving ? (
                <>
                  <div className="spinner"></div>
                  <span>Saving Setup...</span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  <span>Save Notification Setup</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
