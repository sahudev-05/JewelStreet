const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Helper to generate realistic historical gold prices for graph
function generateGoldHistory(base24K) {
  const dates = ['Sep 01', 'Sep 02', 'Sep 03', 'Sep 04', 'Sep 05', 'Sep 06', 'Sep 07'];
  const multipliers = [0.985, 0.988, 0.992, 0.995, 0.991, 0.997, 1.000];
  
  return dates.map((date, idx) => {
    const r24 = Math.round(base24K * multipliers[idx]);
    return {
      date,
      rate24K: r24,
      rate916: Math.round(r24 * 0.916),
      rate750: Math.round(r24 * 0.75),
    };
  });
}

const dailyRateFilePath = path.join(__dirname, '../data/daily_gold_rate.json');

// GET /api/products/goldrate — proxy & enriched gold rates locked to update ONCE PER DAY
router.get('/goldrate', async (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  // Check if today's rate is already cached
  try {
    if (fs.existsSync(dailyRateFilePath)) {
      const cachedRaw = fs.readFileSync(dailyRateFilePath, 'utf8');
      const cachedData = JSON.parse(cachedRaw);
      if (cachedData && cachedData.date === today) {
        return res.json(cachedData);
      }
    }
  } catch (err) {
    console.warn('Failed reading daily gold rate cache:', err.message);
  }

  // If not cached today, fetch from API once for the day
  let baseRate = 7500;
  try {
    const response = await fetch('https://api.gold-api.com/price/XAU');
    const data = await response.json();
    if (data && data.price) {
      const goldRatePerGramUSD = parseFloat(data.price) / 31.1035;
      const exchangeRate = 87;
      baseRate = Math.round(goldRatePerGramUSD * exchangeRate);
    }
  } catch (error) {
    baseRate = 7480;
  }

  const rate24K = baseRate;
  const rate916 = Math.round(baseRate * 0.916);
  const rate750 = Math.round(baseRate * 0.75);
  const history = generateGoldHistory(baseRate);

  const dailyResult = {
    date: today,
    goldRatePerGramINR: baseRate,
    rate24K,
    rate916,
    rate750,
    rate916TenGram: rate916 * 10,
    rate750TenGram: rate750 * 10,
    change24h: '+1.35%',
    history,
    lastUpdated: `Daily Rate (${today})`,
  };

  try {
    if (!fs.existsSync(path.join(__dirname, '../data'))) {
      fs.mkdirSync(path.join(__dirname, '../data'), { recursive: true });
    }
    fs.writeFileSync(dailyRateFilePath, JSON.stringify(dailyResult, null, 2));
  } catch (err) {
    console.error('Failed writing daily gold rate cache:', err.message);
  }

  res.json(dailyResult);
});

// Mock customer reviews bank for products
const sampleReviews = {
  rings: [
    { id: 1, author: 'Priya Sharma', rating: 5, date: '2 days ago', title: 'Exquisite Craftsmanhip!', comment: 'The ring sparkles magnificently. The 91.6 BIS hallmark is laser engraved inside the band.' },
    { id: 2, author: 'Rohan Mehta', rating: 5, date: '1 week ago', title: 'Perfect Proposal Ring', comment: 'Proposed with this ring and she absolutely loved it! Premium luxury finish and sturdy weight.' },
    { id: 3, author: 'Ananya Roy', rating: 4, date: '2 weeks ago', title: 'Very Elegant', comment: 'Minimalist design, looks very expensive. Arrived with tamper-proof packaging and hallmark certificate.' }
  ],
  necklace: [
    { id: 1, author: 'Sunita Verma', rating: 5, date: '3 days ago', title: 'Grand Royal Look', comment: 'Bought this necklace for a family wedding. Everyone gave endless compliments!' },
    { id: 2, author: 'Kavita Reddy', rating: 5, date: '2 weeks ago', title: '100% Genuine Quality', comment: 'Verified the gold purity at a local assayer and it was exactly 91.6%. Highly trusted brand.' }
  ],
  coin: [
    { id: 1, author: 'Vikram Singh', rating: 5, date: 'Yesterday', title: 'Pure Investment', comment: '24K / 91.6 certified coin with tamper-evident blister packaging. Ideal for gifting.' },
    { id: 2, author: 'Deepak Patel', rating: 5, date: '5 days ago', title: 'Instant Add to Cart & Fast Delivery', comment: 'Delivered within 48 hours with insured courier. Highly satisfied!' }
  ],
  general: [
    { id: 1, author: 'Aarti Kulkarni', rating: 5, date: '4 days ago', title: 'Superb Polish & Finish', comment: 'The gold luster and finish is beyond expectations. Fits so comfortably.' },
    { id: 2, author: 'Nikhil Saxena', rating: 5, date: '1 week ago', title: 'Worth Every Rupee', comment: 'Top-tier luxury presentation box and official guarantee card included.' }
  ]
};

