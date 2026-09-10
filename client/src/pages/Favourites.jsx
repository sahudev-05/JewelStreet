import React from 'react';
import { Link } from 'react-router-dom';
import { useFavourites } from '../context/FavouritesContext';
import { useCart } from '../context/CartContext';
import './Favourites.css';

const Favourites = () => {
  const { favourites, removeFromFavourites } = useFavourites();
  const { addToCart, isInCart } = useCart();

  const handleAddToCart = async (item) => {
    await addToCart({
      productId: item.productId,
      name: item.name,
      image: item.image,
      purity: item.purity,
      weight: item.weight,
      price: item.price,
      category: item.category,
    });
  };

  return (
    <div className="favs-page">
      <div className="favs-container">
        <div className="favs-header">
          <h1><i className="fas fa-heart" style={{ color: '#e89da9' }}></i> My Saved Favourites</h1>
          <p>{favourites.length} {favourites.length === 1 ? 'item' : 'items'} saved</p>
        </div>

        {favourites.length === 0 ? (
          <div className="empty-favs">
            <div className="empty-icon"><i className="far fa-heart" style={{ color: '#e89da9' }}></i></div>
            <h3>No favourites yet</h3>
            <p>Heart products you love to save them here.</p>
            <Link to="/" className="shop-btn">Start Shopping</Link>
          </div>
        ) : (
          <div className="favs-grid">
            {favourites.map((item, i) => (
              <div key={item.productId || i} className="fav-card">
                <div className="fav-image-wrap">
                  <img
                    src={item.image}
                    alt={item.name}
                    onError={e => e.target.src = '/photos/product1.jpg'}
                  />
                  <button
                    className="remove-fav-btn"
                    onClick={() => removeFromFavourites(item.productId)}
                    title="Remove from favourites"
                  >
                    <i className="fas fa-heart" style={{ color: '#e89da9' }}></i>
                  </button>
                </div>
                <div className="fav-info">
                  <h3>{item.name}</h3>
                  <p className="fav-detail">{item.purity}</p>
                  <p className="fav-detail">{item.weight}</p>
                  <p className="fav-price">{item.price}</p>
                  <div className="fav-actions">
                    <button
                      className={`fav-cart-btn ${isInCart(item.productId) ? 'in-cart' : ''}`}
                      onClick={() => handleAddToCart(item)}
                      disabled={isInCart(item.productId)}
                    >
                      {isInCart(item.productId) ? (
                        <><i className="fas fa-check"></i> In Cart</>
                      ) : (
                        <><i className="fas fa-shopping-cart"></i> Add to Cart</>
                      )}
                    </button>
                    <button
                      className="fav-remove-btn"
                      onClick={() => removeFromFavourites(item.productId)}
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="back-nav">
          <Link to="/" className="back-link">
            <i className="fas fa-arrow-left"></i> Back to Home
          </Link>
          {favourites.length > 0 && (
            <Link to="/cart" className="go-cart-link">
              <i className="fas fa-shopping-cart"></i> View Cart
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Favourites;
