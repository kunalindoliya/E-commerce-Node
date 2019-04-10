const express = require('express');
const path=require('path');
const app = express();
const expressHbs=require('express-handlebars');
// view engine setup
//app.engine('hbs',expressHbs());
app.set('views', 'views');
app.set('view engine', 'ejs');
const bodyparser=require('body-parser');
app.use(express.static(path.join(__dirname,'public')));
const adminData=require('./routes/admin');
const userRoutes=require('./routes/shop');
//creating middleware
app.use(bodyparser.urlencoded({extended:false}));
app.use('/admin',adminData.routes);
app.use(userRoutes);

app.use((req,res,next)=>{
    res.status(404).render('404',{pageTitle:'Page Not found'});
});
app.listen(3000);