// Comprehensive product catalog
const productCatalog = {
  rings: [
    { id: 'ring1', name: 'Solitaire Diamond Ring', purity: '75%', weight: 6.15, image: '/photos/rings/ring1.jpg', rating: 4.9, reviewCount: 148, reviews: sampleReviews.rings, description: 'Handcrafted solitaire ring featuring a brilliant round-cut diamond set on 18K (75%) polished gold.' },
    { id: 'ring2', name: 'Royal Crown Diamond Ring', purity: '91.6%', weight: 6.15, image: '/photos/rings/ring2.jpg', rating: 4.8, reviewCount: 112, reviews: sampleReviews.rings, description: 'Royal crown design in 22K (91.6%) hallmarked gold with precision diamond pavé setting.' },
    { id: 'ring3', name: 'Gold Band Ring', purity: '75%', weight: 5.80, image: '/photos/rings/ring3.jpg', rating: 4.7, reviewCount: 89, reviews: sampleReviews.rings, description: 'Sleek luxury gold band crafted with comfort-fit curved inner profile.' },
    { id: 'ring4', name: 'Eternity Engagement Ring', purity: '91.6%', weight: 7.20, image: '/photos/rings/ring4.jpg', rating: 5.0, reviewCount: 204, reviews: sampleReviews.rings, description: 'Timeless engagement ring symbolizing endless love, featuring high-clarity diamonds.' },
    { id: 'ring5', name: 'Cluster Diamond Ring', purity: '75%', weight: 5.50, image: '/photos/rings/ring5.jpg', rating: 4.8, reviewCount: 95, reviews: sampleReviews.rings, description: 'Intricate cluster setting with sparkling stones designed to capture light from every angle.' },
    { id: 'ring6', name: 'Imperial Cocktail Ring', purity: '91.6%', weight: 8.00, image: '/photos/rings/ring6.jpg', rating: 4.9, reviewCount: 130, reviews: sampleReviews.rings, description: 'Bold statement cocktail ring for gala evenings and grand festive occasions.' },
    { id: 'ring7', name: 'Infinite Eternity Ring', purity: '75%', weight: 4.90, image: '/photos/rings/ring7.jpg', rating: 4.7, reviewCount: 76, reviews: sampleReviews.rings, description: 'Continuous band of prong-set gems representing everlasting commitment.' },
    { id: 'ring8', name: 'Heritage Statement Ring', purity: '91.6%', weight: 9.10, image: '/photos/rings/ring8.jpg', rating: 4.9, reviewCount: 165, reviews: sampleReviews.rings, description: 'Artisanal heritage carving in pure 22K gold with satin matte contrast details.' },
  ],
  necklace: [
    { id: 'necklace1', name: 'Royal Heritage Gold Necklace', purity: '91.6%', weight: 12.50, image: '/photos/necklace/necklace1.jpg', rating: 4.9, reviewCount: 182, reviews: sampleReviews.necklace, description: 'Opulent traditional necklace with intricate gold filigree craftsmanship.' },
    { id: 'necklace2', name: 'Ethereal Diamond Choker', purity: '75%', weight: 10.00, image: '/photos/necklace/necklace2.jpg', rating: 4.8, reviewCount: 94, reviews: sampleReviews.necklace, description: 'Contemporary diamond choker designed to rest elegantly along the collarbone.' },
    { id: 'necklace3', name: 'Pearl & Gold Symphony Necklace', purity: '91.6%', weight: 14.00, image: '/photos/necklace/necklace3.jpg', rating: 4.9, reviewCount: 140, reviews: sampleReviews.necklace, description: 'Lustrous South Sea pearls intertwined with 22K gold beads.' },
    { id: 'necklace4', name: 'Layered Elegance Necklace', purity: '75%', weight: 8.00, image: '/photos/necklace/necklace4.jpg', rating: 4.7, reviewCount: 88, reviews: sampleReviews.necklace, description: 'Multi-strand delicate gold chain necklace for effortless layering.' },
    { id: 'necklace5', name: 'Celestial Diamond Pendant Necklace', purity: '91.6%', weight: 9.50, image: '/photos/necklace/necklace5.jpg', rating: 4.8, reviewCount: 110, reviews: sampleReviews.necklace, description: 'Striking central diamond pendant suspended on a fine 22K gold chain.' },
    { id: 'necklace6', name: 'Velvet Choker Necklace', purity: '75%', weight: 11.00, image: '/photos/necklace/necklace6.jpg', rating: 4.6, reviewCount: 65, reviews: sampleReviews.necklace, description: 'Chic modern choker with geometric gold motifs.' },
    { id: 'necklace7', name: 'Grand Maharani Necklace', purity: '91.6%', weight: 16.00, image: '/photos/necklace/necklace7.jpg', rating: 5.0, reviewCount: 220, reviews: sampleReviews.necklace, description: 'Showstopping bridal centerpiece with temple gold motifs and ruby accents.' },
    { id: 'necklace8', name: 'Delicate Petal Necklace', purity: '75%', weight: 7.50, image: '/photos/necklace/necklace8.jpg', rating: 4.7, reviewCount: 79, reviews: sampleReviews.necklace, description: 'Subtle floral petal charms strung on 18K yellow gold.' },
  ],
  earrings: [
    { id: 'earring1', name: 'Diamond Solitaire Stud Earrings', purity: '91.6%', weight: 2.50, image: '/photos/earring/1.jpg', rating: 4.9, reviewCount: 215, reviews: sampleReviews.general, description: 'Classic four-prong solitaire studs in 22K gold.' },
    { id: 'earring2', name: 'Cascading Drop Earrings', purity: '75%', weight: 3.00, image: '/photos/earring/2.jpg', rating: 4.8, reviewCount: 140, reviews: sampleReviews.general, description: 'Gracefully swaying drop earrings designed for light reflections.' },
    { id: 'earring3', name: 'Classic Gold Hoop Earrings', purity: '91.6%', weight: 4.00, image: '/photos/earring/3.jpg', rating: 4.7, reviewCount: 168, reviews: sampleReviews.general, description: 'High-polish seamless gold hoops with secure click closure.' },
    { id: 'earring4', name: 'Chandelier Diamond Earrings', purity: '75%', weight: 5.50, image: '/photos/earring/4.jpg', rating: 4.9, reviewCount: 190, reviews: sampleReviews.general, description: 'Dramatic chandelier design with multi-tiered gem droplets.' },
    { id: 'earring5', name: 'Heritage Jhumka Earrings', purity: '91.6%', weight: 6.00, image: '/photos/earring/5.jpg', rating: 5.0, reviewCount: 280, reviews: sampleReviews.general, description: 'Traditional bell-shaped Jhumkas with delicate gold tassel drops.' },
    { id: 'earring6', name: 'Lustrous Pearl Drop Earrings', purity: '75%', weight: 3.50, image: '/photos/earring/6.jpg', rating: 4.8, reviewCount: 105, reviews: sampleReviews.general, description: 'Freshwater pearls hanging beneath polished gold studs.' },
    { id: 'earring7', name: 'Modern Clip Earrings', purity: '91.6%', weight: 2.80, image: '/photos/earring/7.jpg', rating: 4.6, reviewCount: 62, reviews: sampleReviews.general, description: 'Ergonomic non-pierced luxury gold clips.' },
    { id: 'earring8', name: 'Geometric Cuff Earrings', purity: '75%', weight: 3.20, image: '/photos/earring/8.jpg', rating: 4.7, reviewCount: 84, reviews: sampleReviews.general, description: 'Contemporary ear cuff wrapping comfortably around the helix.' },
  ],
  chain: [
    { id: 'chain1', name: 'Classic Gold Chain', purity: '91.6%', weight: 8.00, image: '/photos/chain/1.jpg', rating: 4.9, reviewCount: 175, reviews: sampleReviews.general, description: 'Durable 22K gold chain with hand-finished links.' },
    { id: 'chain2', name: 'Figaro Link Chain', purity: '75%', weight: 10.00, image: '/photos/chain/2.jpg', rating: 4.8, reviewCount: 130, reviews: sampleReviews.general, description: 'Distinctive Figaro pattern featuring alternating long and short links.' },
    { id: 'chain3', name: 'Diamond Cut Rope Chain', purity: '91.6%', weight: 12.00, image: '/photos/chain/3.jpg', rating: 4.9, reviewCount: 198, reviews: sampleReviews.general, description: 'Twisted rope chain with precision diamond-cut facet edges for maximum sheen.' },
    { id: 'chain4', name: 'Sleek Box Chain', purity: '75%', weight: 9.00, image: '/photos/chain/4.jpg', rating: 4.7, reviewCount: 92, reviews: sampleReviews.general, description: 'Square interlocking links offering a smooth, flexible texture.' },
    { id: 'chain5', name: 'Heavy Cuban Link Chain', purity: '91.6%', weight: 15.00, image: '/photos/chain/5.jpg', rating: 5.0, reviewCount: 240, reviews: sampleReviews.general, description: 'Bold luxury Cuban link chain crafted for substantial weight and presence.' },
    { id: 'chain6', name: 'Spiga Wheat Chain', purity: '75%', weight: 7.50, image: '/photos/chain/6.jpg', rating: 4.8, reviewCount: 86, reviews: sampleReviews.general, description: 'Braided wheat motif chain known for strength and flexibility.' },
    { id: 'chain7', name: 'Fluid Snake Chain', purity: '91.6%', weight: 11.00, image: '/photos/chain/7.jpg', rating: 4.7, reviewCount: 115, reviews: sampleReviews.general, description: 'Silky smooth ring joints forming a continuous fluid ribbon.' },
    { id: 'chain8', name: 'Bead & Bar Chain', purity: '75%', weight: 6.50, image: '/photos/chain/8.jpg', rating: 4.6, reviewCount: 70, reviews: sampleReviews.general, description: 'Delicate polished spheres interspersed with sleek gold bars.' },
  ],
  bangles: [
    { id: 'bangle1', name: 'Classic Gold Bangle', purity: '91.6%', weight: 14.00, image: '/photos/bangles/1.jpg', rating: 4.9, reviewCount: 160, reviews: sampleReviews.general, description: 'Solid 22K gold bangle with mirror polish finish.' },
    { id: 'bangle2', name: 'Diamond Eternity Bangle', purity: '75%', weight: 12.00, image: '/photos/bangles/2.jpg', rating: 4.8, reviewCount: 118, reviews: sampleReviews.general, description: 'Channel-set diamonds around the perimeter of 18K gold.' },
    { id: 'bangle3', name: 'Kada Bangle with Screw Lock', purity: '91.6%', weight: 16.00, image: '/photos/bangles/3.jpg', rating: 4.9, reviewCount: 145, reviews: sampleReviews.general, description: 'Substantial Kada style bangle with heavy hinge lock.' },
    { id: 'bangle4', name: 'Stackable Thin Bangle', purity: '75%', weight: 8.00, image: '/photos/bangles/4.jpg', rating: 4.7, reviewCount: 90, reviews: sampleReviews.general, description: 'Slender stackable bangle for everyday luxury styling.' },
    { id: 'bangle5', name: 'Broad Textured Bangle', purity: '91.6%', weight: 20.00, image: '/photos/bangles/5.jpg', rating: 5.0, reviewCount: 205, reviews: sampleReviews.general, description: 'Wide statement bangle with hammered gold texture.' },
    { id: 'bangle6', name: 'Open Cuff Bangle', purity: '75%', weight: 10.00, image: '/photos/bangles/6.jpg', rating: 4.8, reviewCount: 102, reviews: sampleReviews.general, description: 'Flexible open wrist cuff with ball endcaps.' },
    { id: 'bangle7', name: 'Filigree Art Bangle', purity: '91.6%', weight: 15.00, image: '/photos/bangles/7.jpg', rating: 4.9, reviewCount: 135, reviews: sampleReviews.general, description: 'Intricate openwork lace motifs crafted in pure gold.' },
    { id: 'bangle8', name: 'Meenakari Enamel Bangle', purity: '75%', weight: 11.00, image: '/photos/bangles/8.jpg', rating: 4.7, reviewCount: 81, reviews: sampleReviews.general, description: 'Vibrant handcrafted enamel work combined with gold.' },
  ],
  bracelets: [
    { id: 'bracelet1', name: 'Luxury Tennis Bracelet', purity: '91.6%', weight: 6.00, image: '/photos/bracelete/1.jpg', rating: 4.9, reviewCount: 172, reviews: sampleReviews.general, description: 'Continuous line of brilliant diamonds in 22K gold settings.' },
    { id: 'bracelet2', name: 'Golden Charm Bracelet', purity: '75%', weight: 5.00, image: '/photos/bracelete/2.jpg', rating: 4.8, reviewCount: 114, reviews: sampleReviews.general, description: 'Polished link chain adorned with symbolic gold charms.' },
    { id: 'bracelet3', name: 'Gold Chain Link Bracelet', purity: '91.6%', weight: 7.00, image: '/photos/bracelete/3.jpg', rating: 4.7, reviewCount: 98, reviews: sampleReviews.general, description: 'Bold interlocking links with luxury lobster clasp.' },
    { id: 'bracelet4', name: 'Infinity Bangle Bracelet', purity: '75%', weight: 8.00, image: '/photos/bracelete/4.jpg', rating: 4.8, reviewCount: 126, reviews: sampleReviews.general, description: 'Infinity symbol centerpiece with sparkling pave stones.' },
    { id: 'bracelet5', name: 'Sleek Cuff Bracelet', purity: '91.6%', weight: 9.00, image: '/photos/bracelete/5.jpg', rating: 4.9, reviewCount: 140, reviews: sampleReviews.general, description: 'Structured metallic cuff tailored for elegant wrists.' },
    { id: 'bracelet6', name: 'Cuban Link Bracelet', purity: '75%', weight: 6.50, image: '/photos/bracelete/6.jpg', rating: 4.7, reviewCount: 88, reviews: sampleReviews.general, description: 'Classic Cuban links with high gloss polish.' },
    { id: 'bracelet7', name: 'Beaded Gold Bracelet', purity: '91.6%', weight: 5.50, image: '/photos/bracelete/7.jpg', rating: 4.8, reviewCount: 95, reviews: sampleReviews.general, description: 'Strung golden spheres with adjustable extension chain.' },
    { id: 'bracelet8', name: 'Woven Mesh Bracelet', purity: '75%', weight: 4.00, image: '/photos/bracelete/8.jpg', rating: 4.6, reviewCount: 68, reviews: sampleReviews.general, description: 'Supple woven gold mesh strap.' },
  ],
  kada: [
    { id: 'kada1', name: 'Classic Sovereign Kada', purity: '91.6%', weight: 20.00, image: '/photos/kada/1.jpg', rating: 5.0, reviewCount: 230, reviews: sampleReviews.general, description: 'Heavyweight traditional 22K gold Kada with smooth rounded profile.' },
    { id: 'kada2', name: 'Diamond Embossed Kada', purity: '75%', weight: 18.00, image: '/photos/kada/2.jpg', rating: 4.8, reviewCount: 142, reviews: sampleReviews.general, description: 'Contemporary Kada featuring solitaire diamond highlights.' },
    { id: 'kada3', name: "Men's Imperial Kada", purity: '91.6%', weight: 25.00, image: '/photos/kada/3.jpg', rating: 4.9, reviewCount: 260, reviews: sampleReviews.general, description: 'Masculine solid gold Kada designed for strength and elegance.' },
    { id: 'kada4', name: 'Slim Everyday Kada', purity: '75%', weight: 12.00, image: '/photos/kada/4.jpg', rating: 4.7, reviewCount: 104, reviews: sampleReviews.general, description: 'Lightweight Kada suitable for daily wear.' },
    { id: 'kada5', name: 'Antique Temple Kada', purity: '91.6%', weight: 22.00, image: '/photos/kada/5.jpg', rating: 4.9, reviewCount: 185, reviews: sampleReviews.general, description: 'Intricately carved temple motifs with matte antique finish.' },
    { id: 'kada6', name: 'Lion Head Kada', purity: '75%', weight: 16.00, image: '/photos/kada/6.jpg', rating: 4.8, reviewCount: 130, reviews: sampleReviews.general, description: 'Regal lion terminal heads sculpted at the open ends.' },
    { id: 'kada7', name: 'Filigree Carved Kada', purity: '91.6%', weight: 19.00, image: '/photos/kada/7.jpg', rating: 4.8, reviewCount: 115, reviews: sampleReviews.general, description: 'Handicrafted filigree work wrapping around the perimeter.' },
    { id: 'kada8', name: 'Heavy Armor Kada', purity: '75%', weight: 28.00, image: '/photos/kada/8.jpg', rating: 5.0, reviewCount: 290, reviews: sampleReviews.general, description: 'Extra thick solid gold Kada for grand statement styling.' },
  ],
  men: [
    { id: 'men1', name: "Men's Heavy Gold Chain", purity: '91.6%', weight: 15.00, image: '/photos/men/1.jpg', rating: 5.0, reviewCount: 275, reviews: sampleReviews.general, description: 'Solid 22K gold chain for men with thick box clasp.' },
    { id: 'men2', name: "Men's Diamond Signet Ring", purity: '75%', weight: 8.00, image: '/photos/men/2.jpg', rating: 4.8, reviewCount: 150, reviews: sampleReviews.general, description: 'Square flat-top signet ring studded with black & white diamonds.' },
    { id: 'men3', name: "Men's Cuban Link Bracelet", purity: '91.6%', weight: 12.00, image: '/photos/men/3.jpg', rating: 4.9, reviewCount: 190, reviews: sampleReviews.general, description: 'Wide Cuban link wristband for men.' },
    { id: 'men4', name: "Men's Sovereign Kada", purity: '75%', weight: 20.00, image: '/photos/men/4.jpg', rating: 4.9, reviewCount: 210, reviews: sampleReviews.general, description: 'Robust solid gold Kada crafted for masculine hands.' },
    { id: 'men5', name: "Men's Shield Pendant", purity: '91.6%', weight: 6.00, image: '/photos/men/5.jpg', rating: 4.7, reviewCount: 96, reviews: sampleReviews.general, description: 'Geometric shield pendant in brushed gold.' },
    { id: 'men6', name: "Men's Gold Cufflinks", purity: '75%', weight: 5.00, image: '/photos/men/6.jpg', rating: 4.8, reviewCount: 82, reviews: sampleReviews.general, description: 'Luxury suit shirt cufflinks with onyx stone inlay.' },
    { id: 'men7', name: "Men's Dog Tag Pendant", purity: '91.6%', weight: 10.00, image: '/photos/men/7.jpg', rating: 4.8, reviewCount: 125, reviews: sampleReviews.general, description: 'Sleek military-inspired dog tag crafted in 22K gold.' },
    { id: 'men8', name: "Men's ID Bar Bracelet", purity: '75%', weight: 14.00, image: '/photos/men/8.jpg', rating: 4.7, reviewCount: 108, reviews: sampleReviews.general, description: 'Customizable gold ID plaque attached to a heavy chain.' },
  ],
  kids: [
    { id: 'kids1', name: 'Kids Gold Bangle Pair', purity: '91.6%', weight: 5.00, image: '/photos/kids/1.jpg', rating: 4.9, reviewCount: 130, reviews: sampleReviews.general, description: 'Smooth rounded non-scratching gold bangles for children.' },
    { id: 'kids2', name: 'Kids Little Star Ring', purity: '75%', weight: 1.50, image: '/photos/kids/2.jpg', rating: 4.8, reviewCount: 84, reviews: sampleReviews.general, description: 'Cute star motif ring with adjustable size band.' },
    { id: 'kids3', name: 'Kids Angel Pendant Necklace', purity: '91.6%', weight: 4.00, image: '/photos/kids/3.jpg', rating: 4.9, reviewCount: 110, reviews: sampleReviews.general, description: 'Charming angel motif necklace in pure gold.' },
    { id: 'kids4', name: 'Kids Screw-Back Earrings', purity: '75%', weight: 1.20, image: '/photos/kids/4.jpg', rating: 4.9, reviewCount: 155, reviews: sampleReviews.general, description: 'Safety screw-back studs designed specifically for young ears.' },
    { id: 'kids5', name: 'Kids Nazariya Anklet', purity: '91.6%', weight: 3.00, image: '/photos/kids/5.jpg', rating: 5.0, reviewCount: 210, reviews: sampleReviews.general, description: 'Protective black bead and gold Nazariya anklet.' },
    { id: 'kids6', name: 'Kids Charm Bracelet', purity: '75%', weight: 2.50, image: '/photos/kids/6.jpg', rating: 4.7, reviewCount: 78, reviews: sampleReviews.general, description: 'Delicate bracelet with miniature teddy bear charm.' },
    { id: 'kids7', name: 'Kids Ganesh Pendant', purity: '91.6%', weight: 2.00, image: '/photos/kids/7.jpg', rating: 4.9, reviewCount: 140, reviews: sampleReviews.general, description: 'Blessed Lord Ganesha charm in 22K gold.' },
    { id: 'kids8', name: 'Kids Light Chain', purity: '75%', weight: 3.50, image: '/photos/kids/8.jpg', rating: 4.8, reviewCount: 92, reviews: sampleReviews.general, description: 'Soft flexible gold neck chain for children.' },
  ],
  coin: [
    { id: 'coin1', name: '1g 24K Pure Gold Coin', purity: '91.6%', weight: 1.00, image: '/photos/product11.jpg', rating: 5.0, reviewCount: 310, reviews: sampleReviews.coin, description: '1 Gram 999 24K / 91.6 Hallmark Certified Pure Gold Coin in tamper-proof assay card.' },
    { id: 'coin2', name: '2g 24K Pure Gold Coin', purity: '91.6%', weight: 2.00, image: '/photos/product11.jpg', rating: 4.9, reviewCount: 245, reviews: sampleReviews.coin, description: '2 Gram 999 24K / 91.6 Hallmark Certified Pure Gold Coin with Lakshmi motif engraving.' },
    { id: 'coin3', name: '5g 24K Pure Gold Coin', purity: '91.6%', weight: 5.00, image: '/photos/product11.jpg', rating: 5.0, reviewCount: 420, reviews: sampleReviews.coin, description: '5 Gram BIS Hallmarked 24K / 91.6 Gold bullion coin. Perfect investment item.' },
    { id: 'coin4', name: '8g 24K Pure Gold Coin (1 Sovereign)', purity: '91.6%', weight: 8.00, image: '/photos/product11.jpg', rating: 5.0, reviewCount: 380, reviews: sampleReviews.coin, description: '8 Gram (1 Sovereign / Pavan) Pure Gold Coin with certificate of weight and purity.' },
    { id: 'coin5', name: '10g 24K Pure Gold Coin', purity: '91.6%', weight: 10.00, image: '/photos/product11.jpg', rating: 5.0, reviewCount: 510, reviews: sampleReviews.coin, description: '10 Gram 24K / 91.6 Pure Gold Coin with Swiss assay certificate package.' },
    { id: 'coin6', name: '20g 24K Pure Gold Coin Bar', purity: '91.6%', weight: 20.00, image: '/photos/product11.jpg', rating: 4.9, reviewCount: 195, reviews: sampleReviews.coin, description: '20 Gram Minted Pure Gold Investment Coin.' },
    { id: 'coin7', name: '50g 24K Pure Gold Bullion Bar', purity: '91.6%', weight: 50.00, image: '/photos/product11.jpg', rating: 5.0, reviewCount: 140, reviews: sampleReviews.coin, description: '50 Gram High Purity Gold Bullion for serious investors.' },
    { id: 'coin8', name: '100g 24K Pure Gold Bullion Bar', purity: '91.6%', weight: 100.00, image: '/photos/product11.jpg', rating: 5.0, reviewCount: 98, reviews: sampleReviews.coin, description: '100 Gram Master Bullion Bar with individual serial number registration.' },
  ],
  anklet: [
    { id: 'anklet1', name: 'Sterling Silver Payal', purity: '75%', weight: 4.00, image: '/photos/anklets/1.jpg', rating: 4.8, reviewCount: 110, reviews: sampleReviews.general, description: 'Traditional silver anklet with melodious bell charms.' },
    { id: 'anklet2', name: 'Luxury Gold Anklet', purity: '91.6%', weight: 5.00, image: '/photos/anklets/2.jpg', rating: 4.9, reviewCount: 145, reviews: sampleReviews.general, description: 'Delicate 22K gold anklet with diamond-cut beads.' },
    { id: 'anklet3', name: 'Beaded Charm Anklet', purity: '75%', weight: 3.50, image: '/photos/anklets/3.jpg', rating: 4.7, reviewCount: 88, reviews: sampleReviews.general, description: 'Layered bead chain anklet with spring clasp.' },
    { id: 'anklet4', name: 'Dual Chain Anklet', purity: '91.6%', weight: 4.50, image: '/photos/anklets/4.jpg', rating: 4.8, reviewCount: 102, reviews: sampleReviews.general, description: 'Sleek double strand anklet in pure gold.' },
    { id: 'anklet5', name: 'Starlet Charm Anklet', purity: '75%', weight: 3.00, image: '/photos/anklets/1.jpg', rating: 4.6, reviewCount: 75, reviews: sampleReviews.general, description: 'Star motif anklet suitable for summer footwear.' },
    { id: 'anklet6', name: 'Jhumki Bell Anklet', purity: '91.6%', weight: 6.00, image: '/photos/anklets/2.jpg', rating: 4.9, reviewCount: 132, reviews: sampleReviews.general, description: 'Heavy bridal payal with dangling Jhumki bells.' },
    { id: 'anklet7', name: 'Heritage Payal Anklet', purity: '75%', weight: 5.50, image: '/photos/anklets/3.jpg', rating: 4.8, reviewCount: 95, reviews: sampleReviews.general, description: 'Antique design payal with oxidized gold highlights.' },
    { id: 'anklet8', name: 'Minimalist Thread Anklet', purity: '91.6%', weight: 2.80, image: '/photos/anklets/4.jpg', rating: 4.7, reviewCount: 68, reviews: sampleReviews.general, description: 'Feather-light gold anklet for daily wear.' },
  ],
  pendent: [
    { id: 'pendent1', name: 'Solitaire Gold Pendant', purity: '91.6%', weight: 3.50, image: '/photos/pendent/1.jpg', rating: 4.9, reviewCount: 165, reviews: sampleReviews.general, description: '22K gold pendant featuring a central sparkling diamond.' },
    { id: 'pendent2', name: 'Ethereal Diamond Drop Pendant', purity: '75%', weight: 2.80, image: '/photos/pendent/2.jpg', rating: 4.8, reviewCount: 120, reviews: sampleReviews.general, description: 'Tear-drop diamond pendant in 18K white and yellow gold.' },
    { id: 'pendent3', name: 'Temple Gold Pendant', purity: '91.6%', weight: 4.00, image: '/photos/pendent/3.jpg', rating: 4.9, reviewCount: 140, reviews: sampleReviews.general, description: 'Divine goddess motif carved in solid 22K gold.' },
    { id: 'pendent4', name: 'Romantic Heart Pendant', purity: '75%', weight: 2.50, image: '/photos/pendent/4.jpg', rating: 4.7, reviewCount: 108, reviews: sampleReviews.general, description: 'Polished open heart design studded with pave gems.' },
    { id: 'pendent5', name: 'Sacred Om Pendant', purity: '91.6%', weight: 5.00, image: '/photos/pendent/5.jpg', rating: 5.0, reviewCount: 230, reviews: sampleReviews.general, description: 'Auspicious Om symbol in pure hallmarked 22K gold.' },
    { id: 'pendent6', name: 'Floral Bloom Pendant', purity: '75%', weight: 3.20, image: '/photos/pendent/6.jpg', rating: 4.8, reviewCount: 94, reviews: sampleReviews.general, description: 'Multi-petal flower cluster pendant.' },
    { id: 'pendent7', name: 'Ganesh Blessing Pendant', purity: '91.6%', weight: 6.50, image: '/photos/pendent/7.jpg', rating: 5.0, reviewCount: 270, reviews: sampleReviews.general, description: 'Sculpted Lord Ganesha pendant with ruby eye.' },
    { id: 'pendent8', name: 'Star of Wonder Pendant', purity: '75%', weight: 2.00, image: '/photos/pendent/8.jpg', rating: 4.6, reviewCount: 82, reviews: sampleReviews.general, description: 'Eight-pointed celestial star pendant.' },
  ],
  mangalsutra: [
    { id: 'mangalsutra1', name: 'Classic Bridal Mangalsutra', purity: '91.6%', weight: 8.00, image: '/photos/mangalsutra/1.jpg', rating: 5.0, reviewCount: 290, reviews: sampleReviews.general, description: 'Traditional black bead chain with 22K gold dual wati pendant.' },
    { id: 'mangalsutra2', name: 'Modern Short Mangalsutra', purity: '75%', weight: 6.00, image: '/photos/mangalsutra/2.jpg', rating: 4.9, reviewCount: 210, reviews: sampleReviews.general, description: 'Chic short length mangalsutra with diamond bar centerpiece.' },
    { id: 'mangalsutra3', name: 'Solitaire Diamond Mangalsutra', purity: '91.6%', weight: 10.00, image: '/photos/mangalsutra/3.jpg', rating: 4.9, reviewCount: 180, reviews: sampleReviews.general, description: 'Brilliant solitaire diamond set on black bead gold chain.' },
    { id: 'mangalsutra4', name: 'Sleek Tanmaniya', purity: '75%', weight: 4.00, image: '/photos/mangalsutra/4.jpg', rating: 4.8, reviewCount: 135, reviews: sampleReviews.general, description: 'Minimalist tanmaniya designed for office wear.' },
    { id: 'mangalsutra5', name: 'Traditional Wati Mangalsutra', purity: '91.6%', weight: 12.00, image: '/photos/mangalsutra/1.jpg', rating: 5.0, reviewCount: 240, reviews: sampleReviews.general, description: 'Double bowl wati motifs symbolizing harmony.' },
    { id: 'mangalsutra6', name: 'Designer Floral Mangalsutra', purity: '75%', weight: 9.00, image: '/photos/mangalsutra/2.jpg', rating: 4.8, reviewCount: 160, reviews: sampleReviews.general, description: 'Floral diamond centerpiece on flexible bead chain.' },
    { id: 'mangalsutra7', name: 'Royal Long Mangalsutra', purity: '91.6%', weight: 14.00, image: '/photos/mangalsutra/3.jpg', rating: 4.9, reviewCount: 205, reviews: sampleReviews.general, description: 'Long double-strand chain with grand pendant.' },
    { id: 'mangalsutra8', name: 'Lightweight Daily Mangalsutra', purity: '75%', weight: 5.00, image: '/photos/mangalsutra/4.jpg', rating: 4.7, reviewCount: 118, reviews: sampleReviews.general, description: 'Comfortable daily wear gold mangalsutra.' },
  ],
  nosepin: [
    { id: 'nosepin1', name: 'Solitaire Diamond Nosepin', purity: '91.6%', weight: 0.50, image: '/photos/nose/1.jpg', rating: 4.9, reviewCount: 320, reviews: sampleReviews.general, description: 'Single high-clarity diamond in 22K gold screw setting.' },
    { id: 'nosepin2', name: 'Floral Cluster Nosepin', purity: '75%', weight: 0.80, image: '/photos/nose/2.jpg', rating: 4.8, reviewCount: 195, reviews: sampleReviews.general, description: 'Seven-diamond floral cluster nose pin.' },
    { id: 'nosepin3', name: 'Twist Wire Nosepin', purity: '91.6%', weight: 0.60, image: '/photos/nose/3.jpg', rating: 4.7, reviewCount: 140, reviews: sampleReviews.general, description: 'Handcrafted twisted gold wire stud.' },
    { id: 'nosepin4', name: 'Classic Gold Ring Nosepin', purity: '75%', weight: 0.70, image: '/photos/nose/4.jpg', rating: 4.8, reviewCount: 210, reviews: sampleReviews.general, description: 'Seamless gold wire hoop for nose piercing.' },
    { id: 'nosepin5', name: 'Lustrous Pearl Nosepin', purity: '91.6%', weight: 0.55, image: '/photos/nose/1.jpg', rating: 4.6, reviewCount: 98, reviews: sampleReviews.general, description: 'Tiny seed pearl set on gold stud.' },
    { id: 'nosepin6', name: 'Minimalist Diamond Stud', purity: '75%', weight: 0.45, image: '/photos/nose/2.jpg', rating: 4.8, reviewCount: 165, reviews: sampleReviews.general, description: 'Subtle diamond accent nose pin.' },
    { id: 'nosepin7', name: 'Nath Ring Nosepin', purity: '91.6%', weight: 0.75, image: '/photos/nose/3.jpg', rating: 4.9, reviewCount: 180, reviews: sampleReviews.general, description: 'Bridal nath ring with gold drop bead.' },
    { id: 'nosepin8', name: 'Antique Carved Nosepin', purity: '75%', weight: 0.65, image: '/photos/nose/4.jpg', rating: 4.7, reviewCount: 112, reviews: sampleReviews.general, description: 'Matte antique finished gold stud.' },
  ],
  hair: [
    { id: 'hair1', name: 'Gold Filigree Hair Pin', purity: '75%', weight: 3.00, image: '/photos/hair/1.jpg', rating: 4.8, reviewCount: 95, reviews: sampleReviews.general, description: 'Luxury hair hairpin crafted with 18K gold lace details.' },
    { id: 'hair2', name: 'Jeweled Hair Comb', purity: '91.6%', weight: 5.00, image: '/photos/hair/2.jpg', rating: 4.9, reviewCount: 124, reviews: sampleReviews.general, description: 'Bridal hair comb adorned with gold leaves and stones.' },
    { id: 'hair3', name: 'Royal Maang Tikka', purity: '75%', weight: 4.50, image: '/photos/hair/3.jpg', rating: 5.0, reviewCount: 215, reviews: sampleReviews.general, description: 'Traditional Maang Tikka with ruby drop and gold chain.' },
    { id: 'hair4', name: 'Juda Hair Pin Set', purity: '91.6%', weight: 6.00, image: '/photos/hair/4.jpg', rating: 4.8, reviewCount: 110, reviews: sampleReviews.general, description: 'Set of hair pins for decorative bun styling.' },
    { id: 'hair5', name: 'Gold Leaf Hair Band', purity: '75%', weight: 3.50, image: '/photos/hair/1.jpg', rating: 4.7, reviewCount: 88, reviews: sampleReviews.general, description: 'Flexible hair headband decorated with gold laurel leaves.' },
    { id: 'hair6', name: 'Grand Matha Patti', purity: '91.6%', weight: 8.00, image: '/photos/hair/2.jpg', rating: 5.0, reviewCount: 260, reviews: sampleReviews.general, description: 'Dual-line bridal Matha Patti forehead jewelry.' },
    { id: 'hair7', name: 'Side Passa Hair Piece', purity: '75%', weight: 7.00, image: '/photos/hair/3.jpg', rating: 4.9, reviewCount: 175, reviews: sampleReviews.general, description: 'Nawab style side Passa for festive hair arrangements.' },
    { id: 'hair8', name: 'Gold Seenthhi Hair Pin', purity: '91.6%', weight: 5.50, image: '/photos/hair/4.jpg', rating: 4.8, reviewCount: 104, reviews: sampleReviews.general, description: 'Center parting hair accessory in pure gold.' },
  ],
  watch: [
    { id: 'watch1', name: 'Royal Gold Watch', purity: '91.6%', weight: 25.00, image: '/photos/watch/1.jpg', rating: 5.0, reviewCount: 198, reviews: sampleReviews.general, description: 'Solid 22K gold bracelet timepiece with Swiss movement.' },
    { id: 'watch2', name: 'Diamond Bezel Luxury Watch', purity: '75%', weight: 30.00, image: '/photos/watch/2.jpg', rating: 4.9, reviewCount: 160, reviews: sampleReviews.general, description: '18K gold watch featuring a bezel set with 36 brilliant diamonds.' },
    { id: 'watch3', name: "Ladies' Petite Gold Watch", purity: '91.6%', weight: 20.00, image: '/photos/watch/3.jpg', rating: 4.9, reviewCount: 210, reviews: sampleReviews.general, description: 'Slender gold watch with mother of pearl dial.' },
    { id: 'watch4', name: "Men's Imperial Gold Watch", purity: '75%', weight: 35.00, image: '/photos/watch/4.jpg', rating: 5.0, reviewCount: 240, reviews: sampleReviews.general, description: 'Heavy gold men\'s wrist watch with sapphire crystal.' },
    { id: 'watch5', name: 'Vintage Gold Pocket Watch', purity: '91.6%', weight: 28.00, image: '/photos/watch/5.jpg', rating: 4.8, reviewCount: 115, reviews: sampleReviews.general, description: 'Classic mechanical skeleton pocket watch.' },
    { id: 'watch6', name: 'Gold Smart Watch Band', purity: '75%', weight: 22.00, image: '/photos/watch/6.jpg', rating: 4.7, reviewCount: 92, reviews: sampleReviews.general, description: 'Luxury gold link band compatible with smart watches.' },
    { id: 'watch7', name: 'Sports Chronograph Gold Watch', purity: '91.6%', weight: 32.00, image: '/photos/watch/7.jpg', rating: 4.9, reviewCount: 178, reviews: sampleReviews.general, description: 'Water-resistant gold chronograph watch.' },
    { id: 'watch8', name: 'Automatic Skeleton Gold Watch', purity: '75%', weight: 40.00, image: '/photos/watch/8.jpg', rating: 5.0, reviewCount: 225, reviews: sampleReviews.general, description: 'Transparent dial revealing intricate gold movement gears.' },
  ],
};

