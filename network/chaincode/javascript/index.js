/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const MyFiLedgerContract = require('./lib/fabcar');
// const MyUploadContract = require('./lib/createDoc');

module.exports.MyFiLedgerContract = MyFiLedgerContract;
// module.exports.MyUploadContract = MyUploadContract;

module.exports.contracts = [ MyFiLedgerContract ];
