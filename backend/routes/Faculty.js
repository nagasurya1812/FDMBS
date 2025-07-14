const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const upload  = require('../config/multerConfig');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
console.log('Importing upload:', upload);

const Faculty = require('../models/Faculty');
const { log } = require('console');



// Create a new faculty
router.post('/register', upload.single('photoId'), async (req, res) => {
  const {
    name, empId, dob, experience, password, email, phone, address,
    educationalBackground, subjectsHandled, certifications,
    internships, publications, awards, projectsHandled,
    fundedProjectProposals, patents, books, fdpsAttended, consultancies
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if a file was uploaded
    let photoIdPath = null;
    if (req.file) {
      photoIdPath = req.file.path; 
    }

    const newFaculty = new Faculty({
      name,
      empId,
      dob,
      experience,
      password: hashedPassword,
      email,
      phone,
      address,
      educationalBackground,
      photoId: photoIdPath,
      subjectsHandled,
      certifications,
      internships,
      publications,
      awards,
      projectsHandled,
      fundedProjectProposals,
      patents,
      books,
      fdpsAttended,
      consultancies
    });

    await newFaculty.save();
    res.status(201).send('Faculty registered');
  } catch (error) {
    console.error('Error registering faculty:', error);
    res.status(500).send('Error registering faculty');
  }
});


//authenticate

router.post('/login', async (req, res) => {
  console.log('Request body:', req.body);
  const { email, password } = req.body;

  try {
    console.log(`Checking user with email: ${email}`);
    const faculty = await Faculty.findOne({ email });

    if (!faculty) {
      console.log("User not found!");
      return res.status(400).send('Faculty not found');
    }

    console.log(`User found: ${JSON.stringify(faculty)}`);
    if (!faculty.password) {
      console.error("User password is undefined");
      return res.status(500).json({ message: "Internal server error" });
    }

    console.log(`Comparing passwords: input password: ${password}, stored password: ${faculty.password}`);
    const isMatch = await bcrypt.compare(password, faculty.password);

    if (!isMatch) {
      console.log('Invalid credentials');
      return res.status(400).json({ message: "Password is incorrect!" });
    }

    const token = jwt.sign({ id: faculty._id }, process.env.JWT_KEY, { expiresIn: '1h' });
    res.status(200).cookie('token', token, { httpOnly: true }).json(faculty);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error logging in');
  }
});

// Protected dashboard route


// Route to fetch faculty details for dashboard
router.get('/dashboard', (req, res) => {
  const token = req.cookies.token;

  if (!token) {
      return res.status(401).send('Access denied');
  }

  try {
      const verified = jwt.verify(token,process.env.KEY);
      req.user = verified;
      res.json(verified);
  } catch (error) {
      res.status(400).send('Invalid token');
  }
});

// Read all faculty
router.get('/facultydetails', async (req, res) => {
  try {
    const fac = await Faculty.find({});
    if (!fac) {
      res.status(500).send('faculty not found');
    } else {
      res.status(200).send(fac);
    }
  } catch (error) {
    res.status(500).send('Error retrieving faculty details');
  }
});

// Read a single faculty by ID
router.post('/facultyview', async (req, res) => {
  try {
      const faculty = await Faculty.findById(req.body.facid);
      if (!faculty) {
          return res.status(404).send({ message: 'Faculty not found' });
      }
      res.status(200).send(faculty);
  } catch (error) {
      res.status(500).send({ message: 'Server error' });
  }
});

// Update a faculty by ID
router.put('/faculty/:id', async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!faculty) return res.status(404).send();
    res.status(200).send(faculty);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete a faculty by ID
