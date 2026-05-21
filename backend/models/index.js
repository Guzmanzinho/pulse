const Utilizador = require('./Utilizador');
const Tweet = require('./Tweet');
const Comentario = require('./Comentario');

// Tweets
Utilizador.hasMany(Tweet, { foreignKey: 'utilizador_id' });
Tweet.belongsTo(Utilizador, { foreignKey: 'utilizador_id' });

// Comentários no tweet
Tweet.hasMany(Comentario, { foreignKey: 'tweet_id' });
Comentario.belongsTo(Tweet, { foreignKey: 'tweet_id' });

// Comentários do utilizador
Utilizador.hasMany(Comentario, { foreignKey: 'utilizador_id' });
Comentario.belongsTo(Utilizador, { foreignKey: 'utilizador_id' });

module.exports = {
  Utilizador,
  Tweet,
  Comentario
};