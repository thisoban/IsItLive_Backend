const mongoose = require("mongoose");
const httpStatus = require("http-status");
const APIError = require("../errors/api-error");
const { env } = require("../../config/vars");

const { AHShopClient } = require("typescriptah");
const ahShop = new AHShopClient();

const ah_expectedProductSchema  = new mongoose.Schema(
    {
        ean: {
            unique: true,
            required: true,
            type: Number,
        },
        productId: {
            required: true,
            type: Number,
        },
        productDescription: {
            required: true,
            type: String,
        },
        unitSize: {
            required: true,
            type: String,
        },
        opco: {
            required: true,
            type: String,
        },
        description: {
            required: true,
            type: String,
        },
        points: {
            required: true,
            type: [String],
        },
        optionalDescription: {
            required: true,
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Ah_ExpectedProduct", ah_expectedProductSchema);
