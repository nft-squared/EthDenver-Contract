import { ethers, upgrades, waffle } from "hardhat";
//import { BigNumberish, utils, Wallet, BigNumber, constants } from "ethers";
import chai from "chai";
import { solidity } from "ethereum-waffle";
//import "@openzeppelin/test-helpers";

import { App } from "../helps/app"

chai.use(solidity);
const { expect } = chai;


type UnboxPromise<T> = T extends Promise<infer U> ? U: never;
type SignerWithAddress = UnboxPromise<ReturnType<(typeof ethers)['getSigner']>>


describe("NFT2", () => {
  before(async function () {
    const app = new App();
    await app.deployMock721s(["BAYC","MAYC"])
    await app.deployAll();
    this.app = app;
    const [admin, ipowner, user] = await ethers.getSigners();
    this.admin = admin;
    this.ipowner = ipowner;
    this.user = user;

    const IPToken = Object.values(app.MockERC721)[0]
    const IPTokenId = await app.MockNFTMint(IPToken, ipowner.address)
    this.IPTokenLocal = {token:IPToken.address, tokenId: IPTokenId}
    this.IPTokenCrossed = {token:IPToken.address, tokenId: Math.floor(Math.random()*10000)}
  });

  it("add shadow IPPools",async function () {
    const app = this.app as App
    const [admin, ipowner, user] = [this.admin, this.ipowner, this.user] as SignerWithAddress[]
    await app.deployIPPoolShadow([1666600000])

    const pools = Object.values(app.IPPoolShadows).map(ippool=>ippool.address);
    await app.NFT2.addIPPools(pools);
    for await (const chainId of pools.map(pool=>app.NFT2.ippools(pool))) {
      expect(chainId).gt(0)
    }
  })

  it("add IP into IPPoolLocal", async function () {
    const app = this.app as App
    const [admin, ipowner, user] = [this.admin, this.ipowner, this.user] as SignerWithAddress[]

    const {token, tokenId} = this.IPTokenLocal
    await app.IPPoolLocal.connect(ipowner).IPAdd(token, tokenId)
    const owner = await app.IPPoolLocal.ownerOf(token, tokenId)
    expect(owner.registedOwner == ipowner.address && owner.realOwner == ipowner.address, "ip owner check").equal(true)
  })
  it("add IP into IPPoolShadow", async function () {
    const app = this.app as App
    const [admin, ipowner, user] = [this.admin, this.ipowner, this.user] as SignerWithAddress[]
    
    const {token, tokenId} = this.IPTokenCrossed
    const IPPoolShadow = Object.values(app.IPPoolShadows)[0]
    await IPPoolShadow.IPAdd(token, tokenId, ipowner.address)
    const owner = await IPPoolShadow.ownerOf(token, tokenId)
    expect(owner.registedOwner == ipowner.address && owner.realOwner == ipowner.address, "ip owner check").equal(true)
  })

  it("register Demo Application", async function () {
    const app = this.app as App
    const [admin, ipowner, user] = [this.admin, this.ipowner, this.user] as SignerWithAddress[]
    await app.deployAPPDemo()
    await app.AppRegistry.register(app.APPDemo.address);
    const hasAPP = await app.AppRegistry.hasAPP(app.APPDemo.address)
    expect(hasAPP).equal(true)
  })

  it("mint derivative use IPPoolLocal", async function () {
    const app = this.app as App
    const [admin, ipowner, user] = [this.admin, this.ipowner, this.user] as SignerWithAddress[]   
    const {token, tokenId} = this.IPTokenLocal
    const tx = await app.NFT2.connect(user).mint(app.APPDemo.address, app.IPPoolLocal.address, token, tokenId, Buffer.alloc(0), "IPFS://TOKENURI", "IPFS://LICENSEURI")
    const receipt = await tx.wait()
    const MintEvent = receipt.events!.find(e=>e.event == 'Mint' && e.address == app.NFT2.address)
    expect(MintEvent!.args!.ippool).eq(app.IPPoolLocal.address)
    expect(MintEvent!.args!.token).eq(token)
    expect(MintEvent!.args!.tokenId).eq(tokenId)
    expect(MintEvent!.args!.owner).eq(ipowner.address)
    expect(MintEvent!.args!.licenser).eq(app.Licenser.address)
    //expect(MintEvent!.args!.licenseId).eq(app.IPPoolLocal.address)
    expect(MintEvent!.args!.app).eq(app.APPDemo.address)
    //expect(MintEvent!.args!.derivativeTokenId).eq(app.IPPoolLocal.address)
    expect(MintEvent!.args!.to).eq(user.address)
  })

  it("mint derivative use IPPoolShadow", async function () {
    const app = this.app as App
    const [admin, ipowner, user] = [this.admin, this.ipowner, this.user] as SignerWithAddress[]   
    const {token, tokenId} = this.IPTokenCrossed
    const IPPoolShadow = Object.values(app.IPPoolShadows)[0]
    const tx = await app.NFT2.connect(user).mint(app.APPDemo.address, IPPoolShadow.address, token, tokenId, Buffer.alloc(0), "IPFS://TOKENURI", "IPFS://LICENSEURI")
    const receipt = await tx.wait()
    const MintEvent = receipt.events!.find(e=>e.event == 'Mint' && e.address == app.NFT2.address)
    expect(MintEvent!.args!.ippool).eq(IPPoolShadow.address)
    expect(MintEvent!.args!.token).eq(token)
    expect(MintEvent!.args!.tokenId).eq(tokenId)
    expect(MintEvent!.args!.owner).eq(ipowner.address)
    expect(MintEvent!.args!.licenser).eq(app.Licenser.address)
    //expect(MintEvent!.args!.licenseId).eq(app.IPPoolLocal.address)
    expect(MintEvent!.args!.app).eq(app.APPDemo.address)
    //expect(MintEvent!.args!.derivativeTokenId).eq(app.IPPoolLocal.address)
    expect(MintEvent!.args!.to).eq(user.address)
  })
})
