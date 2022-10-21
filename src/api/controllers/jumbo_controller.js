const httpStatus = require('http-status');
const similarity = require("similarity");
const logger = require('../../config/logger');
const jumbo_ExpectedProduct = require('../models/jumbo_expectedProduct.model')
const jumbo_snapshotProduct = require('../models/jumbo_snapshotProduct.model')

const { parse } = require("node-html-parser");



exports.post = async (req, res) => {
    // Catch error false response/ contains product
    try {
        const productFromjumbo = await GetproductByEan(req.body.ean);
        console.log(productFromAh);

        const ah_expectedProduct = new jumbo_ExpectedProduct({ productId: productFromjumbo.id, ...req.body});
        const savedjumbo_expectedProduct = await jumbo_expectedProduct.save();
        res.status(httpStatus.CREATED);
        res.json(savedjumbo_expectedProduct);
    } catch (error) {
        console.log(error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.compare = async(req, res) =>{
    try {
        const jumbo_snapshotProduct = objectToExpectedProduct(await Jumbo_snapshotProduct.findOne(req.ean).sort({createdAt: -1}));
        const jumbo_ExpectedProduct = objectToExpectedProduct(await  Jumbo_ExpectedProduct.findOne(req.ean));
        // Retrun simularity

        const simularityKeysOfObject = similarityKeyEqualsOrNot(jumbo_ExpectedProduct, jumbo_snapshotProduct);
        const simularityCompleetObject = similarity(JSON.stringify(jumbo_ExpectedProduct), JSON.stringify(jumbo_snapshotProduct), { sensitive: true }) * 100;

        res.status(httpStatus.OK).json({keySimularity: simularityKeysOfObject,objectSimularity: simularityCompleetObject,jumbo_snapshotProduct, jumbo_ExpectedProduct });
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message: error.message})
    }
}

async function GetproductByEan( ean ){

    
}