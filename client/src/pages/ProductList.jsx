import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import './ProductList.css';

const categoryTitles = {
  rings: 'Solitaire & Rings Collection',
  necklace: 'Royal Necklace Collection',
  earrings: 'Earrings & Jhumkas',
  chain: 'Gold Chain Collection (22K)',
  bangles: 'Gold Bangles & Kadas',
  bracelets: 'Tennis & Charm Bracelets',
  kada: 'Sovereign Gold Kadas',
  men: "Men's Luxury Jewellery",
  kids: "Kid's Precious Jewellery",
  coin: '24K (999) Pure Gold Coins & Bars',
  anklet: 'Anklets & Payals',
  pendent: 'Pendants & Charms',
  mangalsutra: 'Bridal Mangalsutra',
  nosepin: 'Nosepin & Studs',
  hair: 'Hair Accessories',
  watch: 'Luxury Watch Accessories',
};

const ProductList = () => {
  const { category } = useParams();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('q');

  const [products, setProducts] = useState([]);
  const [goldRate, setGoldRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const title = searchQuery
    ? `Search Results for "${searchQuery}"`
    : categoryTitles[category] || category || 'Jewellery Catalog';

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Fetch gold rate
    axios.get('/api/products/goldrate')
      .then(res => setGoldRate(res.data.goldRatePerGramINR))
      .catch(() => setGoldRate(7480));

    if (searchQuery) {
      // Execute search query
      axios.get(`/api/products/search?q=${encodeURIComponent(searchQuery)}`)
        .then(res => {
          setProducts(res.data);
          setLoading(false);
        })
        .catch(() => {
          setError(`No products found for "${searchQuery}".`);
          setLoading(false);
        });
    } else if (category) {
      // Category lookup
      axios.get(`/api/products/${category}`)
        .then(res => {
          setProducts(res.data);
          setLoading(false);
        })
        .catch(() => {
          setError(`Could not load category '${category}'.`);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [category, searchQuery]);

  return (
    <div className="product-list-page">
      <div className="page-banner">
        <span className="banner-eyebrow">JEWEL STREET HAUTE JOAILLERIE</span>
        <h1 className="page-title">{title}</h1>
        {goldRate && (
          <div className="gold-rate-badge" style={{ display: 'inline-flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span><i className="fas fa-coins"></i> Live 22K (91.6%): ₹{Math.round(goldRate * 0.916).toLocaleString('en-IN')}/g</span>
            <span style={{ opacity: 0.5 }}>•</span>
            <span><i className="fas fa-coins"></i> 18K (75.0%): ₹{Math.round(goldRate * 0.75).toLocaleString('en-IN')}/g</span>
          </div>
        )}
      </div>

      {loading && (
        <div className="loading-state">
          <div className="loader"></div>
          <p>Loading luxury creations...</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <p>{error}</p>
          <Link to="/" className="back-link">Return to Home</Link>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="empty-state">
          <i className="fas fa-search"></i>
          <p>No jewellery matching "{searchQuery || category}" was found.</p>
          <Link to="/" className="back-link">Browse All Categories</Link>
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="catalog-container">
          <div className="catalog-toolbar">
            <span>Showing {products.length} authenticated items with verified reviews</span>
            <span className="tap-hint"><i className="fas fa-hand-pointer"></i> Tap any card to enlarge details & reviews</span>
          </div>

          <div className="cards-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} goldRate={goldRate} />
            ))}
          </div>
        </div>
      )}

      <div className="back-link-wrap">
        <Link to="/" className="back-link">
          <i className="fas fa-arrow-left"></i> Return to Home
        </Link>
      </div>
    </div>
  );
};

export default ProductList;
