const mongoose = require("mongoose");
let bookSchema = mongoose.Schema({
title:{
    type: String,
    required : true,
},
genres:{
    type: [String],
    required : true,
},
author:{
    type: String,
    required : true,
},
rating:{
    type: Number,
    required : true,
},
pages:{
    type: Number,
    required : true,
},
posted_by:{
    type: String,
    required : true,
},
isbn:{
    type: Number, 
    required : true,
}
});

module.exports = mongoose.model("Book", bookSchema);