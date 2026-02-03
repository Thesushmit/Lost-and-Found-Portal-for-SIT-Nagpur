import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navigation = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Hide navbar on login and signup pages
    const hideNavbarPaths = ['/login', '/signup', '/'];
    if (hideNavbarPaths.includes(location.pathname)) {
        return null;
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
            <Container>
                <Navbar.Brand as={Link} to="/home">
                    <i className="bi bi-search-heart me-2"></i>
                    Lost & Found
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="ms-auto">
                        <Nav.Link as={Link} to="/home">Home</Nav.Link>

                        {user ? (
                            <>
                                <Nav.Link as={Link} to="/upload">Report Found Item</Nav.Link>
                                <Nav.Link as={Link} to="/my-items">My Items</Nav.Link>
                                <NavDropdown title={user.name} id="basic-nav-dropdown">
                                    <NavDropdown.Item disabled>
                                        {user.userType === 'student' ? `Student ID: ${user.studentId}` : `Dept: ${user.department}`}
                                    </NavDropdown.Item>
                                    <NavDropdown.Divider />
                                    <NavDropdown.Item onClick={handleLogout}>
                                        <i className="bi bi-box-arrow-right me-2"></i>
                                        Logout
                                    </NavDropdown.Item>
                                </NavDropdown>
                            </>
                        ) : (
                            <>
                                <Nav.Link as={Link} to="/login">Login</Nav.Link>
                                <Nav.Link as={Link} to="/signup">Signup</Nav.Link>
                            </>
                        )}
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default Navigation;
