const AppError = require('../utils/appError');
const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');
const multer = require('multer');
const sharp = require('sharp');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

const uploadTourImages = upload.fields([{
    name: 'imageCover',
    maxCount: 1
  },
  {
    name: 'images',
    maxCount: 3
  }
]);


// upload.single('image')
// upload.array('images', 5);

const resizeTourImages = catchAsync(async (req, res, next) => {
  console.log(req.files);
  if (!req.files.imageCover || !req.files.images) return next();
console.log('here');

  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1333)
    .toFormat('jpeg')
    .jpeg({
      quality: 90
    })
    .toFile(`public/img/tours/${req.body.imageCover}`);

  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({
          quality: 90
        })
        .toFile(`public/img/tours/${filename}`);

      req.body.images.push(filename);
    })
  );
  console.log(req.body.images);
  next();
});

function aliasTopTours() {
  return (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
  }
}

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// const checkId = (req, res, next, val) => {

//         if (req.params.id * 1 > tours.length) {
//             return res.status(404).json({
//                 status: 'fail',
//                 message: 'Invalid ID'
//             });
//         };
//         next();

// };

// function checkBody() {
//   return (req, res, next) => {
//     if (!req.body.name || !req.body.price) {
//       return res.status(400).json({
//         status: 'Fail',
//         message: 'Missing name or price',
//       });
//     }
//     next();
//   };
// }

// function checkId() {
//   return (req, res, next, val) => {
//     if (req.params.id * 1 > tours.length) {
//       return res.status(404).json({
//         status: 'fail',
//         message: 'Invalid ID',
//       });
//     }
//     next();
//   };
// }

function deleteTour() {
  return factory.deleteOne(Tour);
}

function updateTour() {
  return factory.updateOne(Tour);
}

function createTour() {
  return factory.createOne(Tour);
}

function getTour() {
  return factory.getOne(Tour, {
    path: 'reviews'
  });
};

function getTours() {
  return factory.getAll(Tour);
}

function getToursStats() {
  return catchAsync(async (req, res, next) => {

    const stats = await Tour.aggregate([{
        $match: {
          ratingAverage: {
            $gte: 4.5
          }
        }
      },
      {
        $group: {
          _id: {
            $toUpper: '$difficulty'
          },
          numTours: {
            $sum: 1
          },
          numRatings: {
            $sum: '$ratingsQuantity'
          },
          avgRating: {
            $avg: '$ratingsAverage'
          },
          avgPrice: {
            $avg: '$price'
          },
          minPrice: {
            $min: '$price'
          },
          maxPrice: {
            $max: '$price'
          },
        }
      },
      {
        $sort: {
          avgPrice: 1
        }
      },
      {
        $match: {
          _id: {
            $ne: 'EASY'
          }
        }
      }
    ]);


    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  })
}

function getMonthlyPlan() {
  return catchAsync(async (req, res, next) => {

    const year = req.params.year * 1;

    const plan = await Tour.aggregate([{
        $unwind: '$startDates'
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`)
          }
        }
      },
      {
        $group: {
          _id: {
            $month: '$startDates'
          },
          numToursStars: {
            $sum: 1
          },
          tours: {
            $push: '$name'
          }
        }
      },
      {
        $addFields: {
          month: '$_id'
        }
      },
      {
        $project: {
          _id: 0
        }
      },
      {
        $sort: {
          numToursStars: -1
        }
      },
      {
        $limit: 12
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan,
      },
    });
  })
}

function getToursWithin() {
  return catchAsync(async (req, res, next) => {
    const {
      distance,
      latlng,
      unit
    } = req.params;
    const [lat, lng] = latlng.split(',');

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

    if (!lat || !lng) {
      next(new AppError('Please provide in right format', 400))
    }

    console.log(distance, lat, lng, unit);
    const tours = await Tour.find({
      startLocation: {
        $geoWithin: {
          $centerSphere: [
            [lng, lat], radius
          ]
        }
      }
    });

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        data: tours
      }
    })
  })
}

function getDistances() {
  return catchAsync(async (req, res, next) => {
    const {
      latlng,
      unit
    } = req.params;
    const [lat, lng] = latlng.split(',');

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if (!lat || !lng) {
      next(new AppError('Please provide in right format', 400))
    }

    const distances = await Tour.aggregate([{
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng * 1, lat * 1]
          },
          distanceField: 'distance',
          distanceMultiplier: multiplier
        }
      },
      {
        $project: {
          distance: 1,
          name: 1
        }
      }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        data: distances
      }
    });

  });
}


module.exports = {
  deleteTour,
  updateTour,
  createTour,
  getTour,
  getTours,
  aliasTopTours,
  getToursStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances,
  uploadTourImages,
  resizeTourImages
};