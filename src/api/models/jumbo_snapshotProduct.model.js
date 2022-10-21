const mongoose = require("mongoose");
const httpStatus = require("http-status");
const APIError = require("../errors/api-error");
const { env } = require("../../config/vars");

// jumbo const { JumboShopClient } = require("typescriptjumbo");
//jumbo const jumboShop = new JumboShopClient();

const jumbo_snapshotProductSchema  = new mongoose.Schema(
    {
        ean: {
            required: true,
            type: Number,
        },
        shortDescription1: {
            required: true,
            type: String,
        },
        shortDescription2: {
            required: true,
            type: String,
        },
        points: {
            required: true,
            type: [String],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("jumbo_snapshotProduct", jumbo_snapshotProductSchema);
