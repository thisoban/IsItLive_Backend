const httpStatus = require('http-status');
const similarity = require("similarity");
const logger = require('../../config/logger');
const Ah_ExpectedProduct = require('../models/ah_expectedProduct.model');
const Ah_SnapshotProduct = require('../models/ah_snapshotProduct.model');

const { parse } = require("node-html-parser");
const { AHShopClient } = require("typescriptah");
const { result } = require('lodash');
const ahShop = new AHShopClient();



exports.post = async (req, res) => {
    // Catch error false response/ contains product
    try {
        const productFromAh = await getProductByDescriptionThatEqualsEan(req.body.ean, req.body.description);
        console.log(productFromAh);

        const ah_expectedProduct = new Ah_ExpectedProduct({ productId: productFromAh.id, ...req.body});
        const savedAh_expectedProduct = await ah_expectedProduct.save();
        res.status(httpStatus.CREATED);
        res.json(savedAh_expectedProduct);
    } catch (error) {
        console.log(error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.snapshotByEan = async (req, res) => {
    try {
        const expectedProduct = await Ah_ExpectedProduct.findOne({ean: req.params.ean});
        const syncedProduct = {ean:(expectedProduct.ean), ...(await getAhProductByID(expectedProduct.productId))};
        
        const ah_snapshotProduct = new Ah_SnapshotProduct(syncedProduct);
        const savedAh_snapshotProduct = await ah_snapshotProduct.save();
        res.status(httpStatus.CREATED);
        res.json(savedAh_snapshotProduct);
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message: error.message})
    }
};

exports.snapshotAllProducts = async (req, res) => {
    //Ah_ExpectedProduct.map();
    let allProductEans = await Ah_ExpectedProduct.find({}).select('-_id ean');

    // 
   
        allProductEans.forEach(async (product) => {
            const syncedProduct = {ean:(expectedProduct.ean), ...(await getAhProductByID(expectedProduct.productId))};
            
            const ah_snapshotProduct = new Ah_SnapshotProduct(syncedProduct);
            const savedAh_snapshotProduct = await ah_snapshotProduct.save();
        })
        res.status(httpStatus.OK).json(allProductEans);
        //MongooseMap.Ah_ExpectedProduct.$isMongooseMap
    
};
   

exports.compare = async (req, res) => {
    try {
        const ah_snapshotProduct = objectToExpectedProduct(await Ah_SnapshotProduct.findOne(req.ean).sort({createdAt: -1}));
        const ah_expectedProduct = objectToExpectedProduct(await  Ah_ExpectedProduct.findOne(req.ean));
        // Retrun simularity

        const simularityKeysOfObject = similarityKeyEqualsOrNot(ah_expectedProduct, ah_snapshotProduct);
        const simularityCompleetObject = similarity(JSON.stringify(ah_expectedProduct), JSON.stringify(ah_snapshotProduct), { sensitive: true }) * 100;

        res.status(httpStatus.OK).json({keySimularity: simularityKeysOfObject,objectSimularity: simularityCompleetObject,ah_snapshotProduct, ah_expectedProduct });
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message: error.message})
    }
    // Find in database
    // Exist return error (automatic)

    // Get product

    // Save

    //getProductByDescriptionThatEqualsEan()
};

// Internal Function
// Add product
async function getProductByDescriptionThatEqualsEan(ean, productDescription) {
    return (product = await ahShop
        .product()
        .getProductByName(productDescription, { size: 1000 })
        .then((result) => {
            if (result.cards == undefined) throw new Error(`ERROR: productDescription: '${productDescription}' has 0 results!`);

            let productResult = {};

            for (const card of result.cards) {
                for (const product of card.products) {
                    // Check if EAN equals the product GTINS
                    if (product.gtins.includes(ean)) {
                        // Get product parent and overwrite child
                        if (Object.keys(productResult).length === 0 || product.gtins.length == 1) {
                            productResult = product;
                        }
                    }
                }
            }

            if (Object.keys(productResult).length === 0) throw new Error(`ERROR: there are ${result.cards.length} products found on the product description. But non matched the EAN code '${ean}'`);

            return productResult;
        }));
}

// Snapshot
async function getAhProductByID(productId) {
    return ahShop
        .product()
        .getProductByID(productId)
        .then((result) => {
            const document = parse(result);

            // Get elements from body by attribute
            const productSummary = document.querySelector('[data-testhook="product-summary"]');
            const productItems = productSummary.querySelectorAll("li");

            // Get values from the elements
            const productItems_array = productItems.map(function (item) {
                return item.innerHTML;
            });
            const productDescription_value = productSummary.querySelector("p").innerHTML;
            const productSummary_value = productSummary.innerHTML;

            return {
                description: productDescription_value,
                points: productItems_array,
                optionalDescription: productSummary_value,
                createAt: new Date()
            };
        });
}

// Simularity
function similarityKeyEqualsOrNot(obj1, obj2) {
    let totalItems = 0;
    let equals = 0;

    for (const key of Object.keys(obj1)) {
        // Is value array
        if (Array.isArray(obj1[key])) {
            for (let index = 0; index < obj1[key].length; index++) {
                if (obj1[key][index] == obj2[key][index]) equals++;

                totalItems++;
            }
        } else {
            if (obj1[key] == obj2[key]) equals++;

            totalItems++;
        }
    }

    //return (100 / totalItems) * equals;
    return `${equals} of the ${totalItems} are equal`;
}

function objectToExpectedProduct(obj) {
    return {
        description: obj.description,
        points: obj.points,
        optionalDescription: obj.optionalDescription,
    }
}