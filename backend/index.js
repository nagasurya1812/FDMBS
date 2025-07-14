    const express = require('express');
    const dotenv = require('dotenv');
    const mongoose = require('mongoose');
    const cookieParser = require('cookie-parser');
    const bodyParser = require('body-parser');
    const cors = require('cors');
    const path = require('path'); 
    const upload = require('./config/multerConfig'); // Import the Multer configuration
    const adminRoutes = require('./routes/Admin');
    const FacultyRoutes = require('./routes/Faculty');

    dotenv.config();

    // Database connection
    mongoose.connect(process.env.DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then((con) => {
        console.log(`MongoDB Connected to host: ` + con.connection.host);
    }).catch(err => {
        console.error('MongoDB connection error:', err.message);
    });

    const app = express();
    app.use(express.json());
    app.use(cors({
        origin: "*",
        credentials: true
    }));

    app.use(cookieParser());
    app.use(bodyParser.urlencoded({ extended: true }));
    

    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
    app.use('/api/admin', adminRoutes);
    app.use('/api/', FacultyRoutes);

    app.use(express.static(path.join(__dirname, "../frontend/build")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "../frontend/build", "index.html"));
    });

    app.listen(5000, () => {
        console.log(`Server running on the port 5000`);
    });

    module.exports = upload; // Export upload for use in routes
