# V1-core
Core smart contract of NFT Squared platform.

## Installation
`npm install` or `yarn`

## Deployment

### 1. start a local node
`npx hardhat node`
> Skip this step if you want to connect to a online network like Ethereum, Ropsten.

### 2. import deployer account
`yarn toKeystore prikey passwd`

### 3. init environment variable
```
export NETENV=test # test or main
export NETWORK=hmy_test
export PASSWD=123456 # passwd of keystore
```

### 4. deploy
1. deploy mock NFT IP: `yarn tags Mocks`
2. deploy core contracts: `yarn tags Main`
3. deploy IPPoolShadow: `yarn tags IPPoolShadow`
4. deploy Demo App: `yarn tags DemoApp`

### 5. interact with deployed contracts
1. Start a hardhat console and connect to a node
`yarn console`
2. In hardhat console:
`await app.Licenser.name()`

## Keystore
### import a account
`yarn toKeystore prikey passwd`
### export a account
`yarn fromKeystore keystorePath passwd`

## Contract Address
### testnet
[record_test.json](/record_test.json)
