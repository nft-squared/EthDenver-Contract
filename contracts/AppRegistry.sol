// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "./IPPool.sol";
import "./Licenser.sol";
import "./Application.sol";

/// @dev application registry/factory contract
contract AppRegistry is OwnableUpgradeable {
    event Register(address indexed app, uint256 indexed index);

    mapping(address => uint256) public appIndex;
    IAPP[] public apps;

    function initialize() external initializer {
        OwnableUpgradeable.__Ownable_init();
        register(IAPP(address(0))); // position 0 is reserved
    }

    /// @dev description? url?
    function register(IAPP app) public onlyOwner returns (uint256 index) {
        require(appIndex[address(app)] == 0, "app is registed");
        index = apps.length;
        apps.push(app);
        appIndex[address(app)] = index;
        emit Register(address(app), index);
        return index;
    }

    function hasAPP(IAPP app) external view returns(bool) {
        return appIndex[address(app)] > 0;
    }
}