const {DataTypes} = require('sequelize');
const sequelize = require('../../config/dbConfig');
const bcrypt = require('bcryptjs');

// console.log(DataTypes);
const Admin = sequelize.define('admin', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: true,
});

const createOneAdmin = async () => {
    try {
        await Admin.sync();
        const adminPresent = await Admin.findOne();
        const ourPassword = "password";
        if(!adminPresent){
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(ourPassword, salt);
            await Admin.create({
                username: "admin",
                password: hashedPassword,
                email: "admin@gmail.com",
                role: "superAdmin"
            })
            console.log("admin created");
        }else if(adminPresent && adminPresent.password == ""){
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(ourPassword, salt);
            adminPresent.password = hashedPassword;
            await adminPresent.save();
            console.log("admin password changed");
        }
    } catch (error) {
        console.log(error);
    }
}

createOneAdmin();

module.exports = Admin;

