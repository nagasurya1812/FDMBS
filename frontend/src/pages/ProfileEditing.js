import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Image, Alert } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { signInSuccess } from "../redux/user/userSlice";
import { useNavigate } from 'react-router-dom';
import { FaCamera, FaFileUpload } from 'react-icons/fa';

function ProfileEditing() {
    const { currentUser } = useSelector(state => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        name: currentUser?.data?.name || '',
        empId: currentUser?.data?.empId || '',
        designation: currentUser?.data?.designation || '',
        department: currentUser?.data?.department || '',
        educationalBackground: currentUser?.data?.educationalBackground || '',
        email: currentUser?.data?.email || '',
        phone: currentUser?.data?.phone || '',
        address: currentUser?.data?.address || '',
        linkedinProfile: currentUser?.data?.linkedinProfile || ''
    });

    const [profileImage, setProfileImage] = useState(
        currentUser?.data?.photoId ? 
        `/uploads/${currentUser.data.photoId}` : 
        '/default-profile.png'
    );

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleImageChange = async (e) => {
            const file = e.target.files[0];
        if (!file) return;

            const formData = new FormData();
        formData.append('profileImage', file);
        formData.append('empId', currentUser.data.empId);

        try {
            setLoading(true);
            setError('');
            const response = await axios.put('/api/updateProfileImage', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setProfileImage(`/uploads/${response.data.photoId}`);
            dispatch(signInSuccess({ 
                data: { ...currentUser.data, photoId: response.data.photoId } 
            }));
            setSuccess('Profile picture updated successfully!');
        } catch (err) {
            setError('Failed to update profile picture');
            console.error(err);
            } finally {
            setLoading(false);
        }
    };

    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('resume', file);
        formData.append('empId', currentUser.data.empId);

        try {
            setLoading(true);
            setError('');
            const response = await axios.put('/api/uploadResume', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            dispatch(signInSuccess({ 
                data: { 
                    ...currentUser.data, 
                    resume: response.data.resume 
                } 
            }));
            setSuccess('Resume uploaded successfully!');
        } catch (err) {
            setError('Failed to upload resume');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            
            const dataToSubmit = {
                ...formData,
                resume: currentUser.data.resume
            };

            const response = await axios.put('/api/facultyedit', dataToSubmit);
            dispatch(signInSuccess(response));
            setSuccess('Profile updated successfully!');
            setTimeout(() => navigate('/profile'), 1500);
        } catch (err) {
            setError('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="py-5">
            <div className="bg-white rounded-lg shadow-sm p-4">
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
                
                <Form onSubmit={handleSubmit}>
                    {/* Profile Image Section */}
                    <div className="text-center mb-4 position-relative">
                        <Image 
                                src={profileImage}
                            roundedCircle 
                            style={{ 
                                width: '150px', 
                                height: '150px', 
                                objectFit: 'cover',
                                border: '3px solid #f8f9fa'
                            }} 
                        />
                        <div className="position-absolute bottom-0 end-50 mb-2">
                            <label className="btn btn-light rounded-circle p-2" style={{ cursor: 'pointer' }}>
                                <FaCamera />
                                <input
                                    type="file"
                                    className="d-none"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </label>
                        </div>
                    </div>

                    <Row className="g-3">
                        {/* Basic Information */}
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Full Name*</Form.Label>
                                <Form.Control
                                    required
                                        type="text"
                                        name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Employee ID*</Form.Label>
                                <Form.Control
                                    required
                                        type="text"
                                        name="empId"
                                    value={formData.empId}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                        </Col>

                        {/* Professional Information */}
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Designation</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="designation"
                                    value={formData.designation}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Department</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Educational Background</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="educationalBackground"
                                    value={formData.educationalBackground}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                        </Col>

                        {/* Contact Information */}
                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Email*</Form.Label>
                                <Form.Control
                                    required
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>Phone</Form.Label>
                                <Form.Control
                                    type="tel"
                name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={12}>
                            <Form.Group>
                                <Form.Label>Address</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                />
                            </Form.Group>
                        </Col>

                        <Col md={6}>
                            <Form.Group>
                                <Form.Label>LinkedIn Profile</Form.Label>
                                <Form.Control
                                    type="url"
                                    name="linkedinProfile"
                                    value={formData.linkedinProfile}
                                    onChange={handleInputChange}
                                    placeholder="https://www.linkedin.com/in/your-profile"
                                />
                                <Form.Text className="text-muted">
                                    Enter your full LinkedIn profile URL
                                </Form.Text>
                            </Form.Group>
                        </Col>

                        {/* Resume Upload Section */}
                        <Col md={12}>
                            <Form.Group className="mb-4">
                                <Form.Label>
                                    <strong>Resume/CV</strong>
                                </Form.Label>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="position-relative">
                                        <label className="btn btn-outline-primary d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
                                            <FaFileUpload />
                                            Upload Resume
                                            <input
                                                type="file"
                                                className="d-none"
                                                accept=".pdf,.doc,.docx"
                                                onChange={handleResumeUpload}
                                            />
                                        </label>
                                    </div>
                                    {currentUser?.data?.resume && (
                                        <span className="text-success">
                                            Resume uploaded: {currentUser.data.resume.split('/').pop()}
                                        </span>
                                    )}
                                </div>
                                <Form.Text className="text-muted">
                                    Upload your resume in PDF, DOC, or DOCX format
                                </Form.Text>
                            </Form.Group>
                        </Col>

                        {/* Submit Button */}
                        <Col md={12} className="text-center mt-4">
                            <Button 
                                type="submit" 
                                variant="primary" 
                                size="lg" 
                                disabled={loading}
                                className="px-5"
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </div>
        </Container>
    );
}

export default ProfileEditing;
