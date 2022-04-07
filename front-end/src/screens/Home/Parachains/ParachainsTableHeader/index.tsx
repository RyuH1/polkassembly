// Copyright 2019-2020 @Premiurly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import styled from '@xstyled/styled-components';
import React from 'react';
import { Table } from 'semantic-ui-react';

interface ParachainsTableHeaderProps {
	className?: string
}

const ParachainsTableHeader = function ({
	className
}:ParachainsTableHeaderProps) {

	return (
		<Table.Header className={`${className}`}>
			<Table.Row>
				<Table.HeaderCell width={8}><span>Project</span></Table.HeaderCell>
				<Table.HeaderCell width={2}><span>Status</span></Table.HeaderCell>
				<Table.HeaderCell width={2}><span>Tokens</span></Table.HeaderCell>
				<Table.HeaderCell width={2}><span>W3F Grant</span></Table.HeaderCell>
				<Table.HeaderCell width={1}><span>Investors</span></Table.HeaderCell>
				<Table.HeaderCell width={1}><span>Github</span></Table.HeaderCell>
			</Table.Row>
		</Table.Header>
	);
};

export default styled(ParachainsTableHeader)`
	background: #F2F2F2;

	th {
		font-weight: 500 !important;
		padding-top: 1.5em;
		padding-bottom: 1.5em;

		:not(:first-child){
			span {
				border-left: 1px solid #ddd;
				padding: 0.3em 0 0.3em 1em;
				margin-left: -1em;
			}
		}

		&:first-child {
			padding-right: 0 !important;
			width: 120px !important;
		}
	}
`;
