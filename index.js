require('dotenv').config();
const express = require('express');
const app = express();
const sequelize = require('./config/dbConfig');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log("Connected to Database");
        
        await sequelize.sync();
        console.log("Models synchronized with the database");
    } catch (error) {
        console.log(error);
    }
}
connectDB();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads',express.static(path.join(__dirname, 'uploads')));

app.use('/api', require('./routes/index'));
app.get('',(req,res)=>res.send('hello'))

// app.use(require('./middlewares/multerErrorHandler'));

const PORT = process.env.PORT;
app.listen(PORT, ()=> {
    console.log('server is lintening on port', PORT);
})