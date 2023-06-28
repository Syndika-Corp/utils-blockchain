import {
  GasLimitService,
  MultiCallRequest,
  MultiCallRequestWithGas,
  MultiCallService,
  MultiCallWithGasParams,
  Web3ProviderConnector,
  MultiCallParams,
  defaultParamsByChunkSize,
  defaultParamsWithGas,
} from '@1inch/multicall';
import { Contract, JsonRpcProvider } from 'ethers';
import Web3 from 'web3';
import { MULTICALL_ADDRESS } from './constants';
import { Blockchain_Type } from '../enums/blockchain-type.enum';
import { InvalidConnectionError } from '../errors/invalid-connection';
import { Web3Connection } from '../types/web3-connection.type';
import { WrongFunctionKey } from '../errors/wrong-function-key';

export class Multicall {
  /**
   * @param _multiCallService Multicall service implementation
   * @param _gasLimit Gas limit value
   * @param _params Multicall params with gas values
   * @param _provider Provider connector (web3, json-rpc)
   */
  constructor(
    private _multiCallService: MultiCallService,
    private _params: MultiCallParams | MultiCallWithGasParams,
    private _provider: Web3ProviderConnector,
    private _gasLimit?: number
  ) {}

  /**
   * Initiate Multicall class with specified connection mechanism
   *
   * @param connection Connection instance for Multicall serivce
   * @param withGas Initialize Multicall with gas limitation or not
   * @param params The parameters for Multicall - are optional, if not specified, the default will be used
   * @returns New Multicall instance
   */
  static async init(
    connection: Web3Connection,
    withGas = false,
    params?: MultiCallParams | MultiCallWithGasParams
  ): Promise<Multicall> {
    const web3 = Multicall.getWeb3Instance(connection);
    const provider = new Web3ProviderConnector(web3);
    const chainId = await Multicall.getChainId(web3, connection);
    const enumKey = Multicall.getChainEnumKey(chainId);
    const contractAddress =
      MULTICALL_ADDRESS[
        Blockchain_Type[enumKey as keyof typeof Blockchain_Type]
      ];
    if (withGas) {
      const gasLimitService = new GasLimitService(provider, contractAddress);
      const gasLimit = await gasLimitService.calculateGasLimit();
      return new Multicall(
        new MultiCallService(provider, contractAddress),
        params ? params : defaultParamsWithGas,
        provider,
        gasLimit
      );
    }
    return new Multicall(
      new MultiCallService(provider, contractAddress),
      params ? params : defaultParamsByChunkSize,
      provider,
      undefined
    );
  }

  /**
   * Generate encoded data for multicall
   *
   * @param contract Target contract to request
   * @param functionName Name of the function for multicall
   * @param args Arguments necessary for function multicall
   * @returns Encoded data for multicall
   */
  generateCallData(
    contract: Contract,
    functionName: string,
    args: any = []
  ): string {
    const functionFragment = contract.interface.getFunction(functionName);

    if (functionFragment === null) {
      throw new WrongFunctionKey(functionName);
    }

    const encodedData = contract.interface.encodeFunctionData(
      functionFragment,
      args
    );

    return encodedData;
  }

  /**
   * Return multicall request object
   *
   * @param contract Requested contract instance
   * @param functionName Name of the function for multicall
   * @param args Arguments of the function for multicall
   * @param gas Amount of gas units specified for this call. Skip if chunks are used.
   * @returns Multicall request object
   */
  async getRequestObject(
    contract: Contract,
    functionName: string,
    args: any = [],
    gas?: number
  ): Promise<MultiCallRequest | MultiCallRequestWithGas> {
    const to = await contract.getAddress();
    const data = this.generateCallData(contract, functionName, args);
    if (gas) {
      return {
        to,
        data,
        gas,
      };
    }
    return {
      to,
      data,
    };
  }

  /**
   * Execute multicall on particular batch
   *
   * @param requests Batch of multicall requests to be executed
   */
  async multicall(
    requests: MultiCallRequestWithGas[] | MultiCallRequest[]
  ): Promise<string[]> {
    if ('gas' in requests[0]) {
      return await this._multiCallService.callByGasLimit(
        requests as MultiCallRequestWithGas[],
        this._gasLimit as number,
        this._params as MultiCallWithGasParams
      );
    } else {
      return await this._multiCallService.callByChunks(
        requests,
        this._params as MultiCallParams
      );
    }
  }

  /**
   * Returns new connection instance
   *
   * @param connection Connection instance for Multicall serivce
   */
  private static getWeb3Instance(connection: Web3Connection) {
    let web3: Web3;

    switch (typeof connection) {
      case 'string':
        web3 = new Web3(connection);
        break;

      default:
        web3 =
          connection instanceof JsonRpcProvider
            ? new Web3(connection._getConnection().url)
            : connection;
        break;
    }

    return web3;
  }

  /**
   * Returns the id of the chain on which the multicall service is operating
   *
   * @param web3 Web3 instance for multicall
   * @param connection Connection object instance
   */
  private static async getChainId(web3: Web3, connection: Web3Connection) {
    let chainId: string;
    try {
      chainId = (await web3.eth.net.getId()).toString();
    } catch (err) {
      throw new InvalidConnectionError(connection as string);
    }

    return chainId;
  }

  /**
   * Return enum key for particular chain
   *
   * @param chainId The id of the chain
   */
  private static getChainEnumKey(chainId: string) {
    let enumKey;
    for (const key in Blockchain_Type) {
      if (Blockchain_Type[key as keyof typeof Blockchain_Type] === chainId) {
        enumKey = key;
      }
    }
    return enumKey;
  }
}
