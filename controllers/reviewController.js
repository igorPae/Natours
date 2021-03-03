const Review = require('./../models/reviewModel');
const factory = require('./handlerFactory');

function setToursUserIds() {
    return (req, res, next) => {
        // Alow nested routes
        if (!req.body.tour) req.body.tour = req.params.tourId;
        if (!req.body.user) req.body.user = req.user.id;
        next();
    }
}

function createReview() {
    return factory.createOne(Review);
}

function getReview() {
    return factory.getOne(Review);
}

function getReviews() {
    return factory.getAll(Review);
}

function deleteReview() {
    return factory.deleteOne(Review)
}

function updateReview() {
    return factory.updateOne(Review)
}

module.exports = {
    createReview,
    getReviews,
    deleteReview,
    updateReview,
    setToursUserIds,
    getReview
};