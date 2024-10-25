const express = require("express");
const router = express.Router();
const Document = require("../models/document-model"); // Ensure the path to the model is correct
const { authenticateToken } = require("../middlewares/auth"); // Ensure middleware is imported correctly

// Get editor page (Protected route)
router.get("/:id", authenticateToken, async (req, res) => {

    try {
      const document = await Document.findById(req.params.id);
      console.log(document)
  
      // Ensure only the owner of the document can access it
      if (document.author.toString() !== req.user.userId) {
        return res.status(403).json({ message: "You do not have permission to access this document" });
      }
  
      res.render("editor", { document });
    } catch (error) {
      console.error("Error loading document:", error);
      res.status(500).json({ error: "An error occurred while loading the document" });
    }
  });

module.exports = router;
