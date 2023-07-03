require("dotenv").config()
require("./conn")

const express=require("express")
const cors=require("cors")
const app=express()
const cookieParser=require('cookie-parser')
const User=require("./models/User")
const getUser = require("./middleware/auth")

const bodyParser=require("body-parser")

app.use(cookieParser())
app.use(express.json())
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
  }));
app.use(cors())

app.get("/test",(req,res)=>{
    res.send("Okayeee")
})


app.use('/auth',require("./routes/auth"))
app.use('/courses',getUser,require("./routes/courses"))
app.use('/discussion',getUser,require("./routes/discussions"))

app.listen(5000,()=>{
    console.log("Listening at port 5000")
})