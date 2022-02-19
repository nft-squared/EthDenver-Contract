// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {IERC721Upgradeable as IERC721} from "@openzeppelin/contracts-upgradeable/token/ERC721/IERC721Upgradeable.sol";

/// @dev IP pool contract
abstract contract IPPool is OwnableUpgradeable {
    event IPAdded(
        address indexed token,
        uint256 indexed tokenId,
        address operator,
        address tokenOwner
    );
    event IPRemoved(
        address indexed token,
        uint256 indexed tokenId,
        address operator,
        address tokenOwner
    );
    mapping(bytes32 => address) public ips; // keccak256(token|tokenId) => tokenOwner
    struct IP {
        address token;
        uint256 tokenId;
    }
    IP[] public iplist;

    function ipLength() external view returns(uint256) {
        return iplist.length;
    }

    function allIP() external view returns(IP[] memory) {
        return iplist;
    }

    function ipKey(address token, uint256 tokenId)
        public
        pure
        returns (bytes32)
    {
        return keccak256(abi.encodePacked(token, tokenId));
    }

    function _IPAdd(
        address token,
        uint256 tokenId,
        address owner
    ) internal {
        bytes32 key = ipKey(token, tokenId);
        if(ips[key] == address(0)) {
            iplist.push(IP(token, tokenId));
        }
        ips[key] = owner;
        emit IPAdded(token, tokenId, msg.sender, owner);
    }

    function _IPRemove(address token, uint256 tokenId) internal {
        bytes32 key = ipKey(token, tokenId);
        address owner = ips[key];
        delete ips[key];
        emit IPRemoved(token, tokenId, msg.sender, owner);
    }

    function _ownerOf(address token, uint256 tokenId)
        internal
        view
        returns (address registedOwner)
    {
        bytes32 key = ipKey(token, tokenId);
        registedOwner = ips[key];
    }

    function _chainId() internal view returns (uint256) {
        uint256 _chainid;
        assembly {
            _chainid := chainid()
        }
        return _chainid;
    }

    function ownerOf(address token, uint256 tokenId)
        external
        view
        virtual
        returns (address registedOwner, address realOwner);

    function chainId() external view virtual returns (uint256);
}

contract IPPoolShadow is IPPool {
    uint256 public override chainId;

    function initialize(uint256 _chainId) external initializer {
        OwnableUpgradeable.__Ownable_init();
        require(_chainId != IPPool._chainId(), "wrong chainId");
        chainId = _chainId;
    }

    /// @dev  add crossed IP, called by owner
    function IPAdd(
        address token,
        uint256 tokenId,
        address owner
    ) external onlyOwner {
        IPPool._IPAdd(token, tokenId, owner);
    }

    /// @dev remove crossed IP, called by owner
    function IPRemove(address token, uint256 tokenId) external onlyOwner {
        IPPool._IPRemove(token, tokenId);
    }

    function ownerOf(address token, uint256 tokenId)
        external
        view
        override
        returns (address registedOwner, address realOwner)
    {
        registedOwner = realOwner = IPPool._ownerOf(token, tokenId);
    }
}

contract IPPoolLocal is IPPool {
    function initialize() external initializer {
        OwnableUpgradeable.__Ownable_init();
    }

    /// @dev  add token, called by user(IP owner)
    /// @param token token which want to add into IP pool
    /// @param tokenId tokenId
    function IPAdd(IERC721 token, uint256 tokenId) external {
        require(token.ownerOf(tokenId) == msg.sender, "only token owner");
        IPPool._IPAdd(address(token), tokenId, msg.sender);
    }

    /// @dev remove IP, called by user(IP owner)
    /// @param token token which want to remove from IP pool
    /// @param tokenId tokenId
    function IPRemove(IERC721 token, uint256 tokenId) external {
        require(token.ownerOf(tokenId) == msg.sender, "only token owner");
        IPPool._IPRemove(address(token), tokenId);
    }

    function ownerOf(address token, uint256 tokenId)
        external
        view
        override
        returns (address registedOwner, address realOwner)
    {
        registedOwner = IPPool._ownerOf(token, tokenId);
        realOwner = IERC721(token).ownerOf(tokenId);
    }

    function chainId() external view override returns (uint256) {
        return IPPool._chainId();
    }
}
