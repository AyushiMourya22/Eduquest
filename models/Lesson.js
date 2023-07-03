const mongoose=require("mongoose")

const lessonSchema = new mongoose.Schema({
    title: {type:String,required:true,unique:true},
    description: {type:String,required:true,unique:true},
    // videoUrl: [{type: mongoose.Schema.Types.ObjectId, ref: "fs.files"},  ],
    duration: Number,
    resources: [{
      title: String,
      url: String,
    }],
    quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }],
  }, { timestamps: true });

  module.exports=mongoose.model("Lesson",lessonSchema)