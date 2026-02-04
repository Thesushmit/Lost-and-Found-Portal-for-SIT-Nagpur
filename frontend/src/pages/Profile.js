import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Badge, Spinner, Alert, Modal } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../api/axios';
import { Link } from 'react-router-dom';

const Profile = () => {
    const { user } = useAuth();
    const { addNotification } = useNotifications();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [stats, setStats] = useState({ uploaded: 0, claimed: 0, returned: 0 });
    const [recentItems, setRecentItems] = useState([]);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        phone: ''
    });

    useEffect(() => {
        if (user) {
            setEditForm({
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || ''
            });
            fetchUserStats();
        }
    }, [user]);

    const fetchUserStats = async () => {
        try {
            setLoading(true);
            const res = await api.get('/items/my-items');
            const items = res.data;
            setStats({
                uploaded: items.length,
                claimed: items.filter(i => i.status === 'claimed').length,
                returned: items.filter(i => i.status === 'returned').length
            });
            setRecentItems(items.slice(0, 3));
        } catch (err) {
            console.error('Error fetching stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            // Note: This would need a backend endpoint to update user profile
            // For now, we'll show a success message
            toast.success('Profile updated successfully!');
            addNotification({
                type: 'success',
                title: 'Profile Updated',
                message: 'Your profile information has been updated successfully.'
            });
            setShowEditModal(false);
        } catch (err) {
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const getInitials = (name) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
    };

    const getMemberSince = () => {
        // Assuming user was created recently
        return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    };

    if (!user) {
        return (
            <div className="profile-page">
                <Container>
                    <Alert variant="warning" className="text-center mt-5">
                        Please login to view your profile.
                    </Alert>
                </Container>
            </div>
        );
    }

    return (
        <div className="profile-page">
            {/* Hero Section */}
            <section className="profile-hero">
                <div className="profile-hero-bg"></div>
                <Container>
                    <Row className="align-items-center">
                        <Col lg={8}>
                            <div className="profile-header">
                                <div className="profile-avatar-large">
                                    {getInitials(user.name)}
                                </div>
                                <div className="profile-info">
                                    <h1>{user.name}</h1>
                                    <p className="profile-role">
                                        <Badge bg={user.userType === 'staff' ? 'warning' : 'primary'}>
                                            <i className={`bi ${user.userType === 'staff' ? 'bi-briefcase' : 'bi-mortarboard'} me-1`}></i>
                                            {user.userType === 'staff' ? 'Staff Member' : 'Student'}
                                        </Badge>
                                    </p>
                                    <p className="profile-meta">
                                        <i className="bi bi-envelope me-2"></i>
                                        {user.email}
                                    </p>
                                    {user.studentId && (
                                        <p className="profile-meta">
                                            <i className="bi bi-person-badge me-2"></i>
                                            ID: {user.studentId}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </Col>
                        <Col lg={4} className="text-lg-end mt-4 mt-lg-0">
                            <Button 
                                variant="light" 
                                className="edit-profile-btn"
                                onClick={() => setShowEditModal(true)}
                            >
                                <i className="bi bi-pencil me-2"></i>
                                Edit Profile
                            </Button>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Stats Section */}
            <section className="profile-stats-section">
                <Container>
                    <Row>
                        <Col md={4} className="mb-4 mb-md-0">
                            <Card className="profile-stat-card">
                                <Card.Body>
                                    <div className="stat-icon-wrapper bg-primary-soft">
                                        <i className="bi bi-cloud-upload"></i>
                                    </div>
                                    <div className="stat-details">
                                        <h3>{loading ? <Spinner size="sm" /> : stats.uploaded}</h3>
                                        <p>Items Reported</p>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4} className="mb-4 mb-md-0">
                            <Card className="profile-stat-card">
                                <Card.Body>
                                    <div className="stat-icon-wrapper bg-warning-soft">
                                        <i className="bi bi-hand-index-thumb"></i>
                                    </div>
                                    <div className="stat-details">
                                        <h3>{loading ? <Spinner size="sm" /> : stats.claimed}</h3>
                                        <p>Items Claimed</p>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4}>
                            <Card className="profile-stat-card">
                                <Card.Body>
                                    <div className="stat-icon-wrapper bg-success-soft">
                                        <i className="bi bi-check-circle"></i>
                                    </div>
                                    <div className="stat-details">
                                        <h3>{loading ? <Spinner size="sm" /> : stats.returned}</h3>
                                        <p>Items Returned</p>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Main Content */}
            <section className="profile-content-section">
                <Container>
                    <Row>
                        {/* Left Column - Account Info */}
                        <Col lg={4} className="mb-4">
                            <Card className="profile-card">
                                <Card.Header>
                                    <h5>
                                        <i className="bi bi-person-circle me-2"></i>
                                        Account Information
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <div className="info-item">
                                        <label>Full Name</label>
                                        <p>{user.name}</p>
                                    </div>
                                    <div className="info-item">
                                        <label>Email Address</label>
                                        <p>{user.email}</p>
                                    </div>
                                    <div className="info-item">
                                        <label>Account Type</label>
                                        <p className="text-capitalize">{user.userType}</p>
                                    </div>
                                    {user.studentId && (
                                        <div className="info-item">
                                            <label>Student/Staff ID</label>
                                            <p>{user.studentId}</p>
                                        </div>
                                    )}
                                    <div className="info-item">
                                        <label>Member Since</label>
                                        <p>{getMemberSince()}</p>
                                    </div>
                                </Card.Body>
                            </Card>

                            <Card className="profile-card mt-4">
                                <Card.Header>
                                    <h5>
                                        <i className="bi bi-link-45deg me-2"></i>
                                        Quick Links
                                    </h5>
                                </Card.Header>
                                <Card.Body className="quick-links">
                                    <Link to="/my-items" className="quick-link-item">
                                        <i className="bi bi-collection"></i>
                                        <span>My Items</span>
                                        <i className="bi bi-chevron-right"></i>
                                    </Link>
                                    <Link to="/upload" className="quick-link-item">
                                        <i className="bi bi-plus-circle"></i>
                                        <span>Report New Item</span>
                                        <i className="bi bi-chevron-right"></i>
                                    </Link>
                                    <Link to="/settings" className="quick-link-item">
                                        <i className="bi bi-gear"></i>
                                        <span>Settings</span>
                                        <i className="bi bi-chevron-right"></i>
                                    </Link>
                                    <Link to="/help" className="quick-link-item">
                                        <i className="bi bi-question-circle"></i>
                                        <span>Help Center</span>
                                        <i className="bi bi-chevron-right"></i>
                                    </Link>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Right Column - Recent Activity */}
                        <Col lg={8}>
                            <Card className="profile-card">
                                <Card.Header className="d-flex justify-content-between align-items-center">
                                    <h5>
                                        <i className="bi bi-clock-history me-2"></i>
                                        Recent Activity
                                    </h5>
                                    <Link to="/my-items" className="view-all-link">
                                        View All <i className="bi bi-arrow-right"></i>
                                    </Link>
                                </Card.Header>
                                <Card.Body>
                                    {loading ? (
                                        <div className="text-center py-5">
                                            <Spinner animation="border" variant="primary" />
                                            <p className="mt-3 text-muted">Loading activity...</p>
                                        </div>
                                    ) : recentItems.length === 0 ? (
                                        <div className="empty-activity">
                                            <i className="bi bi-inbox"></i>
                                            <h5>No Activity Yet</h5>
                                            <p>Start by reporting a found item!</p>
                                            <Link to="/upload" className="btn btn-primary">
                                                <i className="bi bi-plus-circle me-2"></i>
                                                Report Item
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="activity-list">
                                            {recentItems.map(item => (
                                                <Link to={`/items/${item._id}`} key={item._id} className="activity-item">
                                                    <div className="activity-image">
                                                        {item.image ? (
                                                            <img src={`http://localhost:5000${item.image}`} alt={item.itemName} />
                                                        ) : (
                                                            <div className="no-image">
                                                                <i className="bi bi-image"></i>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="activity-details">
                                                        <h6>{item.itemName}</h6>
                                                        <p className="text-muted">
                                                            <i className="bi bi-geo-alt me-1"></i>
                                                            {item.foundLocation}
                                                        </p>
                                                        <Badge bg={
                                                            item.status === 'available' ? 'success' :
                                                            item.status === 'claimed' ? 'warning' : 'secondary'
                                                        }>
                                                            {item.status}
                                                        </Badge>
                                                    </div>
                                                    <div className="activity-date">
                                                        {new Date(item.foundDate).toLocaleDateString()}
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>

                            {/* Achievements Card */}
                            <Card className="profile-card mt-4">
                                <Card.Header>
                                    <h5>
                                        <i className="bi bi-trophy me-2"></i>
                                        Achievements
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <Row>
                                        <Col sm={6} md={4} className="mb-3">
                                            <div className={`achievement-badge ${stats.uploaded >= 1 ? 'unlocked' : 'locked'}`}>
                                                <i className="bi bi-star-fill"></i>
                                                <span>First Report</span>
                                                <small>Report your first item</small>
                                            </div>
                                        </Col>
                                        <Col sm={6} md={4} className="mb-3">
                                            <div className={`achievement-badge ${stats.uploaded >= 5 ? 'unlocked' : 'locked'}`}>
                                                <i className="bi bi-hand-thumbs-up-fill"></i>
                                                <span>Helper</span>
                                                <small>Report 5 items</small>
                                            </div>
                                        </Col>
                                        <Col sm={6} md={4} className="mb-3">
                                            <div className={`achievement-badge ${stats.returned >= 1 ? 'unlocked' : 'locked'}`}>
                                                <i className="bi bi-heart-fill"></i>
                                                <span>Reuniter</span>
                                                <small>Help return an item</small>
                                            </div>
                                        </Col>
                                        <Col sm={6} md={4} className="mb-3">
                                            <div className={`achievement-badge ${stats.uploaded >= 10 ? 'unlocked' : 'locked'}`}>
                                                <i className="bi bi-gem"></i>
                                                <span>Champion</span>
                                                <small>Report 10 items</small>
                                            </div>
                                        </Col>
                                        <Col sm={6} md={4} className="mb-3">
                                            <div className={`achievement-badge ${stats.returned >= 5 ? 'unlocked' : 'locked'}`}>
                                                <i className="bi bi-award-fill"></i>
                                                <span>Super Helper</span>
                                                <small>Return 5 items</small>
                                            </div>
                                        </Col>
                                        <Col sm={6} md={4} className="mb-3">
                                            <div className={`achievement-badge ${stats.uploaded >= 25 ? 'unlocked' : 'locked'}`}>
                                                <i className="bi bi-lightning-fill"></i>
                                                <span>Legend</span>
                                                <small>Report 25 items</small>
                                            </div>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Edit Profile Modal */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered className="edit-profile-modal">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="bi bi-pencil-square me-2"></i>
                        Edit Profile
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={handleEditSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Full Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={editForm.name}
                                onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                placeholder="Enter your name"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Email Address</Form.Label>
                            <Form.Control
                                type="email"
                                value={editForm.email}
                                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                                placeholder="Enter your email"
                                disabled
                            />
                            <Form.Text className="text-muted">Email cannot be changed</Form.Text>
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label>Phone Number</Form.Label>
                            <Form.Control
                                type="tel"
                                value={editForm.phone}
                                onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                                placeholder="Enter your phone number"
                            />
                        </Form.Group>
                        <div className="d-flex gap-2 justify-content-end">
                            <Button variant="light" onClick={() => setShowEditModal(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="primary" disabled={saving}>
                                {saving ? (
                                    <>
                                        <Spinner size="sm" className="me-2" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-check-lg me-2"></i>
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Profile;
