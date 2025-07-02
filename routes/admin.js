var express = require('express');
var router = express.Router();
let productHelpers = require('../helpers/product-helpers');
let path = require('path');
let fs = require('fs')
let adminHelpers = require('../helpers/admin-helpers');
const { error } = require('console');

const verifyAdminLogin =  (req,res,next)=>{
  if(req.session.adminLogged){
    next();
  }
  else{
    res.redirect('/admin/login')
  }
}

/* GET users listing. */
router.get('/', function(req, res, next) {
  if(req.session.adminLogged){
    let admin = req.session.admin
    productHelpers.getProduct().then((products)=>{
      res.render('admin/all-products',{products,isAdmin:true,admin,activePage:'all-products'});
    })
  }
  else{
    res.redirect('/admin/login');
  }
});

router.get('/login',(req,res,next)=>{
  if(req.session.adminLogged){
    res.redirect('/admin');
  }
  else{
    res.render('admin/login',{isAdmin:true,adminLoginError : req.session.adminLoginError});
    req.session.adminLoginError = false;
  }
})

router.post('/login',(req,res,next)=>{
  adminHelpers.doAdminLogin(req.body).then((response)=>{
    if(response.status){
      req.session.adminLogged = true;
      req.session.admin = response.admin;
      productHelpers.getProduct().then((products)=>{
        res.render('admin/all-products',{products,admin:req.session.admin,isAdmin:true,activePage:'all-products'});
      })
    }
    else{
      req.session.adminLoginError = response.errorMsg;
      res.redirect('/admin/login')
    }
  })
})


router.get('/add-product',(req,res)=>{
  res.render('admin/add-products',{isAdmin:true,activePage:'all-products'});
})

router.post('/add-product',(req,res,next)=>{
  productHelpers.addProduct(req.body,(id)=>{
    const idStr = id.toString();
    let image = req.files.image;
    image.mv(path.join(__dirname,'../public/product-images/',idStr+'.jpg'),(err)=>{
      if(!err){
        res.render('admin/add-products',{isAdmin:true});
      }
      else{
        console.log(err);
      }
    })
  });
});

router.get('/delete-product/:id',(req,res,next)=>{
  let productId = req.params.id;
  let imageFile = path.join(__dirname,'../public/product-images/',productId+'.jpg');
  productHelpers.deleteProduct(productId).then((productId)=>{
    if(productId){
      fs.unlink(imageFile,(err)=>{
        if(err){
          console.log("File deletion failed.")
        }
        else{
          console.log("File deletion successfull.")
        }
      })
      res.redirect('/admin');
    }
    else{
      res.redirect('/admin');
    }
  })
})

router.get('/edit-product/',(req,res,next)=>{
  let productId = req.query.id;
  productHelpers.getProductDetails(productId).then((product)=>{
    res.render('admin/edit-product',{product,isAdmin:true,activePage:'all-products'});
  })
})

router.post('/edit-product/:id',(req,res,next)=>{
  productHelpers.updateProductDetails(req.params.id,req.body).then((response)=>{
    res.redirect('/admin');
    if(req.files && req.files.image){
      let image = req.files.image;
      image.mv(path.join(__dirname,'../public/product-images/',req.params.id+'.jpg'),(err)=>{
        if(err){
          console.log(err);
        }
      });
    }
  })
})

router.get('/all-orders',verifyAdminLogin,(req,res,next)=>{
  let admin = req.session.admin;
  adminHelpers.getAllOrders().then((allOrders)=>{
    console.log(allOrders);
    res.render('admin/all-orders',{allOrders,isAdmin:true,admin,activePage:'all-orders'})
  })
})

router.post('/change-order-status',(req,res,next)=>{
  adminHelpers.changeOrderStatus(req.body).then(()=>{
    console.log("Order status changed");
  })
})

router.get('/all-users',verifyAdminLogin,(req,res,next)=>{
  let admin = req.session.admin;
  adminHelpers.getAllUsers().then((allUsers)=>{
    res.render('admin/all-users',{allUsers, isAdmin : true,admin,activePage:'all-users'});
  })
})

router.get('/logout',(req,res,next)=>{
  req.session.admin = null;
  req.session.adminLogged = false;
  res.redirect('/admin/login');
})


router.post('/remove-user',(req,res,next)=>{
  adminHelpers.removeUser(req.body.userId).then(()=>{
    res.json({status:true});
  }).catch((error)=>{
    console.log(error);
  })
})
module.exports = router;
