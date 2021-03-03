const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');

// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users');
//     },
//     filename: (req, file, cb) => {
//        const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
//     }
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image! Please upload only images.', 400), false);
    }
}

const upload = multer({ storage: multerStorage, fileFilter: multerFilter});
const uploadUserPhoto = upload.single('photo');

const resizeUserPhoto =catchAsync(async (req, res, next) => {
    if(!req.file) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
    .resize(500,500)
    .toFormat('jpeg')
    .jpeg({quality: 90})
    .toFile(`public/img/users/${req.file.filename}`);

    next();
});


const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });
    return newObj;
}

function getAllUsers() {
    return factory.getAll(User);
}

function getUser() {
    return factory.getOne(User);
}

function updateUser() {
    return factory.updateOne(User);
}

function deleteUser() {
    return factory.deleteOne(User);
}

function createUser() {
    return(req, res) => {
        res.status(500).json({
            status: 'error',
            message: 'This route is not yet defined'
        })
    }
}

function updateMe() {
    return catchAsync( async (req, res, next) => {
        // 1) Create error if user past password data
        if (req.body.password || req.body.passwordConfirm) {
            return next(new AppError('This route is not for password updates.', 400));
        }

        // 2) Update user document
        const filteredBody = filterObj(req.body, 'name', 'email');

        if(req.file) filteredBody.photo = req.file.filename;
        const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
            new: true, runValidators: true
        });

        res.status(200).json({
            status: 'success',
            data: {
                user: updateUser
            }
        })
    });
}

function deleteMe() {
    return catchAsync( async (req, res, next) => {
        await User.findByIdAndUpdate(req.user.id, {active: false});

        res.status(204).json({
            status: 'success',
            data: null
        })
    });
}

function getMe() {
    return (req, res, next) => {
        req.params.id = req.user.id;
        next();
    }
}

module.exports = {
    getAllUsers,
    getUser,
    updateUser,
    deleteUser,
    createUser,
    updateMe,
    deleteMe,
    getMe,
    uploadUserPhoto,
    resizeUserPhoto
}