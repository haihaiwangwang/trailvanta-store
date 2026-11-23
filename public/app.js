const $ = (selector) => document.querySelector(selector);
const money = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value) || 0);
const DEMO_PRODUCTS = [
  {id:1,name:'Trailblazer 2-Person Tent',category:'Camping',price:89,stock:20,description:'A roomy, easy-pitch shelter for weekends outside.',symbol:'⌂',tag:'BEST SELLER',bg:'#dce2d2'},
  {id:2,name:'All-Terrain Hiking Backpack',category:'Camping',price:54,stock:25,description:'A versatile daypack with space for the essentials.',symbol:'▤',tag:'TRAIL PICK',bg:'#e3d9c6'},
  {id:3,name:'Compact Camping Lantern',category:'Camping',price:28,stock:30,description:'Warm light for camp nights and early starts.',symbol:'◉',tag:'',bg:'#d9e1d9'},
  {id:4,name:'Insulated Outdoor Bottle',category:'Camping',price:22,stock:45,description:'A durable bottle for long days on the move.',symbol:'▯',tag:'',bg:'#e6ddce'},
  {id:5,name:'Resistance Band Training Set',category:'Fitness',price:24,stock:40,description:'A simple, portable set for full-body workouts.',symbol:'〰',tag:'EVERYDAY ESSENTIAL',bg:'#e1d8c7'},
  {id:6,name:'Adjustable Fitness Dumbbell',category:'Fitness',price:69,stock:12,description:'Flexible strength training for home sessions.',symbol:'●',tag:'',bg:'#d9dfd4'},
  {id:7,name:'Performance Yoga Mat',category:'Fitness',price:35,stock:28,description:'A comfortable base for stretching and flow.',symbol:'▱',tag:'',bg:'#d8e2dd'},
  {id:8,name:'Agility Training Cones',category:'Fitness',price:18,stock:60,description:'Set up drills and quick-footwork sessions.',symbol:'△',tag:'',bg:'#e7dec9'},
  {id:9,name:'Urban Ride Helmet',category:'Cycling',price:42,stock:18,description:'Everyday cycling protection with a clean profile.',symbol:'◒',tag:'RIDER FAVORITE',bg:'#dce1d7'},
  {id:10,name:'Compact Bike Repair Kit',category:'Cycling',price:19,stock:35,description:'Handy tools for common roadside adjustments.',symbol:'⚒',tag:'',bg:'#e4daca'},
  {id:11,name:'Cycling Gloves',category:'Cycling',price:16,stock:50,description:'Comfort-focused grip for daily rides.',symbol:'✳',tag:'',bg:'#d9e2dc'},
  {id:12,name:'LED Bike Light Set',category:'Cycling',price:25,stock:32,description:'A front and rear light set for added visibility.',symbol:'☼',tag:'',bg:'#e5e0cf'},
  {id:13,name:'Inflatable Paddle Board Kit',category:'Water Sports',price:249,stock:6,description:'A versatile board kit for calm-water exploring.',symbol:'⌁',tag:'ADVENTURE PICK',bg:'#d5e3df'},
  {id:14,name:'Quick-Dry Swim Goggles',category:'Water Sports',price:16,stock:50,description:'A comfortable fit for pool and open-water sessions.',symbol:'◎',tag:'',bg:'#d9e1e1'},
  {id:15,name:'Waterproof Dry Bag',category:'Water Sports',price:21,stock:40,description:'Keep everyday essentials together near the water.',symbol:'▱',tag:'',bg:'#dce4d7'},
  {id:16,name:'Floating Swim Buoy',category:'Water Sports',price:29,stock:22,description:'A bright visibility aid for open-water practice.',symbol:'◉',tag:'',bg:'#e7ddc9'}
];
let products = [...DEMO_PRODUCTS];
let cart = [];
let activeCategory = 'All';
let noticeTimer;

