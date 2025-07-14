import React, { useState } from 'react';
import axios from 'axios';
import '../styles/AddPublication.css';
import { useSelector,useDispatch } from 'react-redux';
import { signInSuccess } from "../redux/user/userSlice";

function AddPublication() {
    const {currentUser} = useSelector(state => state.user)
    const dispatch = useDispatch(); 
  const [formData, setFormData] = useState({
   
    title: '',
    category: '',
    type: '', 
    otherType: '',
    date: '', 
    description: '', 
    file: null 
  });


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({
      ...formData,
      file: file
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate type
    if (formData.type === 'Others' && !formData.otherType) {
        alert('Please specify the publication type');
        return;
    }

    const data = new FormData();
    data.append('empId', currentUser.data.empId);
    data.append('title', formData.title);
    data.append('category', formData.category);
    
    // Use the selected type or custom type
    const publicationType = formData.type === 'Others' ? formData.otherType : formData.type;
    data.append('type', publicationType);
    
    data.append('date', formData.date);
    data.append('description', formData.description);
    data.append('file', formData.file);

    try {
        const response = await axios.post(`/api/faculty/add-publication`, data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        
        if (response.status === 200) {
            alert('Publication added successfully');
            dispatch(signInSuccess(response));
            setFormData({
                title: '',
                category: '',
                type: '', 
                otherType: '',
                date: '', 
                description: '', 
                file: null 
            });
        }
    } catch (error) {
        console.error('Error:', error);
        alert(error.response?.data?.message || 'Failed to add publication');
    }
  };

  return (
    <div className="divg">
      <div className="addpub">
        <div className="top">
          PUBLICATION DETAILS
        </div>
        <form onSubmit={handleSubmit}>
          
          <div className="textdiv">
            <label htmlFor="title">Title of Publication:</label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="Title of the publication"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div> <br/>

          <div className="category">
            <label htmlFor="category">Category:</label>
            <input
              type="text"
              id="category"
              name="category"
              placeholder="Category of the publication"
              value={formData.category}
              onChange={handleInputChange}
            />
          </div> <br/>

          <div className="type">
            <label htmlFor="type">Type:</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
              className="form-select"
            >
              <option value="">Select Publication Type</option>
              <option value="Research Paper">Research Paper</option>
              <option value="Journal">Journal</option>
              <option value="Conference Paper">Conference Paper</option>
              <option value="Others">Others</option>
            </select>
          </div>

          {formData.type === 'Others' && (
            <div className="other-type">
              <label htmlFor="otherType">Specify Type:</label>
              <input
                type="text"
                id="otherType"
                name="otherType"
                placeholder="Enter publication type"
                value={formData.otherType}
                onChange={handleInputChange}
                required
              />
            </div>
          )} <br/>

          <div className="date">
            <label htmlFor="date">Date:</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              required
            />
          </div> <br/>

          <div className="discriptionarea">
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              name="description"
              placeholder="Describe the publication"
              value={formData.description}
              onChange={handleInputChange}
              required
            ></textarea>
          </div> <br/>

          <div className="file">
            <label htmlFor="upload">Upload Publication:</label>
            <input
              type="file"
              id="upload"
              onChange={handleFileChange}
              required
            />
          </div> <br/>

          <div className="bt">
            <button type="submit" className="add">Add</button>
            <br />
          </div>
        </form>

      </div>
    </div>
  );
}

export default AddPublication;
