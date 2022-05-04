// Copyright 2018-2020 @paritytech/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { ApiPromise } from '@polkadot/api';
import {
  AccountId,
  BlockNumber,
  Hash,
  PropIndex,
} from '@polkadot/types/interfaces';
import { ITuple } from '@polkadot/types/types'
import { logger } from '@polkadot/util';

import { prisma } from '../generated/prisma-client';
import { filterEvents } from '../util/filterEvents';
import {
  Cached,
  NomidotDAOProject,
  NomidotDAOProjectEvent,
  NomidotDAOProjectRawEvent,
  Task,
} from './types';

const l = logger('Task: DAOProjects');

const eventField = [
  'ProjectId'
];

/*
 *  ======= Table (Proposal) ======
 */
const createDAOProject: Task<NomidotDAOProject[]> = {
  name: 'createDAOProject',
  read: async (
    blockHash: Hash,
    cached: Cached,
    api: ApiPromise
  ): Promise<NomidotDAOProject[]> => {
    const { events } = cached;
    const daoProjectEvents = filterEvents(
      events,
      'daoPortal',
      'ProjectCreated'
    );

    const results: NomidotDAOProject[] = [];

    await Promise.all(
      daoProjectEvents.map(async ({ event: { data, typeDef } }) => {
        const daoProjectRawEvent: NomidotDAOProjectRawEvent = data.reduce(
          (prev, curr, index) => {
            const type = eventField[index];

            console.log(index, curr.toJSON());

            return {
              ...prev,
              [type]: curr.toJSON(),
            };
          },
          {}
        );

        l.log(`daoProjectRawEvent: ${JSON.stringify(daoProjectRawEvent)}`);

        if (!daoProjectRawEvent.ProjectId) {
          l.error(
            `Expected ProjectId missing on the event: ${daoProjectRawEvent.ProjectId}`
          );
          return null;
        }

        const daoProjectArguments: NomidotDAOProjectEvent = {
          projectId: daoProjectRawEvent.ProjectId,
        };

        const result: NomidotDAOProject = {
          projectId: daoProjectArguments.projectId,
        };

        l.log(`Nomidot DAOProject: ${JSON.stringify(result)}`);
        results.push(result);
      })
    );

    return results;
  },
  write: async (blockNumber: BlockNumber, value: NomidotDAOProject[]) => {
    await Promise.all(
      value.map(async prop => {
        const {
          projectId,
        } = prop;

        await prisma.createDAOProject({
          projectId,
        });
      })
    );
  },
};

export default createDAOProject;
