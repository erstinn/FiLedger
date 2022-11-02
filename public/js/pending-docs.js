//TRIAL CODE for accept and reject button in pending docs

// Requiring module
import fs from "fs-extra";

function moveDoc(id){
    //  let loc = '/dashboard/accepted-docs/'
    // window.location.assign(id.loc);
    // Source file
    const src = id;
    // Destination path
    const dest = "/dashboard/accepted-docs/";

// Function call
// Using call back function
    fs.move(src, dest, (err) => {
        if (err) return console.log(err);
        console.log(`File successfully moved!!`);
    });
}

// onclick="viewDoc('<%=d.docs[i]._id%>')"

import {moveFile} from 'move-file';

await moveFile('source/unicorn.png', 'destination/unicorn.png');
console.log('The file has been moved');