import React, { useState } from 'react';
import '../styles/Publications.css';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MdDelete, MdPictureAsPdf } from 'react-icons/md';
import axios from 'axios';
import { signInSuccess } from '../redux/user/userSlice';
import { Alert, Button } from 'react-bootstrap';

function Publications() {
  const navigate = useNavigate();
  const { currentUser } = useSelector(state => state.user);
  const dispatch = useDispatch();

  // Use optional chaining to safely access publications
  const publications = currentUser?.data?.publications || [];

  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: null,
  });

  const handleDelete = async (pubId) => {
    setStatus({ loading: true, success: false, error: null });
    try {
      const response = await axios.delete(`/api/delpublications`, {
        data: {
          empId: currentUser?.data?.empId, // Use optional chaining
          id: pubId,
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
    <div className="App">
      <h1>Publications</h1>

      {status.loading && <Alert variant="info">Deleting...</Alert>}
      {status.success && <Alert variant="success">Publication deleted successfully.</Alert>}
      {status.error && <Alert variant="danger">{status.error}</Alert>}

      <div className="publications">
        {publications.map((pub) => (
          <div className="publication" key={pub._id}>
            <div className="document-section">
              
            </div>
            <div className="description">
              <p><strong>{pub.title}</strong></p>
              <p><strong>{pub.category}</strong></p>
              <p><strong>{pub.type}</strong></p>
              <p>{pub.date}</p>
              <p>{pub.description}</p>
              <Button 
                variant="outline-primary" 
                onClick={() => handleViewPDF(pub.fileId)}
                className="view-pdf-btn"
                style={{width: '200px','marginBottom': '10px'}}
              >
                <MdPictureAsPdf /> View PDF
              </Button>
              <button className="custom-button" onClick={() => handleDelete(pub._id)}>
                <MdDelete />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className='forbt'>
        <button className="bt1" onClick={() => navigate('/addPublicationForm')}>Add New Publication</button>
      </div>
    </div>
  );
}

export default Publications;
