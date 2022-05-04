// Copyright 2019-2020 @Premiurly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import 'mocha';

import { AuthenticationError, ForbiddenError } from 'apollo-server';
import { expect } from 'chai';

import Address from '../../../src/model/Address';
import User from '../../../src/model/User';
import addressLinkConfirm from '../../../src/resolvers/mutation/addressLinkConfirm';
import addressLinkStart from '../../../src/resolvers/mutation/addressLinkStart';
import { Context, NetworkEnum } from '../../../src/types';
import messages from '../../../src/utils/messages';
import { getNewUserCtx } from '../../helpers';

describe('addressLinkConfirm mutation', () => {
	let signupUserId = -1;
	let fakectx: Context;
	let dbAddressId: any;
	const email = 'test@email.com';
	const password = 'testpass';
	const username = 'testuser';

	before(async () => {
		const result = await getNewUserCtx(email, password, username);
		fakectx = result.ctx;
		signupUserId = result.userId;
	});

	after(async () => {
		await User
			.query()
			.where({ id: signupUserId })
			.del();

		await Address
			.query()
			.where({ id: dbAddressId })
			.del();
	});

	it('should be able to confirm address link on Substrate', async () => {
		const network = NetworkEnum.SUBSTRATE;
		const address = 'HNZata7iMYWmk5RvZRTiAsSDhV8366zq2YGb3tLH5Upf74F'; //Alice
		const signMessage = 'da194645-4daf-43b6-b023-6c6ce99ee709';
		const signature = '0x048ffa02dd58557ab7f7ffb316ac75fa942d2bdb83f4480a6698a1f39d6fa1184dd85d95480bfab59f516de578b102a2b01b81ca0e69134f90e0cd08ada7ca88';

		const linkStartRes = await addressLinkStart(undefined, { network, address }, fakectx);

		await Address
			.query()
			.patch({
				sign_message: signMessage
			})
			.findById(linkStartRes.address_id);

		const linkConfirmRes = await addressLinkConfirm(undefined, { signature, address_id: linkStartRes.address_id }, fakectx);

		const dbAddress = await Address
			.query()
			.where({ user_id: signupUserId })
			.first();

		expect(dbAddress?.public_key).to.exist;
		expect(dbAddress?.verified).to.be.true;
		expect(dbAddress?.default).to.be.true;

		expect(linkConfirmRes.message).to.equal(messages.ADDRESS_LINKING_SUCCESSFUL);

		dbAddressId = dbAddress?.id;
	});

	it('should be able to confirm address link on Ethereum', async () => {
		const network = NetworkEnum.ETHEREUM;
		const address = '0x2d6eBb160A14eed95c0Cb8ede5C92EA9E182a938';
		const signMessage = 'da194645-4daf-43b6-b023-6c6ce99ee709';
		const signature = '0x417ea879ecc9131601417b04f0a3502cc8cb409d539d749f1789602aa8269a155492cc865b1c481452530ae804934519f0b187ee75f8b2c48eb3ca4b822174531b';

		const linkStartRes = await addressLinkStart(undefined, { network, address }, fakectx);

		await Address
			.query()
			.patch({
				sign_message: signMessage
			})
			.findById(linkStartRes.address_id);

		const linkConfirmRes = await addressLinkConfirm(undefined, { signature, address_id: linkStartRes.address_id }, fakectx);

		const dbAddress = await Address
			.query()
			.where({ user_id: signupUserId })
			.first();

		expect(dbAddress?.public_key).to.exist;
		expect(dbAddress?.verified).to.be.true;
		expect(dbAddress?.default).to.be.true;

		expect(linkConfirmRes.message).to.equal(messages.ADDRESS_LINKING_SUCCESSFUL);

		dbAddressId = dbAddress?.id;
	});

	it('should not be able to confirm address link with fake signature on Substrate', async () => {
		const network = NetworkEnum.SUBSTRATE;
		const address = 'FoQJpPyadYccjavVdTWxpxU7rUEaYhfLCPwXgkfD6Zat9QP'; // Bob
		const signMessage = 'da194645-4daf-43b6-b023-6c6ce99ee709';
		const fakeSignature = '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';


		const linkStartRes = await addressLinkStart(undefined, { network, address }, fakectx);

		await Address
			.query()
			.patch({
				sign_message: signMessage
			})
			.findById(linkStartRes.address_id);

		try {
			await addressLinkConfirm(undefined, { signature: fakeSignature, address_id: linkStartRes.address_id }, fakectx);
		} catch (error) {
			expect(error).to.exist;
			expect(error).to.be.an.instanceof(ForbiddenError);
			expect(error.message).to.eq(messages.ADDRESS_LINKING_FAILED);
		}
	});

	it('should not be able to confirm address link with fake signature on Ethereum', async () => {
		const network = NetworkEnum.ETHEREUM;
		const address = '0x2d6eBb160A14eed95c0Cb8ede5C92EA9E182a938'; // Bob
		const signMessage = 'da194645-4daf-43b6-b023-6c6ce99ee709';
		const fakeSignature = '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000';

		const linkStartRes = await addressLinkStart(undefined, { network, address }, fakectx);

		await Address
			.query()
			.patch({
				sign_message: signMessage
			})
			.findById(linkStartRes.address_id);

		try {
			await addressLinkConfirm(undefined, { signature: fakeSignature, address_id: linkStartRes.address_id }, fakectx);
		} catch (error) {
			expect(error).to.exist;
			expect(error).to.be.an.instanceof(ForbiddenError);
			expect(error.message).to.eq(messages.ADDRESS_LINKING_FAILED);
		}
	});

	it('should not be able to confirm linking address with wrong jwt', async () => {
		const signature = 'fake';
		fakectx.req.headers.authorization = 'Bearer wrong';
		try {
			await addressLinkConfirm(undefined, { signature, address_id: 1 }, fakectx);
		} catch (error) {
			expect(error).to.exist;
			expect(error).to.be.an.instanceof(AuthenticationError);
			expect(error.message).to.eq(messages.INVALID_JWT);
		}
	});
});
