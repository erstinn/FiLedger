// i think we should insert the code here in front end part
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
    // async createDoc(ctx, MyDocId, value) {
    //     //checks if assetID exists
    //     const exists = await this.myDocExists(ctx, MyDocId);
    //     if (exists) {
    //         throw new Error(`The my document ${MyDocId} already exists`);
    //     }
    //     const document = { value };
    //     //if it doesn't exists, create new assetID
    //     const buffer = Buffer.from(JSON.stringify(document));
    //     await ctx.stub.putState(MyDocId, buffer);
    // }
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
    // //updateVer
    // async updateDoc(ctx, MyDocId, newValue) {
    //     const exists = await this.myDocExists(ctx, MyDocId);
    //     if (!exists) {
    //         throw new Error(`The my document ${MyDocId} does not exist`);
    //     }
    //     const document = { value: newValue };
    //     const buffer = Buffer.from(JSON.stringify(document));
    //     await ctx.stub.putState(MyDocId, buffer);
    // }
    //deleteDoc
    async deleteDoc(ctx, MyDocId) {
        const exists = await this.myDocExists(ctx, MyDocId);
        if (!exists) {
            throw new Error(`The my document ${MyDocId} does not exist`);
        }
        await ctx.stub.deleteState(MyDocId);
    }

    async getAllDocs(ctx) {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: result.value.key, Record: record });
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
}

module.exports = MyFiLedgerContract;