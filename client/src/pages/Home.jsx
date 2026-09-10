import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductModal from '../components/ProductModal';
import './Home.css';

/* ── Scroll-reveal hook ── */
function useScrollReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -80px 0px',
      }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
}

/* ── Hero Intro Video (Clean background video) ── */
const IntroVideo = () => {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);

  const handleMuteToggle = () => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = !vid.muted;
    vid.volume = 1.0;
    if (!vid.muted) vid.play();
    setMuted(vid.muted);
  };

  return (
    <div className="intro-video-wrap">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="intro-video"
        id="introVideo"
      >
        <source src="/videos/Jewel%20Street.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <button className="mute-btn" onClick={handleMuteToggle} aria-label="Toggle mute">
        <i className={`fas ${muted ? 'fa-volume-xmark' : 'fa-volume-high'}`}></i>
      </button>
    </div>
  );
};

/* ── Model video section — FULL LEFT SCREEN COVERAGE ── */
const ModelSection = () => {
  const [sectionRef, visible] = useScrollReveal(0.1);
  return (
    <section
      ref={sectionRef}
      id="fade"
      className={`model-section ${visible ? 'visible' : ''}`}
    >
      <div className="model-inner-vertical">
        <div className={`model-video-wrap-vertical ${visible ? 'visible' : ''}`}>
          <video autoPlay loop muted playsInline className="model-video-vertical">
            <source src="/videos/model.mp4" type="video/mp4" />
          </video>
        </div>

        <div className={`model-text-vertical ${visible ? 'visible' : ''}`}>
          <span className="model-subtitle">ROYAL HERITAGE & CRAFTSMANSHIP</span>
          <h2>Timeless Haute Joaillerie<br />Sculpted for Perfection</h2>
          <p>
            Immerse yourself in our master-crafted gold, diamond, and precious gem creations.
            Every piece is certified 100% BIS Hallmarked 22K (91.6%) and 18K (75%) gold, engineered to radiate grandeur.
          </p>
          <div className="model-badges-row">
            <div className="badge-pill"><i className="fas fa-gem"></i> Certified High-Clarity Diamonds</div>
            <div className="badge-pill"><i className="fas fa-certificate"></i> BIS 91.6 Hallmarked</div>
            <div className="badge-pill"><i className="fas fa-truck-fast"></i> 100% Insured Shipping</div>
            <div className="badge-pill"><i className="fas fa-arrows-rotate"></i> 30-Day Easy Exchange</div>
          </div>
          <div className="model-cta-wrap">
            <Link to="/necklace" className="model-explore-btn">Explore Royal Necklaces →</Link>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ── Product categories grid ── */
const productCategories = [
  { href: '/rings',       img: '/photos/product1.jpg',  label: 'Solitaire & Rings' },
  { href: '/men',         img: '/photos/product2.jpg',  label: "Men's Collection" },
  { href: '/watch',       img: '/photos/product3.webp', label: 'Watch Accessories' },
  { href: '/nosepin',     img: '/photos/product4.jpg',  label: 'Diamond Nosepin' },
  { href: '/earrings',    img: '/photos/product5.jpg',  label: 'Heritage Earrings' },
  { href: '/necklace',    img: '/photos/product6.jpg',  label: 'Royal Necklace' },
  { href: '/chain',       img: '/photos/product9.jpg',  label: 'Gold Chain (22K)' },
  { href: '/kids',        img: '/photos/product10.jpg', label: "Kid's Jewellery" },
  { href: '/coin',        img: '/photos/product11.jpg', label: '24K Gold Coins' },
  { href: '/kada',        img: '/photos/product12.jpg', label: 'Sovereign Kada' },
  { href: '/mangalsutra', img: '/photos/product8.jpg',  label: 'Bridal Mangalsutra' },
  { href: '/anklet',      img: '/photos/product13.jpg', label: 'Anklets & Payal' },
  { href: '/bangles',     img: '/photos/product14.jpg', label: 'Gold Bangles' },
  { href: '/pendent',     img: '/photos/product7.jpg',  label: 'Precious Pendants' },
  { href: '/bracelets',   img: '/photos/product15.jpg', label: 'Tennis Bracelets' },
  { href: '/hair',        img: '/photos/product18.jpg', label: 'Hair Accessories' },
];

const ShopSection = () => {
  const [ref, visible] = useScrollReveal(0.05);
  return (
    <section ref={ref} id="shop" className={`shop-section scroll-reveal ${visible ? 'visible' : ''}`}>
      <div className="section-header-center">
        <span className="section-subtitle">CURATED COLLECTIONS</span>
        <h2 className="section-title">Explore Fine Jewellery</h2>
        <div className="accent-divider"></div>
      </div>
      <div className="product-grid">
        {productCategories.map((cat, i) => (
          <figure
            key={i}
            className="product-figure"
            style={{ '--delay': `${(i % 6) * 60}ms` }}
          >
            <Link to={cat.href}>
              <div className="product-thumb">
                <img
                  src={cat.img}
                  alt={cat.label}
                  onError={e => { e.target.src = '/photos/product1.jpg'; }}
                />
              </div>
            </Link>
            <figcaption>{cat.label}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
};

/* ── Reviews — 70% IMAGE & 30% DETAILS WITH CLICKABLE PURCHASED ITEM ── */
const reviews = [
  {
    id: 'ring2',
    category: 'rings',
    name: 'Priyanka Chopra',
    img: '/photos/review/1.jpg',
    productImg: '/photos/rings/ring2.jpg',
    item: 'Royal Crown Diamond Ring',
    purity: '91.6%',
    weight: 6.15,
    text: '"Absolutely in love with my gold ring from Jewel Street! The design is sleek, minimalist, and perfect for everyday wear. The 91.6 hallmark certification gives absolute peace of mind."',
  },
  {
    id: 'necklace1',
    category: 'necklace',
    name: 'Deepika Padukone',
    img: '/photos/review/2.jpg',
    productImg: '/photos/necklace/necklace1.jpg',
    item: 'Royal Heritage Gold Necklace',
    purity: '91.6%',
    weight: 12.50,
    text: '"The diamonds shine beautifully, and the craftsmanship is flawless. A true statement piece that transformed my red carpet bridal look!"',
  },
  {
    id: 'men1',
    category: 'men',
    name: 'Vicky Kaushal',
    img: '/photos/review/3.jpg',
    productImg: '/photos/men/1.jpg',
    item: "Men's Heavy Gold Chain",
    purity: '91.6%',
    weight: 15.00,
    text: '"Great weight, premium shine, and a masculine design — Jewel Street nailed it with this men\'s heavy 22K gold chain! Highly recommended for quality buyers."',
  },
  {
    id: 'necklace7',
    category: 'necklace',
    name: "Cristle D'Souza",
    img: '/photos/review/4.jpg',
    productImg: '/photos/necklace/necklace7.jpg',
    item: 'Grand Maharani Necklace',
    purity: '91.6%',
    weight: 16.00,
    text: '"Absolutely breathtaking! My diamond necklace from Jewel Street is the perfect mix of elegance and sparkle. The packaging and insured courier were top notch!"',
  },
  {
    id: 'bracelet1',
    category: 'bracelets',
    name: 'Emily Watson',
    img: '/photos/review/5.jpg',
    productImg: '/photos/bracelete/1.jpg',
    item: 'Luxury Tennis Bracelet',
    purity: '91.6%',
    weight: 6.00,
    text: '"Jewel Street never fails to amaze! Stunning designs, certified 100% purity, and a perfect mix of minimal and royal luxury pieces for every occasion."',
  },
];

const ReviewSection = () => {
  const [ref, visible] = useScrollReveal(0.05);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const handlePurchasedItemClick = (r) => {
    setSelectedProduct({
      id: r.id,
      name: r.item,
      image: r.productImg,
      purity: r.purity || '91.6%',
      weight: r.weight || 6.15,
      rating: 5.0,
      reviewCount: 148,
      category: r.category,
      description: r.text.replace(/^"|"$/g, ''),
    });
  };

  return (
    <section ref={ref} id="review" className={`review-section scroll-reveal ${visible ? 'visible' : ''}`}>
      <div className="section-header-center">
        <span className="section-subtitle">VERIFIED CLIENT TESTIMONIALS</span>
        <h2 className="section-title">Loved by Royalty & Connoisseurs</h2>
        <div className="accent-divider"></div>
      </div>

      <div className="reviews-grid-vertical">
        {reviews.map((r, i) => (
          <article
            key={i}
            className="review-card-7030"
            style={{ '--delay': `${i * 100}ms` }}
          >
            {/* 70% REVIEWER IMAGE */}
            <div className="review-photo-70">
              <img
                src={r.img}
                alt={r.name}
                onError={e => { e.target.src = '/photos/review/1.jpg'; }}
              />
              <div className="photo-overlay-gradient"></div>
              <div className="review-badge-top">
                <span><i className="fas fa-circle-check"></i> Verified Client</span>
              </div>
            </div>

            {/* 30% DETAILS BELOW PHOTO */}
            <div className="review-details-30">
              <div className="reviewer-name-bar">
                <h3>{r.name}</h3>
                <div className="star-row-vertical">
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                </div>
              </div>

              <p className="review-text-vertical">{r.text}</p>

              {/* Clickable Purchased Item Redirects to Product */}
              <div
                className="review-item-footer-clickable"
                onClick={() => handlePurchasedItemClick(r)}
                title={`Click to view details of ${r.item}`}
              >
                <img
                  src={r.productImg}
                  alt={r.item}
                  onError={e => { e.target.src = '/photos/product1.jpg'; }}
                  className="review-product-thumb"
                />
                <div className="purchased-item-label">
                  <span className="purchased-title">Purchased Item <i className="fas fa-arrow-up-right-from-square"></i></span>
                  <span className="purchased-name">{r.item}</span>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          goldRate={7480}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </section>
  );
};

/* ── Contact Concierge ── */
const ContactSection = () => {
  const [ref, visible] = useScrollReveal(0.1);
  return (
    <section ref={ref} id="contact" className={`contact-section scroll-reveal ${visible ? 'visible' : ''}`}>
      <div className="contact-inner">
        <span className="section-subtitle">CONCIERGE SERVICE</span>
        <h2>Contact Our Jewellery Experts</h2>
        <p>
          Whether you require bespoke custom design assistance, hallmark purity verification, or private appointments,
          our master concierges are at your service.
        </p>
        <div className="contact-details">
          <div className="contact-item"><i className="fas fa-envelope"></i><span>concierge@jewelstreet.com</span></div>
          <div className="contact-item"><i className="fas fa-phone"></i><span>+91 1800 233 8899 (Toll Free)</span></div>
          <div className="contact-item"><i className="fas fa-clock"></i><span>Mon–Sat, 10:00 AM – 8:00 PM (IST)</span></div>
        </div>
        <div className="contact-address">
          <i className="fas fa-location-dot"></i>
          <address>
            JEWEL STREET Flagship Store<br />
            456 Sparkle Street, MG Road, Bangalore, Karnataka 560001
          </address>
        </div>
      </div>
    </section>
  );
};

/* ── Main Home Page ── */
const Home = () => (
  <div className="home-page">
    <div className="introduction">
      <IntroVideo />
    </div>

    <main className="home-main-container">
      {/* Model video section */}
      <ModelSection />

      {/* Shop Categories Grid */}
      <ShopSection />

      {/* Customer Reviews */}
      <ReviewSection />

      {/* Contact Concierge */}
      <ContactSection />
    </main>
  </div>
);

export default Home;
