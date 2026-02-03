import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner, Container } from 'react-bootstrap';

const PrivateRoute = () => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <Container className="d-flex justify-content-center mt-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </Container>
        );
    }

    return user ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
