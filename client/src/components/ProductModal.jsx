import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useFavourites } from '../context/FavouritesContext';
import './ProductModal.css';

const ProductModal = ({ product, goldRate, onClose }) => {
  const { addToCart, isInCart } = useCart();
  const { toggleFavourite, isFavourited } = useFavourites();
  
  const [activeTab, setActiveTab] = useState('details'); // 'details' | 'reviews'
  const [addingCart, setAddingCart] = useState(false);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState('');
  const [reviewList, setReviewList] = useState(product?.reviews || []);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  if (!product) return null;

  const faved = isFavourited(product.id);
  const inCart = isInCart(product.id);

  const [selectedQuality, setSelectedQuality] = useState(product.purity?.includes('75') ? '75' : '91.6');

  // Price calculations based on selected quality
  const purityFactor = selectedQuality === '75' ? 0.75 : 0.916;
  const purityLabel = selectedQuality === '75' ? '18K (75.0% Pure Gold)' : '22K (91.6% Pure Gold)';
  const currentGoldRate = goldRate || 7480;
  const rawGoldPrice = currentGoldRate * (product.weight || 1) * purityFactor;
  const makingCharges = rawGoldPrice * 0.30;
  const gst = (rawGoldPrice + makingCharges) * 0.03;
  const finalPriceVal = rawGoldPrice + makingCharges + gst;
  const formattedPrice = `₹${Math.round(finalPriceVal).toLocaleString('en-IN')}`;

  const handleAddToCart = async () => {
    setAddingCart(true);
    const itemData = {
      productId: product.id,
      name: product.name,
      image: product.image,
      purity: `Purity: ${purityLabel}`,
      weight: `Weight: ${product.weight}g`,
      price: formattedPrice,
      category: product.category || '',
    };
    await addToCart(itemData);
    setAddingCart(false);
  };

  const handleToggleFav = async () => {
    const itemData = {
      productId: product.id,
      name: product.name,
      image: product.image,
      purity: `Purity: ${purityLabel}`,
      weight: `Weight: ${product.weight}g`,
      price: formattedPrice,
      category: product.category || '',
    };
    await toggleFavourite(itemData);
  };

  const handleAddReview = (e) => {
    e.preventDefault();
    if (!newReviewName.trim() || !newReviewText.trim()) return;
    const newRev = {
      id: Date.now(),
      author: newReviewName.trim(),
      rating: Number(newReviewRating),
      date: 'Just now',
      title: 'Verified Customer',
      comment: newReviewText.trim(),
    };
    setReviewList([newRev, ...reviewList]);
    setNewReviewName('');
    setNewReviewText('');
    setReviewSubmitted(true);
    setTimeout(() => setReviewSubmitted(false), 4000);
  };

  return (
    <div className="product-modal-backdrop" onClick={onClose}>
      <div className="product-modal-container" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <i className="fas fa-times"></i>
        </button>

        <div className="modal-content-grid">
          {/* Left Column: Image & Badges */}
          <div className="modal-image-col">
            <div className="modal-img-wrapper">
              <img
                src={product.image}
                alt={product.name}
                className="modal-main-img"
                onError={e => { e.target.src = '/photos/product1.jpg'; }}
              />
            </div>

            <div className="modal-trust-badges">
              <div className="trust-item">
                <i className="fas fa-certificate"></i>
                <span>BIS 91.6 Hallmarked</span>
              </div>
              <div className="trust-item">
                <i className="fas fa-shield-alt"></i>
                <span>100% Insured Delivery</span>
              </div>
              <div className="trust-item">
                <i className="fas fa-arrow-rotate-left"></i>
                <span>30-Day Easy Return</span>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Reviews */}
          <div className="modal-info-col">
            <div className="modal-header">
              <span className="modal-category-label">{product.category ? product.category.toUpperCase() : 'JEWEL STREET LUXURY'}</span>
              <h2 className="modal-product-title">{product.name}</h2>

              <div className="modal-rating-row">
                <div className="stars-badge">
                  <i className="fas fa-star"></i>
                  <span>{product.rating || 4.9}</span>
                </div>
                <span className="reviews-count-text">
                  ({product.reviewCount || reviewList.length || 120} Verified Buyer Reviews)
                </span>
                <span className="in-stock-badge">
                  <i className="fas fa-check-circle"></i> In Stock
                </span>
              </div>
            </div>

            {/* Tabs Header */}
            <div className="modal-tabs">
              <button
                className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
                onClick={() => setActiveTab('details')}
              >
                Overview & Pricing
              </button>
              <button
                className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                Customer Reviews ({reviewList.length})
              </button>
            </div>

            {/* Tab 1: Overview & Price Breakdown */}
            {activeTab === 'details' && (
              <div className="tab-pane">
                <p className="modal-description">{product.description || 'Crafted in pure gold with precision gem setting. Designed for high elegance and timeless luxury.'}</p>

                {/* Gold Quality / Purity Switcher */}
                <div style={{ margin: '14px 0', background: 'rgba(19, 6, 36, 0.6)', padding: '12px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                    <i className="fas fa-gem" style={{ color: '#e6b97e', marginRight: '6px' }}></i> Select Gold Quality / Purity:
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedQuality('91.6')}
                      style={{
                        flex: 1,
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: selectedQuality === '91.6' ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                        background: selectedQuality === '91.6' ? 'rgba(230, 185, 126, 0.18)' : '#090029',
                        color: selectedQuality === '91.6' ? 'var(--accent-primary)' : '#c4b8e2',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      <i className="fas fa-certificate" style={{ color: '#e6b97e', marginRight: '6px' }}></i> 22K (91.6% BIS Hallmarked)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedQuality('75')}
                      style={{
                        flex: 1,
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: selectedQuality === '75' ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                        background: selectedQuality === '75' ? 'rgba(230, 185, 126, 0.18)' : '#090029',
                        color: selectedQuality === '75' ? 'var(--accent-primary)' : '#c4b8e2',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontSize: '0.85rem'
                      }}
                    >
                      <i className="fas fa-certificate" style={{ color: '#e6b97e', marginRight: '6px' }}></i> 18K (75.0% BIS Hallmarked)
                    </button>
                  </div>
                </div>

                <div className="modal-price-card">
                  <div className="total-price-row">
                    <span className="price-label">Total Price:</span>
                    <span className="price-amount">{formattedPrice}</span>
                  </div>
                  <p className="price-subnote">Incl. 30% making charges + 3% GST</p>

                  <div className="price-breakdown">
                    <div className="breakdown-item">
                      <span>Gold Purity Rate ({product.purity}):</span>
                      <span>₹{Math.round(currentGoldRate * purityFactor).toLocaleString('en-IN')}/g</span>
                    </div>
                    <div className="breakdown-item">
                      <span>Gross Gold Weight:</span>
                      <span>{product.weight} grams</span>
                    </div>
                    <div className="breakdown-item">
                      <span>Raw Gold Value:</span>
                      <span>₹{Math.round(rawGoldPrice).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="breakdown-item">
                      <span>Making Charges (30%):</span>
                      <span>₹{Math.round(makingCharges).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="breakdown-item">
                      <span>GST (3%):</span>
                      <span>₹{Math.round(gst).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="modal-actions">
                  <button
                    className={`modal-cart-btn ${inCart ? 'in-cart' : ''}`}
                    onClick={handleAddToCart}
                    disabled={inCart || addingCart}
                  >
                    {inCart ? (
                      <><i className="fas fa-check"></i> Added to Cart</>
                    ) : (
                      <><i className="fas fa-shopping-bag"></i> Add to Cart</>
                    )}
                  </button>

                  <button
                    className={`modal-fav-btn ${faved ? 'faved' : ''}`}
                    onClick={handleToggleFav}
                    title={faved ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    <i className={faved ? 'fas fa-heart' : 'far fa-heart'}></i>
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Reviews */}
            {activeTab === 'reviews' && (
              <div className="tab-pane reviews-pane">
                <div className="reviews-summary-bar">
                  <div className="big-rating">{product.rating || 4.9}</div>
                  <div className="rating-info">
                    <div className="stars-gold">
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                    </div>
                    <span>Based on {product.reviewCount || 120} reviews</span>
                  </div>
                </div>

                {/* Existing Reviews List */}
                <div className="reviews-list-container">
                  {reviewList.map(r => (
                    <div key={r.id} className="modal-review-card">
                      <div className="review-card-head">
                        <span className="review-author">{r.author}</span>
                        <span className="review-date">{r.date}</span>
                      </div>
                      <div className="review-stars">
                        {[...Array(r.rating || 5)].map((_, i) => (
                          <i key={i} className="fas fa-star"></i>
                        ))}
                      </div>
                      <h4 className="review-item-title">{r.title}</h4>
                      <p className="review-item-text">{r.comment}</p>
                    </div>
                  ))}
                </div>

                {/* Add Review Form */}
                <form className="add-review-form" onSubmit={handleAddReview}>
                  <h3>Write a Verified Review</h3>
                  {reviewSubmitted && (
                    <div className="review-success">
                      <i className="fas fa-check-circle"></i> Thank you! Your review has been added.
                    </div>
                  )}
                  <div className="review-form-row">
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={newReviewName}
                      onChange={e => setNewReviewName(e.target.value)}
                      required
                    />
                    <select
                      value={newReviewRating}
                      onChange={e => setNewReviewRating(e.target.value)}
                    >
                      <option value="5">★★★★★ (5 Stars - Excellent)</option>
                      <option value="4">★★★★☆ (4 Stars - Very Good)</option>
                      <option value="3">★★★☆☆ (3 Stars - Good)</option>
                    </select>
                  </div>
                  <textarea
                    placeholder="Share your experience with this jewellery piece..."
                    value={newReviewText}
                    onChange={e => setNewReviewText(e.target.value)}
                    rows="3"
                    required
                  ></textarea>
                  <button type="submit" className="submit-review-btn">
                    Submit Review
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
