import React, { useState, useRef, useCallback } from 'react';
import { Form, Button, Container, Row, Col, Alert, ProgressBar, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';

const UploadItem = () => {
    const navigate = useNavigate();
    const { addNotification } = useNotifications();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState(1);
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
    const [imagePreview, setImagePreview] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const categories = [
        { value: 'electronics', label: 'Electronics', icon: 'bi-laptop', color: '#667eea' },
        { value: 'documents', label: 'Documents', icon: 'bi-file-earmark-text', color: '#11998e' },
        { value: 'accessories', label: 'Accessories', icon: 'bi-watch', color: '#f39c12' },
        { value: 'clothing', label: 'Clothing', icon: 'bi-bag', color: '#e74c3c' },
        { value: 'books', label: 'Books', icon: 'bi-book', color: '#9b59b6' },
        { value: 'others', label: 'Others', icon: 'bi-box', color: '#6c757d' }
    ];

    const depositLocations = [
        'Security Office - Main Gate',
        'Security Office - Back Gate',
        'Library Reception',
        'Admin Building - Ground Floor',
        'Student Affairs Office',
        'Hostel Warden Office',
        'Canteen Counter',
        'Sports Complex Office'
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleDrag = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    }, []);

    const handleFile = (file) => {
        if (file && file.type.startsWith('image/')) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image size should be less than 5MB');
                return;
            }
            setImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            toast.error('Please upload a valid image file');
        }
    };

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const removeImage = () => {
        setImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const validateStep = (step) => {
        switch(step) {
            case 1:
                if (!formData.itemName.trim()) {
                    toast.error('Please enter item name');
                    return false;
                }
                if (!formData.category) {
                    toast.error('Please select a category');
                    return false;
                }
                if (!formData.description.trim()) {
                    toast.error('Please enter description');
                    return false;
                }
                return true;
            case 2:
                if (!image) {
                    toast.error('Please upload an image');
                    return false;
                }
                return true;
            case 3:
                if (!formData.foundDate || !formData.foundTime || !formData.foundLocation.trim() || !formData.depositLocation.trim()) {
                    toast.error('Please fill all location and time details');
                    return false;
                }
                return true;
            default:
                return true;
        }
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 3));
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateStep(3)) return;

        try {
            setLoading(true);
            setError('');
            setUploadProgress(0);

            const data = new FormData();
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key]);
            });
            if (image) {
                data.append('image', image);
            }

            await api.post('/items', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });

            // Add notification
            addNotification({
                type: 'upload',
                title: 'Item Reported Successfully!',
                message: `Your found item "${formData.itemName}" has been uploaded and is now visible to others.`
            });

            toast.success('🎉 Item reported successfully!');
            navigate('/home');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to upload item');
            toast.error('Failed to upload item');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="upload-page">
            <Container>
                {/* Header */}
                <div className="upload-header">
                    <div className="upload-header-content">
                        <h1>
                            <i className="bi bi-cloud-upload me-3"></i>
                            Report Found Item
                        </h1>
                        <p>Help someone find their lost belongings by reporting the item you found</p>
                    </div>
                </div>

                {/* Progress Steps */}
                <div className="upload-progress-container">
                    <div className="progress-steps">
                        <div className={`progress-step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                            <div className="step-circle">
                                {currentStep > 1 ? <i className="bi bi-check"></i> : '1'}
                            </div>
                            <span>Item Details</span>
                        </div>
                        <div className={`progress-line ${currentStep > 1 ? 'active' : ''}`}></div>
                        <div className={`progress-step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                            <div className="step-circle">
                                {currentStep > 2 ? <i className="bi bi-check"></i> : '2'}
                            </div>
                            <span>Upload Image</span>
                        </div>
                        <div className={`progress-line ${currentStep > 2 ? 'active' : ''}`}></div>
                        <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>
                            <div className="step-circle">3</div>
                            <span>Location & Time</span>
                        </div>
                    </div>
                </div>

                {error && (
                    <Alert variant="danger" className="upload-error">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        {error}
                    </Alert>
                )}

                <div className="upload-form-container">
                    <Form onSubmit={handleSubmit}>
                        {/* Step 1: Item Details */}
                        <div className={`form-step ${currentStep === 1 ? 'active' : ''}`}>
                            <div className="step-content">
                                <h3 className="step-title">
                                    <i className="bi bi-box-seam me-2"></i>
                                    Item Information
                                </h3>
                                
                                <Form.Group className="mb-4">
                                    <Form.Label className="custom-label">Item Name *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="itemName"
                                        value={formData.itemName}
                                        onChange={handleChange}
                                        placeholder="e.g., Black Samsung Earbuds, Blue Wallet"
                                        className="custom-input"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label className="custom-label">Category *</Form.Label>
                                    <div className="category-grid-upload">
                                        {categories.map(cat => (
                                            <div
                                                key={cat.value}
                                                className={`category-option ${formData.category === cat.value ? 'selected' : ''}`}
                                                onClick={() => setFormData({ ...formData, category: cat.value })}
                                                style={{ '--category-color': cat.color }}
                                            >
                                                <i className={`bi ${cat.icon}`}></i>
                                                <span>{cat.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label className="custom-label">Description *</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={4}
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Provide detailed description to help identify the item (color, brand, distinguishing features, etc.)"
                                        className="custom-input"
                                    />
                                    <div className="char-count">{formData.description.length}/500 characters</div>
                                </Form.Group>
                            </div>
                        </div>

                        {/* Step 2: Image Upload */}
                        <div className={`form-step ${currentStep === 2 ? 'active' : ''}`}>
                            <div className="step-content">
                                <h3 className="step-title">
                                    <i className="bi bi-image me-2"></i>
                                    Upload Image
                                </h3>
                                
                                <div 
                                    className={`dropzone ${dragActive ? 'drag-active' : ''} ${imagePreview ? 'has-image' : ''}`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    onClick={() => !imagePreview && fileInputRef.current?.click()}
                                >
                                    {imagePreview ? (
                                        <div className="image-preview-container">
                                            <img src={imagePreview} alt="Preview" className="image-preview" />
                                            <div className="image-preview-overlay">
                                                <button 
                                                    type="button" 
                                                    className="btn-remove-image"
                                                    onClick={(e) => { e.stopPropagation(); removeImage(); }}
                                                >
                                                    <i className="bi bi-trash"></i>
                                                    Remove
                                                </button>
                                                <button 
                                                    type="button" 
                                                    className="btn-change-image"
                                                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                                                >
                                                    <i className="bi bi-arrow-repeat"></i>
                                                    Change
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="dropzone-content">
                                            <div className="dropzone-icon">
                                                <i className="bi bi-cloud-arrow-up"></i>
                                            </div>
                                            <h4>Drag & Drop your image here</h4>
                                            <p>or click to browse</p>
                                            <span className="dropzone-hint">Supports: JPG, PNG, GIF (Max 5MB)</span>
                                        </div>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        style={{ display: 'none' }}
                                    />
                                </div>

                                {image && (
                                    <div className="file-info">
                                        <i className="bi bi-file-earmark-image"></i>
                                        <span>{image.name}</span>
                                        <span className="file-size">({(image.size / 1024 / 1024).toFixed(2)} MB)</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Step 3: Location & Time */}
                        <div className={`form-step ${currentStep === 3 ? 'active' : ''}`}>
                            <div className="step-content">
                                <h3 className="step-title">
                                    <i className="bi bi-geo-alt me-2"></i>
                                    Location & Time Details
                                </h3>
                                
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-4">
                                            <Form.Label className="custom-label">
                                                <i className="bi bi-calendar3 me-1"></i>
                                                Found Date *
                                            </Form.Label>
                                            <Form.Control
                                                type="date"
                                                name="foundDate"
                                                value={formData.foundDate}
                                                onChange={handleChange}
                                                max={new Date().toISOString().split('T')[0]}
                                                className="custom-input"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-4">
                                            <Form.Label className="custom-label">
                                                <i className="bi bi-clock me-1"></i>
                                                Found Time *
                                            </Form.Label>
                                            <Form.Control
                                                type="time"
                                                name="foundTime"
                                                value={formData.foundTime}
                                                onChange={handleChange}
                                                className="custom-input"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-4">
                                    <Form.Label className="custom-label">
                                        <i className="bi bi-geo me-1"></i>
                                        Found Location *
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="foundLocation"
                                        value={formData.foundLocation}
                                        onChange={handleChange}
                                        placeholder="e.g., Library 2nd Floor, Near Computer Lab"
                                        className="custom-input"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <Form.Label className="custom-label">
                                        <i className="bi bi-building me-1"></i>
                                        Deposited At *
                                    </Form.Label>
                                    <Form.Select
                                        name="depositLocation"
                                        value={formData.depositLocation}
                                        onChange={handleChange}
                                        className="custom-input"
                                    >
                                        <option value="">Select deposit location</option>
                                        {depositLocations.map(loc => (
                                            <option key={loc} value={loc}>{loc}</option>
                                        ))}
                                        <option value="custom">Other (Specify below)</option>
                                    </Form.Select>
                                    {formData.depositLocation === 'custom' && (
                                        <Form.Control
                                            type="text"
                                            name="depositLocation"
                                            placeholder="Enter custom location"
                                            onChange={handleChange}
                                            className="custom-input mt-2"
                                        />
                                    )}
                                </Form.Group>

                                {/* Upload Progress */}
                                {loading && (
                                    <div className="upload-progress">
                                        <div className="progress-label">
                                            <span>Uploading...</span>
                                            <span>{uploadProgress}%</span>
                                        </div>
                                        <ProgressBar 
                                            now={uploadProgress} 
                                            animated 
                                            striped 
                                            variant="success"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="form-navigation">
                            {currentStep > 1 && (
                                <Button
                                    type="button"
                                    variant="outline-secondary"
                                    onClick={prevStep}
                                    className="btn-prev"
                                    disabled={loading}
                                >
                                    <i className="bi bi-arrow-left me-2"></i>
                                    Previous
                                </Button>
                            )}
                            
                            {currentStep < 3 ? (
                                <Button
                                    type="button"
                                    onClick={nextStep}
                                    className="btn-next"
                                >
                                    Next
                                    <i className="bi bi-arrow-right ms-2"></i>
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    className="btn-submit-report"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Spinner size="sm" animation="border" className="me-2" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-check-circle me-2"></i>
                                            Submit Report
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </Form>
                </div>

                {/* Tips Section */}
                <div className="upload-tips">
                    <h4><i className="bi bi-lightbulb me-2"></i>Tips for a Good Report</h4>
                    <Row>
                        <Col md={4}>
                            <div className="tip-card">
                                <div className="tip-icon">📸</div>
                                <h5>Clear Photo</h5>
                                <p>Take a clear, well-lit photo of the item from multiple angles if possible.</p>
                            </div>
                        </Col>
                        <Col md={4}>
                            <div className="tip-card">
                                <div className="tip-icon">📝</div>
                                <h5>Detailed Description</h5>
                                <p>Include brand, color, size, and any unique identifying features.</p>
                            </div>
                        </Col>
                        <Col md={4}>
                            <div className="tip-card">
                                <div className="tip-icon">📍</div>
                                <h5>Exact Location</h5>
                                <p>Be specific about where you found the item to help the owner recall.</p>
                            </div>
                        </Col>
                    </Row>
                </div>
            </Container>
        </div>
    );
};

export default UploadItem;
