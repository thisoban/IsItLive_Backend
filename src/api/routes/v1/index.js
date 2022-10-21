const express = require('express');
const ahRoutes = require('./ah.routes');
const jumboroutes = require('./jumbo_routes')

const router = express.Router();

/**
 * GET v1/status
 */
router.get('/status', (req, res) => res.send('OK'));

router.use('/ah', ahRoutes);
router.use('/jumbo', jumboroutes)

module.exports = router;