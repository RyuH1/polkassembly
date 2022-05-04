// Copyright 2019-2020 @Premiurly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ForbiddenError } from 'apollo-server';

import About from '../../model/About';
import { ChangeAboutArgs, MessageType, Network } from '../../types';
import messages from '../../utils/messages';
import verifySignature from '../../utils/verifySignature';

export default async (parent: void, {
	network,
	address,
	title,
	description,
	image,
	signature
}: ChangeAboutArgs): Promise<MessageType> => {
	const signMessage = `<Bytes>about::network:${network}|address:${address}|title:${title}|description:${description}|image:${image}</Bytes>`;

	const isValidSr = verifySignature(network as Network, signMessage, address, signature);

	if (!isValidSr) {
		throw new ForbiddenError(messages.ABOUT_INVALID_SIGNATURE);
	}

	const about = await About
		.query()
		.where({
			address,
			network
		})
		.first();

	if (!about) {
		await About
			.query()
			.allowInsert('[address, description, image, network, title]')
			.insert({
				address,
				description,
				image,
				network,
				title
			});
	} else {
		await About
			.query()
			.patch({
				address,
				description,
				image,
				network,
				title
			})
			.findById(about.id);
	}

	return { message: messages.PROFILE_CHANGED_SUCCESS };
};