router.delete('/delfac', async (req, res) => {
  const { facid } = req.body;
  try {
    const faculty = await Faculty.findByIdAndDelete(facid);
    const fa=await Faculty()
    if (!faculty) {
      return res.status(404).send('Faculty not found');
    }
    
    res.status(200).send('Faculty deleted successfully');
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

//updating and editing the profile for faculty
router.put('/facultyedit', async (req, res) => {
  const {
    empId,
    name,
    email,
    phone,
    address,
    photoId,
    linkedinProfile, // Ensure to handle this if needed
    resume,
  } = req.body;

  console.log("Received data for update:", req.body); // Log received data

  try {
    const updatedFaculty = await Faculty.findOneAndUpdate(
      { empId }, // Find faculty by empId
      {
        name,
        email,
        phone,
        address,
        photoId,
        linkedinProfile, // If you are handling profile image update
        resume, // Handle resume if needed
      },
      { new: true, runValidators: true }
    );

    if (!updatedFaculty) {
      console.log("Faculty not found with empId:", empId); // Log if not found
      return res.status(404).json({ message: 'Faculty not found' });
    }

    console.log("Profile updated successfully:", updatedFaculty); // Log updated data
    res.status(200).json(updatedFaculty);
  } catch (error) {
    console.error("Error updating profile:", error); // Log error details
    res.status(400).json({ message: 'Error updating profile', error });
  }
});


//------------------------------------------------------------profile upload----------------------------------------------------------------------


router.put('/updateProfileImage', upload.single('profileImage'), async (req, res) => {
  try {
      const { empId } = req.body;

      const faculty = await Faculty.findOne({ empId });

      if (!faculty) {
          return res.status(404).json({ message: "Faculty not found" });
      }

      // Store only the filename instead of full path
      faculty.photoId = req.file.filename; // Changed from req.file.path to req.file.filename

      await faculty.save();

      res.status(200).json({ 
          message: "Profile image updated successfully", 
          photoId: req.file.filename  // Return filename instead of full path
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error updating profile image", error: error.message });
  }
});


//resume`````````````````````````````````````````````````````````````````````````````````````````````````````````````

router.put('/uploadResume', upload.single('resume'), async (req, res) => {
  try {
    const { empId } = req.body;
    const faculty = await Faculty.findOne({ empId });

    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    faculty.resume = req.file.filename;
    await faculty.save();

    res.status(200).json({ 
      message: "Resume uploaded successfully",
      resume: req.file.filename 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error uploading resume" });
  }
});



//-------------------------------------------------------------SUBJECT----------------------------------------------------------------------------

// Add a subject
router.post('/update-subject-percentage', async (req, res) => {
  const { empId, subjectName, courseCode, examType, percentage } = req.body;
  
  console.log('Received data:', req.body);  // Debug statement

  try {
      // Find the faculty by empId
      let faculty = await Faculty.findOne({ empId });

      if (!faculty) {
          return res.status(404).json({ message: 'Faculty not found' });
      }

      // Find the subject
      let subject = faculty.subjectsHandled.find(sub => sub.name === subjectName && sub.coursecode === courseCode);

      if (!subject) {
          // If the subject does not exist, create a new subject
          subject = {
              name: subjectName,
              coursecode: courseCode,
              internalPassPercentages: []
          };
          faculty.subjectsHandled.push(subject);
      }

      // Find the examType in the subject's internalPassPercentages array
      let passPercentage = subject.internalPassPercentages.find(pass => pass.examType === examType);

      if (passPercentage) {
          // If the examType exists, update the percentage
          passPercentage.percentage = percentage;
      } else {
          // If the examType does not exist, add a new entry
          subject.internalPassPercentages.push({ examType, percentage });
      }

      // Save the updated faculty document
      await faculty.save();

      res.json(faculty);
  } catch (error) {
      res.status(500).json({ message: 'Server error', error });
  }
});

  
  // Delete a subject
  router.delete('/delsubjects', async (req, res) => {
    const { empId, id } = req.body;
    try {
      const faculty = await Faculty.findOne({ empId });
      if (!faculty) return res.status(404).send('Faculty not found');
  
      const subjectIndex = faculty.subjectsHandled.findIndex(subject => subject._id.toString() === id);
      if (subjectIndex !== -1) {
        faculty.subjectsHandled.splice(subjectIndex, 1);
        await faculty.save();
        res.status(200).json(faculty);
      } else {
        res.status(404).send('Subject not found');
      }
    } catch (error) {
      res.status(500).send(error);
    }
  });
  


//------------------------------------------------PUBLICATIONS-------------------------------------------------------------------------------------  
  
// Add a publication
router.post('/faculty/add-publication', upload.single('file'), async (req, res) => {
  try {
    const { empId, title, category, type, date, description } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const faculty = await Faculty.findOne({ empId });
    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    const newPublication = {
      title,
      category,
      type,
      date,
      description,
      fileId: file.filename
    };

    faculty.publications.push(newPublication);
    await faculty.save();

    res.status(200).json(faculty); // Send back the updated faculty record
  } catch (error) {
    console.error('Error adding publication:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});


  // Get all publications
  router.get('/faculty/:id/publications', async (req, res) => {
    try {
      const faculty = await Faculty.findById(req.params.id);
      if (!faculty) return res.status(404).send();
      res.status(200).send(faculty.publications);
    } catch (error) {
      res.status(500).send(error);
    }
  });
  
  // Delete a publication
  router.delete('/delpublications', async (req, res) => {
    const { empId, id } = req.body;
    try {
      const faculty = await Faculty.findOne({ empId });
      if (!faculty) return res.status(404).send('Faculty not found');
  
      const publicationIndex = faculty.publications.findIndex(pub => pub._id.toString() === id);
      if (publicationIndex !== -1) {
        faculty.publications.splice(publicationIndex, 1);
        await faculty.save();
        res.status(200).json(faculty);
      } else {
        res.status(404).send('Publication not found');
      }
    } catch (error) {
      res.status(500).send(error);
    }
  });
  

  
//-------------------------------------------------CERTIFICATIONS----------------------------------------------------------------------------------

// Add a certification
router.post('/uploadcertificate', upload.single('upload'), async (req, res) => {
  const { empId, nameofcer, Describecertificate, Duration } = req.body;

  if (!req.file) {
      return res.status(400).send('No file uploaded.');
  }

  try {
      const faculty = await Faculty.findOne({ empId });
      if (!faculty) {
          return res.status(404).send('User not found.');
      }
      console.log(`faculty found ${faculty}`);

      const newCertificate = {
          name: nameofcer,
          description: Describecertificate,
          duration: Duration,
          fileId: req.file.filename
      };

      faculty.certifications.push(newCertificate);
      await faculty.save();

      res.status(200).send(faculty);
  } catch (error) {
      res.status(500).send('Server error.');
  }
});

  
  // Get all certifications
  router.get('/faculty/:id/certifications', async (req, res) => {
    try {
      const faculty = await Faculty.findById(req.params.id);
      if (!faculty) return res.status(404).send();
      res.status(200).send(faculty.certifications);
    } catch (error) {
      res.status(500).send(error);
    }
  });
  
  // Delete a certification
  router.delete('/delcertificates', async (req, res) => {
    const { empId, id } = req.body;
    try {
      const faculty = await Faculty.findOne({ empId });
      if (!faculty) return res.status(404).send('Faculty not found');
  
      const certIndex = faculty.certifications.findIndex(cert => cert._id.toString() === id);
      if (certIndex !== -1) {
        faculty.certifications.splice(certIndex, 1);
        await faculty.save();
        res.status(200).json(faculty);
      } else {
        res.status(404).send('Certificate not found');
      }
    } catch (error) {
      res.status(500).send(error);
    }
  });
  
  
//-----------------------------------------------------AWARDS--------------------------------------------------------------------------------------

// Add an award
router.post('/uploadaward', upload.single('awardImage'), async (req, res) => {
  const { empId, awardName, organization, date } = req.body;

  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    const faculty = await Faculty.findOne({ empId });
    if (!faculty) {
      return res.status(404).send('User not found.');
    }
    console.log(`Faculty found: ${faculty}`);

    const newAward = {
      name: awardName,
      issuer: organization,
      date: date,
      fileId: req.file.filename
    };

    faculty.awards.push(newAward);
    await faculty.save();

    res.status(200).json(faculty); 
  } catch (error) {
    console.error('Error during award upload:', error);
    res.status(500).send('Server error.');
  }
});
  
  // Get all awards
  router.get('/faculty/:id/awards', async (req, res) => {
    try {
      const faculty = await Faculty.findById(req.params.id);
      if (!faculty) return res.status(404).send();
      res.status(200).send(faculty.awards);
    } catch (error) {
      res.status(500).send(error);
    }
  });
  
  // Delete an award
  router.delete('/delawards', async (req, res) => {
    const { empId, id } = req.body;
    try {
      const faculty = await Faculty.findOne({ empId });
      if (!faculty) return res.status(404).send('Faculty not found');
  
      const awardIndex = faculty.awards.findIndex(award => award._id.toString() === id);
      if (awardIndex !== -1) {
        faculty.awards.splice(awardIndex, 1);
        await faculty.save();
        res.status(200).json(faculty);
      } else {
        res.status(404).send('Award not found');
      }
    } catch (error) {
      res.status(500).send(error);
    }
  });
  
//------------------------------------------EVENTS HANDELED--------------------------------------------------------------------------------------------

router.post('/uploadevent', upload.single('eventimg'), async (req, res) => {
  const { empId, eventname, eventdes, eventdate } = req.body;

  if (!req.file) {
      return res.status(400).send('No file uploaded.');
  }

  try {
      const faculty = await Faculty.findOne({ empId });
      if (!faculty) {
          return res.status(404).send('User not found.');
      }

      const newEvent = {
          name:eventname,
          description: eventdes,
          date:eventdate,
          image: req.file.filename
      };

      faculty.events.push(newEvent);
      await faculty.save();

      res.status(200).json(faculty);
  } catch (error) {
      console.error(error); // Log the error for debugging
      res.status(500).send('Server error.');
  }
});
  

router.delete('/delevents', async (req, res) => {
  const { empId, id } = req.body;
  try {
    const faculty = await Faculty.findOne({empId});
    if (!faculty) return res.status(404).send('Faculty not found');
    
    const eventIndex = faculty.events.findIndex(event => event._id.toString() === id);
    if (eventIndex !== -1) {
      faculty.events.splice(eventIndex, 1);
      await faculty.save();
      res.status(200).json(faculty);
    } else {
      res.status(404).send('Event not found');
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

//---------------------------------------------PROJECTS_HANDLED------------------------------------------------------------------------------------

// Add a project
router.post('/faculty/:id/projects', upload.single('pdf'), async (req, res) => {
    try {
      const faculty = await Faculty.findById(req.params.id);
      if (!faculty) return res.status(404).send();
      const project = { ...req.body, fileId: req.file.id };
      faculty.projectsHandled.push(project);
      await faculty.save();
      res.status(200).send(faculty);
    } catch (error) {
      res.status(500).send(error);
    }
  });
  
  // Get all projects
  router.get('/faculty/:id/projects', async (req, res) => {
    try {
      const faculty = await Faculty.findById(req.params.id);
      if (!faculty) return res.status(404).send();
      res.status(200).send(faculty.projectsHandled);
    } catch (error) {
      res.status(500).send(error);
    }
  });
  
  // Delete a project
  router.delete('/faculty/:id/projects/:projectId', async (req, res) => {
    try {
      const faculty = await Faculty.findById(req.params.id);
      if (!faculty) return res.status(404).send();
      const project = faculty.projectsHandled.id(req.params.projectId);
      if (project) {
        await gfs.remove({ _id: project.fileId, root: 'uploads' });
        project.remove();
        await faculty.save();
        res.status(200).send(faculty);
      } else {
        res.status(404).send();
      }
    } catch (error) {
      res.status(500).send(error);
    }
  });

//----------------------------------------------FUNDED_PROJECT--------------------------------------------------------------------------------------

// Add a funded project proposal
router.post('/faculty/add-fpp', upload.single('file'), async (req, res) => {
  try {
    const { empId, title, status, dateSubmitted, dateReviewed, description } = req.body;
    const file = req.file;

    const faculty = await Faculty.findOne({ empId });
    if (!faculty) {
      return res.status(404).send('Faculty not found');
    }

    const newFPP = {
      title,
      status,
      dateSubmitted,
      dateReviewed,
      description,
      fileId: file.filename
    };

    faculty.fundedProjectProposals.push(newFPP);
    await faculty.save();

    res.status(200).json(faculty); // Send back the updated faculty record
  } catch (error) {
    res.status(500).send('Server error');
  }
});
  

  
  // Delete a funded project proposal
  router.delete('/delprojects', async (req, res) => {
    const { empId, id } = req.body;
    try {
      const faculty = await Faculty.findOne({ empId });
      if (!faculty) return res.status(404).send('Faculty not found');
  
      const projectIndex = faculty.fundedProjectProposals.findIndex(project => project._id.toString() === id);
      if (projectIndex !== -1) {
        faculty.fundedProjectProposals.splice(projectIndex, 1);
        await faculty.save();
        res.status(200).json(faculty);
      } else {
        res.status(404).send('Project not found');
      }
    } catch (error) {
      res.status(500).send(error);
    }
  });
  

  
//----------------------------------------------------------PATENTS----------------------------------------------------------------------------------

// Add a patent
router.post('/faculty/add-patent', upload.single('pdf'), async (req, res) => {
  try {
    const { empId, patentNo, patentTitle, patentDescription, dateOfPublishing } = req.body;
    const file = req.file;

    const faculty = await Faculty.findOne({ empId });
    if (!faculty) {
      return res.status(404).send('Faculty not found');
    }

    const newPatent = {
      p_no : patentNo,
      title: patentTitle,
      description: patentDescription,
      dop: new Date(dateOfPublishing),
      fileId: file.filename
    };

    faculty.patents.push(newPatent);
    await faculty.save();

    res.status(200).json(faculty); // Send back the updated faculty record
  } catch (error) {
    res.status(500).send('Server error');
  }
});
  
  // Get all patents
  router.get('/faculty/:id/patents', async (req, res) => {
    try {
      const faculty = await Faculty.findById(req.params.id);
      if (!faculty) return res.status(404).send();
      res.status(200).send(faculty.patents);
    } catch (error) {
      res.status(500).send(error);
    }
  });
  
  // Delete a patent
  router.delete('/delpatents', async (req, res) => {
    const { empId, id } = req.body;
    try {
      const faculty = await Faculty.findOne({ empId });
      if (!faculty) return res.status(404).send('Faculty not found');
  
      const patentIndex = faculty.patents.findIndex(patent => patent._id.toString() === id);
      if (patentIndex !== -1) {
        faculty.patents.splice(patentIndex, 1);
        await faculty.save();
        res.status(200).json(faculty);
      } else {
        res.status(404).send('Patent not found');
      }
    } catch (error) {
      res.status(500).send(error);
    }
  });
  
  
//------------------------------------------------------BOOKS------------------------------------------------------------------------------

// Add a book
router.post('/uploadbook', upload.single('pdf'), async (req, res) => {
  const { academicYear, title, author, description, ISBN, empId } = req.body;
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    const faculty = await Faculty.findOne({empId });
    if (!faculty) {
      return res.status(404).send('User not found.');
    }
    console.log(`Faculty found: ${faculty}`);

    const newBook = {
      academicYear: academicYear,
      title: title,
      author: author,
      description: description,
      ISBN: ISBN,
      fileId: req.file.filename
    };

    faculty.books.push(newBook);
    await faculty.save();

    res.status(200).json(faculty);
  } catch (error) {
    console.error('Error during book upload:', error);
    res.status(500).send('Server error.');
  }
});
  
  // Get all books
  router.get('/faculty/:id/books', async (req, res) => {
    try {
      const faculty = await Faculty.findById(req.params.id);
      if (!faculty) return res.status(404).send();
      res.status(200).send(faculty.books);
    } catch (error) {
      res.status(500).send(error);
    }
  });
  
  // Delete a book
  router.delete('/delbooks', async (req, res) => {
    const { empId, id } = req.body;
    try {
      const faculty = await Faculty.findOne({ empId });
      if (!faculty) return res.status(404).send('Faculty not found');
  
      const bookIndex = faculty.books.findIndex(book => book._id.toString() === id);
      if (bookIndex !== -1) {
        faculty.books.splice(bookIndex, 1);
        await faculty.save();
        res.status(200).json(faculty);
      } else {
        res.status(404).send('Book not found');
      }
    } catch (error) {
      res.status(500).send(error);
    }
  });
  
  
//------------------------------------------------------FDP---------------------------------------------------------------------------------------

// Add an FDP
router.post('/faculty/:id/fdp', upload.single('pdf'), async (req, res) => {
    try {
      const faculty = await Faculty.findById(req.params.id);
      if (!faculty) return res.status(404).send();
      const fdp = { ...req.body, fileId: req.file.id };
      faculty.fdp.push(fdp);
      await faculty.save();
      res.status(200).send(faculty);
    } catch (error) {
      res.status(500).send(error);
    }
  });
  
  // Get all FDPs
  router.get('/faculty/:id/fdp', async (req, res) => {
    try {
      const faculty = await Faculty.findById(req.params.id);
      if (!faculty) return res.status(404).send();
      res.status(200).send(faculty.fdp);
    } catch (error) {
      res.status(500).send(error);
    }
  });
  
  // Delete an FDP
  router.delete('/faculty/:id/fdp/:fdpId', async (req, res) => {
    try {
      const faculty = await Faculty.findById(req.params.id);
      if (!faculty) return res.status(404).send();
      const fdp = faculty.fdp.id(req.params.fdpId);
      if (fdp) {
        await gfs.remove({ _id: fdp.fileId, root: 'uploads' });
        fdp.remove();
        await faculty.save();
        res.status(200).send(faculty);
      } else {
        res.status(404).send();
      }
    } catch (error) {
      res.status(500).send(error);
    }
  });

  
//-------------------------------------------------CONSULTANCY -----------------------------------------------------------------------------------

// Add a consultancy
router.post('/faculty/:id/consultancy', upload.single('pdf'), async (req, res) => {
    try {
      const faculty = await Faculty.findById(req.params.id);
      if (!faculty) return res.status(404).send();
      const consultancy = { ...req.body, fileId: req.file.id };
      faculty.consultancy.push(consultancy);
      await faculty.save();
      res.status(200).send(faculty);
    } catch (error) {
      res.status(500).send(error);
    }
  });
  
  // Get all consultancy
  router.get('/faculty/:id/consultancy', async (req, res) => {
    try {
      const faculty = await Faculty.findById(req.params.id);
      if (!faculty) return res.status(404).send();
      res.status(200).send(faculty.consultancy);
    } catch (error) {
      res.status(500).send(error);
    }
  });
  
  // Delete a consultancy
  router.delete('/faculty/:id/consultancy/:consultancyId', async (req, res) => {
    try {
      const faculty = await Faculty.findById(req.params.id);
      if (!faculty) return res.status(404).send();
      const consultancy = faculty.consultancy.id(req.params.consultancyId);
      if (consultancy) {
        await gfs.remove({ _id: consultancy.fileId, root: 'uploads' });
        consultancy.remove();
        await faculty.save();
        res.status(200).send(faculty);
      } else {
        res.status(404).send();
      }
    } catch (error) {
      res.status(500).send(error);
    }
  });
  

// Route to generate PDF report

router.get("/generateReport/:empId", async (req, res) => {
  const empId = req.params.empId;
  console.log("Requested Employee ID:", empId);

  try {
      const faculty = await Faculty.findOne({ empId });
      if (!faculty) {
          return res.status(404).json({ message: "Faculty not found" });
      }

      // ✅ Ensure uploads directory exists
      const uploadsDir = path.join(__dirname, "../uploads");
      if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
          console.log("✅ Uploads directory created:", uploadsDir);
      }

      // ✅ Define file path
      const filename = `Report_${faculty.name.replace(/\s+/g, "_")}.pdf`;
      const filePath = path.join(uploadsDir, filename);
      console.log("✅ File will be saved at:", filePath);

      // ✅ Create PDF document
      const doc = new PDFDocument();
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);
      
      // ✅ Profile Picture (Move slightly down)
      const imagePath = faculty.photoId ? path.join(__dirname, "../uploads", faculty.photoId) : null;
      
      if (imagePath && fs.existsSync(imagePath)) {
          doc.image(imagePath, doc.page.width - 120, 80, { width: 100, height: 100 });
      }

      const publications = faculty.publications || [];
const fundedProjectProposals = faculty.fundedProjectProposals || [];
const projectsHandled = faculty.projectsHandled || [];
const eventsHandled = faculty.eventsHandled || [];
const subjectsHandled = faculty.subjectsHandled || [];
const books = faculty.books || [];
const certifications = faculty.certifications || [];
const awards = faculty.awards || [];
const consultancies = faculty.consultancies || [];
      
      // ✅ Title
      doc.fontSize(25).text("Faculty Report", { align: "center" }).moveDown(1.5);
      
      // ✅ Faculty Basic Information
      doc.x = 50;
      doc.fontSize(18).text(`Name: ${faculty.name}`).moveDown();
      doc.text(`Employee ID: ${faculty.empId}`).moveDown();
      doc.text(`Date of Birth: ${faculty.dob?.toDateString() || "N/A"}`).moveDown();
      doc.text(`Experience: ${faculty.experiance || "N/A"}`).moveDown();
      doc.text(`Email: ${faculty.email}`).moveDown();
      doc.text(`Phone: ${faculty.phone}`).moveDown();
      doc.text(`Address: ${faculty.address || "N/A"}`).moveDown();
      doc.text(`LinkedIn: ${faculty.linkedinProfile || "N/A"}`).moveDown(2);
      
      // ✅ Educational Background
      doc.fontSize(18).text("Educational Background:").moveDown(0.5);
      doc.fontSize(14).text(faculty.educationalBackground || "N/A").moveDown(1.5);
      
      doc.fontSize(18).text("Publications:");
if (publications.length > 0) {
    publications.forEach((pub) => {
        doc.fontSize(14).text(`  Title: ${pub.title}`);
        doc.fontSize(14).text(`  Type: ${pub.type}`);
        doc.fontSize(14).text(`  Category: ${pub.category}`);
        doc.fontSize(14).text(`  Description: ${pub.description}`);
        doc.moveDown(); // Add space after each publication
    });
} else {
    doc.fontSize(14).text("N/A");
}
doc.moveDown();

doc.fontSize(18).text("Funded Project Proposals:");
fundedProjectProposals.length > 0
    ? fundedProjectProposals.forEach((prop) => {
      doc.fontSize(14).text(`  Title: ${prop.title}`);
      doc.fontSize(14).text(`  Status: ${prop.status}`);
      doc.fontSize(14).text(`  Date Submitted: ${prop.dateSubmitted}`);
      doc.fontSize(14).text(`  Date Reviewed: ${prop.dateReviewed}`);
      doc.fontSize(14).text(`  Description: ${prop.description}`);
      doc.moveDown();})
    : doc.fontSize(14).text("N/A");
doc.moveDown();

doc.fontSize(18).text("Subjects Handled:");
subjectsHandled.length > 0
    ? subjectsHandled.forEach((prop) => {
      doc.fontSize(14).text(`  Name: ${prop.name}`);
      doc.fontSize(14).text(`  Course Code: ${prop.coursecode}`);
      doc.fontSize(14).text(`  Internal Pass Percentages:`);
      prop.internalPassPercentages.forEach((pass) => {
          doc.fontSize(14).text(`    - ${pass.examType}: ${pass.percentage}`);
          doc.moveDown();
        });
      doc.moveDown();
    })
    : doc.fontSize(14).text("N/A");
doc.moveDown();

doc.fontSize(18).text("Projects Handled:");
projectsHandled.length > 0
    ? projectsHandled.forEach((proj) => {
    doc.fontSize(14).text(`  Title: ${proj.title}`)
    doc.fontSize(14).text(`  Description: ${proj.description}`);
    doc.fontSize(14).text(`  Date: ${proj.date}`);
    doc.fontSize(14).text(`  Status: ${proj.status}`);
    doc.moveDown();}) 
    : doc.fontSize(14).text("N/A");
doc.moveDown();

doc.fontSize(18).text("Events Handled:");
eventsHandled.length > 0
    ? eventsHandled.forEach((event) => {
      doc.fontSize(14).text(`  Name: ${event.name}`)
      doc.fontSize(14).text(`  Description: ${event.description}`);
      doc.fontSize(14).text(`  Date: ${event.date}`);
      doc.fontSize(14).text(`  Image: ${event.image}`);
      doc.moveDown();})
    : doc.fontSize(14).text("N/A");
doc.moveDown();

doc.fontSize(18).text("Books:");
books.length > 0
    ? books.forEach((book) => {
      doc.fontSize(14).text(`  Title: ${book.title}`);
      doc.fontSize(14).text(`  Author: ${book.author}`);
      doc.fontSize(14).text(`  Description: ${book.description}`);
      doc.fontSize(14).text(`  ISBN: ${book.ISBN}`);
      doc.moveDown();})
    : doc.fontSize(14).text("N/A");
doc.moveDown();

doc.fontSize(18).text("Certifications:");
certifications.length > 0
    ? certifications.forEach((cert) => {doc.fontSize(14).text(`  Name: ${cert.name}`)
    doc.fontSize(14).text(`  Description: ${cert.description}`);
    doc.fontSize(14).text(`  Duration: ${cert.duration}`);
   doc.moveDown();}
    )
    : doc.fontSize(14).text("N/A");
doc.moveDown();

doc.fontSize(18).text("Awards:");
awards.length > 0
    ? awards.forEach((award) =>{ 
      doc.fontSize(14).text(`  Name: ${award.name}`);
      doc.fontSize(14).text(`  Issuer: ${award.issuer}`);
      doc.fontSize(14).text(`  Date: ${award.date}`);
      doc.moveDown();
    })
    : doc.fontSize(14).text("N/A");
doc.moveDown();
      
      // ✅ End document
      doc.end();
      
      // ✅ Ensure response is sent after file creation
      stream.on("finish", () => {
          console.log("✅ PDF generated successfully:", filePath);
          res.json({ filePath: `/uploads/${filename}` });
      });
      
  } catch (error) {
      console.error("❌ Error generating report:", error);
      res.status(500).json({ message: "Error generating report" });
  }
});



module.exports = router;