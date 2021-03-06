import _ from "lodash";

import {
  NODE_ADD_BROKER_NODE,
  NODE_ADD_NEW_GENESIS_HASH,
  NODE_RESET,
  NODE_MARK_SECTOR_AS_CLAIMED
} from "../actions/node-actions";

import { CHUNKS_PER_SECTOR, SECTOR_STATUS } from "../../config/";

const initState = {
  brokerNodes: [],
  newGenesisHashes: [],
  oldGenesisHashes: [],
  id: null,
  lastResetAt: new Date()
};

const brokerNodeGenerator = address => {
  return { address };
};

const newGenesisHashGenerator = (genesisHash, numberOfChunks) => {
  const numberOfSectors = Math.ceil(numberOfChunks / CHUNKS_PER_SECTOR);
  const sectorIdxes = _.range(numberOfSectors);
  const sectors = _.map(sectorIdxes, index => {
    return {
      index,
      status: SECTOR_STATUS.NOT_STARTED
    };
  });
  return { genesisHash, numberOfChunks, sectors };
};

export default (state = initState, action) => {
  switch (action.type) {
    case NODE_ADD_BROKER_NODE:
      const { address } = action.payload;
      return {
        ...state,
        brokerNodes: [...state.brokerNodes, brokerNodeGenerator(address)]
      };

    case NODE_ADD_NEW_GENESIS_HASH:
      const { genesisHash, numberOfChunks } = action.payload;
      return {
        ...state,
        newGenesisHashes: [
          ...state.newGenesisHashes,
          newGenesisHashGenerator(genesisHash, numberOfChunks)
        ]
      };

    case NODE_RESET:
      const { id, lastResetAt } = action.payload;
      return {
        ...state,
        id,
        lastResetAt,
        brokerNodes: [],
        newGenesisHashes: [],
        oldGenesisHashes: []
      };

    case NODE_MARK_SECTOR_AS_CLAIMED:
      const { genesisHash: gh, sectorIdx } = action.payload;
      const updatedGenesisHashes = _.map(
        state.newGenesisHashes,
        newGenesisHash => {
          if (newGenesisHash.genesisHash === gh) {
            const updatedSectors = _.map(newGenesisHash.sectors, sector => {
              if (sector.index === sectorIdx) {
                return {
                  ...sector,
                  status: SECTOR_STATUS.CLAIMED
                };
              } else {
                return { ...sector };
              }
            });
            return { ...newGenesisHash, sectors: updatedSectors };
          } else {
            return { ...newGenesisHash };
          }
        }
      );
      return {
        ...state,
        newGenesisHashes: updatedGenesisHashes
      };

    default:
      return { ...state };
  }
};
