
import { Request } from 'express'
import multer, { FileFilterCallback } from 'multer'
const fileFilter = (req:Request, file:Express.Multer.File, cb:FileFilterCallback) => {
    if (file.fieldname === 'image'||file.fieldname==='stadiumImage'||file.fieldname==='adversaryLogo') {
      if (
        file.mimetype === 'image/png' ||
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg'||
        file.mimetype === 'stadiumImage/png' ||
        file.mimetype === 'stadiumImage/jpg' ||
        file.mimetype === 'stadiumImage/jpeg'||
        file.mimetype === 'adversaryLogo/png' ||
        file.mimetype === 'adversaryLogo/jpg' ||
        file.mimetype === 'adversaryLogo/jpeg'
      ) {
        cb(null, true);
      } else {
        cb(null,false);
        
        
      }
    } else if (file.fieldname === 'video') {
      if (file.mimetype === 'video/mp4') {
        cb(null, true);
      } else {
        cb(null,false)
        
      }
    } else {
      cb(null, false);
    }
  };
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = file.mimetype.startsWith('image/'||'stadiumImage/'||'adversaryLogo/') ? 'uploads/images' : 'uploads/videos';
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    let name = file.originalname.split(" ").join("_").split(".")[0];
        const extension = file.mimetype;
        name = name + Date.now() + "." + extension.slice(6);
       cb(null, name);
  },
});

const upload = multer({ storage,fileFilter });

export default upload;
