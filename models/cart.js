const fs = require('fs');
const path = require('path');
const p = path.join(path.dirname(process.mainModule.filename), 'data', 'cart.json');

module.exports= class cart {
   static addProduct(id,productPrice){
       //fetch the previous cart
       fs.readFile(p,(err,fileContent)=>{
           let cart={products:[],totalprice:0};
           if(!err){
               //cart already exists
               cart=JSON.parse(fileContent);
           }
           //Analyze the cart => find existing product
           const existingProductIndex=cart.products.findIndex(prod => prod.id===id);
           const existingProduct=cart.products[existingProductIndex];
           //add a new product/update previous
           if(existingProduct){
              existingProduct.qty+=1;
           } else{
              cart.products.push({id:id,qty:1});
           }
           cart.totalprice+= +productPrice;
           fs.writeFile(p,JSON.stringify(cart),err => {
               console.log(err);
           });
       });
   }
};