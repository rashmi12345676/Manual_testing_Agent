import React, { useState } from 'react';
import { ShoppingBag, Search, Plus, Minus, Trash2, CheckCircle2, ShieldCheck, Tag, ArrowRight, X } from 'lucide-react';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  image: string;
  description: string;
  inStock: boolean;
}

const PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Acoustic Pro Wireless Headphones',
    category: 'Audio',
    price: 199,
    originalPrice: 249,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
    description: 'Active noise cancellation with 40-hour battery life and spatial audio support.',
    inStock: true,
  },
  {
    id: 'prod-2',
    name: 'Mechanical RGB Developer Keyboard',
    category: 'Peripherals',
    price: 149,
    originalPrice: 179,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&q=80',
    description: 'Hot-swappable switches, wireless tri-mode connection, and aluminum body.',
    inStock: true,
  },
  {
    id: 'prod-3',
    name: 'Ultra-Precision 4K Web Camera',
    category: 'Streaming',
    price: 129,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=400&q=80',
    description: 'HDR sensor with dual noise-reducing stereo microphones.',
    inStock: true,
  },
  {
    id: 'prod-4',
    name: 'Ergonomic Vertical Mouse Master',
    category: 'Peripherals',
    price: 89,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400&q=80',
    description: 'Natural handshake angle to reduce wrist fatigue and repetitive strain.',
    inStock: false,
  },
];

export interface CartItem {
  product: Product;
  quantity: number;
}

