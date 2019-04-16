const express = require('express');
const path=require('path');
const app = express();
// view engine setup
app.set('views', 'views');
app.set('view engine', 'ejs');
const bodyParser=require('body-parser');
app.use(express.static(path.join(__dirname,'public')));
const errorController=require('./controllers/error');
const sequelize=require('./util/database');

const adminRoutes=require('./routes/admin');
const userRoutes=require('./routes/shop');
//creating middleware
app.use(bodyParser.urlencoded({extended:false}));
app.use('/admin',adminRoutes);
app.use(userRoutes);
app.use(errorController.get404);
sequelize.sync().then(result=>{
    //console.log(result);
    app.listen(3000);
}).catch(err=>console.log(err));


