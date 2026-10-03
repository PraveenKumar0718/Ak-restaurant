const items=[
{name:"Mutton Dum Biryani",price:280,cat:"Mutton",img:"https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=300&q=80"},
{name:"Mutton SP Bucket Biryani",price:450,cat:"Mutton",img:"https://images.unsplash.com/photo-1563379091339-03246963d51a?auto=format&fit=crop&w=300&q=80"},
{name:"Chicken SP Biryani",price:220,cat:"Chicken",img:"https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=300&q=80"},
{name:"Chicken Fry Biryani",price:230,cat:"Chicken",img:"https://images.unsplash.com/photo-1517244683847-7456b63c5969?auto=format&fit=crop&w=300&q=80"},
{name:"Hyderabadi Chicken Dum Biryani",price:240,cat:"Biryani",img:"https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=300&q=80"},
{name:"Hyderabad Biryani",price:210,cat:"Biryani",img:"https://images.unsplash.com/photo-1599043513900-ed6fe01d3833?auto=format&fit=crop&w=300&q=80"},
{name:"Haleem",price:180,cat:"Starters",img:"https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=300&q=80"},
{name:"Rita Salan Khatta",price:60,cat:"Extras",img:"https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&w=300&q=80"},
{name:"Thumbs Up",price:40,cat:"Beverages",img:"https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=300&q=80"}
];
let cart=[];
function show(id){document.querySelectorAll('.screen').forEach(x=>x.classList.remove('active'));document.getElementById(id).classList.add('active');if(id==='menu')renderMenu();if(id==='cart')renderCart();if(id==='payment')document.getElementById('payAmount').textContent='₹'+(subtotal()+40);window.scrollTo(0,0)}
function sendOTP(){let p=document.getElementById('phone').value.trim();if(p.length!==10){alert('Please enter a valid 10-digit phone number');return}document.getElementById('shownPhone').textContent='+91 '+p;document.getElementById('deliveryPhone').value=p;show('otp')}
function renderMenu(list=items){document.getElementById('menuList').innerHTML=list.map((x,i)=>`<div class="item"><img class="item-img" src="${x.img}"><div class="item-info"><h4>${x.name}</h4><span class="price">₹${x.price}</span></div><button class="add" onclick="add(${items.indexOf(x)})">Add +</button></div>`).join('')}
function filterCategory(cat){renderMenu(cat==='All'?items:items.filter(x=>x.cat===cat))}
function filterItems(q){q=q.toLowerCase();renderMenu(items.filter(x=>x.name.toLowerCase().includes(q)))}
function add(i){let found=cart.find(x=>x.name===items[i].name);if(found)found.qty++;else cart.push({...items[i],qty:1});updateCount();show('menu')}
function updateCount(){let n=cart.reduce((a,x)=>a+x.qty,0);document.getElementById('cartCount').textContent=n;document.getElementById('cartCount2').textContent=n}
function subtotal(){return cart.reduce((a,x)=>a+x.price*x.qty,0)}
function renderCart(){document.getElementById('cartItemsCount').textContent=cart.reduce((a,x)=>a+x.qty,0)+' Items';document.getElementById('cartList').innerHTML=cart.length?cart.map((x,i)=>`<div class="cart-row"><img src="${x.img}"><div><b>${x.name}</b><br><span class="price">₹${x.price}</span></div><div class="qty"><button onclick="change(${i},-1)">−</button> ${x.qty} <button onclick="change(${i},1)">+</button></div></div>`).join(''):'<p class="muted">Your cart is empty.</p>';document.getElementById('subtotal').textContent='₹'+subtotal();document.getElementById('total').textContent='₹'+(subtotal()+40)}
function change(i,d){cart[i].qty+=d;if(cart[i].qty<=0)cart.splice(i,1);updateCount();renderCart()}
function clearCart(){cart=[];updateCount();renderCart()}
function placeOrder(){if(!cart.length){alert('Please add items to cart first.');show('menu');return}let id='AKBH'+Math.floor(100000+Math.random()*900000);document.getElementById('orderId').textContent=id;document.getElementById('billId').textContent=id;document.getElementById('billDate').textContent=new Date().toLocaleString('en-IN');document.getElementById('billItems').innerHTML=cart.map(x=>`<p><span>${x.name} ×${x.qty}</span><b>₹${x.price*x.qty}</b></p>`).join('');document.getElementById('billSubtotal').textContent='₹'+subtotal();document.getElementById('billTotal').textContent='₹'+(subtotal()+40);show('confirmed')}
renderMenu();updateCount();
document.querySelectorAll('.otp').forEach((el,i)=>el.addEventListener('input',()=>{if(el.value && i<3)document.querySelectorAll('.otp')[i+1].focus()}));
