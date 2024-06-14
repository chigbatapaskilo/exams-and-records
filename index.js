const express= require("express")
const mongoose=require("mongoose")
const port = 4567

const app=express()

app.use(express.json())

mongoose.connect("mongodb+srv://chigbatapaskilo:4Qcw8vzjJt6nI77H@cluster0.c4bxivw.mongodb.net/").then(()=>{
    
    console.log("connection to db is sucessfully established")
    app.listen(port,()=>{

        console.log("application is starting on port  "+port)
    })
}).catch((err)=>{
console.log("unable to connect to db"+err.message)
})

// app.get('/',(req,res)=>{
// res.status(200).json(`welcome to mongoDB`)
// })

app.get("/",(req,res)=>{
    res.status(200).json("welcome to our backend api")
})



const scoreSchema=new mongoose.Schema({
firstName:{type:String,required:[true,"kindly fill your first name"]},
lastName:{type:String,required:[true,"kindly fill your last name"]},
birthYear:{type:Number,required:[true,"birth years is required"]},
age:{type:Number},
sex :{type:String ,required:true,enum:["male" , "female"]},
state:{type:String,required:[true,"kindly fill your state"]},
subjects:{type:Array,required :[true,"kindly fill your subjects"]},
scores:{type:Object,required:[true,"kindly  fill your scores"]},
total:{type:Number},
isPassed:{type:Boolean,default:function(){
    if(this.total<200){
            return false
          }else{
            return true
          } 
}}
},{timestamps:true})


const scoreModel= mongoose.model("ps utme score",scoreSchema)
const date= new Date
//create our first user
app.post("/createuser",async(req,res)=>{
  
    try {

        const{firstName,lastName,birthYear,sex,state,subjects,scores}=req.body


       

if(!(subjects.includes(Object.keys(scores)[0]) && subjects.includes(Object.keys(scores)[1]) && subjects.includes(Object.keys(scores)[2]) && subjects.includes(Object.keys(scores)[3]))){
    return res.status(400).json("scores column doesnt match with the subject provided")
}else{
    const data={firstName:firstName,
        lastName:lastName,
        birthYear:birthYear,
        sex:sex,
        state:state,
        subjects:subjects,
        age:date.getFullYear()-birthYear,
        scores:scores,
        total:Object.values(scores).reduce((a,b)=>{
            return  a+b
          }),
       
    } 
    if(data.age<18){return res.status(400).json("you are not eligible to register for this exam ")}
    const newData=  await  scoreModel.create(data)
         

res.status(201).json({message:`new user created`,newData})
}
    } catch (error) {
       res.status(500).json(error.message) 
    }
})

app.get("/getAll",async(req,res)=>{
    try{
        const allStudent=await scoreModel.find()
        res.status(200).json({message:`kindly find below the ${allStudent.length} registered students `,allStudent})

    }catch(error){
        res.status(500).json(error.message)
    }

})

app.get("/getonestudent/:ID", async(req,res)=>{
    try {
        let ID = req.params.ID
        const getOne = await scoreModel.findById(ID)
        res.status(200).json({message:`below is the ${ID} of the requested student`, getOne})
        
    } catch (error) {
        res.status(500).json(error.message)
        
    }
})

//get pass students

app.get("/:status",async(req,res)=>{
    try {
        let status=req.params.status.toLowerCase()==="true"
        
        const getPass= await scoreModel.find({isPassed:status})
        if (status==true){
            res.status(200).json({
                message:`kindly find below the ${getPass.length} passed students`,
                data:getPass
            })
        }else{
            res.status(200).json({
                message:`kindly find below the ${getPass.length} failled students`,
                data:getPass
            })    
        }

      
           
    } catch (error) {
     res.status(500).json(error.message)   
    }
})

// update user scores

app.put("/updatescores/:id",async (req,res)=>{
try {
    const userId=req.params.id
    let{yb,subjects,scores}=req.body
let data={
    birthYear:yb,
    age:date.getFullYear() - yb,
    subjects,
    scores,
    total:Object.values(scores).reduce((a,b)=>{
        return a+b
    }),
}
if(data.total < 200){
    data.isPassed=false
}else{
    data.isPassed= true
}
if(!mongoose.Types.ObjectId.isValid(userId)){
    return res.status(400).json(`user with id:${userId} not found`)
}

//  data.total < 200 ? isPassed = false : isPassed = true

if(!(subjects.includes(Object.keys(scores)[0]) && subjects.includes(Object.keys(scores)[1]) && subjects.includes(Object.keys(scores)[2]) && subjects.includes(Object.keys(scores)[3]))){
    return res.status(400).json("scores column doesnt match with the subject provided")
   
}else{
   const updatedUser= await scoreModel.findByIdAndUpdate(userId,data,{new:true})
    res.status(200).json({message:updatedUser.firstName + " information has been succesfully updated",data:updatedUser})
}
   
} catch (error) {
    
    res.status(500).json(error.message)
}
})

app.put("/updateinfo/:id",async(req,res)=>{

    try {

        const {firstName,lastName,state,sex}=req.body
let firstLetter=firstName.charAt(0).toUpperCase()
let remainingChar=firstName.slice(1).toLowerCase()
let allTogether=firstLetter.concat(remainingChar)

let firstLetter2=lastName.charAt(0).toUpperCase()
let remainingChar2=lastName.slice(1).toLowerCase()
let allTogether2=firstLetter2.concat(remainingChar2)

let firstLetter3=state.charAt(0).toUpperCase()
let remainingChar3=state.slice(1).toLowerCase()
let allTogether3=firstLetter3.concat(remainingChar3)


        const userInfo={
firstName:allTogether,
lastName:allTogether2,
state:allTogether3,
sex

        }
        console.log(userInfo)

        if(!mongoose.Types.ObjectId.isValid(req.params.id)){
            return res.status(400).json(`user with id:${req.params.id} not found`)
        }
        

        if(userInfo.sex !== "male" &&  userInfo.sex !=="female" ){

         return    res.status(400).json("sex can either be male or female")
        }
       
let updateUserInfo=await scoreModel.findByIdAndUpdate(req.params.id,userInfo,{new:true})

res.status(200).json({
    message:`${updateUserInfo.firstName} information has been updated`,
    userInfo:updateUserInfo
})

        
    } catch (error) {
    res.status(500).json(error.message)    
    }
})