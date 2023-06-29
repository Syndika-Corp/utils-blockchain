# Blockchain Utils

[![npm package][npm-img]][npm-url]
[![Build Status][build-img]][build-url]
[![Downloads][downloads-img]][downloads-url]
[![Issues][issues-img]][issues-url]
[![Code Coverage][codecov-img]][codecov-url]
[![Commitizen Friendly][commitizen-img]][commitizen-url]
[![Semantic Release][semantic-release-img]][semantic-release-url]

> The TypeScript utility package designed for addressing multicall problems in dApp development. Built upon the foundation of the [1inch multicall library](https://github.com/1inch/multicall/tree/master).

## Install

### Node

```bash
npm install utils-blockchain
```

### Yarn

```bash
yarn add utils-blockchain
```

## Multicall contract addresses

> :warning: The MultiCall contract was not audited yet, so use at your OWN RISK! Syndika does not provide any guarantees or assurances!!!

### Mainnet

| Name     | Address                                    |
| -------- | ------------------------------------------ |
| Ethereum | 0x8d035edd8e09c3283463dade67cc0d49d6868063 |
| BSC      | 0x804708de7af615085203fa2b18eae59c5738e2a9 |
| Polygon  | 0xe38D748a07a6e3f9911Ec53ed434af2aB65716bc |

### Testnet

| Name    | Address                                    |
| ------- | ------------------------------------------ |
| Sepolia | 0x069C02e7fF41Fd3d3f0c3fa80Ce0cB3b368aCc31 |
| Goerli  | 0x20B136D01e87C99F2866f71C2d6Cc027E724AAF7 |
| Mumbai  | 0xe38D748a07a6e3f9911Ec53ed434af2aB65716bc |

## Motivation

The purpose of this utility library is to efficiently execute multiple view calls simultaneously. It accomplishes this by taking a list of requests, dividing them into manageable chunks, and making batched calls to the provider. By reducing the number of requests and optimizing the request-response flow, the library significantly speeds up the process.

For instance, when comparing the time taken for 50 `balanceOf` requests, the difference in request time between a naive approach and the batch approach is substantial.

```bash
$ npm run benchmark

> utils-blockchain@0.0.0-development benchmark
> ts-node benchmark/multicall.benchmark.ts

Time spent to make 50 requests using Multicall: 219 ms
----------------------------------------------------------
Time spent to make 50 requests using Promise.all(): 1620 ms
Multicall saved 1401 ms
----------------------------------------------------------
Time spent to make 50 requests using separate calls: 9753 ms
Multicall saved 9534 ms
```

> You can play with various parameters by modifying the benchmark script from `benchmark/multicall.banchmark.ts` directory and observing the difference.

The default multicall parameters are set as follows:

- maxChunkSize: **500**
- retriesLimit: **3**
- blockNumber: **'latest'**
- gasBuffer: **100000**

> For better understanding of how requests are packed and all trade-offs made when splitting in batches, please refer to [1inch algorithm visualisation](https://github.com/1inch/multicall/tree/master#algorithm-visualization).

## Library Usage

### Initializing multicall service

```ts
import { Multicall } from 'utils-blockchain';

const providerURL = 'https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY';
const multicallService = await Multicall.init(providerURL);
```

### Request batch generation

```ts
import { Contract } from 'ethers';

const contract = new Contract(
  '0xdAC17F958D2ee523a2206206994597C13D831ec7', // address of the requested contract
  ABI, // abi of the requested contract
  new JsonRpcProvider(providerURL) // JSON-RPC or Web3 provider
);
const functionName = 'balanceOf';
const targetTokenOwners = [
  '0x1212121212121212121212121212121212121212',
  '0x3434343434343434343434343434343434343434',
  '0xabcabcabcabcabcabcabcabcabcabcabcabcabca',
];
const batch = await Promise.all(
  targetTokenOwners.map(address => {
    return multicall.getRequestObject(contract, functionName, [address]);
  })
);
```

The `batch` array is formatted in the following way:

```bash
[
  {
    to: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    data: '0x70a082310000000000000000000000001212121212121212121212121212121212121212',
    gas: 146999999
  },
  {
    to: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    data: '0x70a082310000000000000000000000003434343434343434343434343434343434343434',
    gas: 146999999
  },
  {
    to: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    data: '0x70a08231000000000000000000000000abcabcabcabcabcabcabcabcabcabcabcabcabca',
    gas: 146999999
  }
]
```

### Multicall request execution

```ts
const res = await multicallService.multicall(batch);
```

The response array denotes the balances of the users specified in the request batch.

```bash
[
  '0x000000000000000000000000000000000000000000000000000000000002528f',
  '0x0000000000000000000000000000000000000000000000000000000000000000',
  '0x0000000000000000000000000000000000000000000000000000000000000000'
]
```

[build-img]: https://github.com/Syndika-Corp/utils-blockchain/actions/workflows/release.yml/badge.svg
[build-url]: https://github.com/Syndika-Corp/utils-blockchain/actions/workflows/release.yml
[downloads-img]: https://img.shields.io/npm/dt/utils-blockchain
[downloads-url]: https://www.npmtrends.com/utils-blockchain
[npm-img]: https://img.shields.io/npm/v/utils-blockchain
[npm-url]: https://www.npmjs.com/package/utils-blockchain
[issues-img]: https://img.shields.io/github/issues/Syndika-Corp/utils-blockchain
[issues-url]: https://github.com/Syndika-Corp/utils-blockchain/issues
[codecov-img]: https://codecov.io/gh/Syndika-Corp/utils-blockchain/branch/main/graph/badge.svg
[codecov-url]: https://app.codecov.io/gh/Syndika-Corp/utils-blockchain
[semantic-release-img]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release
[commitizen-img]: https://img.shields.io/badge/commitizen-friendly-brightgreen.svg
[commitizen-url]: http://commitizen.github.io/cz-cli/

