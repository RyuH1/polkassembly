// Copyright 2019-2020 @Premiurly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { NetworkEnum, NetworkUserAddressInfo } from '../types';
import getAllAddressesFromUserId from './getAllAddressesFromUserId';

/**
 * Get verified addresses from userId for a given network
 */
export default async (userId: number): Promise<NetworkUserAddressInfo> => {
	const allAddresses = await getAllAddressesFromUserId(userId);

	const substrateAddressses: string[] = [];
	const ethereumAddressses: string[] = [];

	let substrateDefault = '';
	let ethereumDefault = '';

	allAddresses.forEach(addressInfo => {
		switch (addressInfo.network) {
		case NetworkEnum.SUBSTRATE:
			if (addressInfo.verified) {
				substrateAddressses.push(addressInfo.address);
				if (addressInfo.default) {
					substrateDefault = addressInfo.address;
				}
			}
			break;

		case NetworkEnum.ETHEREUM:
			if (addressInfo.verified) {
				ethereumAddressses.push(addressInfo.address);
				if (addressInfo.default) {
					ethereumDefault = addressInfo.address;
				}
			}
			break;
		default:
			break;
		}
	});

	const result = {
		[NetworkEnum.SUBSTRATE]: {
			addresses: substrateAddressses,
			default: substrateDefault
		},
		[NetworkEnum.ETHEREUM]: {
			addresses: ethereumAddressses,
			default: ethereumDefault
		}
	} as unknown as NetworkUserAddressInfo;

	return result;
};

