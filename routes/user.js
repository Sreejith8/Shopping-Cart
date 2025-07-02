var express = require('express');
var router = express.Router();
let productHelpers = require('../helpers/product-helpers');
let userHelpers = require('../helpers/user-helpers');

const verifyLogin = (req,res,next)=>{
  if(req.session.userLogged){
    next();
  }
  else{
    if(req.xhr){
      res.status(401).json({login:false,message:"User not logged in."});
    }else{
      res.redirect('/login');
    }
  }
};

/* GET home page. */
router.get('/', async function(req, res, next) {
  let user = req.session.user;
  let cartCount = null;
  if(user){
    cartCount = await userHelpers.getCartCount(user._id);
  }
  productHelpers.getProduct().then((products)=>{
    res.render('user/view-products', {products,user,cartCount,activePage:'products'});
  })
});

router.get('/signup',(req,res,next)=>{
  if(req.session.userLogged){
    res.redirect('/');
  }
  else{
    res.render('user/signup');
  }
})

router.post('/signup',(req,res,next)=>{
  userHelpers.doSignup(req.body).then((user)=>{
    console.log(user)
    req.session.userLogged = true;
    req.session.user = user;
    res.redirect('/')
  })
})

router.get('/login',(req,res,next)=>{
  if(req.session.userLogged){
    res.redirect('/');
  }
  else{
    res.render('user/login',{loginError:req.session.userLoginError});
    req.session.userLoginError = false;
  }
})

router.post('/login',(req,res,next)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.userLogged = true;
      req.session.user = response.user;
      res.redirect('/');
    }
    else{
      req.session.userLoginError = "Invalid Email Id or Password.";
      res.redirect('/login');
    }
  })
})

router.get('/logout',(req,res,next)=>{
  // req.session.destroy();
  req.session.user = null;
  req.session.userLogged = false;
  res.redirect('/')
})

router.get('/cart',verifyLogin,async (req,res,next)=>{
  let user = req.session.user;
  let cartCount = 0;
  let total = 0;
  if(user){
    cartCount = await userHelpers.getCartCount(user._id);
  }
  if(cartCount>0){
    total = await userHelpers.getTotalAmount(user._id);
  }
  userHelpers.getCartProducts(req.session.user._id).then((cartProducts)=>{
    res.render('user/cart',{user,cartProducts,cartCount,total,activePage:'cart'});
  })
})

router.get('/add-to-cart/:id',verifyLogin,(req,res,next)=>{
  console.log("api call")
  userHelpers.addToCart(req.session.user._id,req.params.id).then((response)=>{
    // res.redirect('/')
    res.json({status:true});
  })
})

router.post('/change-product-quantity',(req,res,next)=>{
  userHelpers.changeProductQuantity(req.body).then(async(response)=>{
    response.totalAmount = await userHelpers.getTotalAmount(req.body.userId);
    res.json(response);
  })
})

router.post('/remove-product',(req,res,next)=>{
  userHelpers.removeProduct(req.body).then((response)=>{
    res.json(response);
  })
})

router.get('/place-order',verifyLogin,async(req,res,next)=>{
  let user = req.session.user;
  let cartCount = null;
  if(user){
    cartCount = await userHelpers.getCartCount(user._id);
  }
  let total = await userHelpers.getTotalAmount(user._id);
  res.render('user/place-order',{user,cartCount,total,activePage:'cart'});
})

router.post('/place-order',async(req,res,next)=>{
  console.log(req.body);
  let products = await userHelpers.getProductList(req.body.userId);
  let totalAmount = await userHelpers.getTotalAmount(req.body.userId);
  userHelpers.placeOrder(req.body,products,totalAmount).then((orderId)=>{
    if(req.body['payment-method']==="COD"){
      res.json({codStatus:true});
    }
    else{
      userHelpers.generateRazorpay(orderId,totalAmount).then((orderDetails)=>{
        res.json(orderDetails);
      })
    }
  })
})

router.get('/order-placed',verifyLogin,async(req,res,next)=>{
  let user = req.session.user;
  let cartCount = null;
  if(user){
    cartCount = await userHelpers.getCartCount(user._id);
  }
  res.render('user/order-placed',{user,cartCount});
})

router.get('/orders',verifyLogin,async(req,res,next)=>{
  let user = req.session.user;
  let cartCount = null;
  if(user){
    cartCount = await userHelpers.getCartCount(user._id);
  }
  userHelpers.getOrderDetails(user._id).then((orderDetails)=>{
    res.render('user/orders',{user,cartCount,orderDetails,activePage:'orders'});
  })
})

router.get('/view-ordered-products/:id',verifyLogin,async(req,res,next)=>{
  let user = req.session.user;
  let cartCount = null;
  if(user){
    cartCount = await userHelpers.getCartCount(user._id);
  }
  userHelpers.getOrderedProducts(req.params.id).then((orderedProducts)=>{
    res.render('user/view-ordered-products',{user,cartCount,orderedProducts,activePage:'orders'});
  })
})

router.post('/verify-payment',(req,res,next)=>{
  console.log(req.body);
  userHelpers.verifyPayment(req.body).then(()=>{
    userHelpers.changePaymentStatus(req.body).then(()=>{
      res.json({status: true})
    })
  }).catch((err)=>{
    console.log(err);
    response.json({status:false});
  })
})

module.exports = router;