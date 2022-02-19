import "@nomiclabs/hardhat-ethers";
import "@openzeppelin/hardhat-upgrades";
import { ethers } from "ethers";
import { deployF, deployProxyF } from "./deployer";
//import { deploy, deployProxy, upgradeProxy, upgradeProxyF } from "./deploy";

import {
    IPPoolShadow__factory,
    IPPoolLocal__factory,
    APPDemo__factory,
    Licenser__factory,
    NFT2__factory,
    AppRegistry__factory,
    MockERC721__factory,
    Lens,
    Lens__factory,
} from "../typechain";

import {
    IPPoolShadow,
    IPPoolLocal,
    APPDemo,
    Licenser,
    AppRegistry,
    NFT2,
    MockERC721
} from "../typechain"

export class App {
    MockERC721:{[symbol:string]:MockERC721} = {} 
    IPPoolShadows:{[chainId:number]:IPPoolShadow} = {}
    IPPoolLocal!:IPPoolLocal
    APPDemo!:APPDemo
    Licenser!:Licenser
    AppRegistry!:AppRegistry
    NFT2!:NFT2
    Lens!:Lens

    constructor() {
        const hre = require("hardhat");
        const app = hre.app // init in hardhat.config.ts
        if(app) {
            Object.assign(this, app)
        }
    }

    async deployMock721s(symbols:string[]) {
        for(const symbol of symbols) {
            const nftoken = await deployF(MockERC721__factory, [symbol, symbol], ['MockERC721', symbol]);
            this.MockERC721[symbol] = nftoken;
        }
    }

    async deployAPPDemo() {
        this.APPDemo = await deployProxyF(APPDemo__factory, [this.NFT2.address])
    }

    async deployLens() {
        this.Lens = await deployProxyF(Lens__factory, [this.NFT2.address])
    }

    async deployIPPoolLocal() {
        const pool = await deployProxyF(IPPoolLocal__factory, []);
        this.IPPoolLocal = pool;
    }

    async deployIPPoolShadow(chainIds:number[]) {
        for(let chainId of chainIds) {
            const pool = await deployProxyF(IPPoolShadow__factory, [chainId], ['IPPoolShadows', String(chainId)]);
            this.IPPoolShadows[chainId] = pool;
        }
    }

    async deployLicenser() {
        const licenser = await deployProxyF(Licenser__factory, []);
        this.Licenser = licenser;
    }

    async deployAppRegistry() {
        this.AppRegistry = await deployProxyF(AppRegistry__factory, []);
    }

    async deployNFT2() {
        this.NFT2 = await deployProxyF(NFT2__factory, [this.AppRegistry.address, this.Licenser.address]);
    }

    async init() {
        const pools = Object.values(this.IPPoolShadows).map(ippool=>ippool.address);
        pools.push(this.IPPoolLocal.address);
        await this.NFT2.addIPPools(pools);
        await this.Licenser.transferOwnership(this.NFT2.address);
    }

    async deployAll() {
        await this.deployIPPoolLocal()
        await this.deployAppRegistry()
        await this.deployLicenser()
        await this.deployNFT2()
        await this.init()
    }

    async MockNFTMint(token:MockERC721, to:string):Promise<ethers.BigNumberish> {
        const tx = await token.mint(to)
        const receipt = await tx.wait()
        const TransferEvent = receipt.events!.find(e=>e.event == 'Transfer' && e.address == token.address)
        return TransferEvent!.args!.tokenId;
    }

    signers() {
        const hre = require("hardhat");
        const { ethers } = hre;
        return ethers.getSigners();
    }
}
