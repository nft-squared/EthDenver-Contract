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
    MockERC721s: MockERC721[] = []
    IPPoolShadow:{[chainId:number]:IPPoolShadow} = {}
    IPPoolLocal!:IPPoolLocal
    APPDemo!:APPDemo
    Licenser!:Licenser
    AppRegistry!:AppRegistry
    NFT2!:NFT2

    async deployMock721s(symbols:string[]) {
        for(const symbol of symbols) {
            const nftoken = await deployF(MockERC721__factory, [symbol, symbol]);
            this.MockERC721s.push(nftoken);
        }
    }

    async deployAPPDemo() {
        this.APPDemo = await deployProxyF(APPDemo__factory, [this.NFT2.address])
    }

    async deployIPPoolLocal() {
        const pool = await deployProxyF(IPPoolLocal__factory, []);
        this.IPPoolLocal = pool;
    }

    async deployIPPoolShadow(chainIds:number[]) {
        for(let chainId of chainIds) {
            const pool = await deployProxyF(IPPoolShadow__factory, [chainId]);
            this.IPPoolShadow[chainId] = pool;
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
        await this.AppRegistry.register(this.APPDemo.address);
        const pools = Object.values(this.IPPoolShadow).map(ippool=>ippool.address);
        pools.push(this.IPPoolLocal.address);
        await this.NFT2.addIPPool(pools);

        await this.APPDemo.transferOwnership(this.NFT2.address);
        await this.Licenser.transferOwnership(this.NFT2.address);
    }

    async deployAll() {
        await this.deployIPPoolLocal()
        await this.deployAppRegistry()
        await this.deployLicenser()
        await this.deployNFT2()
        await this.deployAPPDemo()
        await this.init()
    }

    signers() {
        const hre = require("hardhat");
        const { ethers } = hre;
        return ethers.getSigners();
    }
}
