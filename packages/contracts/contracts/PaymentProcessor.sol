// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract PaymentProcessor is AccessControl, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct Payment {
        address payer;
        address payee;
        uint256 amount;
        address token; // address(0) for ETH
        uint256 agreementId;
        uint256 timestamp;
        uint256 platformFee;
    }

    uint256 public platformFeeBps; // basis points, max 1000 (10%)
    address public treasury;
    uint256 private _nextPaymentId;
    mapping(uint256 => Payment) private _payments;

    event RentPaid(uint256 indexed paymentId, address indexed payer, address indexed payee, uint256 amount, uint256 fee, address token, uint256 agreementId);
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);
    event TreasuryUpdated(address oldTreasury, address newTreasury);

    constructor(address defaultAdmin, address _treasury, uint256 _feeBps) {
        require(_treasury != address(0), "Invalid treasury");
        require(_feeBps <= 1000, "Fee too high");

        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        treasury = _treasury;
        platformFeeBps = _feeBps;
    }

    function payRent(uint256 agreementId, address payee) external payable nonReentrant whenNotPaused {
        require(msg.value > 0, "Must pay ETH");
        require(payee != address(0), "Invalid payee");

        uint256 fee = (msg.value * platformFeeBps) / 10000;
        uint256 netAmount = msg.value - fee;

        uint256 paymentId = _nextPaymentId++;
        _payments[paymentId] = Payment({
            payer: msg.sender,
            payee: payee,
            amount: msg.value,
            token: address(0),
            agreementId: agreementId,
            timestamp: block.timestamp,
            platformFee: fee
        });

        (bool payeeSent, ) = payable(payee).call{value: netAmount}("");
        require(payeeSent, "Payee transfer failed");

        if (fee > 0) {
            (bool feeSent, ) = payable(treasury).call{value: fee}("");
            require(feeSent, "Fee transfer failed");
        }

        emit RentPaid(paymentId, msg.sender, payee, msg.value, fee, address(0), agreementId);
    }

    function payRentToken(uint256 agreementId, address payee, address token, uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Must pay tokens");
        require(payee != address(0), "Invalid payee");
        require(token != address(0), "Invalid token");

        uint256 fee = (amount * platformFeeBps) / 10000;
        uint256 netAmount = amount - fee;

        IERC20(token).safeTransferFrom(msg.sender, payee, netAmount);
        if (fee > 0) {
            IERC20(token).safeTransferFrom(msg.sender, treasury, fee);
        }

        uint256 paymentId = _nextPaymentId++;
        _payments[paymentId] = Payment({
            payer: msg.sender,
            payee: payee,
            amount: amount,
            token: token,
            agreementId: agreementId,
            timestamp: block.timestamp,
            platformFee: fee
        });

        emit RentPaid(paymentId, msg.sender, payee, amount, fee, token, agreementId);
    }

    function setPlatformFee(uint256 feeBps) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(feeBps <= 1000, "Fee too high");
        uint256 oldFee = platformFeeBps;
        platformFeeBps = feeBps;
        emit PlatformFeeUpdated(oldFee, feeBps);
    }

    function setTreasury(address newTreasury) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newTreasury != address(0), "Invalid treasury");
        address oldTreasury = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(oldTreasury, newTreasury);
    }

    function getPayment(uint256 paymentId) external view returns (Payment memory) {
        return _payments[paymentId];
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}
