import { HardhatRuntimeEnvironment } from 'hardhat/types/runtime';
import { App } from '../helps/app';

const func = async function (hre:HardhatRuntimeEnvironment) {
  await (hre as any).wait
  const { ethers } = hre;
  const accounts = await ethers.getSigners();
  const deployAcc = accounts[0].address;
  console.log(deployAcc);
  const app = new App();
  const shadowChains = [1]
  await app.deployIPPoolShadow(shadowChains);
  await app.NFT2.addIPPools(shadowChains.map(chainId=>app.IPPoolShadow[chainId].address))
};

export default func;
func.tags = ['IPPoolShadow'];
