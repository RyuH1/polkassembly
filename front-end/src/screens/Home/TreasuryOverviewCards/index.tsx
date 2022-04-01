// Copyright 2019-2020 @Premiurly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DeriveBalancesAccount } from '@polkadot/api-derive/types';
import type { Balance } from '@polkadot/types/interfaces';
import { BN_MILLION, BN_ZERO, u8aConcat, u8aToHex } from '@polkadot/util';
import BN from 'bn.js';
import moment from 'moment';
import React, { useContext, useEffect, useState } from 'react';
import { Card, Icon, Progress } from 'semantic-ui-react';
import { ApiContext } from 'src/context/ApiContext';
import { REACT_APP_SUBSCAN_API_KEY } from 'src/global/apiKeys';
import { chainProperties } from 'src/global/networkConstants';
import { useBlockTime } from 'src/hooks';
import useDebounce from 'src/hooks/useDebounce';
import HelperTooltip from 'src/ui-components/HelperTooltip';
import blockToDays from 'src/util/blockToDays';
import fetchTokenToUSDPrice from 'src/util/fetchTokenToUSDPrice';
import formatBnBalance from 'src/util/formatBnBalance';
import getNetwork from 'src/util/getNetwork';
import styled from 'styled-components';

const EMPTY_U8A_32 = new Uint8Array(32);

interface Result {
	value?: Balance;
	burn?: BN;
	spendPeriod: BN;
	treasuryAccount: Uint8Array;
}

const NETWORK = getNetwork();

