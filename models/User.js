const mongoose =require("mongoose")

const userSchema= mongoose.Schema({
    first:{
        type:String,
        required:true,
    },
    last:{
        type:String,
        required:true,
    },
    bio:{
        type:String,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        required:true,

    },
    discussion: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Discussion' }],
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
})

module.exports=mongoose.model("User",userSchema)