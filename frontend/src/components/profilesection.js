import React from 'react';
import { Container, Row, Col, Image, Button } from 'react-bootstrap';
import { FaLinkedin, FaEnvelope, FaFileAlt } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import axios from 'axios';
function Profilesection() {
  const { currentUser } = useSelector(state => state.user);

  const photoURL = currentUser?.data?.photoId ?
    `/uploads/${currentUser.data.photoId}` :
    '/default-profile.png';

  const handleViewResume = () => {
    if (currentUser?.data?.resume) {
      window.open(`/uploads/${currentUser.data.resume}`, '_blank');
    }
  };
  const handleViewReport = async () => {
    const empId = currentUser?.data?.empId;
    if (!empId) {
        console.error("❌ Error: Employee ID is undefined");
        alert("Error: Employee ID is missing!");
        return;
    }

    try {
        const response = await axios.get(`/api/generateReport/${empId}`);

        if (!response.data || !response.data.filePath) {
            throw new Error("❌ File path is undefined in response.");
        }

        const filePath = response.data.filePath;
        console.log("✅ Received file path:", filePath);

        // ✅ Open the file in a new tab
        window.open(`${filePath}`, "_blank");
    } catch (error) {
        console.error("❌ Error fetching report:", error);
        alert("Failed to load the report. Please check the console for details.");
    }
  };

  





  return (
    <Container fluid className='text-center pb-5 mt-5'>
      <Row className='justify-content-center'>
        <Col xs={6} md={4}>
          <Image 
            src={photoURL} 
            roundedCircle
            style={{ 
              width: '150px', 
              height: '150px',
              objectFit: 'cover',
              border: '3px solid #f8f9fa'
            }} 
          />
        </Col>
      </Row>
      <Row className="justify-content-center">
        <Col>
          <h1 style={{ fontSize: '48px', fontWeight: 'bold' }}>
            {currentUser.data.name}
          </h1>
          
          {/* Email with icon */}
          <h1 style={{ fontSize: '24px', fontWeight: 'semibold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <a 
              href={`mailto:${currentUser.data.email}`} 
              style={{ color: 'inherit', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}
            >
              <FaEnvelope size={20} />
              {currentUser.data.email}
            </a>
          </h1>

          {/* LinkedIn with icon */}
          {currentUser.data.linkedinProfile && (
            <h1 style={{ fontSize: '24px', fontWeight: 'semibold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <a 
                href={currentUser.data.linkedinProfile}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#0077b5', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}
              >
                <FaLinkedin size={20} />
                {currentUser.data.linkedinProfile}
              </a>
            </h1>
          )}

          <h3 style={{ fontSize: '24px', fontWeight: 'lighter' }}>
            {currentUser.data.educationalBackground}
          </h3>
          <h3 style={{ fontSize: '24px', fontWeight: 'lighter' }}>
            Employee ID: {currentUser.data.empId}
          </h3>
        </Col>
      </Row>

      {/* Add Resume Button */}
      {currentUser?.data?.resume && (
        <Row className="justify-content-center mt-3">
          <Col xs="auto">
            <Button
              style={{ backgroundColor: "#28a745", color: "white", width: "150px" }}
              variant="outline-success"
              onClick={handleViewResume}
              className="d-flex align-items-center gap-2"
            >
              <FaFileAlt />
              View Resume
            </Button>
          </Col>
          <Col xs="auto">
            <Button
              style={{ backgroundColor: "#0077b5", color: "white", width: "150px" }}
              variant="outline-primary"
              onClick={handleViewReport}
              className="d-flex align-items-center gap-2"
            >
              <FaFileAlt />
              View Report
            </Button>
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default Profilesection;