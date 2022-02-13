// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract MockERC721 is ERC721 {
    uint256 public totalSupply;
    constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol) {}

    function mint(address to) external {
        ERC721._mint(to, totalSupply++);
    }
}