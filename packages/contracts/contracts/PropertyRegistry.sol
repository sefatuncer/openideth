// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract PropertyRegistry is AccessControl, Pausable {
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");

    struct Property {
        address owner;
        bytes32 dataHash;
        bool isVerified;
        string uri;
        uint256 registeredAt;
    }

    uint256 private _nextPropertyId;
    mapping(uint256 => Property) private _properties;
    mapping(address => uint256[]) private _ownerProperties;

    event PropertyRegistered(uint256 indexed propertyId, address indexed owner, bytes32 dataHash, string uri);
    event PropertyVerified(uint256 indexed propertyId, address indexed verifier);
    event PropertyTransferred(uint256 indexed propertyId, address indexed from, address indexed to);

    constructor(address defaultAdmin) {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(VERIFIER_ROLE, defaultAdmin);
    }

    function registerProperty(bytes32 dataHash, string calldata uri) external whenNotPaused returns (uint256) {
        uint256 propertyId = _nextPropertyId++;
        _properties[propertyId] = Property({
            owner: msg.sender,
            dataHash: dataHash,
            isVerified: false,
            uri: uri,
            registeredAt: block.timestamp
        });
        _ownerProperties[msg.sender].push(propertyId);

        emit PropertyRegistered(propertyId, msg.sender, dataHash, uri);
        return propertyId;
    }

    function verifyProperty(uint256 propertyId) external onlyRole(VERIFIER_ROLE) {
        require(_properties[propertyId].registeredAt != 0, "Property does not exist");
        require(!_properties[propertyId].isVerified, "Already verified");

        _properties[propertyId].isVerified = true;
        emit PropertyVerified(propertyId, msg.sender);
    }

    function transferOwnership(uint256 propertyId, address newOwner) external whenNotPaused {
        require(newOwner != address(0), "Invalid new owner");
        Property storage prop = _properties[propertyId];
        require(prop.owner == msg.sender, "Not the owner");

        address oldOwner = prop.owner;
        prop.owner = newOwner;

        // Remove from old owner's list
        uint256[] storage oldList = _ownerProperties[oldOwner];
        for (uint256 i = 0; i < oldList.length; i++) {
            if (oldList[i] == propertyId) {
                oldList[i] = oldList[oldList.length - 1];
                oldList.pop();
                break;
            }
        }
        _ownerProperties[newOwner].push(propertyId);

        emit PropertyTransferred(propertyId, oldOwner, newOwner);
    }

    function getProperty(uint256 propertyId) external view returns (Property memory) {
        require(_properties[propertyId].registeredAt != 0, "Property does not exist");
        return _properties[propertyId];
    }

    function getPropertiesByOwner(address owner) external view returns (uint256[] memory) {
        return _ownerProperties[owner];
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}
