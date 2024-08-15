const mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/miniproject")


const UserSchema =mongoose.Schema({
    usernaem:String,
    name:String,
    age:Number,
    email:String,
    password:String
})


   module.exports =  mongoose.model('user',UserSchema)