const mongoose = require('mongoose');
const productsFilePath = path.join(__dirname, '../data/products.json');

try {
  if (fs.existsSync(productsFilePath)) {
    const raw = fs.readFileSync(productsFilePath, 'utf8');
    const customCatalog = JSON.parse(raw);
    Object.keys(customCatalog).forEach(cat => {
      productCatalog[cat] = customCatalog[cat];
    });
  }
} catch (e) {
  console.error('File load products warning:', e);
}

const saveProductsToFile = () => {
  try {
    if (!fs.existsSync(path.join(__dirname, '../data'))) {
      fs.mkdirSync(path.join(__dirname, '../data'), { recursive: true });
    }
    fs.writeFileSync(productsFilePath, JSON.stringify(productCatalog, null, 2));
  } catch (e) {
    console.error('Save products to file error:', e);
  }
};

// Helper: get Product model safely
const getProductModel = () => {
  try { return require('../models/Product'); } catch (e) { return null; }
};

// Helper: convert MongoDB Product doc to plain catalog item
const docToCatalogItem = (doc) => ({
  id: doc.productId,
  name: doc.name,
  category: doc.category,
  purity: doc.purity,
  weight: doc.weight,
  price: doc.price,
  image: doc.image,
  description: doc.description,
  stock: doc.stock,
  makingChargePercent: doc.makingChargePercent || 18,
  rating: doc.rating,
  reviewCount: doc.reviewCount,
  reviews: doc.reviews || [],
});

