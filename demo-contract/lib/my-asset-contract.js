/*
 * SPDX-License-Identifier: Apache-2.0
 */

// 'use strict';
//
// const { Contract } = require('fabric-contract-api');
//
// class MyAssetContract extends Contract {
//     //function to check if the assetID exists
//     //docID
//     async myAssetExists(ctx, myAssetId) {
//         const buffer = await ctx.stub.getState(myAssetId);
//         return (!!buffer && buffer.length > 0);
//     }
//     //uploadDoc
//     //metadata from couchdb
//     async createMyAsset(ctx, myAssetId, value) {
//         //checks if assetID exists
//         const exists = await this.myAssetExists(ctx, myAssetId);
//         if (exists) {
//             throw new Error(`The my asset ${myAssetId} already exists`);
//         }
//         const asset = { value };
//         //if it doesn't exists, create new assetID
//         const buffer = Buffer.from(JSON.stringify(asset));
//         await ctx.stub.putState(myAssetId, buffer);
//     }
//     //read version control (query all versions)
//     async readMyAsset(ctx, myAssetId) {
//         const exists = await this.myAssetExists(ctx, myAssetId);
//         if (!exists) {
//             throw new Error(`The my asset ${myAssetId} does not exist`);
//         }
//         const buffer = await ctx.stub.getState(myAssetId);
//         const asset = JSON.parse(buffer.toString());
//         return asset;
//     }
//     //updateVer
//     async updateMyAsset(ctx, myAssetId, newValue) {
//         const exists = await this.myAssetExists(ctx, myAssetId);
//         if (!exists) {
//             throw new Error(`The my asset ${myAssetId} does not exist`);
//         }
//         const asset = { value: newValue };
//         const buffer = Buffer.from(JSON.stringify(asset));
//         await ctx.stub.putState(myAssetId, buffer);
//     }
//     //deleteDoc
//     async deleteMyAsset(ctx, myAssetId) {
//         const exists = await this.myAssetExists(ctx, myAssetId);
//         if (!exists) {
//             throw new Error(`The my asset ${myAssetId} does not exist`);
//         }
//         await ctx.stub.deleteState(myAssetId);
//     }
//
// }
//
// module.exports = MyAssetContract;

'use strict';

const { Contract } = require('fabric-contract-api');

class MyFiLedgerContract extends Contract {
    //function to check if the assetID exists
    //docID
    async myDocExists(ctx, MyDocId) {
        const buffer = await ctx.stub.getState(MyDocId);
        return (!!buffer && buffer.length > 0);
    }
    //uploadDoc
    //metadata from couchdb
    async createDoc(ctx, MyDocId, value) {
        //checks if assetID exists
        const exists = await this.myDocExists(ctx, MyDocId);
        if (exists) {
            throw new Error(`The my document ${MyDocId} already exists`);
        }
        const document = { value };
        //if it doesn't exists, create new assetID
        const buffer = Buffer.from(JSON.stringify(document));
        await ctx.stub.putState(MyDocId, buffer);
    }
    //read version control (query all versions)
    async readDoc(ctx, MyDocId) {
        const exists = await this.myDocExists(ctx, MyDocId);
        if (!exists) {
            throw new Error(`The my document ${MyDocId} does not exist`);
        }
        const buffer = await ctx.stub.getState(MyDocId);
        const document = JSON.parse(buffer.toString());
        return document;
    }
    //updateVer
    async updateDoc(ctx, MyDocId, newValue) {
        const exists = await this.myDocExists(ctx, MyDocId);
        if (!exists) {
            throw new Error(`The my document ${MyDocId} does not exist`);
        }
        const document = { value: newValue };
        const buffer = Buffer.from(JSON.stringify(document));
        await ctx.stub.putState(MyDocId, buffer);
    }
    //deleteDoc
    async deleteDoc(ctx, MyDocId) {
        const exists = await this.myDocExists(ctx, MyDocId);
        if (!exists) {
            throw new Error(`The my document ${MyDocId} does not exist`);
        }
        await ctx.stub.deleteState(MyDocId);
    }

}

module.exports = MyFiLedgerContract;
