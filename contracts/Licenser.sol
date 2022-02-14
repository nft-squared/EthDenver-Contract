// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {IERC721Upgradeable as IERC721} from "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "./IPPool.sol";

interface ILicenser is IERC721 {
    function mint(
        IPPool ippool,
        address token,
        uint256 tokenId,
        address owner,
        address app,
        uint256 derivativeTokenId,
        address to
    ) external returns (uint256 licenseId);

    function setURI(uint256 licenseId, string calldata uri) external;
}

/// @dev licenser contract
contract Licenser is ILicenser, ERC721Upgradeable, OwnableUpgradeable {
    event Revoke(uint256 indexed licenseId, address indexed issuer);
    uint256 public totalSupply;
    mapping(uint256 => string) _tokenURI;
    mapping(uint256 => bytes32) public licenseHashes;

    function initialize() external initializer {
        OwnableUpgradeable.__Ownable_init();
        ERC721Upgradeable.__ERC721_init("License", "License");
    }

    function licenseHash(
        address ippool,
        address token,
        uint256 tokenId,
        address derivativeToken,
        uint256 derivativeTokenId
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(ippool, token, tokenId, derivativeToken, derivativeTokenId));
    }

    function mint(
        IPPool ippool,
        address token,
        uint256 tokenId,
        address owner,
        address app,
        uint256 derivativeTokenId,
        address to
    ) external override onlyOwner returns (uint256 licenseId) {
        owner;
        to; // record?
        licenseId = totalSupply++;
        ERC721Upgradeable._mint(app, licenseId);
        licenseHashes[licenseId] = licenseHash(address(ippool), token, tokenId, app, derivativeTokenId);
    }

    function revoke(
        uint256 licenseId,
        address ippool,
        address token,
        uint256 tokenId,
        address derivativeToken,
        uint256 derivativeTokenId) external {
        bytes32 _hash = licenseHash(ippool, token, tokenId, derivativeToken, derivativeTokenId);
        require(licenseHashes[licenseId] == _hash, "invalid license");
        (,address tokenOwner) = IPPool(ippool).ownerOf(token, tokenId);
        require(msg.sender == tokenOwner, "only token owner");
        _tokenURI[licenseId] = "revoke";
        emit Revoke(licenseId, msg.sender);
    }

    function setURI(uint256 licenseId, string calldata uri)
        external
        override
        onlyOwner
    {
        require(ERC721Upgradeable._exists(licenseId), "nonexistent token");
        string memory oldURI = _tokenURI[licenseId];
        if(bytes(oldURI).length > 0) revert(oldURI);
        require(bytes(oldURI).length == 0, "licenser:uri not emtpy");
        _tokenURI[licenseId] = uri;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        return _tokenURI[tokenId];
    }

    /// @dev license transfer is forbidden
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal pure override {
        to;tokenId; // kill compile warnings.
        require(from == address(0), "only mint");
    }
}
