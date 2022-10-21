const mongoose = require("mongoose");
const httpStatus = require("http-status");
const APIError = require("../errors/api-error");
const { env } = require("../../config/vars");

// jumbo const { AHShopClient } = require("typescriptah");
//jumbo const ahShop = new AHShopClient();

const jumbo_snapshotProductSchema  = new mongoose.Schema(
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

module.exports = mongoose.model("jumbo_snapshotProduct", jumbo_snapshotProductSchema);
