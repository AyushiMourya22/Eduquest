const express=require("express")

const router=express.Router()
const Course=require("../models/Course")
const Lesson=require("../models/Lesson")
const Quiz = require("../models/Quiz")
const User = require("../models/User")
const { GridFSBucket } = require('mongodb');
const fs = require('fs');
const mongoose=require("mongoose")

router.post("/addcourse",async(req,res)=>{
    try{

        const {title,description,instructor,prerequisites,lessons}=req.body

        const newCourse = new Course({
            title,
            description,
            instructor,
            prerequisites,
            lessons,
          });
          const savedCourse = await newCourse.save();
          res.status(201).json(savedCourse);
    }catch(e){
        res.status(500).json({ error: 'Failed to create the course' });
    }
})


router.get("/getallcourse",async(req,res)=>{
    try{
        const courses=await Course.find({}).populate('lessons')
        res.status(200).json(courses) 
    }catch(e){
        res.status(500).json({ error: 'Failed to fetch all the courses' });
    }
})

router.post("/:courseid/lesson",async(req,res)=>{
    try{
        const id=req.params.courseid

        const { title, description, videoUrl, duration, resources, quizzes } = req.body;

    // Create a new lesson document
    const newLesson = new Lesson({
      title,
      description,
      videoUrl,
      duration,
      resources,
      quizzes,
    });
    const savedLesson = await newLesson.save();
    await Course.findByIdAndUpdate({_id:id}, { $push: { lessons: savedLesson._id } });
    res.json(savedLesson)
    }catch(e){
        res.status(500).json({ error: 'Failed to add the lesson' });
    }
})

router.get("/:courseid/lessons",async(req,res)=>{
    try{
        const id=req.params.courseid
        // const course=await Course.findById({_id:id})
        const course = await Course.findById({_id:id}).populate('lessons');
        res.status(200).json({lessons:course.lessons})
    }catch(e){
        res.status(500).json({ error: 'Failed to fetch all the lessons' });
    }
})

router.post("/:lessonid/addquiz",async(req,res)=>{
    const id=req.params.lessonid

    const {title,question,options,correctOptionId}=req.body

    const newQuiz=new Quiz({
        title,
        question,options,correctOptionId,lesson:id
    })

    const savedQuiz=await newQuiz.save()
    await Lesson.findByIdAndUpdate({_id:id}, { $push: { quizzes: savedQuiz._id } })
    res.json(savedQuiz)
})

router.get("/:lessonid/quizzes",async(req,res)=>{
    const id=req.params.lessonid
    const quizzes=await Lesson.findById({_id:id}).populate("quizzes")
    res.json(quizzes)
})

router.get("/allquizzes",async(req,res)=>{
    const quiz=await Lesson.find({}).populate("quizzes")
    res.json(quiz)
})

router.post("/:id/:courseid/enroll",async(req,res)=>{
   
        const {id,courseid}=req.params
        const user=await User.findById(id)
        if (user.courses.includes(courseid)){
            res.send("Already enrolled")
        }
        else{
            await User.findByIdAndUpdate({_id:id},{$push:{courses:courseid}})
            res.send("done")
        }

    
})

const connection = mongoose.connection;

// Create an instance of GridFSBucket using the MongoDB connection
let gridFSBucket;

// Wait for the MongoDB connection to open
connection.once('open', () => {
  gridFSBucket = new mongoose.mongo.GridFSBucket(connection.db);
  console.log('Connected to MongoDB');
  
});


const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    },
})
const upload = multer({ storage: storage })
router.post("/:lessonid/addvideo",upload.single('myVideo'),async(req,res)=>{
    try {
        const { file } = req;
        const id=req.params.lessonid
        // Read the video file from the local filesystem
        const videoReadStream = fs.createReadStream(file.path);
        console.log(file.originalname)
        // Create a writable stream to upload the video to GridFS
        const uploadStream = gridFSBucket.openUploadStream(file.originalname);
    
        // Pipe the video data from the read stream to the upload stream
        videoReadStream.pipe(uploadStream);
    
        // Wait for the upload to complete
        uploadStream.on('finish', async() => {
        //   fs.unlinkSync(file.path); // Remove the local video file after upload
        const fileId = uploadStream.id;

        // Update the fs.files document with the lesson field
        const db = connection.db;
        const filesCollection = db.collection('fs.files');
        await filesCollection.updateOne(
          { _id: fileId },
          { $set: { lesson:id } }
        );
          res.status(200).json({ message: 'Video uploaded successfully' });
        });
    
        uploadStream.on('error', (error) => {
          console.error('Error occurred during video upload:', error);
          res.status(500).json({ error: 'Internal server error' });
        });
      } catch (error) {
        console.error('Error occurred during video upload:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
})



let streamCounter = 0;
const { ObjectId } = mongoose.Types;

router.get('/:videoId', async (req, res) => {
    const videoId = req.params.videoId;
    const range = req.headers.range;
  
    try {
      const videoObjectId = new ObjectId(videoId);
  
      if (!range) {
        res.status(400).json({ error: 'Range header is required' });
        return;
      }
  
      const files = await gridFSBucket.find({ _id: videoObjectId }).toArray();
  
      if (files.length === 0) {
        res.status(404).json({ error: 'Video not found' });
        return;
      }
  
      const file = files[0];
      console.log(file)
      const videoSize = file
      .length;
      const start = Number(range.replace(/\D/g, ""));
      const end = videoSize - 1;

      const contentLength = end - start + 1;
      const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
      };
  
      res.writeHead(206, headers);
  
      const downloadStream = gridFSBucket.openDownloadStream(videoObjectId, { start });
      downloadStream.pipe(res);
    } catch (error) {
      console.error('Error occurred during video download:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
});

router.get("/:lessonid/allvideos",async(req,res)=>{
    try{
        const id=req.params.lessonid
        const files = await gridFSBucket.find({ lesson:id }).toArray();
        console.log(files)
        res.send(files)
    }catch(e){
        console.error('Error occurred during video fetching:', error);
        res.status(500).json({ error: 'Internal server error' });

    }
})

module.exports=router