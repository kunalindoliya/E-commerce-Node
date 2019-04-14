const express = require('express');
const path=require('path');
const app = express();
// view engine setup
app.set('views', 'views');
app.set('view engine', 'ejs');
const bodyParser=require('body-parser');
app.use(express.static(path.join(__dirname,'public')));

const errorController=require('./controllers/error');

const adminRoutes=require('./routes/admin');
const userRoutes=require('./routes/shop');
const db=require('./util/database');
db.execute('select * from products').then(result=>{
   console.log(result)
}).catch(err=>{
    console.log(err);
});
//creating middleware
app.use(bodyParser.urlencoded({extended:false}));
app.use('/admin',adminRoutes);
app.use(userRoutes);

app.use(errorController.get404);
app.listen(3000);

