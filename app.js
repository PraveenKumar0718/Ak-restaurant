const menu = [
 {id:"mutton-dum",name:"Mutton Dum Biryani",price:280,cat:"Biryani",desc:"Tender mutton, fragrant basmati and traditional dum spices."},
 {id:"mutton-sp",name:"Mutton SP Bucket Biryani",price:450,cat:"Biryani",desc:"A generous family-style bucket packed with mutton and rice."},
 {id:"chicken-sp",name:"Chicken SP Biryani",price:220,cat:"Biryani",desc:"Classic chicken biryani with saffron, mint and fried onions."},
 {id:"chicken-fry",name:"Chicken Fry Biryani",price:230,cat:"Biryani",desc:"Spicy fried chicken pieces layered through aromatic rice."},
 {id:"hyderabad-chicken",name:"Hyderabadi Chicken Dum Biryani",price:240,cat:"Biryani",desc:"Slow-cooked dum biryani inspired by Hyderabad kitchens."},
 {id:"chicken-65",name:"Chicken 65",price:180,cat:"Chicken",desc:"Crispy, spicy and juicy chicken bites."},
 {id:"mutton-roast",name:"Mutton Roast",price:260,cat:"Mutton",desc:"Peppery roasted mutton with house spices."},
 {id:"rita",name:"Raita",price:40,cat:"Extras",desc:"Cool, creamy curd with cucumber and herbs."},
 {id:"salan",name:"Mirchi Ka Salan",price:60,cat:"Extras",desc:"Classic peanut-sesame chilli curry to pair with biryani."},
 {id:"cool-drink",name:"Chilled Beverage",price:60,cat:"Beverages",desc:"Cold drink served chilled."}
];
const cats=["All","Biryani","Chicken","Mutton","Starters","Beverages","Extras"];
let activeCat="All", cart=JSON.parse(localStorage.getItem("ak_cart")||"[]"), currentPhone="", supabaseClient=null;

function initSupabase(){
 if(window.SUPABASE_URL && window.SUPABASE_ANON_KEY && !window.SUPABASE_URL.startsWith("PASTE_") && window.supabase){
   supabaseClient=window.supabase.createClient(window.SUPABASE_URL,window.SUPABASE_ANON_KEY);
 }
}
initSupabase();

