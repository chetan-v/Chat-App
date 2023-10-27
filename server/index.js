const express = require('express');
const pool = require ('./db');
const cors = require('cors');
const bodyParser=require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const e = require('express');

const saltRounds = 10;
const app = express();

app.use(express.json());
// middleware
app.use(cors({
    origin : ["http://localhost:3000"],
    methods: ["GET","POST"],
    credentials: true
}));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended:true}));
app.use(session({
    key:"userId",
    secret: "chat",
    resave:false,
    saveUninitialized:false,
    cookie:{
        expires:60*60*24,
    }

}))

//routes

// app.get('/',async(req,res)=>{
// res.send("hello world")
// })
// sign-up
app.post("/signup",async(req,res)=>{

    try{
   
    const name =req.body.name;
    const password =req.body.password;
    const email =req.body.email;
    const dob =req.body.dob;
    const gender =req.body.gender;
    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1",[email]);
    if(existingUser.rows.length>0)
    {
        return res.status(400).json({message:"Email.already exist"});
    }
    bcrypt.hash(password,saltRounds,(err,hash)=>{
        try {
            pool.query("INSERT INTO users (name,password,email,dob,gender) VALUES($1,$2,$3,$4,$5) returning *",[name,hash,email,dob,gender]);
            console.log("user added");
            return res.status(200);
        } catch (error) {
            console.log(error)
        }
       

    })
    

  }catch(err){
        console.error(err);
    }
 })
 // login 
 app.post("/login", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    pool.query("SELECT * FROM users WHERE email = $1;", [email], (err, result) => {
        if (err) {
            return res.send(400);
        }
        if (result.rows.length > 0) {
            bcrypt.compare(password, result.rows[0].password, (bcryptErr, bcryptRes) => {
                if (bcryptRes) {
                    req.session.user = result.rows[0].name;
                    console.log(req.session.user);

                    return res.sendStatus(200);
                } else {
                    res.send({ message: "wrong password" });
                }
            });
        } else {
            return res.sendStatus(400);
        }
    });
});


app.listen(5000,()=>{
    console.log("server started at 5000");
})