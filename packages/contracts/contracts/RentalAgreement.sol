// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

contract RentalAgreement is AccessControl, Pausable {
    enum Status { Draft, Active, Terminated, Expired }

    struct Agreement {
        address landlord;
        address tenant;
        uint256 propertyId;
        uint256 monthlyRent;
        uint256 deposit;
        uint256 startDate;
        uint256 endDate;
        bytes32 documentHash;
        Status status;
        bool landlordSigned;
        bool tenantSigned;
    }

    uint256 private _nextAgreementId;
    mapping(uint256 => Agreement) private _agreements;

    event AgreementCreated(uint256 indexed agreementId, address indexed landlord, address indexed tenant, uint256 propertyId);
    event AgreementSigned(uint256 indexed agreementId, address indexed signer);
    event AgreementActivated(uint256 indexed agreementId);
    event AgreementTerminated(uint256 indexed agreementId, address indexed by, string reason);

    constructor(address defaultAdmin) {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
    }

    function createAgreement(
        address tenant,
        uint256 propertyId,
        uint256 monthlyRent,
        uint256 depositAmount,
        uint256 startDate,
        uint256 endDate,
        bytes32 documentHash
    ) external whenNotPaused returns (uint256) {
        require(tenant != address(0), "Invalid tenant");
        require(tenant != msg.sender, "Cannot rent to yourself");
        require(endDate > startDate, "Invalid dates");
        require(monthlyRent > 0, "Invalid rent");

        uint256 agreementId = _nextAgreementId++;
        _agreements[agreementId] = Agreement({
            landlord: msg.sender,
            tenant: tenant,
            propertyId: propertyId,
            monthlyRent: monthlyRent,
            deposit: depositAmount,
            startDate: startDate,
            endDate: endDate,
            documentHash: documentHash,
            status: Status.Draft,
            landlordSigned: false,
            tenantSigned: false
        });

        emit AgreementCreated(agreementId, msg.sender, tenant, propertyId);
        return agreementId;
    }

    function signAgreement(uint256 agreementId) external whenNotPaused {
        Agreement storage agreement = _agreements[agreementId];
        require(agreement.status == Status.Draft, "Not in draft status");
        require(msg.sender == agreement.landlord || msg.sender == agreement.tenant, "Not a party");

        if (msg.sender == agreement.landlord) {
            require(!agreement.landlordSigned, "Already signed");
            agreement.landlordSigned = true;
        } else {
            require(!agreement.tenantSigned, "Already signed");
            agreement.tenantSigned = true;
        }

        emit AgreementSigned(agreementId, msg.sender);

        if (agreement.landlordSigned && agreement.tenantSigned) {
            agreement.status = Status.Active;
            emit AgreementActivated(agreementId);
        }
    }

    function terminateAgreement(uint256 agreementId, string calldata reason) external {
        Agreement storage agreement = _agreements[agreementId];
        require(agreement.status == Status.Active, "Not active");
        require(
            msg.sender == agreement.landlord || msg.sender == agreement.tenant || hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Not authorized"
        );

        agreement.status = Status.Terminated;
        emit AgreementTerminated(agreementId, msg.sender, reason);
    }

    function verifyDocument(uint256 agreementId, bytes32 hash) external view returns (bool) {
        return _agreements[agreementId].documentHash == hash;
    }

    function getAgreement(uint256 agreementId) external view returns (Agreement memory) {
        return _agreements[agreementId];
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}