// Helper to stem search words safely without reducing 'ring' to 'r'
function stemWord(word) {
  const w = word.toLowerCase();
  if (w === 'rings' || w === 'ring') return 'ring';
  if (w === 'earrings' || w === 'earring') return 'earring';
  if (w === 'coins' || w === 'coin') return 'coin';
  if (w.endsWith('es') && w.length > 4) return w.slice(0, -2);
  if (w.endsWith('s') && w.length > 3 && !w.endsWith('ss')) return w.slice(0, -1);
  return w;
}

// GET /api/products/search?q=... — Smart Fuzzy Search across all categories
router.get('/search', (req, res) => {
  const rawQuery = (req.query.q || '').toLowerCase().trim();
  if (!rawQuery) {
    return res.json([]);
  }

  // Tokenize & stem query
  const rawTokens = rawQuery.split(/\s+/).filter(Boolean);
  const stemmedTokens = rawTokens.map(stemWord).filter(w => w.length >= 2);

  const synonyms = {
    rings: ['ring', 'rings', 'solitaire', 'band'],
    necklace: ['necklace', 'necklaces', 'choker', 'tanmaniya', 'pendant'],
    earrings: ['earring', 'earrings', 'jhumka', 'stud', 'hoop', 'drop'],
    chain: ['chain', 'chains', 'link', 'cuban', 'rope'],
    bangles: ['bangle', 'bangles', 'kada', 'cuff'],
    bracelets: ['bracelet', 'bracelets', 'tennis', 'charm'],
    kada: ['kada', 'kadas', 'sovereign'],
    coin: ['coin', 'coins', 'bullion', 'bar', 'gold coin', '24k'],
    anklet: ['anklet', 'anklets', 'payal', 'nazariya'],
    pendent: ['pendant', 'pendants', 'pendent', 'charm', 'locket'],
    mangalsutra: ['mangalsutra', 'mangalsutras', 'wati', 'tanmaniya'],
    nosepin: ['nosepin', 'nose', 'nath', 'stud'],
    hair: ['hair', 'tikka', 'patti', 'passa', 'juda', 'comb'],
    watch: ['watch', 'watches', 'chronograph', 'timepiece'],
    men: ['men', 'mens', 'man', 'male'],
    kids: ['kids', 'kid', 'children', 'child', 'baby'],
  };

  // 1. Determine target categories matched by query tokens
  const targetCategories = new Set();
  stemmedTokens.forEach(token => {
    Object.keys(synonyms).forEach(catKey => {
      const synList = synonyms[catKey];
      if (synList.some(syn => syn === token || syn.startsWith(token) || token.startsWith(syn))) {
        targetCategories.add(catKey);
      }
    });
  });

  const resultsMap = new Map();

  // 2. Filter products
  Object.keys(productCatalog).forEach(categoryKey => {
    const list = productCatalog[categoryKey];
    const isTargetCat = targetCategories.has(categoryKey);

    list.forEach(prod => {
      const prodName = prod.name.toLowerCase();
      const prodDesc = (prod.description || '').toLowerCase();
      const prodPurity = (prod.purity || '').toLowerCase();

      let matched = false;

      // Direct match if query token appears as a word in name, purity, desc, or category
      for (const token of stemmedTokens) {
        const wordRegex = new RegExp('\\b' + token + '\\b', 'i');
        if (wordRegex.test(prodName) || wordRegex.test(prodPurity) || wordRegex.test(prodDesc) || wordRegex.test(categoryKey)) {
          matched = true;
          break;
        }
      }

      // Match if product belongs to targeted category
      if (!matched && isTargetCat) {
        matched = true;
      }

      if (matched && !resultsMap.has(prod.id)) {
        resultsMap.set(prod.id, { ...prod, category: categoryKey });
      }
    });
  });

  res.json(Array.from(resultsMap.values()));
});

