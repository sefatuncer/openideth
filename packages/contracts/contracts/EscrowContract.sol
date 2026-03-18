// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract EscrowContract is AccessControl, Pausable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    bytes32 public constant ARBITRATOR_ROLE = keccak256("ARBITRATOR_ROLE");

    enum EscrowStatus { Active, Released, Refunded, Disputed }

    struct Escrow {
        address tenant;
        address landlord;
        uint256 amount;
        address token; // address(0) for ETH
        EscrowStatus status;
        uint256 createdAt;
        uint256 releaseTime;
    }

    uint256 private _nextEscrowId;
    mapping(uint256 => Escrow) private _escrows;
    mapping(address => uint256) private _pendingWithdrawals;

    event Deposited(uint256 indexed escrowId, address indexed tenant, address indexed landlord, uint256 amount, address token);
    event Released(uint256 indexed escrowId);
    event Refunded(uint256 indexed escrowId);
    event Disputed(uint256 indexed escrowId, address indexed by);
    event DisputeResolved(uint256 indexed escrowId, bool toTenant);
    event Withdrawn(address indexed to, uint256 amount);

    constructor(address defaultAdmin) {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(ARBITRATOR_ROLE, defaultAdmin);
    }

    function deposit(address landlord, uint256 releaseTime) external payable whenNotPaused returns (uint256) {
        require(msg.value > 0, "Must deposit ETH");
        require(landlord != address(0), "Invalid landlord");
        require(releaseTime > block.timestamp, "Release time must be in future");

        uint256 escrowId = _nextEscrowId++;
        _escrows[escrowId] = Escrow({
            tenant: msg.sender,
            landlord: landlord,
            amount: msg.value,
            token: address(0),
            status: EscrowStatus.Active,
            createdAt: block.timestamp,
            releaseTime: releaseTime
        });

        emit Deposited(escrowId, msg.sender, landlord, msg.value, address(0));
        return escrowId;
    }

    function depositToken(address landlord, address token, uint256 amount, uint256 releaseTime) external whenNotPaused returns (uint256) {
        require(amount > 0, "Must deposit tokens");
        require(landlord != address(0), "Invalid landlord");
        require(token != address(0), "Invalid token");
        require(releaseTime > block.timestamp, "Release time must be in future");

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);

        uint256 escrowId = _nextEscrowId++;
        _escrows[escrowId] = Escrow({
            tenant: msg.sender,
            landlord: landlord,
            amount: amount,
            token: token,
            status: EscrowStatus.Active,
            createdAt: block.timestamp,
            releaseTime: releaseTime
        });

        emit Deposited(escrowId, msg.sender, landlord, amount, token);
        return escrowId;
    }

    function release(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = _escrows[escrowId];
        require(escrow.status == EscrowStatus.Active, "Not active");
        require(msg.sender == escrow.landlord || hasRole(ARBITRATOR_ROLE, msg.sender), "Not authorized");
        require(block.timestamp >= escrow.releaseTime, "Release time not reached");

        escrow.status = EscrowStatus.Released;
        _creditWithdrawal(escrow.landlord, escrow.amount, escrow.token);
        emit Released(escrowId);
    }

    function refund(uint256 escrowId) external nonReentrant onlyRole(ARBITRATOR_ROLE) {
        Escrow storage escrow = _escrows[escrowId];
        require(escrow.status == EscrowStatus.Active || escrow.status == EscrowStatus.Disputed, "Cannot refund");

        escrow.status = EscrowStatus.Refunded;
        _creditWithdrawal(escrow.tenant, escrow.amount, escrow.token);
        emit Refunded(escrowId);
    }

    function dispute(uint256 escrowId) external {
        Escrow storage escrow = _escrows[escrowId];
        require(escrow.status == EscrowStatus.Active, "Not active");
        require(msg.sender == escrow.tenant || msg.sender == escrow.landlord, "Not a party");

        escrow.status = EscrowStatus.Disputed;
        emit Disputed(escrowId, msg.sender);
    }

    function resolveDispute(uint256 escrowId, bool toTenant) external nonReentrant onlyRole(ARBITRATOR_ROLE) {
        Escrow storage escrow = _escrows[escrowId];
        require(escrow.status == EscrowStatus.Disputed, "Not disputed");

        address recipient = toTenant ? escrow.tenant : escrow.landlord;
        escrow.status = toTenant ? EscrowStatus.Refunded : EscrowStatus.Released;
        _creditWithdrawal(recipient, escrow.amount, escrow.token);
        emit DisputeResolved(escrowId, toTenant);
    }

    function withdraw() external nonReentrant {
        uint256 amount = _pendingWithdrawals[msg.sender];
        require(amount > 0, "Nothing to withdraw");

        _pendingWithdrawals[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "ETH transfer failed");

        emit Withdrawn(msg.sender, amount);
    }

    function getEscrow(uint256 escrowId) external view returns (Escrow memory) {
        return _escrows[escrowId];
    }

    function getPendingWithdrawal(address account) external view returns (uint256) {
        return _pendingWithdrawals[account];
    }

    function _creditWithdrawal(address to, uint256 amount, address token) internal {
        if (token == address(0)) {
            _pendingWithdrawals[to] += amount;
        } else {
            IERC20(token).safeTransfer(to, amount);
        }
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }
}
