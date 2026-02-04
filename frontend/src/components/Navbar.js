import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, NavDropdown, Badge, Dropdown } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const Navigation = () => {
    const { user, logout } = useAuth();
    const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotification } = useNotifications();
    const navigate = useNavigate();
    const location = useLocation();
    const [scrolled, setScrolled] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);

    // Scroll effect - MUST be before any conditional returns
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Hide navbar on login and signup pages
    const hideNavbarPaths = ['/login', '/signup', '/'];
    if (hideNavbarPaths.includes(location.pathname)) {
        return null;
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const getNotificationIcon = (type) => {
        switch(type) {
            case 'upload': return 'bi-cloud-upload-fill';
            case 'claim': return 'bi-hand-index-thumb-fill';
            case 'status': return 'bi-info-circle-fill';
            case 'success': return 'bi-check-circle-fill';
            default: return 'bi-bell-fill';
        }
    };

    const getNotificationColor = (type) => {
        switch(type) {
            case 'upload': return '#667eea';
            case 'claim': return '#f59e0b';
            case 'status': return '#3b82f6';
            case 'success': return '#10b981';
            default: return '#6b7280';
        }
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <Navbar 
            className={`navbar-custom ${scrolled ? 'navbar-scrolled' : ''}`} 
            expand="lg" 
            sticky="top"
        >
            <Container>
                <Navbar.Brand as={Link} to="/home" className="navbar-brand-custom">
                    <div className="brand-logo">
                        <i className="bi bi-search-heart"></i>
                    </div>
                    <div className="brand-text">
                        <span className="brand-name">Lost & Found</span>
                        <span className="brand-tagline">SIT Nagpur</span>
                    </div>
                </Navbar.Brand>

                <Navbar.Toggle aria-controls="navbar-nav" className="navbar-toggler-custom">
                    <span className="toggler-icon"></span>
                </Navbar.Toggle>

                <Navbar.Collapse id="navbar-nav">
                    <Nav className="mx-auto nav-center">
                        <Nav.Link 
                            as={Link} 
                            to="/home" 
                            className={`nav-link-custom ${isActive('/home') ? 'active' : ''}`}
                        >
                            <i className="bi bi-house-door"></i>
                            <span>Home</span>
                        </Nav.Link>
                        
                        {user && (
                            <>
                                <Nav.Link 
                                    as={Link} 
                                    to="/upload" 
                                    className={`nav-link-custom ${isActive('/upload') ? 'active' : ''}`}
                                >
                                    <i className="bi bi-cloud-upload"></i>
                                    <span>Report Item</span>
                                </Nav.Link>
                                <Nav.Link 
                                    as={Link} 
                                    to="/my-items" 
                                    className={`nav-link-custom ${isActive('/my-items') ? 'active' : ''}`}
                                >
                                    <i className="bi bi-collection"></i>
                                    <span>My Items</span>
                                </Nav.Link>
                            </>
                        )}
                    </Nav>

                    <Nav className="nav-right">
                        {user ? (
                            <>
                                {/* Notification Bell with Dropdown */}
                                <Dropdown 
                                    show={showNotifications} 
                                    onToggle={(isOpen) => setShowNotifications(isOpen)}
                                    align="end"
                                    className="notification-dropdown"
                                >
                                    <Dropdown.Toggle as="div" className="notification-wrapper">
                                        <button className="notification-btn">
                                            <i className="bi bi-bell"></i>
                                            {unreadCount > 0 && (
                                                <Badge bg="danger" className="notification-badge">
                                                    {unreadCount > 9 ? '9+' : unreadCount}
                                                </Badge>
                                            )}
                                        </button>
                                    </Dropdown.Toggle>

                                    <Dropdown.Menu className="notification-menu">
                                        <div className="notification-header">
                                            <h6>
                                                <i className="bi bi-bell-fill me-2"></i>
                                                Notifications
                                            </h6>
                                            {unreadCount > 0 && (
                                                <button 
                                                    className="mark-all-read"
                                                    onClick={markAllAsRead}
                                                >
                                                    Mark all as read
                                                </button>
                                            )}
                                        </div>
                                        
                                        <div className="notification-list">
                                            {notifications.length === 0 ? (
                                                <div className="no-notifications">
                                                    <i className="bi bi-bell-slash"></i>
                                                    <p>No notifications yet</p>
                                                </div>
                                            ) : (
                                                notifications.slice(0, 5).map(notification => (
                                                    <div 
                                                        key={notification.id}
                                                        className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                                        onClick={() => markAsRead(notification.id)}
                                                    >
                                                        <div 
                                                            className="notification-icon"
                                                            style={{ background: getNotificationColor(notification.type) }}
                                                        >
                                                            <i className={`bi ${getNotificationIcon(notification.type)}`}></i>
                                                        </div>
                                                        <div className="notification-content">
                                                            <p className="notification-title">{notification.title}</p>
                                                            <p className="notification-message">{notification.message}</p>
                                                            <span className="notification-time">
                                                                {formatTime(notification.timestamp)}
                                                            </span>
                                                        </div>
                                                        <button 
                                                            className="notification-close"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                clearNotification(notification.id);
                                                            }}
                                                        >
                                                            <i className="bi bi-x"></i>
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        {notifications.length > 5 && (
                                            <div className="notification-footer">
                                                <span>+{notifications.length - 5} more notifications</span>
                                            </div>
                                        )}
                                    </Dropdown.Menu>
                                </Dropdown>

                                {/* User Dropdown */}
                                <NavDropdown 
                                    title={
                                        <div className="user-dropdown-trigger">
                                            <div className="user-avatar">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="user-info">
                                                <span className="user-name">{user.name}</span>
                                                <span className="user-role">
                                                    {user.userType === 'student' ? 'Student' : 'Staff'}
                                                </span>
                                            </div>
                                            <i className="bi bi-chevron-down"></i>
                                        </div>
                                    } 
                                    id="user-dropdown"
                                    className="user-dropdown"
                                    align="end"
                                >
                                    <div className="dropdown-header-custom">
                                        <div className="dropdown-avatar">
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="dropdown-user-info">
                                            <strong>{user.name}</strong>
                                            <small>{user.email}</small>
                                        </div>
                                    </div>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item as={Link} to="/profile" className="dropdown-item-custom">
                                        <i className="bi bi-person"></i>
                                        <span>My Profile</span>
                                    </NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/settings" className="dropdown-item-custom">
                                        <i className="bi bi-gear"></i>
                                        <span>Settings</span>
                                    </NavDropdown.Item>
                                    <NavDropdown.Item as={Link} to="/help" className="dropdown-item-custom">
                                        <i className="bi bi-question-circle"></i>
                                        <span>Help Center</span>
                                    </NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item 
                                        onClick={handleLogout}
                                        className="dropdown-item-custom logout-item"
                                    >
                                        <i className="bi bi-box-arrow-right"></i>
                                        <span>Logout</span>
                                    </NavDropdown.Item>
                                </NavDropdown>
                            </>
                        ) : (
                            <div className="auth-buttons">
                                <Link to="/login" className="btn-login-nav">
                                    Sign In
                                </Link>
                                <Link to="/signup" className="btn-signup-nav">
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Navigation;
