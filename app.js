const express = require('express');
const path=require('path');
const app = express();
const bodyparser=require('body-parser');
app.use(express.static(path.join(__dirname,'public')));
const adminRoutes=require('./routes/admin');
const userRoutes=require('./routes/shop');
//creating middleware
app.use(bodyparser.urlencoded({extended:false}));
app.use('/admin',adminRoutes);
app.use(userRoutes);

app.use((req,res,next)=>{
   res.status(404).sendFile(path.join(__dirname,'views','404.html'));
});
app.listen(3000);

