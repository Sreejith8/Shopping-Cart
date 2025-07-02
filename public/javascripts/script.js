addToCart = (productId)=>{
    $.ajax({
        url:'/add-to-cart/'+productId,
        method:'get',
        success:(response)=>{
            if(response.status){
                let cartCount = $('#cart-count').html();
                cartCount = parseInt(cartCount)+1;
                $('#cart-count').html(cartCount);
            }
        },
        error: (xhr) =>{
          if(xhr.status === 401){
            window.location.href = '/login';
          }
        }
    })
}

function changeProductQuantity(cartId,productId,userId,count){
    console.log("AJAX Fired");
    let quantity = document.getElementById(productId).innerHTML;
    quantity = parseInt(quantity);
    console.log(quantity);
    $.ajax({
      url: '/change-product-quantity',
      method : 'post',
      data: {
        cartId : cartId,
        productId : productId,
        userId : userId,
        quantity : quantity,
        count : count
      },
      success : (response)=>{
        if(response.productRemoved){
          alert("Product removed");
          location.reload();
        }
        else{
          quantity = quantity + count;
          document.getElementById(productId).innerHTML = quantity;
          document.getElementById('total-cart-amount').innerHTML = response.totalAmount;
        }
      }
    })
}

removeProduct = (cartId,productId)=>{
    $.ajax({
        url:'/remove-product',
        method : 'post',
        data : {
            cartId : cartId,
            productId : productId
        },
        success : (response)=>{
            if(response.productRemoved){
                alert("Product Removed.");
                location.reload();
            }
        }
    })
}