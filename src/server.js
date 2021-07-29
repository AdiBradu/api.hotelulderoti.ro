const express = require("express");
const dotenv = require("dotenv");
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session); 
const cors = require("cors");
const HttpException = require('./api/v1/utils/HttpException.utils');
const errorMiddleware = require('./api/v1/middleware/error.middleware');
const userRouter = require('./api/v1/routes/user.routes');
const authRouter = require('./api/v1/routes/auth.routes');
const fleetRouter = require('./api/v1/routes/fleetInfo.routes');
const vehicleRouter = require('./api/v1/routes/vehicle.routes');
const partnerRouter = require('./api/v1/routes/partnerInfo.routes');
const tireRouter = require('./api/v1/routes/tire.routes');
const serviceRouter = require('./api/v1/routes/service.routes');
const hotelTireRouter = require('./api/v1/routes/hotelTire.routes');
const hotelRequestRouter = require('./api/v1/routes/hotelRequest.routes');
const helmet = require("helmet");
const app = express();
app.use(helmet());

dotenv.config();

app.use(express.json());

var corsOptions = {
  origin: process.env.CLIENT_FOR_THE_API,
  optionsSuccessStatus: 200, 
  credentials: true
}
app.use(cors(corsOptions));

app.set('etag', false);


//sessions
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_DATABASE,
  clearExpired: true,
	checkExpirationInterval: 900000,
	expiration: parseInt(process.env.SESS_MAX_AGE),
	createDatabaseTable: true,
	connectionLimit: 1,
	endConnectionOnClose: true,
	charset: 'utf8mb4_bin'});

app.set('trust proxy', 1); 
app.use(session({
	key: 'th_session',
	secret: process.env.SESS_SECRET,
	store: sessionStore,
	resave: false,
	saveUninitialized: false,
	unset: 'destroy',
  proxy: process.env.NODE_ENV === 'PRODUCTION',
	cookie: { 
    domain: process.env.NODE_ENV === 'PRODUCTION' ? '.hotelulderoti.ro': process.env.SESS_COOKIE_DOMAIN,
		path: '/',
		httpOnly: true,
		secure: process.env.NODE_ENV === 'PRODUCTION',
		maxAge: parseInt(process.env.SESS_MAX_AGE),

	}
}));



const port = Number(process.env.PORT || 3331);

//routing
app.all('*', function(req, res, next) {   
  if (process.env.NODE_ENV === 'PRODUCTION' && (req.headers['origin'] !== 'https://hotelulderoti.ro')) {
    const err = new HttpException(404, 'Not Found');
    next(err);
  } else {
    next();
  }
});
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/fleets', fleetRouter);
app.use('/api/v1/vehicles', vehicleRouter);
app.use('/api/v1/partners', partnerRouter);
app.use('/api/v1/tires', tireRouter);
app.use('/api/v1/services', serviceRouter);
app.use('/api/v1/hotelTires', hotelTireRouter);
app.use('/api/v1/hotelRequests', hotelRequestRouter);
//404 error
app.all('*', (req, res, next) => {
  const err = new HttpException(404, 'Endpoint Not Found');
  next(err);
});

//error middleware
app.use(errorMiddleware);



//starting the server
app.listen(port, () => 
  console.log(`Server running on port ${port}!`)
);

module.exports = app;