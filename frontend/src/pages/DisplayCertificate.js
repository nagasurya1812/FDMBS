import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Accordion, Form, Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';

const DisplayCertificates = () => {
    const { currentUser } = useSelector((state) => state.user);
    // Get certificates directly from Redux state
    const certificates = currentUser?.data?.certifications || [];
    
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredCertificates, setFilteredCertificates] = useState(certificates);

    // Update filtered certificates when certificates change
    useEffect(() => {
        if (searchTerm) {
            const filtered = certificates.filter(cert => {
                const name = cert.name?.toLowerCase() || '';
                const description = cert.description?.toLowerCase() || '';
                const duration = cert.duration?.toLowerCase() || '';
                return name.includes(searchTerm.toLowerCase()) ||
                       description.includes(searchTerm.toLowerCase()) ||
                       duration.includes(searchTerm.toLowerCase());
            });
            setFilteredCertificates(filtered);
        } else {
            setFilteredCertificates(certificates);
        }
    }, [certificates, searchTerm]);

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleViewPDF = (fileId) => {
        window.open(`/uploads/${fileId}`, '_blank');
    };

    return (
        <Container fluid>
            <Row>
                <h1 className='font-weight-bold px-4'>Certificates</h1>
                <hr />
            </Row>
            <Row className='mb-3'>
                <Col>
                    <Form.Control
                        type="text"
                        placeholder="Search by title, description, or duration"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                </Col>
            </Row>
            <Accordion>
                {filteredCertificates.map((cert, index) => (
                    <Accordion.Item eventKey={index} key={cert._id || index} className='mt-3 mb-3'>
                        <Accordion.Header>{cert.name}</Accordion.Header>
                        <Accordion.Body>
                            <Container>
                                <Row>
                                  <Col>
                                    <img 
                                      src={`/uploads/${cert.fileId}`}
                                      alt={cert.name}
                                      style={{ 
                                        maxWidth: '300px', 
                                        width: '100%', 
                                        height: 'auto',
                                        borderRadius: '8px',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                      }}
                                    />
                                  </Col>
                                  <Col><p>{cert.duration}</p></Col>
                                  <Col><p>{cert.description}</p></Col>
                                </Row>
                            </Container>
                        </Accordion.Body>
                    </Accordion.Item>
                ))}
            </Accordion>
        </Container>
    );
};

export default DisplayCertificates;
