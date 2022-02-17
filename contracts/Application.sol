// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { IERC721Upgradeable as IERC721 } from "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721EnumerableUpgradeable.sol";
import "./IPPool.sol";

interface IAPP is IERC721 {
    function mint(
        IPPool ippool,
        address token,
        uint256 tokenId,
        address to,
        bytes calldata data
    ) external payable returns (uint256 derivativeTokenId);

    function setURI(uint256 tokenId, string calldata uri) external;
}
/// @dev demo of Application/service
contract APPDemo is IAPP, ERC721EnumerableUpgradeable, OwnableUpgradeable {
    mapping(uint256 => string) _tokenURI;
    address public NFT2;

    function initialize(address _NFT2) external initializer {
        OwnableUpgradeable.__Ownable_init();
        ERC721Upgradeable.__ERC721_init("APPDemo", "APPDemo");
        NFT2 = _NFT2;
    }

    modifier onlyNFT2() {
        require(msg.sender == NFT2, "onlyNFT2");
        _;
    }
    /// @dev mint a derivative token, called by NFT2
    function mint(
        IPPool ippool,
        address token,
        uint256 tokenId,
        address to,
        bytes calldata data
    ) external payable override onlyNFT2 returns (uint256 derivativeTokenId) {
        ippool;
        token;
        tokenId;
        data;
        derivativeTokenId = totalSupply();
        ERC721Upgradeable._mint(to, derivativeTokenId);
    }

    /// @dev set token URI, called by owner
    function setURI(uint256 tokenId, string calldata uri)
        external
        override
        onlyNFT2
    {
        require(ERC721Upgradeable._exists(tokenId), "nonexistent token");
        string memory oldURI = _tokenURI[tokenId];
        require(bytes(oldURI).length == 0, "APP:uri not emtpy");
        _tokenURI[tokenId] = uri;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        return _tokenURI[tokenId];
    }
}