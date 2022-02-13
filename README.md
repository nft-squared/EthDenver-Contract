# V1-core
Core smart contract of NFT Squared platform.

## Installation
`npm install` or `yarn`

## Deployment

### 1. start a local node
`npx hardhat node`

### 2. start a hardhat console and connect to a node
`npx hardhat --network=$NETWORK console`
> Connect to a local node such as ganache-cli, hardhat-node, NETWORK can be 'develop'.

### 3. deploy
In hardhat console:
```
const app = new hre.APP();
await app.deployAll();
```
The source code for `hre.APP` is in `helps/app.ts`.

### 4. interact with deployed contracts
In hardhat console:
`await app.Licenser.name()`