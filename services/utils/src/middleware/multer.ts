import multer from "multer";

const storage = multer.memoryStorage();

const uploadFile = multer({storage,
  limits: {
    files: 1,
    fileSize: 1024 * 1024 * 5
  }}).single("file");

export default uploadFile;