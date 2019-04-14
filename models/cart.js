const fs = require('fs');
const path = require('path');
const p = path.join(path.dirname(process.mainModule.filename), 'data', 'cart.json');

module.exports= class cart {
   static addProduct(id,productPrice){
       //fetch the previous cart
       fs.readFile(p,(err,fileContent)=>{
           let cart={products:[],totalPrice:0};
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
           cart.totalPrice+= +productPrice;
           fs.writeFile(p,JSON.stringify(cart),err => {
               if(err)
                   console.log(err);
           });
       });
   }

   static  deleteProduct(id,price){
       fs.readFile(p,(err,fileContent)=>{
           if(err)
               return;
           const updatedCart={...JSON.parse(fileContent)};
           const product=updatedCart.products.find(prod => prod.id===id);
           if(!product){
               return;
           }
           updatedCart.products=updatedCart.products.filter(prod=> prod.id !== id);
           const prodQty=product.qty;
           updatedCart.totalPrice=updatedCart.totalPrice - price*prodQty;
           fs.writeFile(p,JSON.stringify(updatedCart),(err) => {
               if(err){
                   console.log(err);
               }
           });
       });
   }
   static getCart(callback){
       fs.readFile(p,(err,fileContent)=>{
           const cart=JSON.parse(fileContent);
          if(err){
              callback(null);
          }
          else{
              callback(cart);
          }
       });
   }
};