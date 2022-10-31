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
    async createDocs(ctx, id, fileName, fileType, fileSize, fileTagsList,
                     fileVersion, stateTimestampList, fileCreator, fileMinApprovers) {

        //checks if assetID exists
        const exists = await this.myDocExists(ctx, id);
        if (exists) {
            //update the version instead of throwing error
            this.updateDoc(ctx, id, fileName, fileType, fileSize, fileTagsList,
                fileVersion, fileCreator, fileMinApprovers, stateTimestamps, tags, revi)
            // throw new Error(`The my document ${id} already exists`);
        }
        console.log('inserting')
        const document = {
            name: fileName,
            type: fileType,
            size: fileSize,
            category: "standard",
            tag_history: fileTagsList,
            version_num: fileVersion,
            state_history: stateTimestampList,
            owner: fileCreator,
            min_approvers: fileMinApprovers,
            last_activity: "Upload",
            status: "Pending",
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
                     fileVersion, fileCreator, fileMinApprovers, stateTimestamps, tags, revi) {
        // const exists = await this.myDocExists(ctx, id);
        // if (!exists) {
        //     throw new Error(`The my document ${MyDocId} does not exist`);
        // }
        console.log("updating")

        const document = {
            name: fileName,
            type: fileType,
            size: fileSize,
            category: "standard",
            tags_history: tags,
            version_num: parseFloat(fileVer).toFixed(2), //finally updates
            state_history: stateTimestamps,
            creator: fileCreator,
            min_approvers: fileMinApprovers,
            _rev: revi,
            last_activity:"Upload",
            status:"Pending",
        };
        const buffer = Buffer.from(JSON.stringify(document));
        const worked = await ctx.stub.putState(id, buffer);
        if(worked){
            console.log("it worked");
            res.redirect("/dashboard?fail=false");
        }else {
            console.log("failed");
            res.redirect("/dashboard/?fail=true")
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