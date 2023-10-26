const express = require("express");
const router = express.Router();
const Post = require("../Models/Items");

// Get:Retrieve all items

router.get("/post", async (req, res) => {
  try {
    const items = await Post.find();
    res.send({ items });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// Post create a new items

router.post("/create", async (req, res) => {
  const { lien, description } = req.body;
  if (!lien || !description) {
    return res.status(400).send({ message: "le champ ne doit pas etre vide" });
  }
  const post = new Post({
    lien,
    description,
  });
  const newPost = await post.save();
  res.status(201).send({ newPost, message: "Post crée avec succes." });
});

// update

router.put("/update/:id", async (req, res) => {
  try {
    const { lien, description } = req.body;

    const item = await Post.findById(req.params.id);
    if (!item) {
      return res.status(404).send({ message: "Post not found" });
    }
    item.lien = lien;
    item.description = description;
    const UpdatedItem = await item.save();
    res.status(200).send({ UpdatedItem });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// DELETE: Delete an item by ID

router.delete("/delete/:id", async (req, res) => {
  try {
    const item = await Post.findById(req.params.id);
    if (!item) {
      return res.status(400).send({ message: "le post n'est pas trouvé" });
    }
    await Post.deleteOne({ _id: req.params.id });
    return res.status(200).send({ message: "Le post a ete bien supprimé:" });
  } catch (err) {
    console.error("Error while deleting post", err);
    res.status(500).send({ message: err.message });
  }
});
module.exports = router;
