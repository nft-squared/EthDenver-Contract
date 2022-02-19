import { HardhatRuntimeEnvironment } from 'hardhat/types/runtime';
import { App } from '../helps/app';

const func = async function (hre:HardhatRuntimeEnvironment) {
  await (hre as any).wait
  const { ethers } = hre;
  const accounts = await ethers.getSigners();
  const deployAcc = accounts[0].address;
  console.log(deployAcc);
  const app = new App();
  const nft2 = app.NFT2;
  nft2.queryFilter(nft2.filters.Mint(), 0, 1)
};

export default func;
func.tags = ['FilterMint'];
