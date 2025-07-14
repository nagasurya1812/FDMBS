import React, { useState } from 'react';
import '../styles/fundedProject.css';  // Rename App.css to fundedProject.css
import { useSelector } from 'react-redux';
import { MdPictureAsPdf } from 'react-icons/md';
import { Button } from 'react-bootstrap';

function FundedProjectsDisplay() {
    const { currentUser } = useSelector(state => state.user);
    const projects = currentUser.data.fundedProjectProposals;

    const [searchTerm, setSearchTerm] = useState('');
    const [filteredProjects, setFilteredProjects] = useState(projects);

    const handleSearch = (event) => {
        const term = event.target.value;
        setSearchTerm(term);

        const filtered = projects.filter(project => {
            const title = project.title?.toLowerCase() || '';
            const status = project.status?.toLowerCase() || '';
            const dateSubmitted = project.dateSubmitted?.toLowerCase() || '';
            const description = project.description?.toLowerCase() || '';
            return title.includes(term.toLowerCase()) ||
                   status.includes(term.toLowerCase()) ||
                   dateSubmitted.includes(term.toLowerCase()) ||
                   description.includes(term.toLowerCase());
        });

        setFilteredProjects(filtered);
    };

    const handleViewPDF = (fileId) => {
        window.open(`/uploads/${fileId}`, '_blank');
    };

    return (
        <div className="FundedProjects">
            <h1>Funded Projects Proposals</h1>
            <div className="search-bar">
                <input
                    type="text"
                    placeholder="Search by title, status, date submitted, or description"
                    value={searchTerm}
                    onChange={handleSearch}
                />
            </div>
            <div className="projects">
                {filteredProjects.map((project) => (
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
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default FundedProjectsDisplay;
