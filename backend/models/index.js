const Utilizador = require('./Utilizador');
const Tweet = require('./Tweet');
const Comentario = require('./Comentario');
const ImagemTweet = require('./ImagemTweet');
const Gosto = require('./Gosto');
const Seguimento = require('./Seguimento');

// Tweets
Utilizador.hasMany(Tweet, { foreignKey: 'utilizador_id' });
Tweet.belongsTo(Utilizador, { foreignKey: 'utilizador_id' });

// Comentários no tweet
Tweet.hasMany(Comentario, { foreignKey: 'tweet_id' });
Comentario.belongsTo(Tweet, { foreignKey: 'tweet_id' });

// Comentários do utilizador
Utilizador.hasMany(Comentario, { foreignKey: 'utilizador_id' });
Comentario.belongsTo(Utilizador, { foreignKey: 'utilizador_id' });

// Imagens do tweet
Tweet.hasOne(ImagemTweet, { foreignKey: 'tweet_id' });
ImagemTweet.belongsTo(Tweet, { foreignKey: 'tweet_id' });

// Gostos do tweet
Tweet.hasMany(Gosto, { foreignKey: 'tweet_id' });
Gosto.belongsTo(Tweet, { foreignKey: 'tweet_id' });

// Gostos do utilizador
Utilizador.hasMany(Gosto, { foreignKey: 'utilizador_id' });
Gosto.belongsTo(Utilizador, { foreignKey: 'utilizador_id' });

// Seguimento entre utilizadores
Utilizador.belongsToMany(Utilizador, { as: 'Seguindo', through: Seguimento, foreignKey: 'seguidor_id', otherKey: 'seguido_id' });
Utilizador.belongsToMany(Utilizador, { as: 'Seguidores', through: Seguimento, foreignKey: 'seguido_id', otherKey: 'seguidor_id' });

module.exports = {
  Utilizador,
  Tweet,
  Comentario,
  ImagemTweet,
  Gosto,
  Seguimento
};