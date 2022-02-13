import '@typechain/hardhat'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'
import "@openzeppelin/hardhat-upgrades";
import "hardhat-deploy";
import "solidity-coverage";
import { extendEnvironment } from 'hardhat/config';

const { testnet, mainnet } = require('./networks.json');
const { FromKeystore } = require('./wallet');
import fs from 'fs';
const prikeys = ()=>{
  const keystoreDir = './keystore';
  if(fs.existsSync(keystoreDir) && process.env.PASSWD) {
    const keystoreFiles = fs.readdirSync(keystoreDir);
    return keystoreFiles.map(file=>fs.readFileSync(`${keystoreDir}/${file}`)).map(keystoreStr=>FromKeystore(keystoreStr, process.env.PASSWD));
  }
  return [];
}

extendEnvironment(async (hre:any) => {
  // getter setter?
  if(!fs.existsSync(hre.config.typechain.outDir)) return;
  const { App } = require('./helps/app'); // reference compilation result
  hre.APP = App
  const netenv = process.env.NETENV;
  if (!netenv) {
    console.log("export NETENV=XXX // local,mainnet,testnet");
    return;
  }
  if (hre.hardhatArguments.network == undefined){
    return;
  }
  hre.netenv = netenv.toLowerCase();
  hre.Record = `record_${hre.netenv}.json`;
  //hre.Chains = "chains_testnet.json";
  hre.Chains = `chains_${hre.netenv}.json`;
  hre.chainId = await hre.getChainId();
  {
    console.log(`---------------------using NETWORK ${hre.network.name.toUpperCase()}`)
    hre.AppFile = `APP_${hre.network.name}.ts`
    const ContractInit = require('./deploy/init.js'); // reference compilation result
    hre.app = await ContractInit()
  }
});

function networks(network:any, suffix:string, prikey:string[]) {
  const keys = Object.keys(network);
  const nets = {} as any;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const chain = `${key}_${suffix}`;
    const net = network[key];
    nets[chain] = {
      ...net,
      accounts: prikey,
    }
  }
  return nets;
}

module.exports = {
  defaultNetwork: 'hardhat',
  networks: {
    hardhat: {
      chainId: 31337,
      gas: 12000000,
      blockGasLimit: 0x1fffffffffffff,
      allowUnlimitedContractSize: true,
      timeout: 1800000,
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
        initialIndex: 0,
        count: 20,
        path: "m/44'/60'/0'/0",
        accountsBalance: "10000000000000000000000000",
      }
    },
    develop:{
      url: 'http://localhost:8545'
    },
    ...networks(mainnet, 'main', prikeys()),
    ...networks(testnet, 'test', prikeys())
  },
  solidity: {
    version: '0.8.8',
    settings: {
      optimizer: {
        enabled: true,
        runs: 1,
      },
      evmVersion: "istanbul",
      outputSelection: {
        "*": {
          "": [
            "ast"
          ],
          "*": [
            "evm.bytecode.object",
            "evm.deployedBytecode.object",
            "abi",
            "evm.bytecode.sourceMap",
            "evm.deployedBytecode.sourceMap",
            "metadata"
          ]
        }
      },
    },
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
  typechain: {
    outDir: './typechain',
    target: process.env.TYPECHAIN_TARGET || 'ethers-v5',
  },
};