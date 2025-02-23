const express = require("express");
const connectDB = require("./config/database");
const userAuth = require("./utils/userAuth");
const cookieParser = require("cookie-parser");
const auth = require("./routes/auth")
const user = require("./routes/user")
const itemRequest = require("./routes/itemRequest")
const cors = require("cors")

require('dotenv').config();

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
app.use(cookieParser())
app.use(express.json())


app.use("/", auth);
app.use("/", user);
app.use("/", itemRequest);


connectDB().then(() => {
    console.log("Database connected successfully");
    app.listen(process.env.PORT, () => {
        console.log("server listening at port: " + process.env.PORT);
    })
}).catch((err) => {
    console.log("ERROR : " + err.message);
})


