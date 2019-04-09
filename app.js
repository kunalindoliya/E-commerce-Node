const express = require('express');
const path=require('path');
const app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
const bodyparser=require('body-parser');
app.use(express.static(path.join(__dirname,'public')));
const adminData=require('./routes/admin');
const userRoutes=require('./routes/shop');
//creating middleware
app.use(bodyparser.urlencoded({extended:false}));
app.use('/admin',adminData.routes);
app.use(userRoutes);

app.use((req,res,next)=>{
   res.status(404).render('404');
});
app.listen(3000);

