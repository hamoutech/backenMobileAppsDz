 import { Request } from 'express'
 import multer, { FileFilterCallback } from 'multer'

type DestinationCallback = (error: Error | null, destination: string) => void
type FileNameCallback = (error: Error | null, filename: string) => void
 const fileFilter = (
    request: Request,
    file: Express.Multer.File,
    callback: FileFilterCallback
): void => {
    if (
        file.mimetype === 'photo/png' ||
        file.mimetype === 'photo/jpg' ||
        file.mimetype === 'photo/jpeg'
    ) {
        callback(null, true)
    } else {
        callback(null, false)
    }
}
 const photoStorage = multer.diskStorage({
    destination: (
        request: Request,
        file: Express.Multer.File,
        callback: DestinationCallback
    ): void => {
        return callback(null, "photos");
    },

    filename: (
        req: Request, 
        file: Express.Multer.File, 
        callback: FileNameCallback,
    
    ): void => {
        let name = file.originalname.split(" ").join("_").split(".")[0];
        const extension = file.mimetype;
        name = name + Date.now() + "." + extension.slice(6);
        callback(null, name);
    }
})
module.exports = multer({storage:photoStorage,fileFilter:fileFilter}).single("photo");
