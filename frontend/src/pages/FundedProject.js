import React, { useState } from 'react';
import '../styles/fundedProject.css';  // Rename App.css to FundedProjects.css
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MdDelete, MdPictureAsPdf } from 'react-icons/md';
import axios from 'axios';
import { signInSuccess } from '../redux/user/userSlice';
import { Alert, Button } from 'react-bootstrap';

function FundedProjects() {
  const navigate = useNavigate();
  const { currentUser } = useSelector(state => state.user);
  const dispatch = useDispatch();

  // Use optional chaining to safely access projects
  const projects = currentUser?.data?.fundedProjectProposals || [];

  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: null,
  });

  const handleDelete = async (projectId) => {
    setStatus({ loading: true, success: false, error: null });
    try {
      const response = await axios.delete(`/api/delprojects`, {
        data: {
          empId: currentUser?.data?.empId, // Use optional chaining
          id: projectId,
        },
      });
      if (response.status === 200) {
        dispatch(signInSuccess(response));
        setStatus({ loading: false, success: true, error: null });
      }
    } catch (error) {
      const errorMessage = error.response && error.response.data ? JSON.stringify(error.response.data) : 'Server error';
      setStatus({ loading: false, success: false, error: errorMessage });
    }
  };

  const handleViewPDF = (fileId) => {
    window.open(`/uploads/${fileId}`, '_blank');
  };

  return (
    <div className="FundedProjects">
      <h1>Projects</h1>

      {status.loading && <Alert variant="info">Deleting...</Alert>}
      {status.success && <Alert variant="success">Project deleted successfully.</Alert>}
      {status.error && <Alert variant="danger">{status.error}</Alert>}

      <div className="projects">
        {projects.map((project) => (
          <div className="project" key={project._id}>
            <div className="details">
              <p><strong>{project.title}</strong></p>
              <p>{project.status}</p>
              <p>Date Submitted: {project.dateSubmitted}</p>
              <p>{project.description}</p>
              <Button 
                variant="outline-primary" 
                onClick={() => handleViewPDF(project.fileId)}
                className="view-pdf-btn"
                style={{width: '200px', marginBottom: '10px'}}
              >
                <MdPictureAsPdf /> View PDF
              </Button>
              <button className="custom-button" onClick={() => handleDelete(project._id)}>
                <MdDelete />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className='forbt'>
        <button className="bt1" onClick={() => navigate('/addFppForm')}>Add New Project</button>
      </div>
    </div>
  );
}

export default FundedProjects;