function notify(message) {
  const notice = $('#notice');
  notice.textContent = message;
  notice.classList.add('show');
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => notice.classList.remove('show'), 2600);
}

function renderProducts() {
  const query = $('#search').value.trim().toLowerCase();
  const visible = products.filter((product) =>
    (activeCategory === 'All' || product.category === activeCategory) &&
    `${product.name} ${product.category} ${product.description || ''}`.toLowerCase().includes(query)
  );
  $('#products').innerHTML = visible.length ? visible.map((product) => `
    <article class="product-card">
      <div class="product-visual" style="--product-bg:${product.bg || '#e1e5da'}">
        ${product.tag ? `<span class="product-tag">${product.tag}</span>` : ''}
        <span class="product-symbol" aria-hidden="true">${product.symbol || '✳'}</span>
      </div>
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <button class="product-title-button" type="button" data-detail="${product.id}">${product.name}</button>
        <div class="product-bottom"><span class="product-price">${money(product.price)}</span><button class="add-button" data-add="${product.id}" aria-label="Add ${product.name} to bag">+</button></div>
        <button class="view-detail-button" type="button" data-detail="${product.id}">VIEW DETAILS ↗</button>
      </div>
    </article>`).join('') : '<div class="empty-results">No gear found. Try another search.</div>';
}

function openProductDetail(productId) {
  const product = products.find((item) => String(item.id) === String(productId));
  if (!product) return;
  const panel = $('#productDetail');
  $('#detailVisual').style.setProperty('--product-bg', product.bg || '#e1e5da');
  $('#detailVisual').innerHTML = `<span class="detail-symbol" aria-hidden="true">${product.symbol || '✳'}</span>`;
  $('#detailCategory').textContent = product.category;
  $('#detailName').textContent = product.name;
  $('#detailPrice').textContent = money(product.price);
  $('#detailDescription').textContent = product.description || 'A practical essential for your next adventure.';
  $('#detailStock').textContent = Number(product.stock) > 0 ? `In stock · ${product.stock} available` : 'Availability to be confirmed';
  $('#detailAdd').dataset.add = product.id;
  panel.classList.add('open');
  $('#detailBackdrop').classList.add('open');
  panel.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeProductDetail() {
  $('#productDetail').classList.remove('open');
  $('#detailBackdrop').classList.remove('open');
  $('#productDetail').setAttribute('aria-hidden', 'true');
  if (!$('#drawer').classList.contains('open')) document.body.style.overflow = '';
}

function renderCart() {
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  $('#count').textContent = itemCount;
  $('#drawerCount').textContent = `(${itemCount})`;
  $('#subtotal').textContent = money(subtotal);
  $('#cartLines').innerHTML = cart.length ? cart.map((item) => `
    <div class="cart-line">
      <div><strong>${item.name}</strong><small>${item.category}</small><div class="line-actions"><button data-qty="minus" data-id="${item.id}" aria-label="Decrease quantity">−</button><span>${item.quantity}</span><button data-qty="plus" data-id="${item.id}" aria-label="Increase quantity">+</button><button class="remove-line" data-remove="${item.id}">REMOVE</button></div></div>
      <span class="cart-line-price">${money(item.price * item.quantity)}</span>
    </div>`).join('') : '<p class="empty-cart">Your bag is waiting for an adventure.</p>';
}

function openCart() {
  $('#drawer').classList.add('open');
  $('#backdrop').classList.add('open');
  $('#drawer').setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  $('#drawer').classList.remove('open');
  $('#backdrop').classList.remove('open');
  $('#drawer').setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function setCategory(category) {
  activeCategory = category;
  document.querySelectorAll('[data-filter]').forEach((button) => button.classList.toggle('active', button.dataset.filter === category));
  $('#filterChips').scrollTo({ left: 0, behavior: 'smooth' });
  renderProducts();
}

document.addEventListener('click', (event) => {
  const detailButton = event.target.closest('[data-detail]');
  if (detailButton) openProductDetail(detailButton.dataset.detail);
  if (event.target.closest('[data-detail-close]') || event.target.id === 'detailBackdrop') closeProductDetail();
  const addButton = event.target.closest('[data-add]');
  if (addButton) {
    const product = products.find((item) => String(item.id) === addButton.dataset.add);
    if (!product) return;
    const existing = cart.find((item) => item.id === product.id);
    if (existing) existing.quantity += 1;
    else cart.push({ ...product, quantity: 1 });
    renderCart();
    notify('Added to your bag');
    if (addButton.id === 'detailAdd') closeProductDetail();
  }
  const categoryLink = event.target.closest('[data-cat]');
  if (categoryLink) setCategory(categoryLink.dataset.cat);
  const filterButton = event.target.closest('[data-filter]');
  if (filterButton) setCategory(filterButton.dataset.filter);
  const quantityButton = event.target.closest('[data-qty]');
  if (quantityButton) {
    const item = cart.find((entry) => String(entry.id) === quantityButton.dataset.id);
    if (item) item.quantity += quantityButton.dataset.qty === 'plus' ? 1 : -1;
    cart = cart.filter((entry) => entry.quantity > 0);
    renderCart();
  }
  const removeButton = event.target.closest('[data-remove]');
  if (removeButton) {
    cart = cart.filter((entry) => String(entry.id) !== removeButton.dataset.remove);
    renderCart();
  }
});

$('#cartOpen').addEventListener('click', openCart);
$('#cartClose').addEventListener('click', closeCart);
$('#backdrop').addEventListener('click', closeCart);
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { closeCart(); closeProductDetail(); } });
$('#search').addEventListener('input', renderProducts);
$('#year').textContent = new Date().getFullYear();

