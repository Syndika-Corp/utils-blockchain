import Web3 from 'web3';
import {
  MULTICALL_ADDRESS,
  Multicall,
  Blockchain_Type,
  InvalidConnectionError,
  WrongFunctionKey,
} from '../src';
import { Contract, JsonRpcProvider } from 'ethers';
import { ABI } from './abi';
import 'dotenv/config';

const providerURI = process.env.FORK_PROVIDER as string;
const contractAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
const contract = new Contract(
  contractAddress,
  ABI,
  new JsonRpcProvider(providerURI)
);

describe('utils-web3', () => {
  describe('Multicall', () => {
    it('should properly initialize Multicall', async () => {
      expect(await Multicall.init(providerURI)).toBeInstanceOf(Multicall);
      expect(await Multicall.init(new Web3(providerURI))).toBeInstanceOf(
        Multicall
      );
      expect(
        await Multicall.init(new JsonRpcProvider(providerURI))
      ).toBeInstanceOf(Multicall);

      await expect(
        Multicall.init('http://localhost:854/')
      ).rejects.toThrowError(InvalidConnectionError);
    });

    it('should return correct chainIds from enum', () => {
      expect(Blockchain_Type.BSC).toEqual('56');
      expect(Blockchain_Type.ETHEREUM).toEqual('1');
      expect(Blockchain_Type.GOERLI).toEqual('5');
      expect(Blockchain_Type.LOCAL).toEqual('31337');
      expect(Blockchain_Type.MUMBAI).toEqual('80001');
      expect(Blockchain_Type.POLYGON).toEqual('137');
      expect(Blockchain_Type.SEPOLIA).toEqual('11155111');
    });

    it('all constants should be correct', () => {
      const multicallAddresses = {
        '1': '0x8d035edd8e09c3283463dade67cc0d49d6868063',
        '5': '0x20B136D01e87C99F2866f71C2d6Cc027E724AAF7',
        '56': '0x804708de7af615085203fa2b18eae59c5738e2a9',
        '137': '0x0196e8a9455a90d392b46df8560c867e7df40b34',
        '31337': '0x8d035edd8e09c3283463dade67cc0d49d6868063',
        '80001': '0xe38D748a07a6e3f9911Ec53ed434af2aB65716bc',
        '11155111': '0x069C02e7fF41Fd3d3f0c3fa80Ce0cB3b368aCc31',
      };
      expect(MULTICALL_ADDRESS).toMatchObject(multicallAddresses);
    });

    it('generateCallData', async () => {
      const multicall = await Multicall.init(providerURI);
      const functionName = 'name';
      const params = undefined;
      const calldata = contract.interface.encodeFunctionData(
        functionName,
        params
      );
      expect(
        multicall.generateCallData(contract, functionName, params)
      ).toEqual(calldata);

      expect(() =>
        multicall.generateCallData(contract, 'decimals', params)
      ).toThrow(WrongFunctionKey);
    });

    it('getRequestObject', async () => {
      const multicall = await Multicall.init(providerURI);
      const functionName = 'symbol';
      const params = undefined;
      const gas = 1;
      expect(
        await multicall.getRequestObject(contract, functionName, params, gas)
      );
    });

    it('multicall', async () => {
      const multicall = await Multicall.init(providerURI);
      const functionName = 'name';
      const params = undefined;
      const rec = await multicall.getRequestObject(
        contract,
        functionName,
        params
      );
      const res = await multicall.multicall([rec]);
      expect(
        contract.interface.decodeFunctionResult('name', res[0])[0]
      ).toEqual('Tether USD');
    });

    it('multicall with gas', async () => {
      const multicall = await Multicall.init(providerURI, true);
      const functionName = 'symbol';
      const params = undefined;
      const rec = await multicall.getRequestObject(
        contract,
        functionName,
        params
      );
      const res = await multicall.multicall([rec]);
      expect(
        contract.interface.decodeFunctionResult(functionName, res[0])[0]
      ).toEqual('USDT');
    });
  });
});
