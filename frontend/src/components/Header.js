import React from 'react';
import { Navbar, Nav, Button, Container, DropdownButton, Dropdown } from 'react-bootstrap';
import logo from "../images/logo.png"
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useSelector(state => state.user)
  
  const isLandingPage = location.pathname === '/';

  const handleGetStartClick = () => {
    navigate('/facultyLogin'); 
  };

  const handleSignup = () => {
    navigate('/adminLogin'); 
  };

  const handleNavigation = (section) => {
    if (isLandingPage) {
      document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(`/?section=${section}`);
    }
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="p-3 w-100">
      <Container className='w-100'>
        <Navbar.Brand as={Link} to="/">
          <img src={logo} alt='logo' className='logo'/>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            <Nav.Link 
              onClick={() => handleNavigation('home')} 
              className="text-secondary"
            >
              Home
            </Nav.Link>
            <Nav.Link 
              onClick={() => handleNavigation('features')} 
              className="text-white"
            >
              Features
            </Nav.Link>
            <Nav.Link 
              onClick={() => handleNavigation('about')} 
              className="text-white"
            >
              About
            </Nav.Link>
            <Nav.Link 
              onClick={() => handleNavigation('contact')} 
              className="text-white"
            >
              Contact
            </Nav.Link>
          </Nav>
          
          <div className="text-end">
            {currentUser ? (
              <DropdownButton 
              className="me-2 custom-button btn-sm" 
                id="dropdown-button" 
                title="Sign-Out" 
                style={{ padding: '2px 5px', fontSize: '10px', width: 'auto' }}
              >
                <Dropdown.Item as={Link} to="/dashboard">Profile</Dropdown.Item>
                <Dropdown.Item as={Link} to="/">Sign-Out</Dropdown.Item>
              </DropdownButton>
            ) : (
              <div>
                <Button 
                  variant="outline-light" 
                  className="me-2 custom-button btn-sm" 
                  onClick={handleGetStartClick}
                >
                  Login
                </Button>
                <Button 
                  variant="warning" 
                  className="custom-button btn-sm" 
                  onClick={handleSignup}
                >
                  Sign-up
                </Button>
              </div>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;