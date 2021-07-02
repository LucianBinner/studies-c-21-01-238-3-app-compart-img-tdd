const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const user = require("./models/User");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/guiapics", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        // console.log("Conectado com o banco de dados");
    })
    .catch(err => {
        console.log(err);
    });

const User = mongoose.model("User", user)

app.get("/", (req, res) => {
    return res.status(200).json({ success: true });
});

app.post("/user", async (req, res) => {
    
    if (req.body.name === "" || req.body.email === "" || req.body.password === "") {
        return res.sendStatus(400);
    }

    try {
        const user = await User.findOne({"email": req.body.email});
        if(user !== null) {
            return res.status(400).json({error: "E-mail já cadastrado"})
        }

        const password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: hash,
        });

        await newUser.save();
        return res.json({ email: req.body.email })
    } catch (error) {
        return res.status(500).json({ error })
    }
});

module.exports = app;