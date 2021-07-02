const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const JWTSecret = "dcfghfghj4536453*((&P?H02543fghbf";

const user = require("./models/User");
const { json } = require("express");

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

app.post("/auth", async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ "email": email });


    if (user === null) {
        return res.status(403).json({ errors: { email: "E-mail não cadastrado!" } });
    }

    const isPasswordRight = await bcrypt.compare(password, user.password);

    if (!isPasswordRight) {
        return res.status(403).json({ errors: { password: "Senha inválida!" } })
    }

    jwt.sign({ email, name: user.name, id: user._id }, JWTSecret, { expiresIn: '48h' }, (err, token) => {
        if (err) {
            return res.status(500).json(err);
        } else {
            return res.status(200).json({ token });
        }
    });
});

app.post("/user", async (req, res) => {

    if (req.body.name === "" || req.body.email === "" || req.body.password === "") {
        return res.sendStatus(400);
    }

    try {
        const user = await User.findOne({ "email": req.body.email });
        if (user !== null) {
            return res.status(400).json({ error: "E-mail já cadastrado" })
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

app.delete("/user/:email", async (req, res) => {
    try {
        await User.deleteOne({ "email": req.params.email })
        return res.status(200).json({ message: "Usuário deletado com sucesso!" });
    } catch (error) {
        return res.status(500).json({ error });
    }
});

module.exports = app;