import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const { login, user } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            navigate('/home');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            await login(email, password);
            navigate('/home');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-container">
                <Row className="g-0 login-row">
                    {/* Left Side - Branding */}
                    <Col lg={6} className="login-left d-none d-lg-flex">
                        <div className="login-left-content">
                            <div className="brand-icon">
                                <i className="bi bi-search-heart"></i>
                            </div>
                            <h1>Lost & Found Portal</h1>
                            <p>Help reunite lost items with their owners. Report found items or search for your lost belongings.</p>
                            <div className="features-list">
                                <div className="feature-item">
                                    <i className="bi bi-check-circle-fill"></i>
                                    <span>Report found items easily</span>
                                </div>
                                <div className="feature-item">
                                    <i className="bi bi-check-circle-fill"></i>
                                    <span>Search & filter lost items</span>
                                </div>
                                <div className="feature-item">
                                    <i className="bi bi-check-circle-fill"></i>
                                    <span>Connect with finders</span>
                                </div>
                                <div className="feature-item">
                                    <i className="bi bi-check-circle-fill"></i>
                                    <span>Track item status</span>
                                </div>
                            </div>
                        </div>
                        <div className="login-left-overlay"></div>
                    </Col>

                    {/* Right Side - Login Form */}
                    <Col lg={6} className="login-right">
                        <div className="login-form-container">
                            {/* Mobile Logo */}
                            <div className="mobile-logo d-lg-none">
                                <i className="bi bi-search-heart"></i>
                                <h2>Lost & Found</h2>
                            </div>

                            <div className="login-header">
                                <h2>Welcome Back!</h2>
                                <p>Sign in to continue to your account</p>
                            </div>

                            {error && (
                                <Alert variant="danger" className="error-alert">
                                    <i className="bi bi-exclamation-circle me-2"></i>
                                    {error}
                                </Alert>
                            )}

                            <Form onSubmit={handleSubmit} className="login-form">
                                <Form.Group className="mb-4">
                                    <Form.Label className="form-label-custom">
                                        <i className="bi bi-envelope me-2"></i>Email Address
                                    </Form.Label>
                                    <div className="input-group-custom">
                                        <Form.Control
                                            type="email"
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="form-control-custom"
                                        />
                                    </div>
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label className="form-label-custom">
                                        <i className="bi bi-lock me-2"></i>Password
                                    </Form.Label>
                                    <div className="input-group-custom position-relative">
                                        <Form.Control
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter your password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="form-control-custom"
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                        </button>
                                    </div>
                                </Form.Group>

                                <Button
                                    type="submit"
                                    className="btn-login w-100"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Spinner size="sm" animation="border" className="me-2" />
                                            Signing in...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-box-arrow-in-right me-2"></i>
                                            Sign In
                                        </>
                                    )}
                                </Button>
                            </Form>

                            <div className="login-footer">
                                <p>Don't have an account?</p>
                                <Link to="/signup" className="signup-link">
                                    <i className="bi bi-person-plus me-1"></i>
                                    Create Account
                                </Link>
                            </div>

                            <div className="login-decoration">
                                <div className="decoration-circle circle-1"></div>
                                <div className="decoration-circle circle-2"></div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default Login;
