// const express = require('express');
// const app = express();
// const bodyParser = require('body-parser');
// const mongoose = require('mongoose');
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs').promises; 
// const port = 3000;

// const ImageModel = require("./imagemodel");

// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));

// mongoose.connect('mongodb://localhost:27017/imageUpload', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// })
//     .then(() => console.log("db is connected"))
//     .catch((err) => console.log(err, "It has an error"));

// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// const storage = multer.diskStorage({
//     destination: 'uploads',
//     filename: (req, file, cb) => {
//         cb(null, file.originalname);
//     },
// });

// const upload = multer({ storage: storage }).single('testImage');
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'home.html'));
// });

// app.get('/form', (req, res) => {
//     res.sendFile(path.join(__dirname, 'upload.html'));
// });
// app.post('/upload', (req, res) => {
//     upload(req, res, (err) => {
//         if (err) {
//             console.log(err);
//             return res.status(500).send('Upload failed.');
//         }      
//         const newImage = new ImageModel({
//             name: req.body.name,
//             image: {
//                 data: req.file.buffer,
//                 contentType: req.file.mimetype
//             }
//         });
//         newImage.save()
//             .then(() => res.send("Successfully uploaded"))
//             .catch(err => console.log(err));
//     });
// });

// app.get('/display', async (req, res) => {
//     try {
       
//         const files = await fs.readdir('uploads');
        
        
//         const images = await ImageModel.find({}).exec();

       
//         res.render('display', { images: images, uploadedFiles: files });
//     } catch (error) {
//         console.error(error);
//         res.status(500).send('Internal Server Error');
//     }
// });
// app.listen(port, () => {
//     console.log(`Server running at http://localhost:${port}`);
// });




const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises; 
const port = process.env.port || 8000;

const ImageModel = require("./imagemodel");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

mongoose.connect('mongodb://localhost:27017/imageUpload', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("db is connected"))
    .catch((err) => console.log(err, "It has an error"));



app.set('views', path.join(__dirname, 'views'));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Serve static files from the 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// Storage configuration for multer
const storage = multer.diskStorage({
    destination: 'uploads',
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage }).single('testImage');

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});

app.get('/form', (req, res) => {
    res.sendFile(path.join(__dirname, 'upload.html'));
});

app.post('/upload', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Upload failed.');
        }

        const newImage = new ImageModel({
            name: req.body.name,
            image: {
                data: req.file.buffer,
                contentType: req.file.mimetype
            }
        });
        newImage.save()
            .then(() => {
                res.send("<script>alert('Successfully uploaded'); window.location.href = '/display';</script>");
            })
            .catch(err => console.log(err));
    });
});
app.delete('/delete', async (req, res) => {
    try {
        const { filename } = req.query;
        const imagePath = path.join(__dirname, 'uploads', filename);
        await fs.unlink(imagePath); 
        
        res.sendStatus(200); 
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/display', async (req, res) => {
    try {
        const files = await fs.readdir('uploads');
        const images = await ImageModel.find({}).exec();       
        const dates = [];
        
      res.render('display', { images: images, uploadedFiles: files, dates: dates });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});