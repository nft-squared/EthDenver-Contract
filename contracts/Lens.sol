// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract Lens is OwnableUpgradeable {
    struct Token {
        address token;
        uint256 tokenId;
    }
    mapping(address => mapping(uint256 => Token)) public orignal; // derivative,tokenID => IP
    mapping(address => mapping(uint256 => Token[])) public derivatives; // IP,IPTokenId => derivative[]
    address public NFT2;

    function initialize(address _NFT2) external initializer {
        OwnableUpgradeable.__Ownable_init();
        NFT2 = _NFT2;
    }

    modifier onlyNFT2() {
        require(msg.sender == NFT2 || msg.sender == owner(), "onlyNFT2");
        _;
    }

    function getDerivativesByIP(address token, uint256 tokenId) external view returns(Token[] memory){
        return derivatives[token][tokenId];
    }

    function getOriginIP(address token, uint256 tokenId) external view returns(Token memory) {
        return orignal[token][tokenId];
    }

    function mint(
        address ippool,
        address token,
        uint256 tokenId,
        address owner,
        address licenser,
        uint256 licenseId,
        address app,
        uint256 derivativeTokenId,
        address to
    ) external onlyNFT2 {
        orignal[app][derivativeTokenId] = Token(token, tokenId);
        derivatives[token][tokenId].push(Token(app, derivativeTokenId));
    }
}
