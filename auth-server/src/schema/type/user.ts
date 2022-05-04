// Copyright 2019-2020 @Premiurly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

export default `
	type User {
		id: Int
		substrate_default_address: String
		ethereum_default_address: String
		email: String
		email_verified: Boolean
		username: String
		web3signup: Boolean
	}
`;
