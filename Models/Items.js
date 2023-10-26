const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  lien: {
    type: String,
    require: true,
  },
  description: {
    type: String,
    require: true,
  },
});

module.exports = mongoose.model("Post", PostSchema);
