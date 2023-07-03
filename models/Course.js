const mongoose=require("mongoose")

const courseSchema=mongoose.Schema({
    title:{
        type:String,
        unique:true,
        required:true
    },
    description:{
        type:String,
        required:true,
    },
    instructor:{
        type:String,
        required:true,
    },
    prerequisites:{
        type:String,

    },
    lessons: [
        { type: mongoose.Schema.Types.ObjectId,
          ref: 'Lesson' 
        }
    ],
}, { timestamps: true })


module.exports=mongoose.model("Course",courseSchema)