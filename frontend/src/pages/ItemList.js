import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, InputGroup, Button, Badge, Spinner, Pagination } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const ItemList = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0
    });

    const categories = [
        { value: '', label: 'All Categories' },
        { value: 'electronics', label: 'Electronics' },
        { value: 'documents', label: 'Documents' },
        { value: 'accessories', label: 'Accessories' },
        { value: 'clothing', label: 'Clothing' },
        { value: 'books', label: 'Books' },
        { value: 'others', label: 'Others' }
    ];

    const statuses = [
        { value: '', label: 'All Status' },
        { value: 'available', label: 'Available' },
        { value: 'claimed', label: 'Claimed' },
        { value: 'returned', label: 'Returned' }
    ];

    const fetchItems = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page,
                ...(search && { search }),
                ...(category && { category }),
                ...(status && { status })
            });
            
            const res = await api.get(`/items?${params}`);
            setItems(res.data.items);
            setPagination(res.data.pagination);
        } catch (err) {
            console.error('Error fetching items:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [page, category, status]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchItems();
    };

    const clearFilters = () => {
        setSearch('');
        setCategory('');
        setStatus('');
        setPage(1);
    };

    const getCategoryBadgeClass = (cat) => {
        const classes = {
            electronics: 'primary',
            documents: 'info',
            accessories: 'warning',
            clothing: 'success',
            books: 'secondary',
            others: 'dark'
        };
        return classes[cat] || 'secondary';
    };

    const getStatusBadgeClass = (stat) => {
        const classes = {
            available: 'success',
            claimed: 'warning',
            returned: 'secondary'
        };
        return classes[stat] || 'secondary';
    };

    return (
        <Container className="py-4">
            {/* Header */}
            <div className="text-center mb-4">
                <h1 className="display-5 fw-bold">
                    <i className="bi bi-search me-2"></i>
                    Found Items
                </h1>
                <p className="text-muted">Browse all found items reported by students and staff</p>
            </div>

            {/* Filter Section */}
            <Card className="filter-section mb-4">
                <Card.Body>
                    <Form onSubmit={handleSearch}>
                        <Row className="g-3 align-items-end">
                            <Col md={4}>
                                <Form.Label>Search</Form.Label>
                                <InputGroup>
                                    <Form.Control
                                        type="text"
                                        placeholder="Search items, locations..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                    <Button variant="primary" type="submit">
                                        <i className="bi bi-search"></i>
                                    </Button>
                                </InputGroup>
                            </Col>
                            <Col md={3}>
                                <Form.Label>Category</Form.Label>
                                <Form.Select
                                    value={category}
                                    onChange={(e) => {
                                        setCategory(e.target.value);
                                        setPage(1);
                                    }}
                                >
                                    {categories.map(cat => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Col>
                            <Col md={3}>
                                <Form.Label>Status</Form.Label>
                                <Form.Select
                                    value={status}
                                    onChange={(e) => {
                                        setStatus(e.target.value);
                                        setPage(1);
                                    }}
                                >
                                    {statuses.map(stat => (
                                        <option key={stat.value} value={stat.value}>
                                            {stat.label}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Col>
                            <Col md={2}>
                                <Button variant="outline-secondary" onClick={clearFilters} className="w-100">
                                    <i className="bi bi-x-circle me-1"></i>
                                    Clear
                                </Button>
                            </Col>
                        </Row>
                    </Form>
                </Card.Body>
            </Card>

            {/* Results Count */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <span className="text-muted">
                    Showing {items.length} of {pagination.totalItems} items
                </span>
            </div>

            {/* Items Grid */}
            {loading ? (
                <div className="loading-spinner">
                    <Spinner animation="border" variant="primary" />
                </div>
            ) : items.length === 0 ? (
                <div className="empty-state">
                    <i className="bi bi-inbox"></i>
                    <h4>No Items Found</h4>
                    <p>Try adjusting your filters or search terms</p>
                    <Button variant="primary" onClick={clearFilters}>
                        Clear Filters
                    </Button>
                </div>
            ) : (
                <>
                    <Row xs={1} md={2} lg={3} xl={4} className="g-4">
                        {items.map(item => (
                            <Col key={item._id}>
                                <Card className="item-card h-100">
                                    <Card.Img
                                        variant="top"
                                        src={`http://localhost:5000${item.imageUrl}`}
                                        alt={item.itemName}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                                        }}
                                    />
                                    <Card.Body>
                                        <div className="d-flex justify-content-between align-items-start mb-2">
                                            <Badge bg={getCategoryBadgeClass(item.category)}>
                                                {item.category}
                                            </Badge>
                                            <Badge bg={getStatusBadgeClass(item.status)}>
                                                {item.status}
                                            </Badge>
                                        </div>
                                        <Card.Title>{item.itemName}</Card.Title>
                                        <Card.Text className="text-muted small">
                                            {item.description.length > 80 
                                                ? `${item.description.substring(0, 80)}...` 
                                                : item.description}
                                        </Card.Text>
                                        <div className="small text-muted mb-3">
                                            <div>
                                                <i className="bi bi-geo-alt me-1"></i>
                                                {item.foundLocation}
                                            </div>
                                            <div>
                                                <i className="bi bi-calendar me-1"></i>
                                                {new Date(item.foundDate).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <Link 
                                            to={`/items/${item._id}`} 
                                            className="btn btn-outline-primary w-100"
                                        >
                                            View Details
                                        </Link>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="d-flex justify-content-center mt-4">
                            <Pagination>
                                <Pagination.First 
                                    onClick={() => setPage(1)} 
                                    disabled={page === 1}
                                />
                                <Pagination.Prev 
                                    onClick={() => setPage(page - 1)} 
                                    disabled={page === 1}
                                />
                                {[...Array(pagination.totalPages)].map((_, idx) => (
                                    <Pagination.Item
                                        key={idx + 1}
                                        active={idx + 1 === page}
                                        onClick={() => setPage(idx + 1)}
                                    >
                                        {idx + 1}
                                    </Pagination.Item>
                                ))}
                                <Pagination.Next 
                                    onClick={() => setPage(page + 1)} 
                                    disabled={page === pagination.totalPages}
                                />
                                <Pagination.Last 
                                    onClick={() => setPage(pagination.totalPages)} 
                                    disabled={page === pagination.totalPages}
                                />
                            </Pagination>
                        </div>
                    )}
                </>
            )}
        </Container>
    );
};

export default ItemList;
