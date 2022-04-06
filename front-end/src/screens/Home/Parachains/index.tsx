// Copyright 2019-2020 @Premiurly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import styled from '@xstyled/styled-components';
import React from 'react';
import { Card } from 'semantic-ui-react';
import ParachainInfoCard from 'src/components/ParachainInfoCard';
import ParachainSearchInfo from 'src/components/ParachainSearchInfo';

interface Props {
  className?: string
}

const Parachains = ({ className }: Props) => {
	return (
		<div className={className}>
			<h1 className='ma-sm-1'>Projects Directory</h1>
			<ParachainSearchInfo className='ma-sm-1' />

			<Card.Group className='card-group'>
				<ParachainInfoCard network='polkadot' />
				<ParachainInfoCard network='kusama' />
			</Card.Group>
		</div>
	);
};

export default styled(Parachains)`
	h1 {
		font-size: 48px;
		font-weight: 500;
		margin-bottom: 28px !important;
	}

	.ma-sm-1 {
		@media only screen and (max-width: 768px) {
			margin: 1rem;
		}
	}

	.card-group {
		margin-top: 32px;
		overflow-x: auto !important;
		flex-wrap: nowrap;
		max-width: 99.9%;
	}
`;