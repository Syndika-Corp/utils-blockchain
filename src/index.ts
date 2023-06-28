/** Multicall */
export { Multicall } from './multicall/multicall';

/** Web3Connection type for Multicall */
export type { Web3Connection } from './types/web3-connection.type';

/** Multicall Errors */
export { InvalidConnectionError } from './errors/invalid-connection';
export { WrongFunctionKey } from './errors/wrong-function-key';

/** Multicall Constants */
export { MULTICALL_ADDRESS } from './multicall/constants';

/** Enums */
export { Blockchain_Type } from './enums/blockchain-type.enum';

/** External types */
export type {
  GasLimitService,
  MultiCallRequestWithGas,
  MultiCallService,
  MultiCallWithGasParams,
  Web3ProviderConnector,
  MultiCallRequest,
  MultiCallParams,
} from '@1inch/multicall';
