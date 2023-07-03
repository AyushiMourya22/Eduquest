const express=require("express")
const Discussion = require("../models/Discussion")
const User = require("../models/User")
const Reply = require("../models/Reply")

const router=express.Router()

router.post("/:id/addpost",async(req,res) =>{
    try{const id=req.params.id
    const post=new Discussion({
        user:id,
        content:req.body.content,
        likes:0,
        dislikes:0
    })
    const savedPost=await post.save()
    await User.findByIdAndUpdate({_id:id},{$push:{discussion:savedPost}})
    res.json(savedPost)}
    catch(e){
        res.status(500).json(e)
    }
})



router.post("/:userid/:postid/addreply",async(req,res) =>{
    try{
        const userid=req.params.userid
        const postid=req.params.postid
        console.log(req.body.content)
    const post=new Reply({
        user:userid,
        content:req.body.content,
        likes:0,
        dislikes:0
    })
    const savedPost=await post.save()
    await Discussion.findByIdAndUpdate({_id:postid},{$push:{replies:savedPost}})
    res.json(savedPost)}
    catch(e){
        res.status(500).json(e)
    }
})

router.get("/getallposts",async(req,res)=>{
    try{
        const allposts=await Discussion.find({}).populate("replies")
        res.json(allposts)
    }catch(e){
        res.status(500).json(e)
    }
})
module.exports=router