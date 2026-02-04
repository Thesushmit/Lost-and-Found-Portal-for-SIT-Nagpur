import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const Settings = () => {
    const { user, logout } = useAuth();
    const { addNotification, clearAllNotifications } = useNotifications();
    const [saving, setSaving] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    
    // Settings state
    const [settings, setSettings] = useState({
        emailNotifications: true,
        pushNotifications: true,
        itemUpdates: true,
        claimAlerts: true,
        weeklyDigest: false,
        darkMode: false,
        compactView: false,
        autoMarkRead: true
    });

    // Password change state
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [changingPassword, setChangingPassword] = useState(false);

    const handleSettingChange = (key) => {
        setSettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleSaveSettings = async () => {
        try {
            setSaving(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            toast.success('Settings saved successfully!');
            addNotification({
                type: 'success',
                title: 'Settings Updated',
                message: 'Your preferences have been saved.'
            });
        } catch (err) {
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('Passwords do not match!');
            return;
        }
        
        if (passwordForm.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        try {
            setChangingPassword(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            toast.success('Password changed successfully!');
            addNotification({
                type: 'success',
                title: 'Password Changed',
                message: 'Your password has been updated successfully.'
            });
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (err) {
            toast.error('Failed to change password');
        } finally {
            setChangingPassword(false);
        }
    };

    const handleClearNotifications = () => {
        clearAllNotifications();
        toast.success('All notifications cleared!');
    };

    const handleDeleteAccount = async () => {
        // In production, this would call an API to delete the account
        toast.info('Account deletion request submitted. Contact admin for confirmation.');
        setShowDeleteConfirm(false);
    };

    if (!user) {
        return (
            <div className="settings-page">
                <Container>
                    <Alert variant="warning" className="text-center mt-5">
                        Please login to access settings.
                    </Alert>
                </Container>
            </div>
        );
    }

    return (
        <div className="settings-page">
            {/* Header */}
            <section className="settings-header">
                <Container>
                    <div className="settings-header-content">
                        <div className="settings-icon">
                            <i className="bi bi-gear-fill"></i>
                        </div>
                        <div>
                            <h1>Settings</h1>
                            <p>Manage your account preferences and privacy settings</p>
                        </div>
                    </div>
                </Container>
            </section>

            {/* Main Content */}
            <section className="settings-content">
                <Container>
                    <Row>
                        {/* Left Sidebar */}
                        <Col lg={3} className="mb-4">
                            <Card className="settings-nav-card">
                                <Card.Body>
                                    <nav className="settings-nav">
                                        <a href="#notifications" className="settings-nav-item active">
                                            <i className="bi bi-bell"></i>
                                            <span>Notifications</span>
                                        </a>
                                        <a href="#appearance" className="settings-nav-item">
                                            <i className="bi bi-palette"></i>
                                            <span>Appearance</span>
                                        </a>
                                        <a href="#security" className="settings-nav-item">
                                            <i className="bi bi-shield-lock"></i>
                                            <span>Security</span>
                                        </a>
                                        <a href="#privacy" className="settings-nav-item">
                                            <i className="bi bi-eye"></i>
                                            <span>Privacy</span>
                                        </a>
                                        <a href="#danger" className="settings-nav-item text-danger">
                                            <i className="bi bi-exclamation-triangle"></i>
                                            <span>Danger Zone</span>
                                        </a>
                                    </nav>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Main Settings */}
                        <Col lg={9}>
                            {/* Notification Settings */}
                            <Card className="settings-card" id="notifications">
                                <Card.Header>
                                    <h5>
                                        <i className="bi bi-bell me-2"></i>
                                        Notification Preferences
                                    </h5>
                                    <p className="text-muted mb-0">Control how you receive notifications</p>
                                </Card.Header>
                                <Card.Body>
                                    <div className="settings-group">
                                        <div className="setting-item">
                                            <div className="setting-info">
                                                <h6>Email Notifications</h6>
                                                <p>Receive important updates via email</p>
                                            </div>
                                            <Form.Check 
                                                type="switch"
                                                id="emailNotifications"
                                                checked={settings.emailNotifications}
                                                onChange={() => handleSettingChange('emailNotifications')}
                                            />
                                        </div>
                                        <div className="setting-item">
                                            <div className="setting-info">
                                                <h6>Push Notifications</h6>
                                                <p>Receive browser push notifications</p>
                                            </div>
                                            <Form.Check 
                                                type="switch"
                                                id="pushNotifications"
                                                checked={settings.pushNotifications}
                                                onChange={() => handleSettingChange('pushNotifications')}
                                            />
                                        </div>
                                        <div className="setting-item">
                                            <div className="setting-info">
                                                <h6>Item Updates</h6>
                                                <p>Get notified when your items are claimed or updated</p>
                                            </div>
                                            <Form.Check 
                                                type="switch"
                                                id="itemUpdates"
                                                checked={settings.itemUpdates}
                                                onChange={() => handleSettingChange('itemUpdates')}
                                            />
                                        </div>
                                        <div className="setting-item">
                                            <div className="setting-info">
                                                <h6>Claim Alerts</h6>
                                                <p>Notify when someone claims an item you reported</p>
                                            </div>
                                            <Form.Check 
                                                type="switch"
                                                id="claimAlerts"
                                                checked={settings.claimAlerts}
                                                onChange={() => handleSettingChange('claimAlerts')}
                                            />
                                        </div>
                                        <div className="setting-item">
                                            <div className="setting-info">
                                                <h6>Weekly Digest</h6>
                                                <p>Receive a weekly summary of lost items</p>
                                            </div>
                                            <Form.Check 
                                                type="switch"
                                                id="weeklyDigest"
                                                checked={settings.weeklyDigest}
                                                onChange={() => handleSettingChange('weeklyDigest')}
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <Button 
                                            variant="outline-danger" 
                                            size="sm"
                                            onClick={handleClearNotifications}
                                        >
                                            <i className="bi bi-trash me-2"></i>
                                            Clear All Notifications
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>

                            {/* Appearance Settings */}
                            <Card className="settings-card mt-4" id="appearance">
                                <Card.Header>
                                    <h5>
                                        <i className="bi bi-palette me-2"></i>
                                        Appearance
                                    </h5>
                                    <p className="text-muted mb-0">Customize your viewing experience</p>
                                </Card.Header>
                                <Card.Body>
                                    <div className="settings-group">
                                        <div className="setting-item">
                                            <div className="setting-info">
                                                <h6>Dark Mode</h6>
                                                <p>Switch to dark theme for reduced eye strain</p>
                                            </div>
                                            <Form.Check 
                                                type="switch"
                                                id="darkMode"
                                                checked={settings.darkMode}
                                                onChange={() => handleSettingChange('darkMode')}
                                            />
                                        </div>
                                        <div className="setting-item">
                                            <div className="setting-info">
                                                <h6>Compact View</h6>
                                                <p>Show more items with smaller cards</p>
                                            </div>
                                            <Form.Check 
                                                type="switch"
                                                id="compactView"
                                                checked={settings.compactView}
                                                onChange={() => handleSettingChange('compactView')}
                                            />
                                        </div>
                                        <div className="setting-item">
                                            <div className="setting-info">
                                                <h6>Auto-mark as Read</h6>
                                                <p>Automatically mark notifications as read when viewed</p>
                                            </div>
                                            <Form.Check 
                                                type="switch"
                                                id="autoMarkRead"
                                                checked={settings.autoMarkRead}
                                                onChange={() => handleSettingChange('autoMarkRead')}
                                            />
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>

                            {/* Security Settings */}
                            <Card className="settings-card mt-4" id="security">
                                <Card.Header>
                                    <h5>
                                        <i className="bi bi-shield-lock me-2"></i>
                                        Security
                                    </h5>
                                    <p className="text-muted mb-0">Manage your account security</p>
                                </Card.Header>
                                <Card.Body>
                                    <h6 className="mb-3">Change Password</h6>
                                    <Form onSubmit={handlePasswordChange}>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Current Password</Form.Label>
                                                    <Form.Control
                                                        type="password"
                                                        value={passwordForm.currentPassword}
                                                        onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                                                        placeholder="Enter current password"
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>New Password</Form.Label>
                                                    <Form.Control
                                                        type="password"
                                                        value={passwordForm.newPassword}
                                                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                                                        placeholder="Enter new password"
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Confirm New Password</Form.Label>
                                                    <Form.Control
                                                        type="password"
                                                        value={passwordForm.confirmPassword}
                                                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                                                        placeholder="Confirm new password"
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Button type="submit" variant="primary" disabled={changingPassword}>
                                            {changingPassword ? (
                                                <>
                                                    <Spinner size="sm" className="me-2" />
                                                    Changing...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-key me-2"></i>
                                                    Change Password
                                                </>
                                            )}
                                        </Button>
                                    </Form>

                                    <hr className="my-4" />

                                    <h6 className="mb-3">Session Management</h6>
                                    <p className="text-muted">You're currently logged in on this device.</p>
                                    <Button variant="outline-secondary" onClick={logout}>
                                        <i className="bi bi-box-arrow-right me-2"></i>
                                        Logout from this device
                                    </Button>
                                </Card.Body>
                            </Card>

                            {/* Privacy Settings */}
                            <Card className="settings-card mt-4" id="privacy">
                                <Card.Header>
                                    <h5>
                                        <i className="bi bi-eye me-2"></i>
                                        Privacy
                                    </h5>
                                    <p className="text-muted mb-0">Control your privacy settings</p>
                                </Card.Header>
                                <Card.Body>
                                    <div className="privacy-info">
                                        <div className="privacy-item">
                                            <i className="bi bi-check-circle-fill text-success"></i>
                                            <div>
                                                <h6>Your data is secure</h6>
                                                <p>We use industry-standard encryption to protect your information</p>
                                            </div>
                                        </div>
                                        <div className="privacy-item">
                                            <i className="bi bi-check-circle-fill text-success"></i>
                                            <div>
                                                <h6>Email visibility</h6>
                                                <p>Your email is only visible to administrators and item reporters</p>
                                            </div>
                                        </div>
                                        <div className="privacy-item">
                                            <i className="bi bi-check-circle-fill text-success"></i>
                                            <div>
                                                <h6>No third-party sharing</h6>
                                                <p>We never share your personal data with third parties</p>
                                            </div>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>

                            {/* Danger Zone */}
                            <Card className="settings-card danger-card mt-4" id="danger">
                                <Card.Header>
                                    <h5 className="text-danger">
                                        <i className="bi bi-exclamation-triangle me-2"></i>
                                        Danger Zone
                                    </h5>
                                    <p className="text-muted mb-0">Irreversible and destructive actions</p>
                                </Card.Header>
                                <Card.Body>
                                    {!showDeleteConfirm ? (
                                        <div className="danger-action">
                                            <div>
                                                <h6>Delete Account</h6>
                                                <p className="text-muted">Permanently delete your account and all associated data</p>
                                            </div>
                                            <Button 
                                                variant="outline-danger"
                                                onClick={() => setShowDeleteConfirm(true)}
                                            >
                                                Delete Account
                                            </Button>
                                        </div>
                                    ) : (
                                        <Alert variant="danger">
                                            <Alert.Heading>
                                                <i className="bi bi-exclamation-octagon me-2"></i>
                                                Are you sure?
                                            </Alert.Heading>
                                            <p>This action cannot be undone. All your data, including reported items and claims, will be permanently deleted.</p>
                                            <hr />
                                            <div className="d-flex gap-2">
                                                <Button variant="danger" onClick={handleDeleteAccount}>
                                                    Yes, Delete My Account
                                                </Button>
                                                <Button variant="light" onClick={() => setShowDeleteConfirm(false)}>
                                                    Cancel
                                                </Button>
                                            </div>
                                        </Alert>
                                    )}
                                </Card.Body>
                            </Card>

                            {/* Save Button */}
                            <div className="settings-save-bar mt-4">
                                <Button 
                                    variant="primary" 
                                    size="lg" 
                                    onClick={handleSaveSettings}
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <Spinner size="sm" className="me-2" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-check-lg me-2"></i>
                                            Save All Settings
                                        </>
                                    )}
                                </Button>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>
        </div>
    );
};

export default Settings;
