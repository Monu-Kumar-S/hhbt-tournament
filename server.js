// server.js

const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")

const app = express()

app.use(cors())
app.use(express.json())

// ======================
// MONGODB CONNECTION
// ======================

mongoose.connect(
    "mongodb://127.0.0.1:27017/hhbt",
    {
        serverSelectionTimeoutMS:5000
    }
)
.then(()=>{
    console.log("MongoDB Connected")
})
.catch((err)=>{
    console.log("MongoDB Error:", err)
})

// ======================
// TEAM SCHEMA
// ======================

const TeamSchema = new mongoose.Schema({

    name:String,

    category:String

})

const Team = mongoose.model("Team", TeamSchema)

// ======================
// MATCH SCHEMA
// ======================

const MatchSchema = new mongoose.Schema({

    teamA:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Team"
    },

    teamB:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Team"
    },

    scoreA:Number,

    scoreB:Number

})

const Match = mongoose.model("Match", MatchSchema)

// ======================
// HOME
// ======================

app.get("/",(req,res)=>{

    res.send("HHBT Backend Running")

})

// ======================
// GET TEAMS
// ======================

app.get("/teams", async(req,res)=>{

    try{

        const teams = await Team.find()

        res.json(teams)

    }catch(error){

        console.log(error)

        res.status(500).send("Error fetching teams")
    }

})

// ======================
// ADD TEAM
// ======================

app.post("/add-team", async(req,res)=>{

    try{

        const team = new Team({

            name:req.body.name,

            category:req.body.category

        })

        await team.save()

        res.send("Team Added")

    }catch(error){

        console.log(error)

        res.status(500).send("Error adding team")
    }

})

// ======================
// GET MATCHES
// ======================

app.get("/matches", async(req,res)=>{

    try{

        const matches = await Match.find()
        .populate("teamA")
        .populate("teamB")

        res.json(matches)

    }catch(error){

        console.log(error)

        res.status(500).send("Error fetching matches")
    }

})

// ======================
// ADD MATCH
// ======================

app.post("/add-match", async(req,res)=>{

    try{

        const match = new Match({

            teamA:req.body.teamA,

            teamB:req.body.teamB,

            scoreA:req.body.scoreA,

            scoreB:req.body.scoreB

        })

        await match.save()

        res.send("Match Added")

    }catch(error){

        console.log(error)

        res.status(500).send("Error adding match")
    }

})

// ======================
// RESET TOURNAMENT
// ======================

app.delete("/reset", async(req,res)=>{

    try{

        await Team.deleteMany({})

        await Match.deleteMany({})

        res.send({
            success:true
        })

    }catch(error){

        console.log(error)

        res.status(500).send({
            success:false
        })
    }

})

// ======================
// UNDO LAST MATCH
// ======================

app.delete("/undo-last-match", async(req,res)=>{

    try{

        const lastMatch = await Match
        .findOne()
        .sort({_id:-1})
        .populate("teamA")
        .populate("teamB")

        if(!lastMatch){

            return res.send({
                success:false
            })
        }

        await Match.findByIdAndDelete(lastMatch._id)

        res.send({
            success:true,
            match:lastMatch
        })

    }catch(error){

        console.log(error)

        res.status(500).send({
            success:false
        })
    }

})

// ======================
// SERVER START
// ======================

app.listen(3000, ()=>{

    console.log("Server Running On Port 3000")

})