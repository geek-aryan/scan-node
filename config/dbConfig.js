const { Sequelize } = require('sequelize');

const sequelize = new Sequelize("scandb", "admin", "mpmiuE6y51MRMLTxw3Xl", {
    host: "localhost",
    port: 3306,
    dialect: "mysql",
    logging: false,
    suggestions: true,
    dialectOptions: {
        connectTimeout: 60000
    }
});

module.exports = sequelize;
