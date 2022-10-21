function Snapshotallproducts (){
    allProductEans.forEach(async (product) => {
    const syncedProduct = {ean:(expectedProduct.ean), ...(await getAhProductByID(expectedProduct.productId))};
    
    const ah_snapshotProduct = new Ah_SnapshotProduct(syncedProduct);
    const savedAh_snapshotProduct = await ah_snapshotProduct.save();
})
res.status(httpStatus.OK).json(allProductEans);
//MongooseMap.Ah_ExpectedProduct.$isMongooseMap
};