// POST /api/products/upload-image — Admin Image Upload
router.post('/upload-image', (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ message: 'No image data provided' });
    }
    return res.json({ imageUrl: imageBase64 });
  } catch (error) {
    res.status(500).json({ message: 'Image upload failed' });
  }
});

// GET /api/products/inventory/all — Get all inventory for Admin Dashboard
router.get('/inventory/all', async (req, res) => {
  const Product = getProductModel();
  if (Product && mongoose.connection.readyState === 1) {
    try {
      const docs = await Product.find({}).lean();
      return res.json(docs.map(docToCatalogItem));
    } catch (e) { /* fallback */ }
  }
  // File/memory fallback
  const allProducts = [];
  Object.keys(productCatalog).forEach(cat => {
    productCatalog[cat].forEach(p => {
      allProducts.push({ ...p, category: cat, stock: p.stock !== undefined ? p.stock : 12 });
    });
  });
  res.json(allProducts);
});

// POST /api/products/inventory/add — Admin Add New Product
router.post('/inventory/add', async (req, res) => {
  const { name, category, purity, weight, price, image, description, stock } = req.body;
  if (!name || !category) {
    return res.status(400).json({ message: 'Name and category are required' });
  }
  const catKey = category.toLowerCase();
  const newId = `${catKey}_${Date.now()}`;
  const newProdData = {
    id: newId, name,
    purity: purity || '91.6%',
    weight: parseFloat(weight) || 5.0,
    price: price || '₹45,000',
    image: image || '/photos/product1.jpg',
    rating: 5.0, reviewCount: 0,
    description: description || 'Royal handcrafted Jewel Street creation.',
    stock: parseInt(stock) || 10,
    reviews: []
  };

  // Save to MongoDB
  const Product = getProductModel();
  if (Product && mongoose.connection.readyState === 1) {
    try {
      const doc = await Product.create({
        productId: newId, name, category: catKey,
        purity: newProdData.purity, weight: newProdData.weight,
        price: newProdData.price, image: newProdData.image,
        description: newProdData.description, stock: newProdData.stock,
        rating: 5.0, reviewCount: 0, reviews: []
      });
      // Also update in-memory cache
      if (!productCatalog[catKey]) productCatalog[catKey] = [];
      productCatalog[catKey].unshift(newProdData);
      saveProductsToFile();
      return res.status(201).json({ message: 'Product created successfully', product: docToCatalogItem(doc) });
    } catch (e) {
      console.error('MongoDB product create error:', e.message);
    }
  }

  // File/memory fallback
  if (!productCatalog[catKey]) productCatalog[catKey] = [];
  productCatalog[catKey].unshift(newProdData);
  saveProductsToFile();
  res.status(201).json({ message: 'Product created successfully', product: { ...newProdData, category: catKey } });
});

