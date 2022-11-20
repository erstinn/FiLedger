// i think we should insert the code here in front end part
'use strict';

const { Contract } = require('fabric-contract-api');

class MyFiLedgerContract extends Contract {
    //function to check if the assetID exists
    //docID
    async myDocExists(ctx, id) {
        const buffer = await ctx.stub.getState(id);
        return (!!buffer && buffer.length > 0);
    }
    //uploadDoc
    //metadata from couchdb
    async createDoc(ctx, id, fileName, fileType, fileSize, fileTagsList,
                     fileVersion, stateTimestampList, fileCreator, status, dept) {

        //checks if assetID exists
        const exists = await this.myDocExists(ctx, id);
        if (exists) {
            //update the version instead of throwing error
            // this.updateDoc(ctx, id, fileName, fileType, fileSize, fileTagsList,
            //     fileVersion, fileCreator, fileMinApprovers, stateTimestamps, tags, revi)
            throw new Error(`The my document ${id} already exists`);
        }
        console.log('inserting')
        const document = {
            name: fileName,
            type: fileType,
            size: fileSize,
            tag_history: fileTagsList,
            version_num: fileVersion,
            state_history: stateTimestampList,
            creator: fileCreator,
            department: dept,
            last_activity: "Upload",
            status: status,
        };
        //if it doesn't exists, create new assetID
        const buffer = Buffer.from(JSON.stringify(document));
        await ctx.stub.putState(id, buffer);
    }

    //read version control (query all versions)
    async readDoc(ctx, id) {
        const exists = await this.myDocExists(ctx, id);
        if (!exists) {
            throw new Error(`The my document ${id} does not exist`);
        }
        const buffer = await ctx.stub.getState(id);
        const document = JSON.parse(buffer.toString());
        return document;
    }
    // //updateVer
    async updateDocs(ctx, id, fileName, fileType, fileSize, fileTagsList,
                     fileVersion, fileCreator, stateTimestamps, status, dept) {
        // const exists = await this.myDocExists(ctx, id);
        // if (!exists) {
        //     throw new Error(`The my document ${MyDocId} does not exist`);
        // }
        console.log("updating")

        const document = {
            name: fileName,
            type: fileType,
            size: fileSize,
            tags_history: fileTagsList,
            version_num: parseFloat(fileVersion).toFixed(2), //finally updates
            state_history: stateTimestamps,
            creator: fileCreator,
            department: dept,
            last_activity:"Upload",
            status: status,
        };
        const buffer = Buffer.from(JSON.stringify(document));
        const worked = await ctx.stub.putState(id, buffer);
        if(worked){
            console.log("it worked");
        }else {
            console.log("failed");
        }
    }
    //deleteDoc
    async deleteDoc(ctx, id) {
        const exists = await this.myDocExists(ctx, id);
        if (!exists) {
            throw new Error(`The my document ${id} does not exist`);
        }
        await ctx.stub.deleteState(id);
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