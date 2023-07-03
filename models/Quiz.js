const mongoose =require("mongoose")

const quizSchema= mongoose.Schema({
    title:{
        type:String,
        required:true,
    },
    lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
    question:{
        type:String,
        required:true
    },
    options: [{
        _id: false,
        id:Number,
        text: String,
      }],
      correctOptionId: Number,
}, { timestamps: true })



module.exports=mongoose.model("Quiz",quizSchema)