// PUT /api/products/inventory/:id — Admin Update Product
router.put('/inventory/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Update in MongoDB
  const Product = getProductModel();
  if (Product && mongoose.connection.readyState === 1) {
    try {
      const dbUpdates = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.purity) dbUpdates.purity = updates.purity;
      if (updates.weight !== undefined) dbUpdates.weight = parseFloat(updates.weight) || 0;
      if (updates.price) dbUpdates.price = updates.price;
      if (updates.image) dbUpdates.image = updates.image;
      if (updates.description) dbUpdates.description = updates.description;
      if (updates.stock !== undefined) dbUpdates.stock = parseInt(updates.stock) || 0;
      if (updates.category) dbUpdates.category = updates.category.toLowerCase();

      const doc = await Product.findOneAndUpdate(
        { productId: id }, { $set: dbUpdates }, { new: true }
      );
      if (doc) {
        // Sync to in-memory + file
        Object.keys(productCatalog).forEach(cat => {
          const idx = productCatalog[cat].findIndex(p => p.id === id);
          if (idx !== -1) productCatalog[cat][idx] = { ...productCatalog[cat][idx], ...updates };
        });
        saveProductsToFile();
        return res.json({ message: 'Product updated successfully', product: docToCatalogItem(doc) });
      }
    } catch (e) {
      console.error('MongoDB product update error:', e.message);
    }
  }

  // File/memory fallback
  let found = false, updatedProd = null;
  Object.keys(productCatalog).forEach(cat => {
    const idx = productCatalog[cat].findIndex(p => p.id === id);
    if (idx !== -1) {
      productCatalog[cat][idx] = { ...productCatalog[cat][idx], ...updates };
      found = true;
      updatedProd = { ...productCatalog[cat][idx], category: cat };
    }
  });
  if (!found) return res.status(404).json({ message: 'Product not found' });
  saveProductsToFile();
  res.json({ message: 'Product updated successfully', product: updatedProd });
});

