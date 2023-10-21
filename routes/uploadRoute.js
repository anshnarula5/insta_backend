const cloudinary = require("cloudinary").v2
const {CloudinaryStorage} = require("multer-storage-cloudinary")
const express = require('express')
const multer = require('multer')
const router = express.Router()

cloudinary.config({
  cloud_name: "mycloudapi",
  api_key: "339432286479345",
  api_secret : "xNaCcUTbFwkEsNG7oLtmMR25yA4"
})

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
      folder: "instagram",
      allowedFormats : ["png", "jpg", "jpeg", "jfif", "gif"]
  }
})

const upload = multer({storage})

router.post('/', upload.single("image"), (req, res) => {
  res.send(req.file.path)
})
module.exports = router