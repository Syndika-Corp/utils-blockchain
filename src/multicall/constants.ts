import { Blockchain_Type } from '../enums/blockchain-type.enum';

export const MULTICALL_ADDRESS = {
  [Blockchain_Type.ETHEREUM]: '0x8d035edd8e09c3283463dade67cc0d49d6868063',
  [Blockchain_Type.BSC]: '0x804708de7af615085203fa2b18eae59c5738e2a9',
  [Blockchain_Type.POLYGON]: '0x0196e8a9455a90d392b46df8560c867e7df40b34',
  [Blockchain_Type.GOERLI]: '0x20B136D01e87C99F2866f71C2d6Cc027E724AAF7',
  [Blockchain_Type.SEPOLIA]: '0x069C02e7fF41Fd3d3f0c3fa80Ce0cB3b368aCc31',
  [Blockchain_Type.MUMBAI]: '0xe38D748a07a6e3f9911Ec53ed434af2aB65716bc',
  // from ethereum mainnet fork
  [Blockchain_Type.LOCAL]: '0x8d035edd8e09c3283463dade67cc0d49d6868063',
};