// DELETE /api/products/inventory/:id — Admin Delete Product
router.delete('/inventory/:id', async (req, res) => {
  const { id } = req.params;

  // Delete from MongoDB
  const Product = getProductModel();
  if (Product && mongoose.connection.readyState === 1) {
    try {
      await Product.findOneAndDelete({ productId: id });
    } catch (e) { /* fallback */ }
  }

  // Delete from in-memory + file
  let deleted = false;
  Object.keys(productCatalog).forEach(cat => {
    const idx = productCatalog[cat].findIndex(p => p.id === id);
    if (idx !== -1) { productCatalog[cat].splice(idx, 1); deleted = true; }
  });
  if (!deleted && !(Product && mongoose.connection.readyState === 1)) {
    return res.status(404).json({ message: 'Product not found' });
  }
  saveProductsToFile();
  res.json({ message: 'Product removed from inventory', id });
});

// GET /api/products/:category
router.get('/:category', async (req, res) => {
  const category = req.params.category.toLowerCase();

  if (category === 'search') {
    const rawQuery = (req.query.q || '').toLowerCase().trim();
    if (!rawQuery) return res.json([]);
    const resultsMap = new Map();
    const queryWord = rawQuery.replace(/(es|s)$/, '');
    Object.keys(productCatalog).forEach(catKey => {
      productCatalog[catKey].forEach(prod => {
        if (
          prod.name.toLowerCase().includes(rawQuery) ||
          prod.name.toLowerCase().includes(queryWord) ||
          catKey.toLowerCase().includes(rawQuery) ||
          catKey.toLowerCase().includes(queryWord)
        ) {
          resultsMap.set(prod.id, { ...prod, category: catKey });
        }
      });
    });
    return res.json(Array.from(resultsMap.values()));
  }

  // Try MongoDB first
  const Product = getProductModel();
  if (Product && mongoose.connection.readyState === 1) {
    try {
      const docs = await Product.find({ category }).lean();
      if (docs.length > 0) return res.json(docs.map(docToCatalogItem));
    } catch (e) { /* fallback */ }
  }

  // In-memory fallback
  const products = productCatalog[category];
  if (!products) return res.status(404).json({ message: `Category '${category}' not found` });
  res.json(products.map(p => ({ ...p, category })));
});

