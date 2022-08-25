const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary.js");
const multer = require("multer");
const path = require("path");

function fileStorage(type) {
    let obj = {};
    if(type == 'images') {
        obj = {
            folder: process.env.PHOTOS_FOLDER_NAME,
            resource_type: "image"
        };
    } else {
        obj = {
            folder: process.env.VIDEOS_FOLDER_NAME,
            resource_type: "video", 
        }
    }

    const storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        // params: async (req, file) => {
        //     obj['public_id'] = file.fieldname + "-" + Date.now()
        //     console.log("Obj: ", obj);
        //     return obj;
        // },
    });

    let upload = multer({ 
        storage: storage,
        fileFilter: (req, file, cb) => {
            console.log(file);
            let ext = path.extname(file.originalname);
            if(ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png' && ext !== '.mp4' && ext !== '.mkv') {
                cb(new Error('File type is not supported', false));
                return;
            }

            cb(null, true);
        },
    });

    return upload;
}

module.exports = fileStorage;