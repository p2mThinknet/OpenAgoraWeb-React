'use strict';
module.exports = (sequelize, DataTypes) => {
  const Meeting = sequelize.define('Meeting', {
    name: DataTypes.STRING
  }, {});
  Meeting.associate = function(models) {
    Meeting.UserChats = Meeting.hasMany(models.UserChat);
    Meeting.UserOnlines = Meeting.hasMany(models.UserOnline);
  };
  return Meeting;
};
