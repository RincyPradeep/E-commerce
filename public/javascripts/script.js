function addToCart(proId){
    $.ajax({
        url:'/add-to-cart/'+proId,  
        method:'get',
        success:(response)=>{            
            if(response.status){
                let count=$('#cart-count').html()
                count=parseInt(count)+1
                $("#cart-count").html(count)
                alert("1 Item is added to your cart")                
            }            
        }
    })
}

    function removeProduct(cartId,proId){
       let remove= confirm('Are you want to remove?')       
       if(remove){
        $.ajax({
            url:'/remove-product',
            data:{
                cart:cartId,
                product:proId,
            },
            
            method:'post',
            success:(response)=>{
                if(response.removeProduct){
                    location.reload()
                }
            }
        })
    }else{
        location.reload()
    }
    }

    function changeStatus(orderId){       
        $.ajax({
            url:'/admin/change-status/'+orderId, 
            method:'get',
            success:(response)=>{               
                if(response.status){                    
                    // $("#status").html("shipped")
                    alert("Order Shipped")
                    location.reload()
                }               
            }
        })
    }