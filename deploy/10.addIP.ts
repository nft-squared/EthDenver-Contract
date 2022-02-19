import { HardhatRuntimeEnvironment } from 'hardhat/types/runtime';
import { App } from '../helps/app';
import { contractAtF } from '../helps/deployer';
import { IPPoolShadow__factory } from '../typechain';

const func = async function (hre:HardhatRuntimeEnvironment) {
  await (hre as any).wait
  const { ethers } = hre;
  const accounts = await ethers.getSigners();
  const deployAcc = accounts[0].address;
  console.log(deployAcc);
  const app = new App();
  const IPPoolShadowETH = app.IPPoolShadows[1]
  const iplist = require('../iplist.json')
  for(const ip of iplist.data) {
    console.log('IPAdd:', ip.contract, ip.tokenId, ip.address)
    await IPPoolShadowETH.IPAdd(ip.contract, ip.tokenId, ip.address)
  }
};

export default func;
func.tags = ['ADDIP'];
