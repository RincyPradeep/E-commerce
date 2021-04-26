var db=require('../config/connection');
var collection=require('../config/collections')
const bcrypt=require('bcrypt');
var objectId=require('mongodb').ObjectId

module.exports={
    doLogin:(adminData)=>{
        return new Promise(async(resolve,reject)=>{
            let response={} 
            let admin=await db.get().collection(collection.ADMIN_COLLECTION).findOne({Email:adminData.Email})
            if(admin){
                bcrypt.compare(adminData.Password,admin.Password).then((status)=>{
                    if(status){
                        console.log("Login Success");
                        response.admin=admin
                        response.adminstatus=true
                        resolve(response)
                    }else{
                        console.log("Login Failed");
                        resolve({adminstatus:false})
                    }
                })
            }else{
                console.log("Login Failed");
                resolve({adminstatus:false})
            }
        })
    },

    addProduct:(product,callback)=>{ 
       product.Price=parseInt(product.Price)
        db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data)=>{           
            callback(data.ops[0]._id);
        })
    },

    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },

deleteProduct:(prodId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.PRODUCT_COLLECTION).removeOne({_id:objectId(prodId)}).then((response)=>{
            resolve(response)
        })
    })
},

    getProductDetails:(prodId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(prodId)}).then((product)=>{
            resolve(product)
        })
    })
},
updateProduct:(proId,proDetails)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collection.PRODUCT_COLLECTION)
        .updateOne({_id:objectId(proId)},{
            $set:{
            Name:proDetails.Name,
            Category:proDetails.Category,
            Price:parseInt(proDetails.Price)
        }
    }).then((response)=>{
        resolve()
    })
    })
},
placedOrders:()=>{
    return new Promise(async(resolve,reject)=>{
        let placedItems=await db.get().collection(collection.ORDER_COLLECTION)
        .find({status:"placed"}).toArray()
            resolve(placedItems)
        })    
},
getUserDetails:()=>{
    return new Promise(async(resolve,reject)=>{
        let user=await db.get().collection(collection.USER_COLLECTION).find().toArray()
        resolve(user)
    })
},

doSignup:(adminData)=>{
    return new Promise(async(resolve,reject)=>{
        adminData.Password=await bcrypt.hash(adminData.Password,10)
        db.get().collection(collection.ADMIN_COLLECTION).insertOne(adminData).then((data)=>{
            resolve(data.ops[0])            
        })       
    })
},

changeStatus:(orderId)=>{
    let status="shipped"
    return new Promise(async(resolve,reject)=>{
        db.get().collection(collection.ORDER_COLLECTION)
        .updateOne({_id:objectId(orderId)},
         {
          $set: {
            status: status,
          },
        }
      )
      .then(() => {
        resolve();
      });
    })
},

shippedOrders:()=>{
    return new Promise(async(resolve,reject)=>{
        let shippedItems=await db.get().collection(collection.ORDER_COLLECTION)
        .find({status:"shipped"}).toArray()
            resolve(shippedItems)
        })    
},

changePassword: (adminData) => {
    return new Promise(async (resolve, reject) => {
      let admin = await db
        .get()
        .collection(collection.ADMIN_COLLECTION)
        .findOne({});     
        bcrypt
          .compare(adminData.oldPassword, admin.Password)
          .then(async (status) => {           
            if (status) {              
                if(adminData.newPassword===adminData.confirmPassword){                 
                newPassword = await bcrypt.hash(adminData.newPassword, 10);                
                db.get()
                  .collection(collection.ADMIN_COLLECTION)
                  .updateOne(
                    {},                    
                      {
                          $set:
                          {
                        Password: newPassword
                      }
                    }                    
                  )
                  .then((response) => {
                    resolve({ status: true });
                  });
              } else {
                resolve();
              }            
            } else {
              resolve();
            }
           });      
    });
  },
}