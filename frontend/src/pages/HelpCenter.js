import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Accordion, Spinner, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const HelpCenter = () => {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [contactForm, setContactForm] = useState({
        name: user?.name || '',
        email: user?.email || '',
        subject: '',
        message: ''
    });
    const [sending, setSending] = useState(false);

    const faqs = [
        {
            category: 'Getting Started',
            icon: 'bi-rocket-takeoff',
            questions: [
                {
                    q: 'How do I report a found item?',
                    a: 'To report a found item, log in to your account and click on "Report Item" in the navigation bar. Fill in the item details including name, description, category, location where you found it, and upload a clear photo. Once submitted, the item will be visible to all users.'
                },
                {
                    q: 'How do I search for my lost item?',
                    a: 'Visit the Home page and use the search bar to look for your item by name or description. You can also filter by category to narrow down results. Browse through the available items and click on any item card to see full details.'
                },
                {
                    q: 'Do I need to create an account?',
                    a: 'Yes, you need to create an account to report found items or claim lost items. However, you can browse all reported items without logging in. Creating an account helps us verify users and ensure secure item returns.'
                }
            ]
        },
        {
            category: 'Claiming Items',
            icon: 'bi-hand-index-thumb',
            questions: [
                {
                    q: 'How do I claim an item?',
                    a: 'When you find your lost item in the listing, click on it to view details. Then click the "Claim This Item" button. You\'ll need to provide your contact information and describe the item to prove ownership. The person who found it will be notified of your claim.'
                },
                {
                    q: 'What proof do I need to claim an item?',
                    a: 'You\'ll need to describe unique identifying features of the item that wouldn\'t be visible in the photos. This could include serial numbers, contents, marks, or other distinguishing characteristics that only the true owner would know.'
                },
                {
                    q: 'Where do I pick up my item?',
                    a: 'Each reported item shows a "Deposited At" location. This is where the finder has left the item for safekeeping. Common locations include the Security Office, Library Reception, or Admin Building. Bring your ID for verification when picking up.'
                }
            ]
        },
        {
            category: 'Account & Security',
            icon: 'bi-shield-check',
            questions: [
                {
                    q: 'How do I reset my password?',
                    a: 'Go to the login page and click "Forgot Password". Enter your registered email address and we\'ll send you a password reset link. The link expires in 1 hour for security purposes.'
                },
                {
                    q: 'Can I change my email address?',
                    a: 'For security reasons, email addresses cannot be changed directly. Please contact the administrator through the contact form below if you need to update your email address.'
                },
                {
                    q: 'Is my personal information secure?',
                    a: 'Yes, we use industry-standard encryption to protect your data. Your personal information is only shared with item finders when you submit a claim, and we never share your data with third parties.'
                }
            ]
        },
        {
            category: 'Reporting Items',
            icon: 'bi-cloud-upload',
            questions: [
                {
                    q: 'What information should I include when reporting?',
                    a: 'Include as much detail as possible: item name, detailed description, category, exact location and time found, and a clear photograph. The more information you provide, the easier it will be for the owner to identify their item.'
                },
                {
                    q: 'Can I edit my reported item?',
                    a: 'Yes, you can edit items you\'ve reported from the "My Items" page. Click on the item and then the edit button to update details. You cannot edit items after they\'ve been claimed.'
                },
                {
                    q: 'What should I do with the found item?',
                    a: 'After reporting, deposit the item at one of the designated locations (Security Office, Library Reception, etc.) and select that location in the form. This ensures the item is kept safe and the owner knows where to collect it.'
                }
            ]
        },
        {
            category: 'Troubleshooting',
            icon: 'bi-wrench',
            questions: [
                {
                    q: 'Why can\'t I upload images?',
                    a: 'Make sure your image is less than 5MB and in a supported format (JPG, PNG, GIF). Try refreshing the page if the upload fails. If problems persist, try using a different browser or contact support.'
                },
                {
                    q: 'The website is not loading properly',
                    a: 'Try clearing your browser cache and cookies, or use incognito/private mode. Ensure you have a stable internet connection. The website works best on modern browsers like Chrome, Firefox, or Edge.'
                },
                {
                    q: 'I\'m not receiving notification emails',
                    a: 'Check your spam/junk folder first. Make sure your email settings allow notifications in the Settings page. If you still don\'t receive emails, contact support with your registered email address.'
                }
            ]
        }
    ];

    const quickLinks = [
        { icon: 'bi-house', title: 'Home', desc: 'Browse all items', link: '/home' },
        { icon: 'bi-cloud-upload', title: 'Report Item', desc: 'Report a found item', link: '/upload' },
        { icon: 'bi-collection', title: 'My Items', desc: 'View your items', link: '/my-items' },
        { icon: 'bi-gear', title: 'Settings', desc: 'Account settings', link: '/settings' },
        { icon: 'bi-person', title: 'Profile', desc: 'Your profile', link: '/profile' }
    ];

    const filteredFaqs = faqs.map(category => ({
        ...category,
        questions: category.questions.filter(
            q => q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
                 q.a.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter(category => category.questions.length > 0);

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        
        if (!contactForm.subject.trim() || !contactForm.message.trim()) {
            toast.error('Please fill in all fields');
            return;
        }

        try {
            setSending(true);
            // Simulate sending
            await new Promise(resolve => setTimeout(resolve, 1500));
            toast.success('Message sent successfully! We\'ll get back to you soon.');
            setContactForm(prev => ({ ...prev, subject: '', message: '' }));
        } catch (err) {
            toast.error('Failed to send message. Please try again.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="help-center-page">
            {/* Hero Section */}
            <section className="help-hero">
                <div className="help-hero-bg"></div>
                <Container>
                    <div className="help-hero-content">
                        <h1>
                            <i className="bi bi-question-circle me-3"></i>
                            Help Center
                        </h1>
                        <p>Find answers, get support, and learn how to use Lost & Found Portal</p>
                        <div className="help-search-box">
                            <i className="bi bi-search"></i>
                            <input
                                type="text"
                                placeholder="Search for help..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')}>
                                    <i className="bi bi-x-lg"></i>
                                </button>
                            )}
                        </div>
                    </div>
                </Container>
            </section>

            {/* Quick Links */}
            <section className="help-quick-links">
                <Container>
                    <Row>
                        {quickLinks.map((link, idx) => (
                            <Col key={idx} xs={6} md={4} lg className="mb-3">
                                <Link to={link.link} className="quick-link-card">
                                    <i className={`bi ${link.icon}`}></i>
                                    <h6>{link.title}</h6>
                                    <p>{link.desc}</p>
                                </Link>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* FAQs Section */}
            <section className="help-faqs">
                <Container>
                    <h2 className="section-title">
                        <i className="bi bi-chat-quote me-2"></i>
                        Frequently Asked Questions
                    </h2>

                    {searchQuery && filteredFaqs.length === 0 && (
                        <Alert variant="info" className="text-center">
                            <i className="bi bi-search me-2"></i>
                            No results found for "{searchQuery}". Try a different search term.
                        </Alert>
                    )}

                    <Row>
                        {(searchQuery ? filteredFaqs : faqs).map((category, catIdx) => (
                            <Col lg={6} key={catIdx} className="mb-4">
                                <Card className="faq-category-card">
                                    <Card.Header>
                                        <h5>
                                            <i className={`bi ${category.icon} me-2`}></i>
                                            {category.category}
                                        </h5>
                                    </Card.Header>
                                    <Card.Body>
                                        <Accordion flush>
                                            {category.questions.map((faq, faqIdx) => (
                                                <Accordion.Item key={faqIdx} eventKey={`${catIdx}-${faqIdx}`}>
                                                    <Accordion.Header>{faq.q}</Accordion.Header>
                                                    <Accordion.Body>{faq.a}</Accordion.Body>
                                                </Accordion.Item>
                                            ))}
                                        </Accordion>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Container>
            </section>

            {/* Contact Section */}
            <section className="help-contact">
                <Container>
                    <Row>
                        <Col lg={5} className="mb-4 mb-lg-0">
                            <div className="contact-info-card">
                                <h2>
                                    <i className="bi bi-headset me-2"></i>
                                    Still Need Help?
                                </h2>
                                <p>Can't find what you're looking for? Our support team is here to help!</p>
                                
                                <div className="contact-methods">
                                    <div className="contact-method">
                                        <div className="contact-icon">
                                            <i className="bi bi-envelope-fill"></i>
                                        </div>
                                        <div>
                                            <h6>Email Us</h6>
                                            <a href="mailto:sharvayu.zade@gmail.com">sharvayu.zade@gmail.com</a>
                                        </div>
                                    </div>
                                    <div className="contact-method">
                                        <div className="contact-icon">
                                            <i className="bi bi-geo-alt-fill"></i>
                                        </div>
                                        <div>
                                            <h6>Visit Us</h6>
                                            <p>Symbiosis Institute of Technology, Nagpur</p>
                                        </div>
                                    </div>
                                    <div className="contact-method">
                                        <div className="contact-icon">
                                            <i className="bi bi-clock-fill"></i>
                                        </div>
                                        <div>
                                            <h6>Working Hours</h6>
                                            <p>Mon - Fri: 9:00 AM - 5:00 PM</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="creators-info mt-4">
                                    <h6>
                                        <i className="bi bi-code-slash me-2"></i>
                                        Created By
                                    </h6>
                                    <ul>
                                        <li><i className="bi bi-person-fill me-2"></i>Sharvayu Zade</li>
                                        <li><i className="bi bi-person-fill me-2"></i>Sushmit Partakke</li>
                                        <li><i className="bi bi-person-fill me-2"></i>Sharvil Barhanpure</li>
                                    </ul>
                                </div>
                            </div>
                        </Col>
                        <Col lg={7}>
                            <Card className="contact-form-card">
                                <Card.Header>
                                    <h5>
                                        <i className="bi bi-send me-2"></i>
                                        Send Us a Message
                                    </h5>
                                </Card.Header>
                                <Card.Body>
                                    <Form onSubmit={handleContactSubmit}>
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Your Name</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        value={contactForm.name}
                                                        onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                                                        placeholder="Enter your name"
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Email Address</Form.Label>
                                                    <Form.Control
                                                        type="email"
                                                        value={contactForm.email}
                                                        onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                                                        placeholder="Enter your email"
                                                        required
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Subject</Form.Label>
                                            <Form.Select
                                                value={contactForm.subject}
                                                onChange={(e) => setContactForm({...contactForm, subject: e.target.value})}
                                                required
                                            >
                                                <option value="">Select a topic</option>
                                                <option value="general">General Inquiry</option>
                                                <option value="technical">Technical Issue</option>
                                                <option value="account">Account Problem</option>
                                                <option value="item">Item Related</option>
                                                <option value="feedback">Feedback/Suggestion</option>
                                                <option value="other">Other</option>
                                            </Form.Select>
                                        </Form.Group>
                                        <Form.Group className="mb-4">
                                            <Form.Label>Message</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={5}
                                                value={contactForm.message}
                                                onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                                                placeholder="Describe your issue or question in detail..."
                                                required
                                            />
                                        </Form.Group>
                                        <Button type="submit" variant="primary" size="lg" disabled={sending}>
                                            {sending ? (
                                                <>
                                                    <Spinner size="sm" className="me-2" />
                                                    Sending...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-send me-2"></i>
                                                    Send Message
                                                </>
                                            )}
                                        </Button>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>

            {/* Tips Section */}
            <section className="help-tips">
                <Container>
                    <h2 className="section-title text-center">
                        <i className="bi bi-lightbulb me-2"></i>
                        Pro Tips
                    </h2>
                    <Row>
                        <Col md={4} className="mb-4">
                            <Card className="tip-card">
                                <Card.Body>
                                    <div className="tip-icon">
                                        <i className="bi bi-camera"></i>
                                    </div>
                                    <h5>Take Clear Photos</h5>
                                    <p>When reporting items, take well-lit, clear photos from multiple angles. This helps owners identify their belongings quickly.</p>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4} className="mb-4">
                            <Card className="tip-card">
                                <Card.Body>
                                    <div className="tip-icon">
                                        <i className="bi bi-pencil-square"></i>
                                    </div>
                                    <h5>Be Descriptive</h5>
                                    <p>Include as many details as possible in your descriptions - brand, color, size, and any unique features or markings.</p>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4} className="mb-4">
                            <Card className="tip-card">
                                <Card.Body>
                                    <div className="tip-icon">
                                        <i className="bi bi-bell"></i>
                                    </div>
                                    <h5>Enable Notifications</h5>
                                    <p>Turn on notifications in Settings to get instant alerts when someone claims your reported item or when new items are posted.</p>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </section>
        </div>
    );
};

export default HelpCenter;
