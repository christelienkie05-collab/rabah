// backend/src/routes/products.js
const router = require('express').Router();
const prisma = require('../lib/prisma');
const { requireAdmin } = require('../middleware/auth');
const { calculatePrice, getMarginSummary } = require('../pricing/engine');

// GET /api/products
router.get('/', async (req, res) => {
  const { category, inStock } = req.query;
  const where = {};
  if (category) where.category = category.toUpperCase();
  if (inStock === 'true') where.inStock = true;

  const products = await prisma.product.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
  res.json(products);
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  const product = await prisma.product.findUnique({ where: { id: req.params.id } });
  if (!product) return res.status(404).json({ error: 'Produit introuvable' });
  res.json(product);
});

// POST /api/products — admin only
router.post('/', requireAdmin, async (req, res) => {
  const { name, brand, category, sourcePrice, thomannRef, affiliateUrl, imageUrl, description } = req.body;
  if (!name || !category || !sourcePrice) {
    return res.status(400).json({ error: 'name, category et sourcePrice requis' });
  }

  const pricing = calculatePrice(parseFloat(sourcePrice), category.toUpperCase());

  const product = await prisma.product.create({
    data: {
      name,
      brand,
      category: category.toUpperCase(),
      sourcePrice: pricing.sourcePrice,
      ourPrice: pricing.ourPrice,
      marginRate: pricing.marginAbsolute / pricing.ourPrice,
      thomannRef,
      affiliateUrl,
      imageUrl,
      description,
    },
  });
  res.status(201).json(product);
});

// PATCH /api/products/:id — admin only
router.patch('/:id', requireAdmin, async (req, res) => {
  const { sourcePrice, inStock, ...rest } = req.body;
  const data = { ...rest };

  if (sourcePrice !== undefined) {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });
    const pricing = calculatePrice(parseFloat(sourcePrice), product.category);
    data.sourcePrice = pricing.sourcePrice;
    data.ourPrice = pricing.ourPrice;
    data.marginRate = pricing.marginAbsolute / pricing.ourPrice;
  }
  if (inStock !== undefined) data.inStock = Boolean(inStock);

  const updated = await prisma.product.update({ where: { id: req.params.id }, data });
  res.json(updated);
});

// GET /api/products/admin/margins — récap marges admin
router.get('/admin/margins', requireAdmin, (req, res) => {
  res.json(getMarginSummary());
});

module.exports = router;
