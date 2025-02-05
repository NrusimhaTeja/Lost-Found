const jwt = require("jsonwebtoken")
const User = require("../model/User")


const userAuth = async (req, res, next) => {
    try {
        const {token} = req.cookies;
        const {userId} = jwt.verify(token, process.env.SECRET_KEY);
        const user = await User.findOne({_id: userId});
        if (!user) {
            throw new Error("Invalid user");
        } else {
            req.user = user;
            next();
        }

    } catch(err) {
        res.json({"error" : err.message});
    }
}

module.exports = userAuth;