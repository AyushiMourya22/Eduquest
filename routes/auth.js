const express=require("express")

const router=express.Router()
const User =require("../models/User")

const bcrypt=require("bcryptjs")
const {body , validationResult}=require('express-validator')
const jwt=require("jsonwebtoken")
const getUser = require("../middleware/auth")


router.post("/register",[
    body('email',"Enter a valid email address").isEmail(),
    body('first','Enter a valid first name').isLength({min:2}),
    body('last','Enter a valid last name').isLength({min:2}),
    body('role','Enter a valid role').isLength({min:4}),
    body('password',"The minimum length of password is 4").isLength({min:4}),

], async (req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({error:errors.array()})
    } 
    try{
        const {first,last,bio,email,password,role}=req.body
        let user=await User.findOne({email})
        console.log(user)
        if(user){
            return res.status(422).json({error:"Email already exists"})
        }else{
            const salt=await bcrypt.genSalt(10)
            const securePassword=await bcrypt.hash(password,salt)
            user=await User.create({first,last,bio,email,password:securePassword,role})
            const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:"1h"})
            res.status(200).json({_id:user._id,
            first:user.first,
            last:user.last,
            bio:user.bio,
            email:user.email,
            token,
            role:user.role  
        })
        }
    }catch(e){
        console.log(e.message)
        res.status(500).json({error:"Some internal error occured"})
    }

})

router.post("/login",[
    body('email',"Enter a valid email address").isEmail(),
    body('password',"The minimum length of password is 4").isLength({min:4}),

]
,async(req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({error:errors.array()})
    } 
    try{
        const {email,password}=req.body
        let user=await User.findOne({email})
        // console.log(user)
        if(user){
            const passok=await bcrypt.compare(password,user.password)
            // console.log(passok)
            if(passok){
                const token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:"1h"})
                // console.log(token)
                    res.cookie('token',token).json({_id:user._id,
                        first:user.first,
                        last:user.last,
                        email:user.email,
                        role:user.role,
                        bio:user.bio,
                        token})
                
            }else{

                res.status(422).json({error:"Incorrect credentials"})
            }
        }
        else{
            res.status(422).json({error:"Incorrect credentials"})
        }
    }catch(e){
        res.status(500).json(e)
    }

})

router.get("/getuser",getUser,async(req,res)=>{
    try {
        const user=req.user
         res.status(200).send(user)
        
    } catch (error) {
        console.log(error.message)
         res.status(500).send("Some internal error occured")
    }
})

router.post("/logout",getUser,(req,res)=>{
    res.clearCookie('token').send("success")
})

module.exports=router