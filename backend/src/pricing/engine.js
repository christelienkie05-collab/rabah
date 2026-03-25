// backend/src/pricing/engine.js
// Marge variable selon la catégorie — logique optimisée pour maximiser revenus
// sans effrayer l'acheteur par rapport au prix Thomann visible

/**
 * Grille de marges par catégorie
 *
 * Logique :
 * - Instruments chers (piano, synthé) → marge % faible mais valeur absolue élevée
 * - Petits accessoires (médiators, câbles) → marge % forte car prix bas
 * - Zone intermédiaire (pédales, in-ear) → marge % modérée
 *
 * Colonne "justification" = argument à donner au client si besoin
 */
const MARGIN_GRID = {
  PIANO:          { rate: 0.08, min: 30,  label: 'Piano / Clavier',      reason: 'Service de conseil + livraison assurée' },
  GUITARE:        { rate: 0.12, min: 15,  label: 'Guitare',               reason: 'Sélection & configuration incluse' },
  BASSE:          { rate: 0.12, min: 15,  label: 'Basse',                 reason: 'Sélection & configuration incluse' },
  TROMPETTE:      { rate: 0.10, min: 12,  label: 'Trompette',             reason: 'Garantie service Lyra Music' },
  SAXOPHONE:      { rate: 0.10, min: 18,  label: 'Saxophone',             reason: 'Garantie service Lyra Music' },
  VIOLON:         { rate: 0.10, min: 12,  label: 'Violon',                reason: 'Garantie service Lyra Music' },
  ACCESSOIRE_CABLE: { rate: 0.25, min: 2, label: 'Câble Jack / XLR',      reason: 'Sourcing pro, câbles testés' },
  PEDALE_EFFET:   { rate: 0.18, min: 8,  label: 'Pédale d\'effet',        reason: 'Conseil personnalisé genre musical' },
  PEDALE_SUSTAIN: { rate: 0.20, min: 5,  label: 'Pédale de sustain',      reason: 'Conseil personnalisé' },
  MEDIATOR:       { rate: 0.30, min: 0.5, label: 'Médiator',              reason: 'Pack sélectionné pour gospel' },
  IN_EAR:         { rate: 0.15, min: 10,  label: 'In-ear monitors',       reason: 'Conseil mixage scène inclus' },
};

/**
 * Calcule le prix de vente sur Lyra Music
 * @param {number} sourcePrice - Prix Thomann (source)
 * @param {string} category - Clé de MARGIN_GRID
 * @returns {object} Détail du prix
 */
function calculatePrice(sourcePrice, category) {
  const grid = MARGIN_GRID[category];
  if (!grid) throw new Error(`Catégorie inconnue : ${category}`);

  // Marge = max(sourcePrice * rate, min absolu)
  const marginAbsolute = Math.max(sourcePrice * grid.rate, grid.min);
  const ourPrice = parseFloat((sourcePrice + marginAbsolute).toFixed(2));
  const marginPercent = parseFloat(((marginAbsolute / ourPrice) * 100).toFixed(1));

  return {
    sourcePrice,
    ourPrice,
    marginAbsolute: parseFloat(marginAbsolute.toFixed(2)),
    marginPercent,
    category,
    label: grid.label,
  };
}

/**
 * Recalcule les prix de toute la boutique
 * Utile pour un cron quotidien si les prix Thomann changent
 * @param {Array} products - [{id, sourcePrice, category}]
 * @returns {Array} produits avec ourPrice mis à jour
 */
function recalculateCatalog(products) {
  return products.map(p => ({
    ...p,
    ...calculatePrice(p.sourcePrice, p.category),
  }));
}

/**
 * Résumé des marges pour dashboard admin
 */
function getMarginSummary() {
  return Object.entries(MARGIN_GRID).map(([key, v]) => ({
    category: key,
    label: v.label,
    ratePercent: `${(v.rate * 100).toFixed(0)}%`,
    minAbsolute: `${v.min}€`,
  }));
}

module.exports = { calculatePrice, recalculateCatalog, getMarginSummary, MARGIN_GRID };
