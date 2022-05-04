// Copyright 2019-2020 @Premiurly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { signatureVerify } from '@polkadot/util-crypto';

import getPublicKey from './getPublicKey';

import { NetworkEnum, Network } from '../types';

var Web3 = require('web3')
var web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))

export default (network: Network, message: string, address: string, signature: string): boolean => {
	switch (network) {
		case NetworkEnum.SUBSTRATE:
			const publicKey = getPublicKey(address);
			return signatureVerify(message, signature, publicKey).isValid;
		case NetworkEnum.ETHEREUM:
			return web3.eth.accounts.recover(message, signature) == address;
		default:
			break;
	}
	return false;
};
