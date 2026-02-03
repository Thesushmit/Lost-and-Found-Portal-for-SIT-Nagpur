import React, { useState } from 'react';
import { Form, Button, Card, Container, Alert, Tab, Tabs } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Signup = () => {
    const { signupStudent, signupStaff } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [key, setKey] = useState('student');

    // Student State
    const [studentData, setStudentData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        studentId: '',
        semester: ''
    });

    // Staff State
    const [staffData, setStaffData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        department: ''
    });

    const handleStudentChange = (e) => {
        setStudentData({ ...studentData, [e.target.name]: e.target.value });
    };

    const handleStaffChange = (e) => {
        setStaffData({ ...staffData, [e.target.name]: e.target.value });
    };

    const handleStudentSubmit = async (e) => {
        e.preventDefault();
        if (studentData.password !== studentData.confirmPassword) {
            return setError('Passwords do not match');
        }
        try {
            setError('');
            setLoading(true);
            await signupStudent({
                email: studentData.email,
                password: studentData.password,
                name: studentData.name,
                studentId: studentData.studentId,
                semester: studentData.semester
            });
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create student account');
        } finally {
            setLoading(false);
        }
    };

    const handleStaffSubmit = async (e) => {
        e.preventDefault();
        if (staffData.password !== staffData.confirmPassword) {
            return setError('Passwords do not match');
        }
        try {
            setError('');
            setLoading(true);
            await signupStaff({
                email: staffData.email,
                password: staffData.password,
                name: staffData.name,
                department: staffData.department
            });
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create staff account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "80vh", paddingTop: "20px", paddingBottom: "20px" }}>
            <div className="w-100" style={{ maxWidth: "500px" }}>
                <Card>
                    <Card.Body>
                        <h2 className="text-center mb-4">Sign Up</h2>
                        {error && <Alert variant="danger">{error}</Alert>}

                        <Tabs
                            id="signup-tabs"
                            activeKey={key}
                            onSelect={(k) => { setKey(k); setError(''); }}
                            className="mb-3"
                            fill
                        >
                            <Tab eventKey="student" title="Student">
                                <Form onSubmit={handleStudentSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Full Name</Form.Label>
                                        <Form.Control name="name" type="text" required onChange={handleStudentChange} />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control name="email" type="email" required onChange={handleStudentChange} />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Student ID</Form.Label>
                                        <Form.Control name="studentId" type="text" required onChange={handleStudentChange} />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Semester</Form.Label>
                                        <Form.Control name="semester" type="number" min="1" max="8" required onChange={handleStudentChange} />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Password</Form.Label>
                                        <Form.Control name="password" type="password" required minLength="6" onChange={handleStudentChange} />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Confirm Password</Form.Label>
                                        <Form.Control name="confirmPassword" type="password" required minLength="6" onChange={handleStudentChange} />
                                    </Form.Group>
                                    <Button disabled={loading} className="w-100" type="submit">Sign Up as Student</Button>
                                </Form>
                            </Tab>

                            <Tab eventKey="staff" title="Staff">
                                <Form onSubmit={handleStaffSubmit}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Full Name</Form.Label>
                                        <Form.Control name="name" type="text" required onChange={handleStaffChange} />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Email</Form.Label>
                                        <Form.Control name="email" type="email" required onChange={handleStaffChange} />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Department</Form.Label>
                                        <Form.Control name="department" type="text" required onChange={handleStaffChange} />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Password</Form.Label>
                                        <Form.Control name="password" type="password" required minLength="6" onChange={handleStaffChange} />
                                    </Form.Group>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Confirm Password</Form.Label>
                                        <Form.Control name="confirmPassword" type="password" required minLength="6" onChange={handleStaffChange} />
                                    </Form.Group>
                                    <Button disabled={loading} className="w-100" type="submit">Sign Up as Staff</Button>
                                </Form>
                            </Tab>
                        </Tabs>
                    </Card.Body>
                </Card>
                <div className="w-100 text-center mt-2">
                    Already have an account? <Link to="/login">Log In</Link>
                </div>
            </div>
        </Container>
    );
};

export default Signup;
