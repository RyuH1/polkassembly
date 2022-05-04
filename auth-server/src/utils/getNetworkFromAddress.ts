// Copyright 2019-2020 @Premiurly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { resolveTxt } from 'dns';
import Address from '../model/Address';
import { NetworkEnum } from '../types';

/**
 * Get Network from address
 */
export default async (address: string): Promise<NetworkEnum> => {
	const addr = await Address
		.query()
		.where('address', address)
		.first();

	if (!addr) {
		return NetworkEnum.SUBSTRATE;
	}

    return addr.network as NetworkEnum;
};
