import type { JsonRpcProvider } from 'ethers';
import type Web3 from 'web3';

export type Web3Connection = JsonRpcProvider | Web3 | string;
