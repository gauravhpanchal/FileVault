import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import PDF from "../models/Pdf.model.js";
import { io } from "../index.js";

const router = express.Router();

// Upload PDFs
router.post("/upload", authMiddleware, async (req, res) => {
  try {
    const { files } = req.body;

    const pdfs = files.map((file) => ({
      user: req.user._id,
      filename: file.filename,
      // filepath:file.path,
      url: file.url,
      size: file.size,
    }));

    const uploadedFiles = await PDF.insertMany(pdfs);

    //Notify about uploaded files
    if (io.sockets.sockets.size > 0) {
      const socketId = Array.from(io.sockets.sockets.keys())[0];
      console.log(
        `File upload connection established - Socket ID: ${socketId}, User: ${req.user._id}`
      );

      io.emit("fileUploaded", uploadedFiles);

      // Listen for disconnect on this specific socket
      io.sockets.sockets.get(socketId).on("disconnect", () => {
        console.log(
          `File upload connection closed - Socket ID: ${socketId}, User: ${req.user._id}`
        );
      });
    }
    res
      .status(201)
      .json({ message: "Files uploaded successfully", files: uploadedFiles });
  } catch (error) {
    res
      .status(500)
      .json({ message: "File upload failed", error: error.message });
  }
});

// List User's PDFs
router.get("/", authMiddleware, async (req, res) => {
  try {
    const files = await PDF.find({ user: req.user._id });
    res.status(200).json({ files });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch files", error: error.message });
  }
});

// Delete a PDF
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const file = await PDF.findById(req.params.id);
    if (!file || file.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Unauthorized or file not found" });
    }

    await PDF.findByIdAndDelete(req.params.id);

    //Notify about Deleted files
    if (io.sockets.sockets.size > 0) {
      const socketId = Array.from(io.sockets.sockets.keys())[0];
      console.log(
        `File deletion connection established - Socket ID: ${socketId}, User: ${req.user._id}, File: ${req.params.id}`
      );

      io.emit("fileDeleted", { id: req.params.id });

      // Listen for disconnect on this specific socket
      io.sockets.sockets.get(socketId).on("disconnect", () => {
        console.log(
          `File deletion connection closed - Socket ID: ${socketId}, User: ${req.user._id}`
        );
      });
    }
    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete file", error: error.message });
  }
});

export default router;
