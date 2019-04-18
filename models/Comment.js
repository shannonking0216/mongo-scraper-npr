const mongoose = require("mongoose");

// Save a reference to the Schema constructor
const Schema = mongoose.Schema;

const Commentschema = new Schema({
  title: String,
  body: String
});

// This creates our model from the above schema, using mongoose's model method
const Comment = mongoose.model("Comment", Commentschema);

module.exports = Comment;