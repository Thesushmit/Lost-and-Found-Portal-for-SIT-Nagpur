import React, { useState } from 'react';
import { Form, Button, Card, Container, Row, Col, Alert } from 'react-bootstrap';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const UploadItem = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        itemName: '',
        description: '',
        foundLocation: '',
        foundDate: '',
        foundTime: '',
        depositLocation: '',
        category: 'others'
    });
    const [image, setImage] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');

            const data = new FormData();
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });
            if (image) {
                data.append('image', image);
            }

            await api.post('/items', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to upload item');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-4">
            <Row className="justify-content-center">
                <Col md={8}>
                    <Card>
                        <Card.Body>
                            <h2 className="text-center mb-4">Report Found Item</h2>
                            {error && <Alert variant="danger">{error}</Alert>}
                            <Form onSubmit={handleSubmit}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Item Name</Form.Label>
                                            <Form.Control name="itemName" required onChange={handleChange} />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Category</Form.Label>
                                            <Form.Select name="category" onChange={handleChange}>
                                                <option value="others">Others</option>
                                                <option value="electronics">Electronics</option>
                                                <option value="documents">Documents</option>
                                                <option value="accessories">Accessories</option>
                                                <option value="clothing">Clothing</option>
                                                <option value="books">Books</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control as="textarea" rows={3} name="description" required onChange={handleChange} />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Image Used to Identify</Form.Label>
                                    <Form.Control type="file" required onChange={handleImageChange} accept="image/*" />
                                </Form.Group>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Found Date</Form.Label>
                                            <Form.Control type="date" name="foundDate" required onChange={handleChange} />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Found Time</Form.Label>
                                            <Form.Control type="time" name="foundTime" required onChange={handleChange} />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label>Found Location (Place)</Form.Label>
                                    <Form.Control name="foundLocation" required onChange={handleChange} placeholder="e.g. Library 2nd Floor" />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Deposited At</Form.Label>
                                    <Form.Control name="depositLocation" required onChange={handleChange} placeholder="e.g. Security Office Main Gate" />
                                </Form.Group>

                                <Button disabled={loading} className="w-100" type="submit">
                                    Submit Report
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default UploadItem;
