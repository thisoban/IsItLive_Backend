const httpStatus = require('http-status');
const similarity = require("similarity");
const logger = require('../../config/logger');
const jumbo_ExpectedProduct = require('../models/jumbo_expectedProduct.model')
const jumbo_snapshotProduct = require('../models/jumbo_snapshotProduct.model')
const { JumboShopClient } = require("typescriptjumbo");
const jumboShop = new JumboShopClient();

const { parse } = require("node-html-parser");



exports.post = async (req, res) => {
    // Catch error false response/ contains product
    try {
        const productIdFromjumbo = await GetproductByEan(req.body.ean);
        console.log(productFromJumbo);

        const jumbo_expectedProduct = new jumbo_ExpectedProduct({ productId: productIdFromjumbo, ...req.body});
        const savedjumbo_expectedProduct = await jumbo_expectedProduct.save();
        res.status(httpStatus.CREATED);
        res.json(savedjumbo_expectedProduct);
    } catch (error) {
        console.log(error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json(error);
    }
}

exports.snapshotByEan = async (req, res) => {
    try {
        const expectedProduct = await Jumbo_ExpectedProduct.findOne({ean: req.params.ean});
        const syncedProduct = {ean:(expectedProduct.ean), ...(await getJumboProductByID(expectedProduct.productId, expectedProduct.ean))};
        
        const jumbo_snapshotProduct = new Jumbo_SnapshotProduct(syncedProduct);
        const savedJumbo_snapshotProduct = await jumbo_snapshotProduct.save();
        res.status(httpStatus.CREATED);
        res.json(savedJumbo_snapshotProduct);
    } catch (error) {
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({message: error.message})
    }
};

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

exports.snapshotAllProducts = async (req, res) => {
    //Jumbo_ExpectedProduct.map();
    let allProductEans = await Jumbo_ExpectedProduct.find({}).select('-_id ean');
        allProductEans.forEach(async (product) => {
            const syncedProduct = {ean:(expectedProduct.ean), ...(await getJumboProductByID(expectedProduct.productId, expectedProduct.ean))};
            const jumbo_snapshotProduct = new Jumbo_SnapshotProduct(syncedProduct);
            const savedJumbo_snapshotProduct = await jumbo_snapshotProduct.save();
        })
        res.status(httpStatus.OK).json(allProductEans);
        //MongooseMap.Jumbo_ExpectedProduct.$isMongooseMap
};

// Internal Functions
// Add Product
async function GetproductByEan( ean ){
    return (productId = await jumboShop
        .getProductId(ean)
    )
}

// Snapshot
async function getJumboProductByID(productId, ean) {
    return jumboShop
        .getProductInfo(productId, ean)
        .then((result) => {
            const document = parse(result);
            
            // Edit vanaf hier
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
                shortDescription1: productDescription_value,
                shortDescription2: productSummary_value,
                points: productItems_array,
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


// npm install 'path to package.json van jumbo_scraper'