const $=s=>document.querySelector(s);
function toast(msg){const t=$("#toast");t.textContent=msg;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2600)}
function money(n){return "₹"+Number(n).toLocaleString("en-IN")}
function scrollToMenu(){document.querySelector("#menu").scrollIntoView({behavior:"smooth"})}
function renderCats(){ $("#categories").innerHTML=cats.map(c=>`<button class="cat ${c===activeCat?"active":""}" onclick="setCat('${c}')">${c}</button>`).join("")}
function setCat(c){activeCat=c;renderCats();renderMenu()}
function renderMenu(){
 const q=($("#search").value||"").toLowerCase();
 const list=menu.filter(x=>(activeCat==="All"||x.cat===activeCat)&&(`${x.name} ${x.cat} ${x.desc}`.toLowerCase().includes(q)));
 $("#menuGrid").innerHTML=list.map(x=>`<article class="food-card"><div class="food-img"><div class="rice"></div><div class="meat m1"></div><div class="meat m2"></div><div class="meat m3"></div></div><div class="food-info"><h3>${x.name}</h3><p>${x.desc}</p><div class="price-row"><span class="price">${money(x.price)}</span><button class="add" onclick="addToCart('${x.id}')">Add +</button></div></div></article>`).join("")||"<p>No items found.</p>"
}
function addToCart(id){const x=menu.find(i=>i.id===id), item=cart.find(i=>i.id===id);item?item.qty++:cart.push({...x,qty:1});saveCart();toast(x.name+" added to cart")}
function saveCart(){localStorage.setItem("ak_cart",JSON.stringify(cart));$("#cartCount").textContent=cart.reduce((a,b)=>a+b.qty,0)}
function renderCart(){
 if(!cart.length){$("#cartItems").innerHTML="<p style='color:#aaa'>Your cart is empty.</p>";}
 else $("#cartItems").innerHTML=cart.map(x=>`<div class="cart-row"><div class="thumb"></div><div><b>${x.name}</b><div style="color:#aaa">${money(x.price)}</div></div><div class="qty"><button onclick="changeQty('${x.id}',-1)">−</button>${x.qty}<button onclick="changeQty('${x.id}',1)">+</button></div></div>`).join("");
 const sub=cart.reduce((a,b)=>a+b.price*b.qty,0);$("#subtotal").textContent=money(sub);$("#total").textContent=money(sub+(cart.length?40:0));
}
function changeQty(id,d){const x=cart.find(i=>i.id===id);if(!x)return;x.qty+=d;if(x.qty<=0)cart=cart.filter(i=>i.id!==id);saveCart();renderCart()}
function openCart(){renderCart();$("#drawer").classList.remove("hidden")}
function closeCart(){$("#drawer").classList.add("hidden")}
function openLogin(){$("#loginModal").classList.remove("hidden")}
function closeLogin(){$("#loginModal").classList.add("hidden")}
async function sendOTP(){
 if(!supabaseClient){toast("Connect Supabase in supabase-config.js first.");return}
 const digits=$("#phone").value.replace(/\D/g,"");if(digits.length!==10){toast("Enter a valid 10-digit Indian mobile number.");return}
 currentPhone="+91"+digits;
 const {error}=await supabaseClient.auth.signInWithOtp({phone:currentPhone});
 if(error){toast(error.message);return}
 $("#phoneStep").classList.add("hidden");$("#otpStep").classList.remove("hidden");$("#otpHint").textContent=`OTP sent to ${currentPhone}.`;
 toast("OTP sent successfully.");
}
async function verifyOTP(){
 if(!supabaseClient)return;
 const token=$("#otp").value.trim();if(token.length<6){toast("Enter the OTP.");return}
 const {data,error}=await supabaseClient.auth.verifyOtp({phone:currentPhone,token,type:"sms"});
 if(error){toast(error.message);return}
 toast("Login successful!");closeLogin();$("#loginNav").textContent="Logged in ✓";
}
function startCheckout(){
 if(!cart.length){toast("Add an item first.");return}
 if(!supabaseClient){toast("Connect Supabase before placing real orders.");return}
 openLogin();
 const sessionCheck=async()=>{const {data}=await supabaseClient.auth.getSession();if(data.session){closeLogin();closeCart();$("#checkoutModal").classList.remove("hidden");$("#deliveryPhone").value=currentPhone.replace("+91","")||""}};
 sessionCheck();
}
function closeCheckout(){$("#checkoutModal").classList.add("hidden")}
async function placeOrder(){
 const {data:{session}}=await supabaseClient.auth.getSession();
 if(!session){toast("Please login with OTP first.");return}
 const name=$("#name").value.trim(),phone=$("#deliveryPhone").value.trim(),address=$("#address").value.trim();
 if(!name||!phone||!address){toast("Please fill name, phone and address.");return}
 const subtotal=cart.reduce((a,b)=>a+b.price*b.qty,0), total=subtotal+40;
 const order={user_id:session.user.id,customer_name:name,phone,address,landmark:$("#landmark").value.trim(),payment_method:$("#payment").value,status:"placed",items:cart.map(({id,name,price,qty})=>({id,name,price,qty})),subtotal,delivery_fee:40,total};
 const {data,error}=await supabaseClient.from("orders").insert(order).select("order_code").single();
 if(error){toast(error.message);return}
 cart=[];saveCart();closeCheckout();$("#orderNumber").textContent="Order ID: "+data.order_code;$("#successModal").classList.remove("hidden");
}
function closeSuccess(){$("#successModal").classList.add("hidden")}
$("#search").addEventListener("input",renderMenu);$("#cartNav").onclick=openCart;$("#loginNav").onclick=openLogin;$("#mobileMenu").onclick=()=>toast("Use the menu links above on desktop; mobile navigation can be expanded later.");
renderCats();renderMenu();saveCart();
