const express=require('express');
const path=require('path');
const {open}=require('sqlite');
const sqlite3=require('sqlite3');
const jwt=require('jsonwebtoken');
const bcrypt=require('bcrypt')
const cors = require('cors')


const app = express();

app.use(express.json())

app.use(cors({
    origin: "http://localhost:3001",  
    methods: "GET,POST,PUT,DELETE",  
  }));

const secret_key="MY_SECRET_KEY"

const dbPath=path.join(__dirname,"genztrendzdb.db");
let db=null;
const initializeDBAndServer=async()=>{
    try{
        db=await open({
            filename:dbPath,
            driver:sqlite3.Database,
        });
        app.listen(3000, () => {
            console.log("Server is running on port 3000...");
        });
    }
    catch(e){
        console.log(`DB error : ${e.message}`);
        process.exit(1);
    }
}

const createUserDetailsTable=async ()=>{
    await db.exec(
        `CREATE TABLE IF NOT EXISTS userdetails(
            username VARCHAR PRIMARY KEY,
            password VARCHAR
        ) `
    )
}

app.post("/api/register",async(req,res)=>{
    const {username,password}=req.body;
    const hashedPassword=await bcrypt.hash(password,10);
    const getUsernameQuery=`SELECT * from userdetails WHERE username="${username}"`;
    const dbUsername=await db.get(getUsernameQuery);
    if(dbUsername===undefined){
        const insertingUserDetailsQuery=`
        INSERT INTO userdetails(username,password)
        VALUES ('${username}','${hashedPassword}')`;
        await db.run(insertingUserDetailsQuery);

        res.status(200).send({message:"Account created successfully"});
    }
    else{
        res.status(400);
        res.send({error_msg:"User already exists"});
    }
});

app.post("/api/login",async(req,res)=>{
    const {username,password}=req.body;
    const getUsernameQuery=`SELECT * from userdetails WHERE username="${username}"`;
    const dbUsername=await db.get(getUsernameQuery);
    if(dbUsername===undefined){
        res.status(400);
        res.send({error_msg:"Invalid Username"});
    }
    else{
        const isPasswordMatched=await bcrypt.compare(password,dbUsername.password);
        if(isPasswordMatched===true){
            const payload={username:dbUsername.username};
            const token = jwt.sign(payload, secret_key, { expiresIn: "1h" });
            res.status(200).send({ message: "Login Successful", token });
        }
        else{
            res.status(400);
            res.send({error_msg:"Invalid Password"});
        }
    }
});


initializeDBAndServer().then(createUserDetailsTable)