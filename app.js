const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewRouter = require('./routes/viewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const compression = require('compression');

const app = express();
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// 1) MIDLEWARES
app.use(express.static(path.join(__dirname, 'public')));


if (process.env.NODE_ENV === 'development') {

    app.use(morgan('dev'));
} else {
    // app.use(helmet());
}

const limiter = rateLimit({
    max: 100,
    window: 60 * 60 * 1000,
    message: "Too many requests from this IP, please try again in an hour!"
});

app.use('/api', limiter);
app.use(express.json({limit: '10kb'}));
app.use(express.urlencoded({extended: true, limit: '10kb'}))
app.use(cookieParser());

//Data sanitization against NoSQl query injection
app.use(mongoSanitize());
//Data sanitization against XSS
app.use(xss());

app.use(hpp({
    whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'difficulty', 'price', 'maxGroupSize']
}));

app.use(compression());

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    // console.log(req.cookies);
    next();
});

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

//Wild card route
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;


/* TODOS
- Review only for purchased bookings
- Nested booking routes
- Dates ('sold out')
- Advanced authentication
- Sign up form
- "like tour
*/



