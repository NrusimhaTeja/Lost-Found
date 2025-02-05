const express = require("express");
const connectDB = require("./config/database");
const userAuth = require("./utils/userAuth");
const cookieParser = require("cookie-parser");
const auth = require("./routes/auth")

require('dotenv').config();

const app = express();

app.use(cookieParser())
app.use(express.json())


app.use("/", auth)

connectDB().then(() => {
    console.log("Database connected successfully");
    app.listen(process.env.PORT, () => {
        console.log("server listening at port: " + process.env.PORT);
    })
}).catch((err) => {
    console.log("ERROR : " + err.message);
})


