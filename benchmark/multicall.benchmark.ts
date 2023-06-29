import { Contract, JsonRpcProvider, Wallet } from 'ethers';
import { ABI } from '../test/abi';
import { Multicall } from '../src/index';
import 'dotenv/config';
import { MultiCallRequest } from '@1inch/multicall';
import { getEnvVar } from '../utils/env-validation';

export function wait(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getRandomAddress(amount: number): string[] {
  let result: string[] = [];
  for (let index = 0; index < amount; index++) {
    result.push(Wallet.createRandom().address);
  }
  return result;
}

async function benchmark() {
  /* These constants can be configured */
  const numberOfCalls = 50;
  const usdtAddress = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
  const providerUrl = getEnvVar('BENCHMARK_PROVIDER');
  const contract = new Contract(
    usdtAddress,
    ABI,
    new JsonRpcProvider(providerUrl)
  );
  const functionName = 'balanceOf';
  const addresses = getRandomAddress(numberOfCalls);
  const multicall = await Multicall.init(providerUrl);
  
  // test without gas
  let requests: MultiCallRequest[] = [];
  for (let index = 0; index < numberOfCalls; index++) {
    requests.push(
      await multicall.getRequestObject(contract, functionName, [
        addresses[index]
      ])
    );
  }

  
  let beforeTime = Date.now();
  const res = await multicall.multicall(requests);
  let afterTime = Date.now();

  const multicallTimeDifference = afterTime - beforeTime;
  console.log(
    `Time spent to make ${numberOfCalls} requests using Multicall: ${multicallTimeDifference} ms`
  );
  console.log('----------------------------------------------------------');
  await wait(2000)

  let req: Promise<any>[] = [];
  beforeTime = Date.now();
  for (let index = 0; index < numberOfCalls; index++) {
    req.push(contract.balanceOf(addresses[index]));
  }
  await Promise.all(req)
  afterTime = Date.now();
  const promiseAllCallsTimeDifference = afterTime - beforeTime;
  console.log(
    `Time spent to make ${numberOfCalls} requests using Promise.all(): ${promiseAllCallsTimeDifference} ms`
  );
  const savedPromiseAllTime = promiseAllCallsTimeDifference - multicallTimeDifference;
  console.log(`Multicall saved ${savedPromiseAllTime} ms`);
  console.log('----------------------------------------------------------');
  await wait(2000)

  beforeTime = Date.now();
  for (let index = 0; index < numberOfCalls; index++) {
    await contract.balanceOf(addresses[index]);
  }
  afterTime = Date.now();
  const separateCallsTimeDifference = afterTime - beforeTime;
  console.log(
    `Time spent to make ${numberOfCalls} requests using separate calls: ${separateCallsTimeDifference} ms`
  );
  const savedTime = separateCallsTimeDifference - multicallTimeDifference;
  console.log(`Multicall saved ${savedTime} ms`);
}

benchmark()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
