var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let {engine} = require('express-handlebars');
let fileUpload = require('express-fileupload');
let db = require('./config/connection');
let session = require('express-session');
let dayjs = require('dayjs');
require('dotenv').config();

var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',engine({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',
  partialsDir:__dirname+'/views/partials/',helpers: {
    formatDate: function (date, format) {
      return dayjs(date).format(format);
    },
    eq: function(a,b){
      return a===b;
    },
    inc : function(num){
      return num + 1;
    }
  }}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());
app.use(session({secret:"Key",cookie:{maxAge:600000}}));

(async ()=>{
  try{
    await db.connect()
    console.log("Database successfully connected to port 27017");
  }
  catch(error){
    console.log("Error connecting database : "+error);
  }
})();

app.use('/', userRouter);
app.use('/admin', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
