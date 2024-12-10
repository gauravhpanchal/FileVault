import express from "express";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import PDF from "../models/Pdf.model.js";
import { upload } from "../middlewares/upload.middleware.js";
import fs from "fs";
import { io } from "../index.js";
import path from "path";

const router = express.Router();
// const baseURL = "https://file-vault-nine.vercel.app/uploads/";
const baseURL = "http://localhost:5173/uploads/";

// Upload PDFs
// router.post(
//   "/upload",
//   authMiddleware,
//   upload.array("pdfs", 10),
//   async (req, res) => {
//     try {
//       const pdfs = req.files.map((file) => {
//         const fileUrl = `${baseURL}${file.filename}`;
//         return {
//           user: req.user._id,
//           filename: file.filename,
//           filepath: file.path,
//           url: fileUrl,
//           size: file.size,
//         };
//       });
//       const uploadedFiles = await PDF.insertMany(pdfs);
//       // console.log(uploadedFiles);

//       //Notify about uploaded files
//       io.emit("fileUploaded", uploadedFiles);
//       res
//         .status(201)
//         .json({ message: "Files uploaded successfully", files: uploadedFiles });
//     } catch (error) {
//       res
//         .status(500)
//         .json({ message: "File upload failed", error: error.message });
//     }
//   }
// );

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
    io.emit("fileUploaded", uploadedFiles);
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

    fs.unlinkSync(file.filepath); // Delete
    await PDF.findByIdAndDelete(req.params.id);

    //Notify about Deleted files
    io.emit("fileDeleted", { id: req.params.id });

    res.status(200).json({ message: "File deleted successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete file", error: error.message });
  }
});

export default router;
