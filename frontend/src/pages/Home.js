import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, InputGroup, Button, Badge, Spinner, Carousel } from 'react-bootstrap';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [stats, setStats] = useState({ total: 0, available: 0, returned: 0 });

    const categories = [
        { value: '', label: 'All Categories', icon: 'bi-grid' },
        { value: 'electronics', label: 'Electronics', icon: 'bi-laptop' },
        { value: 'documents', label: 'Documents', icon: 'bi-file-earmark-text' },
        { value: 'accessories', label: 'Accessories', icon: 'bi-watch' },
        { value: 'clothing', label: 'Clothing', icon: 'bi-bag' },
        { value: 'books', label: 'Books', icon: 'bi-book' },
        { value: 'others', label: 'Others', icon: 'bi-three-dots' }
    ];

    const fetchItems = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams({
                page,
                ...(search && { search }),
                ...(category && { category })
            });
            const res = await api.get(`/items?${params}`);
            setItems(res.data.items);
            setTotalPages(res.data.pagination.totalPages);
            setStats({
                total: res.data.pagination.totalItems,
                available: res.data.items.filter(i => i.status === 'available').length,
                returned: res.data.items.filter(i => i.status === 'returned').length
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [page, category]);

    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1);
        fetchItems();
    };

    const getCategoryIcon = (cat) => {
        const found = categories.find(c => c.value === cat);
        return found ? found.icon : 'bi-box';
    };

    return (
        <div className="home-page">
            {/* Hero Carousel Section */}
            <section className="hero-carousel-section">
                <Carousel fade interval={4000} className="hero-carousel">
                    <Carousel.Item>
                        <div className="carousel-slide slide-1">
                            <div className="carousel-overlay"></div>
                            <div className="carousel-content">
                                <h1>
                                    <i className="bi bi-search-heart me-3"></i>
                                    Lost & Found Portal
                                </h1>
                                <p>Helping reunite lost items with their owners. Your trusted campus lost and found service.</p>
                                <div className="carousel-buttons">
                                    <Link to="/upload" className="btn btn-light btn-lg me-3">
                                        <i className="bi bi-plus-circle me-2"></i>
                                        Report Found Item
                                    </Link>
                                    <a href="#items-section" className="btn btn-outline-light btn-lg">
                                        <i className="bi bi-search me-2"></i>
                                        Browse Items
                                    </a>
                                </div>
                            </div>
                        </div>
                    </Carousel.Item>
                    <Carousel.Item>
                        <div className="carousel-slide slide-2">
                            <div className="carousel-overlay"></div>
                            <div className="carousel-content">
                                <h1>
                                    <i className="bi bi-hand-thumbs-up me-3"></i>
                                    Found Something?
                                </h1>
                                <p>Be a hero! Report found items and help fellow students retrieve their belongings.</p>
                                <div className="carousel-buttons">
                                    <Link to="/upload" className="btn btn-warning btn-lg">
                                        <i className="bi bi-camera me-2"></i>
                                        Upload Now
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </Carousel.Item>
                    <Carousel.Item>
                        <div className="carousel-slide slide-3">
                            <div className="carousel-overlay"></div>
                            <div className="carousel-content">
                                <h1>
                                    <i className="bi bi-people me-3"></i>
                                    Community Driven
                                </h1>
                                <p>Join hundreds of students helping each other find lost belongings on campus.</p>
                                <div className="carousel-buttons">
                                    {!user ? (
                                        <Link to="/signup" className="btn btn-success btn-lg">
                                            <i className="bi bi-person-plus me-2"></i>
                                            Join Now
                                        </Link>
                                    ) : (
                                        <Link to="/my-items" className="btn btn-info btn-lg">
                                            <i className="bi bi-collection me-2"></i>
                                            My Items
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Carousel.Item>
                </Carousel>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <Container>
                    <Row className="g-4">
                        <Col md={4}>
                            <div className="stat-card">
                                <div className="stat-icon bg-primary">
                                    <i className="bi bi-box-seam"></i>
                                </div>
                                <div className="stat-info">
                                    <h3>{stats.total}</h3>
                                    <p>Total Items Listed</p>
                                </div>
                            </div>
                        </Col>
                        <Col md={4}>
                            <div className="stat-card">
                                <div className="stat-icon bg-success">
                                    <i className="bi bi-check-circle"></i>
                                </div>
                                <div className="stat-info">
                                    <h3>{stats.available}</h3>
                                    <p>Available Items</p>
                                </div>
                            </div>
                        </Col>
                        <Col md={4}>
                            <div className="stat-card">
                                <div className="stat-icon bg-info">
                                    <i className="bi bi-arrow-repeat"></i>
                                </div>
                                <div className="stat-info">
                                    <h3>{stats.returned}</h3>
                                    <p>Items Returned</p>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Category Filter Section */}
            <section className="category-section">
                <Container>
                    <h2 className="section-title">
                        <i className="bi bi-funnel me-2"></i>
                        Browse by Category
                    </h2>
                    <div className="category-grid">
                        {categories.map(cat => (
                            <button
                                key={cat.value}
                                className={`category-btn ${category === cat.value ? 'active' : ''}`}
                                onClick={() => { setCategory(cat.value); setPage(1); }}
                            >
                                <i className={`bi ${cat.icon}`}></i>
                                <span>{cat.label}</span>
                            </button>
                        ))}
                    </div>
                </Container>
            </section>

            {/* Search & Items Section */}
            <section className="items-section" id="items-section">
                <Container>
                    <div className="search-box">
                        <Form onSubmit={handleSearch}>
                            <InputGroup size="lg">
                                <InputGroup.Text className="search-icon">
                                    <i className="bi bi-search"></i>
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Search by item name, description, or location..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="search-input"
                                />
                                <Button variant="primary" type="submit" className="search-btn">
                                    Search
                                </Button>
                            </InputGroup>
                        </Form>
                    </div>

                    <h2 className="section-title mt-5">
                        <i className="bi bi-grid me-2"></i>
                        {category ? `${categories.find(c => c.value === category)?.label}` : 'All Found Items'}
                        <Badge bg="secondary" className="ms-2">{stats.total}</Badge>
                    </h2>

                    {loading ? (
                        <div className="loading-container">
                            <Spinner animation="border" variant="primary" />
                            <p>Loading items...</p>
                        </div>
                    ) : (
                        <>
                            {items.length === 0 ? (
                                <div className="empty-state">
                                    <i className="bi bi-inbox"></i>
                                    <h4>No Items Found</h4>
                                    <p>Try adjusting your search or filters</p>
                                    <Button variant="primary" onClick={() => { setSearch(''); setCategory(''); }}>
                                        Clear Filters
                                    </Button>
                                </div>
                            ) : (
                                <Row xs={1} md={2} lg={3} xl={4} className="g-4 items-grid">
                                    {items.map(item => (
                                        <Col key={item._id}>
                                            <Card className="item-card h-100">
                                                <div className="card-img-wrapper">
                                                    <Card.Img
                                                        variant="top"
                                                        src={`http://localhost:5000${item.imageUrl}`}
                                                        alt={item.itemName}
                                                        onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/300x200?text=No+Image" }}
                                                    />
                                                    <div className="card-category-badge">
                                                        <i className={`bi ${getCategoryIcon(item.category)} me-1`}></i>
                                                        {item.category}
                                                    </div>
                                                    <Badge 
                                                        bg={item.status === 'available' ? 'success' : item.status === 'claimed' ? 'warning' : 'secondary'}
                                                        className="card-status-badge"
                                                    >
                                                        {item.status}
                                                    </Badge>
                                                </div>
                                                <Card.Body>
                                                    <Card.Title>{item.itemName}</Card.Title>
                                                    <Card.Text className="text-muted small">
                                                        {item.description.length > 60 ? `${item.description.substring(0, 60)}...` : item.description}
                                                    </Card.Text>
                                                    <div className="item-meta">
                                                        <div className="meta-item">
                                                            <i className="bi bi-geo-alt"></i>
                                                            <span>{item.foundLocation}</span>
                                                        </div>
                                                        <div className="meta-item">
                                                            <i className="bi bi-calendar"></i>
                                                            <span>{new Date(item.foundDate).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                    <Link to={`/items/${item._id}`} className="btn btn-outline-primary w-100 mt-3 view-btn">
                                                        <i className="bi bi-eye me-1"></i>
                                                        View Details
                                                    </Link>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            )}

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="pagination-container">
                                    <Button
                                        variant="outline-primary"
                                        disabled={page <= 1}
                                        onClick={() => setPage(page - 1)}
                                        className="pagination-btn"
                                    >
                                        <i className="bi bi-chevron-left me-1"></i>
                                        Previous
                                    </Button>
                                    <div className="page-info">
                                        Page <span>{page}</span> of <span>{totalPages}</span>
                                    </div>
                                    <Button
                                        variant="outline-primary"
                                        disabled={page >= totalPages}
                                        onClick={() => setPage(page + 1)}
                                        className="pagination-btn"
                                    >
                                        Next
                                        <i className="bi bi-chevron-right ms-1"></i>
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </Container>
            </section>

            {/* Call to Action Section */}
            <section className="cta-section">
                <Container>
                    <div className="cta-content">
                        <h2>Found an Item?</h2>
                        <p>Help someone today! Report the found item and be a hero.</p>
                        <Link to="/upload" className="btn btn-light btn-lg">
                            <i className="bi bi-plus-circle me-2"></i>
                            Report Found Item
                        </Link>
                    </div>
                </Container>
            </section>

            {/* Footer */}
            <footer className="home-footer">
                <Container>
                    <Row>
                        <Col md={4} className="mb-4 mb-md-0">
                            <h5>
                                <i className="bi bi-search-heart me-2"></i>
                                Lost & Found Portal
                            </h5>
                            <p className="text-muted">Helping reunite lost items with their owners since 2024.</p>
                        </Col>
                        <Col md={4} className="mb-4 mb-md-0">
                            <h5>Quick Links</h5>
                            <ul className="footer-links">
                                <li><Link to="/home">Home</Link></li>
                                <li><Link to="/upload">Report Item</Link></li>
                                <li><Link to="/my-items">My Items</Link></li>
                            </ul>
                        </Col>
                        <Col md={4}>
                            <h5>Contact</h5>
                            <p className="text-muted">
                                <i className="bi bi-building me-2"></i>
                                Symbiosis Institute of Technology, Nagpur
                            </p>
                            <p className="text-muted">
                                <i className="bi bi-envelope me-2"></i>
                                lostandfound@sit.edu
                            </p>
                        </Col>
                    </Row>
                    <hr />
                    <p className="text-center text-muted mb-0">
                        © 2024 Lost & Found Portal. Made with ❤️ for SIT Nagpur
                    </p>
                </Container>
            </footer>
        </div>
    );
};

export default Home;
