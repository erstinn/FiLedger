/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class MyAssetContract extends Contract {
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
            throw new Error(`The my asset ${MyDocId} already exists`);
        }
        const asset = { value };
        //if it doesn't exists, create new assetID
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(MyDocId, buffer);
    }
    //read version control (query all versions)
    async readDoc(ctx, MyDocId) {
        const exists = await this.myDocExists(ctx, MyDocId);
        if (!exists) {
            throw new Error(`The my asset ${MyDocId} does not exist`);
        }
        const buffer = await ctx.stub.getState(MyDocId);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }
    //updateVer
    async updateDoc(ctx, MyDocId, newValue) {
        const exists = await this.myDocExists(ctx, MyDocId);
        if (!exists) {
            throw new Error(`The my asset ${MyDocId} does not exist`);
        }
        const asset = { value: newValue };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(MyDocId, buffer);
    }
    //deleteDoc
    async deleteDoc(ctx, MyDocId) {
        const exists = await this.myDocExists(ctx, MyDocId);
        if (!exists) {
            throw new Error(`The my asset ${MyDocId} does not exist`);
        }
        await ctx.stub.deleteState(MyDocId);
    }

}

module.exports = DocContract;
