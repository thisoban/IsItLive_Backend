const mongoose = require("mongoose");
const httpStatus = require("http-status");
const APIError = require("../errors/api-error");
const { env } = require("../../config/vars");

const { AHShopClient } = require("typescriptah");
const ahShop = new AHShopClient();

const ah_snapshotProductSchema  = new mongoose.Schema(
    {
        ean: {
            required: true,
            type: Number,
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

module.exports = mongoose.model("Ah_SnapshotProduct", ah_snapshotProductSchema);
