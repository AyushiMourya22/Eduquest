const mongoose=require("mongoose")


mongoose.connect(process.env.MONGOURL).then(()=>console.log("Coneection setup successful")).catch((E)=>console.log(E))
