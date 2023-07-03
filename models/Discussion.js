const mongoose=require("mongoose")

const discussionSchema = new mongoose.Schema({
    content:String,
    likes:Number,
    dislike:Number,
    replies:[
        {type:mongoose.Schema.Types.ObjectId,
        ref:"Reply"}
    ]

    ,
    user: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  }, { timestamps: true });

  module.exports=mongoose.model("Discussion",discussionSchema)