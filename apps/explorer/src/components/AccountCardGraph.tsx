// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { formatAmount, formatDate } from '@mysten/core';
import { type AllEpochsAddressMetrics } from '@mysten/sui.js';
import { ParentSize } from '@visx/responsive';
import clsx from 'clsx';
import { useMemo } from 'react';

import { AreaGraph } from './AreaGraph';
import { FormattedStatsAmount } from './HomeMetrics/FormattedStatsAmount';
import { ErrorBoundary } from './error-boundary/ErrorBoundary';
import { useGetAddressMetrics } from '~/hooks/useGetAddressMetrics';
import { useGetAllEpochAddressMetrics } from '~/hooks/useGetAllEpochAddressMetrics';
import { Card } from '~/ui/Card';
import { Heading } from '~/ui/Heading';
import { LoadingSpinner } from '~/ui/LoadingSpinner';
import { Text } from '~/ui/Text';

const graphDataField = 'cumulativeAddresses' as const;
const graphDataText = 'Total accounts';

function TooltipContent({ data }: { data: AllEpochsAddressMetrics[number] }) {
	const dateFormatted = formatDate(new Date(data.timestampMs), ['day', 'month']);
	const totalFormatted = formatAmount(data[graphDataField]);
	return (
		<div className="flex flex-col gap-0.5">
			<Text variant="subtitleSmallExtra/medium" color="steel-darker">
				{dateFormatted}, Epoch {data.epoch}
			</Text>
			<Heading variant="heading6/semibold" color="steel-darker">
				{totalFormatted}
			</Heading>
			<Text variant="subtitleSmallExtra/medium" color="steel-darker" uppercase>
				{graphDataText}
			</Text>
		</div>
	);
}

export function AccountsCardGraph() {
	const { data: addressMetrics } = useGetAddressMetrics();
	const { data: allEpochMetrics, isLoading } = useGetAllEpochAddressMetrics({
		descendingOrder: false,
	});
	const adjEpochAddressMetrics = useMemo(() => allEpochMetrics?.slice(-30), [allEpochMetrics]);
	return (
		<Card bg="white" spacing={!adjEpochAddressMetrics?.length ? 'lg' : 'lgGraph'} height="full">
			<div className="flex h-full flex-col gap-4 overflow-hidden">
				<Heading variant="heading4/semibold" color="steel-darker">
					Accounts
				</Heading>
				<div className="flex flex-wrap gap-6">
					<FormattedStatsAmount
						orientation="vertical"
						label="Total"
						tooltip="Accounts that have participated in at least one transaction since network genesis"
						amount={addressMetrics?.cumulativeAddresses}
						size="sm"
					/>
					<FormattedStatsAmount
						orientation="vertical"
						label="Total Active"
						tooltip="Total active accounts"
						amount={addressMetrics?.cumulativeActiveAddresses}
						size="sm"
					/>
					<FormattedStatsAmount
						orientation="vertical"
						label="Daily Active"
						tooltip="Total daily active accounts"
						amount={addressMetrics?.dailyActiveAddresses}
						size="sm"
					/>
				</div>
				<div
					className={clsx(
						'flex min-h-[180px] flex-1 flex-col items-center justify-center rounded-xl transition-colors',
						!adjEpochAddressMetrics?.length && 'bg-gray-40',
					)}
				>
					{isLoading ? (
						<div className="flex flex-col items-center gap-1">
							<LoadingSpinner />
							<Text color="steel" variant="body/medium">
								loading data
							</Text>
						</div>
					) : adjEpochAddressMetrics?.length ? (
						<div className="relative flex-1 self-stretch">
							<ErrorBoundary>
								<ParentSize className="absolute">
									{({ height, width }) => (
										<AreaGraph
											data={adjEpochAddressMetrics}
											height={height}
											width={width}
											getX={({ epoch }) => epoch}
											getY={(data) => data[graphDataField]}
											color="blue"
											formatY={formatAmount}
											tooltipContent={TooltipContent}
										/>
									)}
								</ParentSize>
							</ErrorBoundary>
						</div>
					) : (
						<Text color="steel" variant="body/medium">
							No historical data available
						</Text>
					)}
				</div>
			</div>
		</Card>
	);
}
