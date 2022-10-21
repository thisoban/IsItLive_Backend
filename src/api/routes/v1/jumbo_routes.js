const express = require('express');
const validate = require('express-validation');
const controller = require('../../controllers/jumbo.controller');

const router = express.Router();

//ah expected product model saved in db
router
  .route('/')
  .post(controller.post)

  //v1/ah/compare/ean
router
  .route('/compare/:ean')
  .get(controller.compare)
//v1/ah/snapshotByEan/ean
router
  .route('/snapshotByEan/:ean')
  .get(controller.snapshotByEan)
//v1/ah/snapshotAllProducts/ean
router
  .route('/snapshotAllProducts')
  .get(controller.snapshotAllProducts)

  //get all expected
  router
  .route('/')
  .get(controller.getAllProducts)
module.exports = router;