
module.exports = (sequelize, DataTypes) => {
  const UserChat = sequelize.define('UserChat', {
    username: DataTypes.STRING,
    message: DataTypes.STRING,
  }, {});
  UserChat.associate = function (models) {
    UserChat.Meeting = UserChat.belongsTo(models.Meeting);
  };
  return UserChat;
};
