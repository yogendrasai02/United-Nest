const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary.js");
const multer = require("multer");
const path = require("path");

function fileStorage(type) {
    let obj = {};
    if(type == 'images') {
        obj = {
            folder: "PhotosOfUnitedNest",
        };
    } else {
        obj = {
            folder: "VideosOfUnitedNest",
            resource_type: "video", 
        }
    }

    const storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: async (req, file) => {
            obj['public_id'] = file.fieldname + "-" + Date.now()
            return obj;
        },
    });

    let upload = multer({ 
        storage: storage,
        fileFilter: (req, file, cb) => {
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