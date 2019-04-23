const Sequelize = require("sequelize");
const sequelize = require("../util/database");
const User = sequelize.define("user", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true
  },
  password: {
    type:Sequelize.STRING,
    allowNull:false,
  },
  email: Sequelize.STRING
});
module.exports=User;