// GET /api/products/reports/inventory — Inventory report summary
router.get('/reports/inventory', (req, res) => {
  const report = [];
  let totalItems = 0;
  let totalValue = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;
  const categoryStats = {};

  Object.keys(productCatalog).forEach(cat => {
    const items = productCatalog[cat];
    let catValue = 0;
    let catCount = 0;
    items.forEach(p => {
      const stock = p.stock !== undefined ? p.stock : 12;
      const priceNum = parseInt((p.price || '₹45000').replace(/[^\d]/g, '')) || 45000;
      const itemValue = priceNum * stock;
      totalItems += stock;
      totalValue += itemValue;
      catValue += itemValue;
      catCount += stock;
      if (stock === 0) outOfStockCount++;
      else if (stock <= 5) lowStockCount++;
      report.push({
        id: p.id,
        name: p.name,
        category: cat,
        purity: p.purity,
        weight: p.weight,
        price: p.price,
        stock,
        stockValue: itemValue,
        status: stock === 0 ? 'Out of Stock' : stock <= 5 ? 'Low Stock' : 'In Stock'
      });
    });
    categoryStats[cat] = { count: catCount, value: catValue, products: items.length };
  });

  res.json({
    summary: {
      totalProducts: report.length,
      totalStockUnits: totalItems,
      totalInventoryValue: totalValue,
      lowStockItems: lowStockCount,
      outOfStockItems: outOfStockCount,
    },
    categoryStats,
    items: report
  });
});

// GET /api/products/reports/sales — Sales analytics from orders
router.get('/reports/sales', (req, res) => {
  // This endpoint reads from the orders file
  const ordersPath = require('path').join(__dirname, '../data/orders.json');
  let orders = [];
  try {
    if (require('fs').existsSync(ordersPath)) {
      orders = JSON.parse(require('fs').readFileSync(ordersPath, 'utf8'));
    }
  } catch (e) {}

  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Monthly breakdown
  const monthlyMap = {};
  orders.forEach(o => {
    const d = new Date(o.createdAt || Date.now());
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlyMap[key]) monthlyMap[key] = { month: key, orders: 0, revenue: 0 };
    monthlyMap[key].orders++;
    monthlyMap[key].revenue += o.totalAmount || 0;
  });
  const monthly = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));

  // Status breakdown
  const statusMap = {};
  orders.forEach(o => {
    const s = o.status || 'Processing';
    if (!statusMap[s]) statusMap[s] = 0;
    statusMap[s]++;
  });

  // Top selling items (from cart items in orders)
  const itemSalesMap = {};
  orders.forEach(o => {
    (o.items || []).forEach(it => {
      const name = it.name || 'Unknown';
      if (!itemSalesMap[name]) itemSalesMap[name] = { name, qty: 0, revenue: 0 };
      itemSalesMap[name].qty++;
      const price = parseInt((it.price || '₹0').replace(/[^\d]/g, '')) || 0;
      itemSalesMap[name].revenue += price;
    });
  });
  const topItems = Object.values(itemSalesMap).sort((a, b) => b.qty - a.qty).slice(0, 10);

  res.json({
    summary: { totalRevenue, totalOrders, avgOrderValue },
    monthly,
    statusBreakdown: statusMap,
    topItems,
    recentOrders: orders.slice(0, 5)
  });
});

// POST /api/products/inventory/update-making-charges — Bulk update making charges for all, category, or selected products
router.post('/inventory/update-making-charges', async (req, res) => {
  try {
    const { scope = 'all', categoryKey = 'all', productIds = [], makingChargePercent = 18 } = req.body;
    const percentNum = parseFloat(makingChargePercent) || 18;

    // Get today's cached gold rate or fallback
    let baseRate = 7500;
    try {
      if (fs.existsSync(dailyRateFilePath)) {
        const cachedRaw = fs.readFileSync(dailyRateFilePath, 'utf8');
        const cachedData = JSON.parse(cachedRaw);
        if (cachedData && cachedData.goldRatePerGramINR) {
          baseRate = cachedData.goldRatePerGramINR;
        }
      }
    } catch (e) {}

    const Product = getProductModel();
    let updatedCount = 0;

    // Process in-memory catalog objects
    Object.keys(productCatalog).forEach(cat => {
      if (scope === 'category' && cat.toLowerCase() !== categoryKey.toLowerCase()) {
        return;
      }

      productCatalog[cat].forEach(p => {
        if (scope === 'selected' && !productIds.includes(p.id)) {
          return;
        }

        const weight = p.weight || 5.0;
        const purityFactor = p.purity?.includes('91.6') ? 0.916 : (p.purity?.includes('75') ? 0.75 : 1.0);
        const goldPrice = baseRate * weight * purityFactor;
        const makingCharges = goldPrice * (percentNum / 100);
        const gst = (goldPrice + makingCharges) * 0.03;
        const newPriceVal = Math.round(goldPrice + makingCharges + gst);

        p.makingChargePercent = percentNum;
        p.price = `₹${newPriceVal.toLocaleString('en-IN')}`;
        updatedCount++;
      });
    });

    // Save updated catalog to file store
    saveProductsToFile();

    // Update in MongoDB database if connected
    if (Product && mongoose.connection.readyState === 1) {
      try {
        const query = {};
        if (scope === 'category') query.category = categoryKey.toLowerCase();
        else if (scope === 'selected') query.productId = { $in: productIds };

        const docs = await Product.find(query);
        for (const doc of docs) {
          const weight = doc.weight || 5.0;
          const purityFactor = doc.purity?.includes('91.6') ? 0.916 : (doc.purity?.includes('75') ? 0.75 : 1.0);
          const goldPrice = baseRate * weight * purityFactor;
          const makingCharges = goldPrice * (percentNum / 100);
          const gst = (goldPrice + makingCharges) * 0.03;
          const newPriceVal = Math.round(goldPrice + makingCharges + gst);

          doc.makingChargePercent = percentNum;
          doc.price = `₹${newPriceVal.toLocaleString('en-IN')}`;
          await doc.save();
        }
      } catch (e) {
        console.error('MongoDB bulk making charges update error:', e.message);
      }
    }

    const scopeText = scope === 'all' ? 'All Products in Store' : (scope === 'category' ? `Category "${categoryKey}"` : `${updatedCount} Selected Product(s)`);

    return res.json({
      message: `Successfully set Making Charges to ${percentNum}% for ${scopeText}!`,
      updatedCount,
      makingChargePercent: percentNum
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
