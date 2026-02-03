import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Spinner, Alert } from 'react-bootstrap';
import api from '../api/axios';

const MyItems = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchMyItems();
    }, []);

    const fetchMyItems = async () => {
        try {
            const res = await api.get('/items/user/my-items');
            setItems(res.data.items);
        } catch (err) {
            setError('Failed to fetch items');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;
        try {
            await api.delete(`/items/${id}`);
            setItems(items.filter(item => item._id !== id));
        } catch (err) {
            alert('Failed to delete item');
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await api.put(`/items/${id}`, { status: newStatus });
            setItems(items.map(item => item._id === id ? { ...item, status: newStatus } : item));
        } catch (err) {
            alert('Failed to update status');
        }
    };

    if (loading) return <Container className="py-4 text-center"><Spinner animation="border" /></Container>;

    return (
        <Container className="py-4">
            <h2 className="mb-4">My Reported Items</h2>
            {error && <Alert variant="danger">{error}</Alert>}

            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Found At</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map(item => (
                        <tr key={item._id}>
                            <td>{item.itemName}</td>
                            <td>{item.foundLocation}</td>
                            <td>
                                <select
                                    className="form-select form-select-sm"
                                    value={item.status}
                                    onChange={(e) => handleStatusUpdate(item._id, e.target.value)}
                                >
                                    <option value="available">Available</option>
                                    <option value="claimed">Claimed</option>
                                    <option value="returned">Returned</option>
                                </select>
                            </td>
                            <td>
                                <Button variant="danger" size="sm" onClick={() => handleDelete(item._id)}>Delete</Button>
                            </td>
                        </tr>
                    ))}
                    {items.length === 0 && (
                        <tr>
                            <td colSpan="4" className="text-center">You haven't reported any items yet.</td>
                        </tr>
                    )}
                </tbody>
            </Table>
        </Container>
    );
};

export default MyItems;