export const StoreApp: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [cart, setCart] = useState<CartItem[]>([
    { product: PRODUCTS[0], quantity: 1 }
  ]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  // Promo code state
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [promoMessage, setPromoMessage] = useState<{ text: string; error: boolean } | null>(null);

  // Checkout form state
  const [customerName, setCustomerName] = useState('Alex Rivers');
  const [customerEmail, setCustomerEmail] = useState('alex.rivers@example.com');
  const [shippingAddress, setShippingAddress] = useState('742 Evergreen Terrace');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const filteredProducts = PRODUCTS.filter((p) => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartTotalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discountAmount = (subtotal * appliedDiscount) / 100;
  const shipping = subtotal > 150 || cart.length === 0 ? 0 : 15;
  const finalTotal = Math.max(0, subtotal - discountAmount + (cart.length > 0 ? shipping : 0));

  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleApplyPromo = () => {
    if (!promoCode.trim()) {
      setPromoMessage({ text: 'Please enter a discount code', error: true });
      return;
    }
    const code = promoCode.trim().toUpperCase();
    if (code === 'SAVE20') {
      setAppliedDiscount(20);
      setPromoMessage({ text: 'Coupon applied! 20% discount activated.', error: false });
    } else if (code === 'FREESHIP') {
      setAppliedDiscount(5);
      setPromoMessage({ text: 'Special shipping pass applied ($5 off)!', error: false });
    } else {
      setPromoMessage({ text: 'Invalid promo code. Try "SAVE20"', error: true });
    }
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};
    if (!customerName.trim()) errors.name = 'Full name is required';
    if (!customerEmail.includes('@')) errors.email = 'Valid email address required';
    if (!shippingAddress.trim()) errors.address = 'Shipping address is required';
    if (!cardNumber.trim()) errors.card = 'Card number required';

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});
    setOrderConfirmed(true);
    setCart([]);
  };

  return (
    <div className="bg-slate-50 min-h-[560px] text-slate-900 font-sans p-4 relative" data-testid="store-sandbox-root">
      {/* Sandbox App Header */}
      <header className="bg-white border-b border-slate-200 -mx-4 -mt-4 px-4 py-3 mb-4 flex items-center justify-between sticky top-0 z-10 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
            N
          </div>
          <div>
            <span className="font-semibold text-sm tracking-tight text-slate-900">NovaTech Store</span>
            <span className="text-[10px] text-slate-500 block">App Under Test (v2.4)</span>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="relative max-w-xs w-full hidden sm:block">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            data-testid="search-input"
            aria-label="Search tech accessories"
            placeholder="Search audio, keyboard, mice..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 border border-transparent focus:border-indigo-500 focus:bg-white rounded-md transition-all outline-hidden"
          />
        </div>

        {/* Cart Trigger */}
        <button
          type="button"
          data-testid="cart-button"
          aria-label="Open Shopping Cart"
          onClick={() => setIsCartOpen(true)}
          className="relative px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-md flex items-center gap-2 transition-colors cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4 text-slate-600" />
          <span>Cart</span>
          <span
            data-testid="cart-badge"
            className="px-1.5 py-0.2 bg-indigo-600 text-white font-bold rounded-full text-[11px]"
          >
            {cartTotalItems}
          </span>
        </button>
      </header>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 mb-4 overflow-x-auto pb-1">
        {['All', 'Audio', 'Peripherals', 'Streaming'].map((cat) => (
          <button
            key={cat}
            type="button"
            data-testid={`filter-${cat.toLowerCase()}`}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
        {searchQuery && (
          <button
            type="button"
            data-testid="clear-search-btn"
            onClick={() => setSearchQuery('')}
            className="text-xs text-rose-600 hover:underline ml-2"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" data-testid="product-grid">
        {filteredProducts.map((prod) => (
          <div
            key={prod.id}
            data-testid={`product-card-${prod.id}`}
            className="bg-white border border-slate-200 rounded-lg p-3 flex flex-col justify-between hover:border-slate-300 transition-all shadow-xs"
          >
            <div className="flex gap-3">
              <img
                src={prod.image}
                alt={prod.name}
                className="w-16 h-16 rounded-md object-cover bg-slate-100 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">{prod.category}</span>
                  <span className="text-xs text-amber-500 font-semibold">★ {prod.rating}</span>
                </div>
                <h3 className="font-semibold text-xs text-slate-900 truncate mt-0.5" title={prod.name}>
                  {prod.name}
                </h3>
                <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                  {prod.description}
                </p>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-baseline gap-1.5">
                <span className="font-bold text-sm text-slate-900" data-testid={`price-${prod.id}`}>
                  ${prod.price}
                </span>
                {prod.originalPrice && (
                  <span className="text-[11px] text-slate-400 line-through">${prod.originalPrice}</span>
                )}
              </div>

              <button
                type="button"
                data-testid={`add-to-cart-${prod.id}`}
                disabled={!prod.inStock}
                onClick={() => handleAddToCart(prod)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                  prod.inStock
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs active:scale-95'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Plus className="w-3 h-3" />
                <span>{prod.inStock ? 'Add to Cart' : 'Out of Stock'}</span>
              </button>
            </div>
          </div>
        ))}

        {filteredProducts.length === 0 && (
          <div className="col-span-2 py-10 text-center bg-white rounded-lg border border-dashed border-slate-300">
            <p className="text-xs text-slate-500 font-medium">No products match your search.</p>
            <button
              type="button"
              data-testid="reset-filters-btn"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
              className="mt-2 text-xs text-indigo-600 hover:underline font-medium"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Cart Drawer Overlay */}
      {isCartOpen && (
        <div
          data-testid="cart-drawer-overlay"
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end"
        >
          <div
            data-testid="cart-drawer"
            className="w-full max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between p-4 animate-in slide-in-from-right duration-200"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-indigo-600" />
                  <h2 className="font-semibold text-sm text-slate-900" data-testid="cart-title">
                    Your Shopping Cart ({cartTotalItems})
                  </h2>
                </div>
                <button
                  type="button"
                  data-testid="close-cart-btn"
                  aria-label="Close Cart"
                  onClick={() => setIsCartOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded-md text-slate-500 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Items List */}
              <div className="mt-3 space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    data-testid={`cart-item-${item.product.id}`}
                    className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="text-xs font-medium text-slate-900 truncate">{item.product.name}</p>
                      <p className="text-[11px] text-slate-500 font-semibold">${item.product.price} each</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-slate-200 bg-white rounded-md">
                        <button
                          type="button"
                          data-testid={`qty-decrease-${item.product.id}`}
                          aria-label="Decrease quantity"
                          onClick={() => handleUpdateQty(item.product.id, -1)}
                          className="p-1 hover:bg-slate-100 text-slate-600 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span
                          data-testid={`qty-value-${item.product.id}`}
                          className="px-2 text-xs font-semibold text-slate-900 min-w-[20px] text-center"
                        >
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          data-testid={`qty-increase-${item.product.id}`}
                          aria-label="Increase quantity"
                          onClick={() => handleUpdateQty(item.product.id, 1)}
                          className="p-1 hover:bg-slate-100 text-slate-600 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        type="button"
                        data-testid={`remove-item-${item.product.id}`}
                        aria-label="Remove item"
                        onClick={() => handleRemoveFromCart(item.product.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {cart.length === 0 && (
                  <div className="py-12 text-center text-slate-400">
                    <p className="text-xs">Your cart is currently empty.</p>
                  </div>
                )}
              </div>

              {/* Promo Code Input */}
              {cart.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        data-testid="promo-input"
                        aria-label="Promo Code"
                        placeholder="Discount code (e.g. SAVE20)"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        className="w-full pl-8 pr-2 py-1.5 text-xs bg-slate-50 border border-slate-200 focus:border-indigo-500 rounded-md outline-hidden uppercase font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      data-testid="apply-promo-btn"
                      onClick={handleApplyPromo}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-md cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {promoMessage && (
                    <p
                      data-testid="promo-feedback"
                      className={`text-[11px] mt-1.5 font-medium ${
                        promoMessage.error ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {promoMessage.text}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Cart Summary & Checkout Trigger */}
            <div className="pt-3 border-t border-slate-200">
              <div className="space-y-1.5 text-xs mb-3">
                <div className="flex justify-between text-slate-500">
                  <span>Subtotal</span>
                  <span data-testid="cart-subtotal">${subtotal.toFixed(2)}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-medium">
                    <span>Discount ({appliedDiscount}%)</span>
                    <span data-testid="cart-discount">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-500">
                  <span>Shipping</span>
                  <span data-testid="cart-shipping">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-slate-900 pt-1.5 border-t border-slate-100">
                  <span>Total Due</span>
                  <span data-testid="cart-final-total">${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="button"
                data-testid="checkout-btn"
                disabled={cart.length === 0}
                onClick={() => {
                  setIsCartOpen(false);
                  setIsCheckoutOpen(true);
                }}
                className={`w-full py-2 rounded-md font-semibold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  cart.length > 0
                    ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && !orderConfirmed && (
        <div
          data-testid="checkout-modal-overlay"
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            data-testid="checkout-dialog"
            className="w-full max-w-md bg-white rounded-xl shadow-2xl p-5 border border-slate-100 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-sm text-slate-900" data-testid="checkout-title">
                  Secure Checkout
                </h3>
              </div>
              <button
                type="button"
                data-testid="cancel-checkout-btn"
                onClick={() => setIsCheckoutOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handlePlaceOrder} className="space-y-3" data-testid="checkout-form">
              <div>
                <label htmlFor="customer-name-input" className="block text-[11px] font-medium text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  id="customer-name-input"
                  type="text"
                  data-testid="customer-name-input"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 focus:border-indigo-600 rounded-md outline-hidden"
                />
                {formErrors.name && (
                  <p data-testid="error-name" className="text-[11px] text-rose-600 mt-1">
                    {formErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="customer-email-input" className="block text-[11px] font-medium text-slate-700 mb-1">
                  Email Address *
                </label>
                <input
                  id="customer-email-input"
                  type="email"
                  data-testid="customer-email-input"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 focus:border-indigo-600 rounded-md outline-hidden"
                />
                {formErrors.email && (
                  <p data-testid="error-email" className="text-[11px] text-rose-600 mt-1">
                    {formErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="shipping-address-input" className="block text-[11px] font-medium text-slate-700 mb-1">
                  Shipping Address *
                </label>
                <input
                  id="shipping-address-input"
                  type="text"
                  data-testid="shipping-address-input"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 focus:border-indigo-600 rounded-md outline-hidden"
                />
                {formErrors.address && (
                  <p data-testid="error-address" className="text-[11px] text-rose-600 mt-1">
                    {formErrors.address}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="card-number-input" className="block text-[11px] font-medium text-slate-700 mb-1">
                  Card Details (Mock Test) *
                </label>
                <input
                  id="card-number-input"
                  type="text"
                  data-testid="card-number-input"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 focus:border-indigo-600 rounded-md outline-hidden font-mono"
                />
                {formErrors.card && (
                  <p data-testid="error-card" className="text-[11px] text-rose-600 mt-1">
                    {formErrors.card}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  data-testid="place-order-btn"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-md shadow-xs transition-colors cursor-pointer"
                >
                  Pay ${finalTotal.toFixed(2)} & Place Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Confirmation Screen */}
      {orderConfirmed && (
        <div
          data-testid="order-success-banner"
          className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center my-4 animate-in fade-in"
        >
          <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
          <h3 className="font-bold text-base text-slate-900" data-testid="order-success-title">
            Order Confirmed #NV-82914
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            Thank you, <span className="font-semibold">{customerName}</span>! A confirmation receipt has been sent to{' '}
            <span className="font-mono text-slate-800">{customerEmail}</span>.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <button
              type="button"
              data-testid="reset-store-btn"
              onClick={() => {
                setOrderConfirmed(false);
                setIsCheckoutOpen(false);
                setCart([{ product: PRODUCTS[0], quantity: 1 }]);
              }}
              className="px-4 py-1.5 bg-slate-900 text-white rounded-md text-xs font-medium cursor-pointer"
            >
              Start New Test Shopping Flow
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
