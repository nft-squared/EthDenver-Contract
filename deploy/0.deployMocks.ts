import { HardhatRuntimeEnvironment } from 'hardhat/types/runtime';
import { App } from '../helps/app';

//const record = require('../helps/record');
//const ChainsData = require('../helps/chains');

const func = async function (hre:HardhatRuntimeEnvironment) {
  await (hre as any).wait
  const { ethers } = hre;
  const accounts = await ethers.getSigners();
  const deployAcc = accounts[0].address;
  console.log(deployAcc);

  if (hre as any ['netenv'] == 'main') throw "not local/test network"

  const app = new App();
  await app.deployMock721s(["BAYC","MAYC"]);
};

export default func;
func.tags = ['Mocks'];