async function postJSON(url, body) {
  const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || 'Something went wrong. Please try again.');
  return result;
}

$('#orderForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!cart.length) return notify('Your bag is empty');
  const button = event.submitter;
  const feedback = $('#orderFeedback');
  button.disabled = true;
  button.textContent = 'SUBMITTING…';
  feedback.textContent = '';
  try {
    const details = Object.fromEntries(new FormData(event.currentTarget));
    const result = await postJSON('/api/orders', { ...details, items: cart.map((item) => ({ product_id: item.id, quantity: item.quantity })) });
    feedback.textContent = `Request received: ${result.order_number || 'Thank you!'}`;
    cart = [];
    renderCart();
    event.currentTarget.reset();
    notify('Your order request was received');
  } catch (error) {
    feedback.textContent = `${error.message} (The demo order service may not be connected yet.)`;
  } finally {
    button.disabled = false;
    button.innerHTML = 'SUBMIT ORDER REQUEST <span>↗</span>';
  }
});

$('#contactForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = event.submitter;
  const feedback = $('#contactFeedback');
  button.disabled = true;
  feedback.textContent = '';
  try {
    await postJSON('/api/contact', Object.fromEntries(new FormData(event.currentTarget)));
    feedback.textContent = 'Thanks — your message has been received.';
    event.currentTarget.reset();
  } catch (error) {
    feedback.textContent = `${error.message} The message service will be available after deployment.`;
  } finally { button.disabled = false; }
});

// Render instantly from local demo data; refresh from the store API when it is available.
renderProducts();
renderCart();
fetch('/api/products', { headers: { Accept: 'application/json' } })
  .then((response) => { if (!response.ok) throw new Error('API unavailable'); return response.json(); })
  .then((data) => { if (Array.isArray(data.products) && data.products.length) { products = data.products.map((item) => ({ ...item, symbol: DEMO_PRODUCTS.find((demo) => demo.id === item.id)?.symbol || '✳', tag: DEMO_PRODUCTS.find((demo) => demo.id === item.id)?.tag || '', bg: DEMO_PRODUCTS.find((demo) => demo.id === item.id)?.bg || '#e1e5da' })); renderProducts(); } })
  .catch(() => { /* Local demo catalog remains available for preview. */ });
