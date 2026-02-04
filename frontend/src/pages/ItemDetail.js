import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import api from '../api/axios';

const ItemDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addNotification } = useNotifications();
    
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showClaimModal, setShowClaimModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [claiming, setClaiming] = useState(false);
    const [claimData, setClaimData] = useState({
        claimantName: '',
        claimantEmail: '',
        claimantPhone: '',
        claimantId: '',
        ownershipProof: ''
    });

    useEffect(() => {
        fetchItemDetails();
    }, [id]);

    // Pre-fill claim form with user data
    useEffect(() => {
        if (user) {
            setClaimData(prev => ({
                ...prev,
                claimantName: user.name || '',
                claimantEmail: user.email || '',
                claimantId: user.studentId || ''
            }));
        }
    }, [user]);

    const fetchItemDetails = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/items/${id}`);
            setItem(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch item details');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        try {
            await api.put(`/items/${id}`, { status: newStatus });
            fetchItemDetails(); // Refresh to get updated data
            
            // Add notification
            addNotification({
                type: 'status',
                title: 'Status Updated!',
                message: `Item "${item.itemName}" status changed to ${newStatus.toUpperCase()}.`
            });
            
            toast.success(`Status updated to ${newStatus}`);
        } catch (err) {
            toast.error('Failed to update status');
        }
    };

    const handleDelete = async () => {
        try {
            setDeleting(true);
            await api.delete(`/items/${id}`);
            toast.success('Item deleted successfully');
            navigate('/home');
        } catch (err) {
            toast.error('Failed to delete item');
        } finally {
            setDeleting(false);
            setShowDeleteModal(false);
        }
    };

    const handleClaimSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!claimData.claimantName.trim()) {
            toast.error('Please enter your name');
            return;
        }
        if (!claimData.claimantEmail.trim()) {
            toast.error('Please enter your email');
            return;
        }
        if (!claimData.claimantPhone.trim()) {
            toast.error('Please enter your phone number');
            return;
        }
        if (!claimData.ownershipProof.trim()) {
            toast.error('Please describe the item to prove ownership');
            return;
        }
        
        try {
            setClaiming(true);
            const res = await api.post(`/items/${id}/claim`, claimData);
            setItem(res.data.item);
            
            // Add notification
            addNotification({
                type: 'claim',
                title: 'Claim Request Submitted!',
                message: `Your claim for "${item.itemName}" has been submitted. Visit ${item.depositLocation} with your ID.`
            });
            
            toast.success('🎉 Claim request submitted successfully! Please visit the deposit location with your ID.');
            setShowClaimModal(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit claim request');
        } finally {
            setClaiming(false);
        }
    };

    const getStatusBadgeClass = (status) => {
        const classes = {
            available: 'success',
            claimed: 'warning',
            returned: 'secondary'
        };
        return classes[status] || 'secondary';
    };

    const getCategoryIcon = (category) => {
        const icons = {
            electronics: 'bi-laptop',
            documents: 'bi-file-earmark-text',
            accessories: 'bi-watch',
            clothing: 'bi-bag',
            books: 'bi-book',
            others: 'bi-box'
        };
        return icons[category] || 'bi-box';
    };

    const isOwner = user && item && item.uploadedBy && (user.id === item.uploadedBy._id);
    const canModify = isOwner || (user && user.userType === 'staff');

    if (loading) {
        return (
            <div className="item-detail-loading">
                <div className="loading-content">
                    <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
                    <h4 className="mt-4">Loading Item Details...</h4>
                    <p className="text-muted">Please wait while we fetch the information</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="item-detail-error">
                <div className="error-content">
                    <i className="bi bi-exclamation-triangle"></i>
                    <h3>Oops! Something went wrong</h3>
                    <p>{error}</p>
                    <Button variant="primary" size="lg" onClick={() => navigate('/home')}>
                        <i className="bi bi-house me-2"></i>
                        Back to Home
                    </Button>
                </div>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="item-detail-error">
                <div className="error-content">
                    <i className="bi bi-search"></i>
                    <h3>Item Not Found</h3>
                    <p>The item you're looking for doesn't exist or has been removed.</p>
                    <Button variant="primary" size="lg" onClick={() => navigate('/home')}>
                        <i className="bi bi-house me-2"></i>
                        Back to Home
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="item-detail-page">
            {/* Hero Header */}
            <div className="item-detail-hero">
                <Container>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb">
                            <li className="breadcrumb-item">
                                <Link to="/home"><i className="bi bi-house"></i> Home</Link>
                            </li>
                            <li className="breadcrumb-item">
                                <Link to="/items">Found Items</Link>
                            </li>
                            <li className="breadcrumb-item active">{item.itemName}</li>
                        </ol>
                    </nav>
                    <div className="hero-title">
                        <i className={`bi ${getCategoryIcon(item.category)} category-icon`}></i>
                        <div>
                            <h1>{item.itemName}</h1>
                            <div className="hero-badges">
                                <Badge bg={getStatusBadgeClass(item.status)} className="status-badge">
                                    <i className="bi bi-circle-fill me-1"></i>
                                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                </Badge>
                                <Badge bg="light" text="dark" className="category-badge">
                                    <i className={`bi ${getCategoryIcon(item.category)} me-1`}></i>
                                    {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </Container>
            </div>

            <Container className="item-detail-content">
                <Row className="g-4">
                    {/* Image Section */}
                    <Col lg={6}>
                        <div className="image-card">
                            <div className="image-wrapper">
                                <img
                                    src={`http://localhost:5000${item.imageUrl}`}
                                    alt={item.itemName}
                                    className="item-image"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://via.placeholder.com/600x400?text=No+Image+Available';
                                    }}
                                />
                                <div className="image-overlay">
                                    <i className="bi bi-zoom-in"></i>
                                </div>
                            </div>
                            
                            {/* Quick Info Below Image */}
                            <div className="quick-info">
                                <div className="quick-info-item">
                                    <i className="bi bi-calendar-check"></i>
                                    <span>Found on {new Date(item.foundDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                </div>
                                <div className="quick-info-item">
                                    <i className="bi bi-clock"></i>
                                    <span>Listed {Math.floor((new Date() - new Date(item.createdAt)) / (1000 * 60 * 60 * 24))} days ago</span>
                                </div>
                            </div>
                        </div>
                    </Col>

                    {/* Details Section */}
                    <Col lg={6}>
                        <div className="details-card">
                            {/* Description */}
                            <div className="detail-section">
                                <h5 className="section-title">
                                    <i className="bi bi-card-text"></i>
                                    Description
                                </h5>
                                <p className="description-text">{item.description}</p>
                            </div>

                            {/* Location & Time Info */}
                            <div className="detail-section">
                                <h5 className="section-title">
                                    <i className="bi bi-info-circle"></i>
                                    Item Information
                                </h5>
                                <div className="info-grid">
                                    <div className="info-card">
                                        <div className="info-icon location">
                                            <i className="bi bi-geo-alt-fill"></i>
                                        </div>
                                        <div className="info-content">
                                            <span className="info-label">Found Location</span>
                                            <span className="info-value">{item.foundLocation}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="info-card">
                                        <div className="info-icon time">
                                            <i className="bi bi-clock-fill"></i>
                                        </div>
                                        <div className="info-content">
                                            <span className="info-label">Found Time</span>
                                            <span className="info-value">{item.foundTime}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="info-card">
                                        <div className="info-icon deposit">
                                            <i className="bi bi-building-fill"></i>
                                        </div>
                                        <div className="info-content">
                                            <span className="info-label">Deposited At</span>
                                            <span className="info-value">{item.depositLocation}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="info-card">
                                        <div className="info-icon person">
                                            <i className="bi bi-person-fill"></i>
                                        </div>
                                        <div className="info-content">
                                            <span className="info-label">Reported By</span>
                                            <span className="info-value">
                                                {item.uploadedBy?.name || 'Unknown'}
                                                <Badge bg="secondary" className="ms-2" style={{ fontSize: '0.7rem' }}>
                                                    {item.uploadedBy?.userType}
                                                </Badge>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Claim Button - Show only if available */}
                            {item.status === 'available' && (
                                <div className="claim-section">
                                    <Button 
                                        className="claim-btn"
                                        size="lg"
                                        onClick={() => setShowClaimModal(true)}
                                    >
                                        <i className="bi bi-hand-index-thumb me-2"></i>
                                        Claim This Item
                                        <i className="bi bi-arrow-right ms-2"></i>
                                    </Button>
                                    <p className="claim-hint">
                                        <i className="bi bi-shield-check me-1"></i>
                                        You'll need to verify ownership at the deposit location
                                    </p>
                                </div>
                            )}

                            {/* Already Claimed Notice - Show claimant details */}
                            {item.status === 'claimed' && (
                                <div className="claimed-details-section">
                                    <div className="status-notice claimed">
                                        <i className="bi bi-hourglass-split"></i>
                                        <div>
                                            <h6>Item Already Claimed</h6>
                                            <p>This item has been claimed and is pending verification.</p>
                                        </div>
                                    </div>
                                    
                                    {/* Claimant Details - Visible to staff/owner */}
                                    {canModify && item.claimDetails && item.claimDetails.claimantName && (
                                        <div className="claimant-info-card">
                                            <h5 className="section-title">
                                                <i className="bi bi-person-badge"></i>
                                                Claimant Information
                                            </h5>
                                            <div className="claimant-details">
                                                <div className="claimant-row">
                                                    <div className="claimant-item">
                                                        <i className="bi bi-person"></i>
                                                        <div>
                                                            <span className="label">Name</span>
                                                            <span className="value">{item.claimDetails.claimantName}</span>
                                                        </div>
                                                    </div>
                                                    <div className="claimant-item">
                                                        <i className="bi bi-envelope"></i>
                                                        <div>
                                                            <span className="label">Email</span>
                                                            <span className="value">{item.claimDetails.claimantEmail}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="claimant-row">
                                                    <div className="claimant-item">
                                                        <i className="bi bi-telephone"></i>
                                                        <div>
                                                            <span className="label">Phone</span>
                                                            <span className="value">{item.claimDetails.claimantPhone}</span>
                                                        </div>
                                                    </div>
                                                    {item.claimDetails.claimantId && (
                                                        <div className="claimant-item">
                                                            <i className="bi bi-card-text"></i>
                                                            <div>
                                                                <span className="label">Student/Staff ID</span>
                                                                <span className="value">{item.claimDetails.claimantId}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="claimant-row full-width">
                                                    <div className="claimant-item">
                                                        <i className="bi bi-chat-quote"></i>
                                                        <div>
                                                            <span className="label">Ownership Proof Description</span>
                                                            <span className="value proof-text">{item.claimDetails.ownershipProof}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="claimant-row">
                                                    <div className="claimant-item">
                                                        <i className="bi bi-calendar-check"></i>
                                                        <div>
                                                            <span className="label">Claimed At</span>
                                                            <span className="value">
                                                                {new Date(item.claimDetails.claimedAt).toLocaleString('en-US', {
                                                                    dateStyle: 'medium',
                                                                    timeStyle: 'short'
                                                                })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Returned Notice */}
                            {item.status === 'returned' && (
                                <div className="status-notice returned">
                                    <i className="bi bi-check-circle-fill"></i>
                                    <div>
                                        <h6>Item Returned</h6>
                                        <p>This item has been successfully returned to its owner.</p>
                                    </div>
                                </div>
                            )}

                            {/* Admin/Owner Controls */}
                            {canModify && (
                                <div className="admin-controls">
                                    <h5 className="section-title">
                                        <i className="bi bi-gear"></i>
                                        Manage Item
                                    </h5>
                                    <div className="control-buttons">
                                        <div className="status-control">
                                            <label>Update Status:</label>
                                            <select
                                                className="form-select"
                                                value={item.status}
                                                onChange={(e) => handleStatusUpdate(e.target.value)}
                                            >
                                                <option value="available">✅ Available</option>
                                                <option value="claimed">⏳ Claimed</option>
                                                <option value="returned">✔️ Returned</option>
                                            </select>
                                        </div>
                                        <Button 
                                            variant="outline-danger"
                                            className="delete-btn"
                                            onClick={() => setShowDeleteModal(true)}
                                        >
                                            <i className="bi bi-trash me-2"></i>
                                            Delete Item
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Col>
                </Row>

                {/* How to Claim Section */}
                <div className="how-to-claim-section">
                    <h4><i className="bi bi-question-circle me-2"></i>How to Claim Your Item</h4>
                    <Row className="g-4">
                        <Col md={4}>
                            <div className="step-card">
                                <div className="step-number">1</div>
                                <h5>Submit Claim Request</h5>
                                <p>Click the "Claim This Item" button and provide details to prove ownership.</p>
                            </div>
                        </Col>
                        <Col md={4}>
                            <div className="step-card">
                                <div className="step-number">2</div>
                                <h5>Visit Deposit Location</h5>
                                <p>Go to <strong>{item.depositLocation}</strong> with a valid ID proof.</p>
                            </div>
                        </Col>
                        <Col md={4}>
                            <div className="step-card">
                                <div className="step-number">3</div>
                                <h5>Verify & Collect</h5>
                                <p>Staff will verify your identity and ownership, then hand over your item.</p>
                            </div>
                        </Col>
                    </Row>
                </div>

                {/* Back Button */}
                <div className="back-section">
                    <Button variant="outline-secondary" onClick={() => navigate('/home')}>
                        <i className="bi bi-arrow-left me-2"></i>
                        Back to All Items
                    </Button>
                </div>
            </Container>

            {/* Claim Modal */}
            <Modal show={showClaimModal} onHide={() => setShowClaimModal(false)} centered size="lg" className="claim-modal">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="bi bi-hand-index-thumb me-2"></i>
                        Claim This Item - Is This Yours?
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="claim-item-preview">
                        <img 
                            src={`http://localhost:5000${item.imageUrl}`} 
                            alt={item.itemName}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                            }}
                        />
                        <div>
                            <h5>{item.itemName}</h5>
                            <p><i className="bi bi-building me-1"></i> Pick up at: {item.depositLocation}</p>
                        </div>
                    </div>
                    
                    <Alert variant="info" className="mb-4">
                        <i className="bi bi-info-circle me-2"></i>
                        <strong>Important:</strong> Please fill in your details accurately. 
                        You'll need to visit the deposit location with a valid ID for final verification.
                    </Alert>

                    <Form onSubmit={handleClaimSubmit}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label><strong>Your Full Name *</strong></Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter your full name"
                                        value={claimData.claimantName}
                                        onChange={(e) => setClaimData({ ...claimData, claimantName: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label><strong>Your Email *</strong></Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Enter your email address"
                                        value={claimData.claimantEmail}
                                        onChange={(e) => setClaimData({ ...claimData, claimantEmail: e.target.value })}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label><strong>Your Phone Number *</strong></Form.Label>
                                    <Form.Control
                                        type="tel"
                                        placeholder="Enter your phone number"
                                        value={claimData.claimantPhone}
                                        onChange={(e) => setClaimData({ ...claimData, claimantPhone: e.target.value })}
                                        required
                                    />
                                    <Form.Text className="text-muted">
                                        Staff may contact you for verification.
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label><strong>Student/Staff ID</strong></Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter your ID (if applicable)"
                                        value={claimData.claimantId}
                                        onChange={(e) => setClaimData({ ...claimData, claimantId: e.target.value })}
                                    />
                                    <Form.Text className="text-muted">
                                        Optional but helps in verification.
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-4">
                            <Form.Label><strong>Prove This Item is Yours *</strong></Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={4}
                                placeholder="Describe specific details that only the owner would know (e.g., unique marks, contents, purchase date, where you last had it, etc.)"
                                value={claimData.ownershipProof}
                                onChange={(e) => setClaimData({ ...claimData, ownershipProof: e.target.value })}
                                required
                            />
                            <Form.Text className="text-muted">
                                The more specific details you provide, the easier it will be to verify your ownership.
                            </Form.Text>
                        </Form.Group>

                        <div className="d-flex gap-3">
                            <Button variant="secondary" onClick={() => setShowClaimModal(false)} className="flex-fill">
                                Cancel
                            </Button>
                            <Button type="submit" className="claim-submit-btn flex-fill" disabled={claiming}>
                                {claiming ? (
                                    <>
                                        <Spinner size="sm" animation="border" className="me-2" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-check-circle me-2"></i>
                                        Yes, This is Mine - Submit Claim
                                    </>
                                )}
                            </Button>
                        </div>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton className="bg-danger text-white">
                    <Modal.Title>
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        Confirm Delete
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center py-4">
                    <i className="bi bi-trash" style={{ fontSize: '3rem', color: '#dc3545' }}></i>
                    <h5 className="mt-3">Delete "{item.itemName}"?</h5>
                    <p className="text-muted">This action cannot be undone. The item will be permanently removed.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        <i className="bi bi-x me-1"></i>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDelete} disabled={deleting}>
                        {deleting ? (
                            <>
                                <Spinner size="sm" animation="border" className="me-2" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-trash me-1"></i>
                                Yes, Delete
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ItemDetail;
