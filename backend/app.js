var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');


const sequelize = require('./config/database');
const {Utilizador, Tweet, Comentario} = require('./models');

/*
Utilizador.findAll().then(utilizadores => {
  console.log('Utilizadores encontrados: ', utilizadores.length);
})
  .catch((erro) => {
    console.error('Erro ao buscar utilizadores: ', erro);
  })

Tweet.findAll().then(tweets => {
  console.log('Tweets encontrados: ', tweets.length);
})
  .catch((erro) => {
    console.error('Erro ao buscar tweets: ', erro);
  })

Tweet.findAll({ include: Utilizador })
  .then(tweets => {
  console.log('Tweets com utilizador: ', tweets.length);
  })
  .catch((erro) => {~
    console.error('Erro ao buscar tweets com utilizdor: ', erro);
  });

*/
Comentario.findAll({ include: [Utilizador, Tweet] })
  .then(comentarios => {
    console.log('Comentários encontrados: ', comentarios.length);
  })
  .catch((erro) => {
    console.error('Erro ao buscar comentários: ', erro);
  });

sequelize.authenticate()
  .then(() => {
    console.log('Ligação à bd realizada com sucesso')
  })
  .catch((erro) => {
    console.error('Erro ao ligar à bd', erro);
  })

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

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
