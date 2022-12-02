const localStrategy = require("passport-local").Strategy;
const User = require("../schemas/User");
const bcryptjs = require("bcryptjs");
const passport = require("passport");

module.exports = (passport) => {
    passport.use(new localStrategy({ usernameField: "email" }, (email, password, done) => {
        User.findOne({ email: email }, (error, user) => {
            bcryptjs.compare(password, user.password, (error, success) => {
                if (error) {
                    console.log(JSON.stringify(error));
                }
                else {
                    if (success) {
                        done(null, user);
                    }
                    else {
                        done(null, false, { message: "User not found" });
                    }
                }
            })
        })
    }))
}
passport.serializeUser((user, done)=>{
    done(null, user.id);
})
passport.deserializeUser((id, done)=>{
    User.findById(id,(error,user)=>{
        if(error){
           console.log("Had problem finding the user by Id:" + id)
        }
        else{
            done(null,user);
        }
    });
})