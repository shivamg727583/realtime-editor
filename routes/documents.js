const express = require("express");
const router = express.Router();
const Document = require("../models/document-model");
const { authenticateToken } = require("../middlewares/auth");

console.log('docu')

// Get all documents (Protected route)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const documents = await Document.find({ author: req.user.userId });
    res.render("documents", { documents });
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ error: "An error occurred while fetching documents" });
  }
});

router.post('/', authenticateToken, async (req, res) => {

    const document = new Document({
      title: req.body.title,    
      content: '',
      author: req.user.userId,
    });
    await document.save();
    res.redirect('/editor/' + document._id);
  });
  

// Render editor page (Protected route)


module.exports = router;
