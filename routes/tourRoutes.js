const express = require('express');
const router = express.Router();
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewController = require('./../controllers/reviewController');
const reviewRouter = require('./../routes/reviewRoutes');

router.use('/:tourId/reviews', reviewRouter);


// router.param('id', tourController.checkId());
router.route('/top-5-cheap').get(tourController.aliasTopTours(), tourController.getTours());

router.route('/tour-stats').get(tourController.getToursStats());

router.route('/monthly-plan/:year')
    .get(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.getMonthlyPlan()
    );

router
.route('/tours-within/:distance/center/:latlng/unit/:unit')
.get(tourController.getToursWithin());

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances());

router
    .route('/')
    .get(tourController.getTours())
    .post(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.createTour()
    );

router
    .route('/:id')
    .get(tourController.getTour())
    .patch(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.uploadTourImages,
        tourController.resizeTourImages,
        tourController.updateTour()
    )
    .delete(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.deleteTour()
    );

// router
//     .route('/:tourId/reviews')
//     .post(
//         authController.protect,
//         authController.restrictTo('user'),
//         reviewController.createReview()
//     );

module.exports = router;