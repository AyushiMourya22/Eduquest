const mongoose=require("mongoose")

const replySchema = new mongoose.Schema({
    content: {type:String,required:true},
    likes:Number,
    dislike:Number,
    user: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  }, { timestamps: true });

  module.exports=mongoose.model("Reply",replySchema)