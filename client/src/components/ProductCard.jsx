import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useFavourites } from '../context/FavouritesContext';
import ProductModal from './ProductModal';
import './ProductCard.css';

const ProductCard = ({ product, goldRate }) => {
  const { addToCart, isInCart } = useCart();
  const { toggleFavourite, isFavourited } = useFavourites();

  const [cartAnim, setCartAnim] = useState(false);
  const [favAnim, setFavAnim] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showImageLightbox, setShowImageLightbox] = useState(false);

  if (!product) return null;

  // Direct context derivation — instant sync across all cards
  const faved = isFavourited(product.id);
  const inCart = isInCart(product.id);

  const calculatePrice = () => {
    const purity = product.purity?.includes('91.6') ? 0.916 : 0.75;
    const rate = goldRate || 7480;
    const weight = product.weight || 1;
    const goldPrice = rate * weight * purity;
    const makingCharge = goldPrice * 0.30;
    const gst = (goldPrice + makingCharge) * 0.03;
    const finalPrice = goldPrice + makingCharge + gst;
    return `₹${Math.round(finalPrice).toLocaleString('en-IN')}`;
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (inCart) return;

    const productData = {
      productId: product.id,
      name: product.name,
      image: product.image,
      purity: `Purity: ${product.purity}`,
      weight: `Weight: ${product.weight}g`,
      price: calculatePrice(),
      category: product.category || '',
    };
    await addToCart(productData);
    setCartAnim(true);
    setTimeout(() => setCartAnim(false), 600);
  };

  const handleToggleFav = async (e) => {
    e.stopPropagation();
    setFavAnim(true);
    setTimeout(() => setFavAnim(false), 600);

    const productData = {
      productId: product.id,
      name: product.name,
      image: product.image,
      purity: `Purity: ${product.purity}`,
      weight: `Weight: ${product.weight}g`,
      price: calculatePrice(),
      category: product.category || '',
    };
    await toggleFavourite(productData);
  };

  const handleImageClick = (e) => {
    e.stopPropagation();
    setShowImageLightbox(true);
  };

  return (
    <>
      <div
        className="luxury-product-card"
        onClick={() => setShowDetailModal(true)}
      >
        {/* Click image opens ONLY Image Lightbox */}
        <div
          className="card-image-wrap"
          onClick={handleImageClick}
          title="Click image to open high-res full image"
        >
          <img
            src={product.image}
            alt={product.name}
            className="card-image"
            onError={e => { e.target.src = '/photos/product1.jpg'; }}
          />
          
          <button
            className={`fav-btn ${faved ? 'faved' : ''} ${favAnim ? 'anim' : ''}`}
            onClick={handleToggleFav}
            title={faved ? 'Remove from favourites' : 'Add to favourites'}
            aria-label="Toggle favourite"
          >
            <i className={faved ? 'fas fa-heart' : 'far fa-heart'}></i>
          </button>

          <div className="card-hover-overlay">
            <span><i className="fas fa-expand"></i> View Full Image</span>
          </div>
        </div>

        {/* Click body opens Detail Modal */}
        <div className="card-body">
          <div className="card-rating-row">
            <span className="card-rating-stars">
              <i className="fas fa-star"></i> {product.rating || 4.9}
            </span>
            <span className="card-reviews-count">({product.reviewCount || 120} reviews)</span>
          </div>

          <h3 className="card-name">{product.name}</h3>

          <div className="card-meta-row">
            <span>Purity: {product.purity}</span>
            <span>Weight: {product.weight}g</span>
          </div>

          <div className="card-price">{calculatePrice()}</div>
          <p className="card-price-note">Incl. 30% making + 3% GST</p>

          <button
            className={`cart-btn ${inCart ? 'added' : ''} ${cartAnim ? 'anim' : ''}`}
            onClick={handleAddToCart}
            disabled={inCart}
          >
            {inCart ? (
              <><i className="fas fa-check"></i> Added to Cart</>
            ) : (
              <><i className="fas fa-shopping-bag"></i> Add to Cart</>
            )}
          </button>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && (
        <ProductModal
          product={product}
          goldRate={goldRate}
          onClose={() => setShowDetailModal(false)}
        />
      )}

      {/* Fullscreen ONLY Image Lightbox Modal */}
      {showImageLightbox && (
        <div
          className="image-lightbox-backdrop"
          onClick={() => setShowImageLightbox(false)}
        >
          <div className="image-lightbox-container" onClick={e => e.stopPropagation()}>
            <button
              className="lightbox-close-btn"
              onClick={() => setShowImageLightbox(false)}
              aria-label="Close image preview"
            >
              <i className="fas fa-times"></i>
            </button>
            <img
              src={product.image}
              alt={product.name}
              className="lightbox-full-img"
              onError={e => { e.target.src = '/photos/product1.jpg'; }}
            />
            <div className="lightbox-caption">{product.name} ({product.purity} Gold)</div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProductCard;
