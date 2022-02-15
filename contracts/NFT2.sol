// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./Licenser.sol";
import "./IPPool.sol";
import "./Application.sol";
import "./AppRegistry.sol";

contract NFT2 is OwnableUpgradeable {
    event Mint(
        address indexed ippool,
        address indexed token,
        uint256 indexed tokenId,
        address owner,
        address licenser,
        uint256 licenseId,
        address app,
        uint256 derivativeTokenId,
        address to
    );
    event SetLicenseURI(
        uint256 indexed licenseId,
        string licenseURI
    );
    event SetDerivativeURI(
        address indexed token,
        uint256 indexed tokenId,
        string tokenURI
    );
    event AddIPPool(address ippool, uint256 chainId);
    mapping(address => uint256) public ippools; // ippool => chainId
    ILicenser public licenser;
    AppRegistry public appRegistry;

    function initialize(AppRegistry _appRegistry, ILicenser _licenser) external initializer {
        OwnableUpgradeable.__Ownable_init();
        licenser = _licenser;
        appRegistry = _appRegistry;
    }

    function addIPPools(IPPool[] calldata _ippools) external onlyOwner {
        for(uint256 i = 0; i < _ippools.length; i++) {
            IPPool ippool = _ippools[i];
            uint256 chainId = ippool.chainId();
            ippools[address(ippool)] = chainId;
            emit AddIPPool(address(ippool), chainId);
        }
    }

    /// @dev mint derivative
    /// @param app derivative token address
    /// @param ippool ipool address
    /// @param token token address of IP
    /// @param tokenId tokenId of IP
    /// @param data custom data used to mint derivative token
    /// @param tokenURI derivative tokenURI
    /// @param licenseURI licenseURI
    /// @return derivativeTokenId
    /// @return licenseId
    function mint(
        IAPP app,
        IPPool ippool,
        address token,
        uint256 tokenId,
        bytes calldata data,
        string calldata tokenURI,
        string calldata licenseURI
    ) external payable returns (uint256 derivativeTokenId, uint256 licenseId) {
        (derivativeTokenId, licenseId) = mint(app, ippool, token, tokenId, data);
        setLicenseURI(licenseId, licenseURI);
        setDerivativeURI(app, derivativeTokenId, tokenURI);
    }

    /// @dev mint derivative
    function mint(
        IAPP app,
        IPPool ippool,
        address token,
        uint256 tokenId,
        bytes memory data
    ) private returns (uint256 derivativeTokenId, uint256 licenseId) {
        require(appRegistry.hasAPP(app), "unregistered app");
        require(ippools[address(ippool)] > 0, "unsupported ippool");
        address realOwner;
        {
            address registedOwner;
            (registedOwner, realOwner) = ippool.ownerOf(token, tokenId);
            require(
                registedOwner != address(0) &&
                    (registedOwner == realOwner || msg.sender == realOwner),
                "unauthorized token"
            );
        }
        derivativeTokenId = app.mint{value:msg.value}(ippool, token, tokenId, msg.sender, data);
        licenseId = licenser.mint(
            ippool,
            token,
            tokenId,
            realOwner,
            address(app),
            derivativeTokenId,
            msg.sender
        );
        emit Mint(
            address(ippool),
            token,
            tokenId,
            realOwner,
            address(licenser),
            licenseId,
            address(app),
            derivativeTokenId,
            msg.sender
        );
    }

    /// @dev setLicenseURI
    function setLicenseURI(
        uint256 licenseId,
        string memory licenseURI
    ) private {
        licenser.setURI(licenseId, licenseURI);
        emit SetLicenseURI(licenseId, licenseURI);
    }

    /// @dev setDerivativeURI
    function setDerivativeURI(
        IAPP app,
        uint256 tokenId,
        string memory tokenURI
    ) private {
        app.setURI(tokenId, tokenURI);
        emit SetDerivativeURI(address(app), tokenId, tokenURI);
    }


}