const TreasuryOverviewCards = ({ className }: {className?: string}) => {
	const { api, apiReady } = useContext(ApiContext);
	const [currentBlock, setCurrentBlock] = useState<BN>(new BN(0));
	const [treasuryBalance, setTreasuryBalance] = useState<
		DeriveBalancesAccount | undefined
	>(undefined);

	const { blocktime } = useBlockTime();

	const [result, setResult] = useState<Result>(() => ({
		spendPeriod: BN_ZERO,
		treasuryAccount: u8aConcat('modl', 'py/trsry', EMPTY_U8A_32).subarray(
			0,
			32
		)
	}));

	const [resultValue, setResultValue] = useState<string>('0');
	const [resultBurn, setResultBurn] = useState<string>('0');
	const [availableUSD, setAvailableUSD] = useState<string>('');
	const [nextBurnUSD, setNextBurnUSD] = useState<string>('');
	const [currentTokenPrice, setCurrentTokenPrice] = useState<string>('');
	const [priceWeeklyChange, setPriceWeeklyChange] = useState<number>();
	const [spendPeriodRemaining, setSpendPeriodRemaining] = useState<number>();
	const [spendPeriodPercentage, setSpendPeriodPercentage] = useState<number>();

	useEffect(() => {
		if (!api) {
			return;
		}

		if (!apiReady) {
			return;
		}

		api.derive.chain.bestNumber((number) => {
			setCurrentBlock(number);
		});

		api.derive.balances
			?.account(u8aToHex(result.treasuryAccount))
			.then((treasuryBalance) => {
				setTreasuryBalance(treasuryBalance);
			});

		if (treasuryBalance) {
			setResult(() => ({
				burn:
					treasuryBalance.freeBalance.gt(BN_ZERO) &&
					!api.consts.treasury.burn.isZero()
						? api.consts.treasury.burn
							.mul(treasuryBalance.freeBalance)
							.div(BN_MILLION)
						: BN_ZERO,
				spendPeriod: api.consts.treasury
					? api.consts.treasury.spendPeriod
					: BN_ZERO,
				treasuryAccount: u8aConcat(
					'modl',
					api.consts.treasury && api.consts.treasury.palletId
						? api.consts.treasury.palletId.toU8a(true)
						: 'py/trsry',
					EMPTY_U8A_32
				),
				value: treasuryBalance.freeBalance.gt(BN_ZERO)
					? treasuryBalance.freeBalance
					: undefined
			}));

			if (result.value) {
				setResultValue(result.value.toString());
			}

			if (result.burn) {
				setResultBurn(result.burn.toString());
			}
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api, apiReady, treasuryBalance, currentBlock]);

	const debouncedResultValue = useDebounce<any>(resultValue, 500);
	const debouncedResultBurn = useDebounce<any>(resultBurn, 500);

	// fetch available token to USD price whenever available token changes
	useEffect(() => {
		// replace spaces returned in string by format function
		const token_available: number = parseFloat(formatBnBalance(
			debouncedResultValue.toString(),
			{
				numberAfterComma: 2,
				withThousandDelimitor: false,
				withUnit: false
			}
		).replaceAll(/\s/g,''));

		fetchTokenToUSDPrice(token_available).then((formattedUSD) => {
			if(formattedUSD){
				setAvailableUSD(formattedUSD);
			}
		});

	}, [debouncedResultValue]);

	// fetch Next Burn token to USD price whenever Next Burn token changes
	useEffect(() => {
		// replace spaces returned in string by format function
		const tokenBurn: number = parseFloat(formatBnBalance(
			debouncedResultBurn.toString(),
			{
				numberAfterComma: 2,
				withThousandDelimitor: false,
				withUnit: false
			}
		));

		fetchTokenToUSDPrice(tokenBurn).then((formattedUSD) => {
			if(formattedUSD){
				setNextBurnUSD(formattedUSD);
			}
		});

	}, [debouncedResultBurn]);

	// fetch current price of the token
	useEffect(() => {
		let cancel = false;

		async function fetchCurrentTokenPrice() {
			if (cancel) return;
			let today = new Date();
			const offset = today.getTimezoneOffset();
			today = new Date(today.getTime() - (offset*60*1000));

			const response = await fetch(
				`https://${NETWORK}.api.subscan.io/api/open/price_converter`,
				{
					body: JSON.stringify({
						from: chainProperties[NETWORK].tokenSymbol,
						quote: 'USD',
						value: 1
					}),
					headers: {
						Accept: 'application/json',
						'Content-Type': 'application/json',
						'X-API-Key': REACT_APP_SUBSCAN_API_KEY || ''
					},
					method: 'POST'
				}
			);
			const responseJSON = await response.json();
			if (responseJSON['message'] == 'Success') {
				setCurrentTokenPrice(parseFloat(responseJSON['data']['output']).toFixed(2));
			}
		}

		fetchCurrentTokenPrice();

		return () => {cancel = true;};
	}, []);

	// fetch a week ago price of the token and calc priceWeeklyChange
	useEffect(() => {
		let cancel = false;

		async function fetchWeekAgoTokenPrice() {
			if (cancel) return;
			const weekAgoDate = moment().subtract(7,'d').format('YYYY-MM-DD');

			const response = await fetch(
				`https://${NETWORK}.api.subscan.io/api/scan/price/history`,
				{
					body: JSON.stringify({
						end: weekAgoDate,
						start: weekAgoDate
					}),
					headers: {
						Accept: 'application/json',
						'Content-Type': 'application/json',
						'X-API-Key': REACT_APP_SUBSCAN_API_KEY || ''
					},
					method: 'POST'
				}
			);
			const responseJSON = await response.json();
			if (responseJSON['message'] == 'Success') {
				const weekAgoPrice = responseJSON['data']['average'];
				const currentTokenPriceNum : number = parseFloat(currentTokenPrice);
				const weekAgoPriceNum : number = parseFloat(weekAgoPrice);
				const percentChange = ((currentTokenPriceNum - weekAgoPriceNum) / weekAgoPriceNum) * 100;
				setPriceWeeklyChange(parseFloat(percentChange.toFixed(2)));
			}
		}

		fetchWeekAgoTokenPrice();
		return () => {cancel = true;};
	}, [currentTokenPrice]);

	useEffect(() => {
		if (!api || !apiReady || currentBlock.isZero()) {
			return;
		}

		const totalSpendPeriod: number = blockToDays(result.spendPeriod.toNumber(), blocktime);
		const spendPeriodElapsed: number = blockToDays(currentBlock.toNumber() % (result.spendPeriod.toNumber()), blocktime);
		const spendPeriodRemaining: number = totalSpendPeriod - spendPeriodElapsed;
		setSpendPeriodRemaining(spendPeriodRemaining);

		const percentage = ((spendPeriodRemaining/totalSpendPeriod) * 100).toFixed(0);
		setSpendPeriodPercentage(parseFloat(percentage));
	}, [api, apiReady, currentBlock, blocktime, result.spendPeriod]);

	return (
		<Card.Group className={className}>
			{/* Available Card */}
			<Card className='treasury-card'>
				<Card.Content>
					<Card.Meta className='treasury-card-meta'>
						Available <HelperTooltip content='Available funds collected through a portion of block production rewards, transaction fees, slashing, staking inefficiencies, etc.' />
					</Card.Meta>
					<Card.Header className='treasury-card-header'>
						{result.value ? (
							<span>
								{formatBnBalance(
									result.value.toString(),
									{
										numberAfterComma: 2,
										withUnit: true
									}
								)}
							</span>
						) : (
							<div>
								<Icon loading name='circle notched' />
							</div>
						)}
					</Card.Header>

					<Card.Description className='treasury-card-desc'>
						{availableUSD
							? `~ $${availableUSD}`
							: 'loading...'}
					</Card.Description>
				</Card.Content>
			</Card>

			{/* Current Price Card */}
			<Card className='treasury-card'>
				<Card.Content>
					<Card.Meta className='treasury-card-meta'>
						Current Price of {chainProperties[NETWORK].tokenSymbol}
					</Card.Meta>
					<Card.Header className='treasury-card-header'>
						{currentTokenPrice ?
							`$${currentTokenPrice}` :
							<div><Icon loading name='circle notched' /></div>
						}
					</Card.Header>

					<Card.Description className='treasury-card-desc'>
						{priceWeeklyChange ?
							<div>
								Weekly Change &nbsp;{Math.abs(priceWeeklyChange)}%
								{priceWeeklyChange < 0 ? <Icon color='red' name='caret down' /> : <Icon color='green' name='caret up' /> }
							</div> :
							'Fetching...'
						}
					</Card.Description>
				</Card.Content>
			</Card>

			{/* Spend Period Remaining */}
			<Card className='treasury-card'>
				<Card.Content>
					<Card.Meta className='treasury-card-meta'>
						Spend Period Remaining <HelperTooltip content={'Funds held in the treasury can be spent by making a spending proposal that, if approved by the Council, will enter a spend period before distribution, it is subject to governance, with the current default set to '+ blockToDays(result.spendPeriod.toNumber(), blocktime) + ' days.'} />
					</Card.Meta>
					<Card.Header className='treasury-card-header'>
						{spendPeriodRemaining && `${spendPeriodRemaining} days` }
					</Card.Header>

					<Card.Description className='treasury-card-desc progress-desc'>
						<div className='progressNumber'>{ spendPeriodPercentage }%</div><br/>
						<Progress percent={spendPeriodPercentage} />
					</Card.Description>
				</Card.Content>
			</Card>

			{/* Next Burn */}
			<Card className='treasury-card'>
				<Card.Content>
					<Card.Meta className='treasury-card-meta'>
						Next Burn <HelperTooltip content='If the Treasury ends a spend period without spending all of its funds, it suffers a burn of a percentage of its funds.' />
					</Card.Meta>
					<Card.Header className='treasury-card-header'>
						{result.burn ? (
							<span>
								{formatBnBalance(
									result.burn.toString(),
									{
										numberAfterComma: 2,
										withUnit: true
									}
								)}
							</span>
						) : (
							<div>
								<Icon loading name='circle notched' />
							</div>
						)}
					</Card.Header>

					<Card.Description className='treasury-card-desc'>
						{nextBurnUSD
							? `~ $${nextBurnUSD}`
							: 'loading...'}
					</Card.Description>
				</Card.Content>
			</Card>
		</Card.Group>
	);
};

export default styled(TreasuryOverviewCards)`
	&&& {
		@media only screen and (max-width: 1024px) {
			justify-content: center;
		}

		.treasury-card{
			border-radius: 0.5em;
			
			@media only screen and (min-width: 945px) {
				// width: 170px;
				width: 254px;
			}
			
			.content{
				padding-bottom: 0 !important;
			}
		}
		
		.treasury-card-meta {
			color: #333 !important;
			font-size: 1.5rem;
		}

		.treasury-card-header {
			margin-top: 0.4em !important;
			font-size: 24px !important;
		}

		.treasury-card-desc{
			&:not(.progress-desc){
				margin-top: 0.9em !important;
				border-top: 1px solid #eee;
				padding-top: 0.7em;
			}
			
			color: #000 !important;

			.bar {
				background-color: #E5007A !important;
				border-radius: 1em;
				height: 8px;
				margin-top: 0.5em;
			}


			.progressNumber{
				float: right;
				color: #787878;
				font-size: 14px;
			}

		}
	}
`;
