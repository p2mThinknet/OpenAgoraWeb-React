'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserOnline = sequelize.define('UserOnline', {
    username: DataTypes.STRING,
    duration: DataTypes.INTEGER
  }, {});
  UserOnline.associate = function(models) {
    UserOnline.Meeting = UserOnline.belongsTo(models.Meeting);
  };
  return UserOnline;
};
