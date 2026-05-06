// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BatchSender
 * @author CeloWallet
 * @notice Send native CELO or any ERC-20 token to multiple recipients in a single transaction.
 * @dev Deployed on Celo Mainnet. No fees taken — pure utility contract.
 */
contract BatchSender is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ── Events ────────────────────────────────────────────────────────────────

    event BatchNativeSent(
        address indexed sender,
        uint256 recipientCount,
        uint256 totalAmount
    );

    event BatchERC20Sent(
        address indexed sender,
        address indexed token,
        uint256 recipientCount,
        uint256 totalAmount
    );

    // ── Errors ────────────────────────────────────────────────────────────────

    error EmptyRecipients();
    error LengthMismatch();
    error TooManyRecipients();
    error InsufficientValue();
    error ZeroAddress();
    error ZeroAmount();
    error TransferFailed();

    // ── Constants ─────────────────────────────────────────────────────────────

    uint256 public constant MAX_RECIPIENTS = 200;

    // ── Native CELO Batch ─────────────────────────────────────────────────────

    /**
     * @notice Send different amounts of native CELO to multiple recipients.
     * @param recipients Array of recipient addresses.
     * @param amounts Array of amounts (in wei) corresponding to each recipient.
     */
    function batchSendNative(
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external payable nonReentrant {
        uint256 len = recipients.length;
        if (len == 0) revert EmptyRecipients();
        if (len > MAX_RECIPIENTS) revert TooManyRecipients();
        if (amounts.length != len) revert LengthMismatch();

        uint256 total = 0;
        for (uint256 i = 0; i < len; ) {
            total += amounts[i];
            unchecked { ++i; }
        }
        if (msg.value < total) revert InsufficientValue();

        for (uint256 i = 0; i < len; ) {
            if (recipients[i] == address(0)) revert ZeroAddress();
            if (amounts[i] == 0) revert ZeroAmount();

            (bool ok, ) = recipients[i].call{value: amounts[i]}("");
            if (!ok) revert TransferFailed();

            unchecked { ++i; }
        }

        // Refund any excess CELO
        uint256 refund = msg.value - total;
        if (refund > 0) {
            (bool ok, ) = msg.sender.call{value: refund}("");
            if (!ok) revert TransferFailed();
        }

        emit BatchNativeSent(msg.sender, len, total);
    }

    /**
     * @notice Send equal amounts of native CELO to multiple recipients.
     * @param recipients Array of recipient addresses.
     * @param amountEach Amount (in wei) to send to each recipient.
     */
    function batchSendNativeEqual(
        address[] calldata recipients,
        uint256 amountEach
    ) external payable nonReentrant {
        uint256 len = recipients.length;
        if (len == 0) revert EmptyRecipients();
        if (len > MAX_RECIPIENTS) revert TooManyRecipients();
        if (amountEach == 0) revert ZeroAmount();

        uint256 total = amountEach * len;
        if (msg.value < total) revert InsufficientValue();

        for (uint256 i = 0; i < len; ) {
            if (recipients[i] == address(0)) revert ZeroAddress();

            (bool ok, ) = recipients[i].call{value: amountEach}("");
            if (!ok) revert TransferFailed();

            unchecked { ++i; }
        }

        uint256 refund = msg.value - total;
        if (refund > 0) {
            (bool ok, ) = msg.sender.call{value: refund}("");
            if (!ok) revert TransferFailed();
        }

        emit BatchNativeSent(msg.sender, len, total);
    }

    // ── ERC-20 Batch ──────────────────────────────────────────────────────────

    /**
     * @notice Send different ERC-20 amounts to multiple recipients.
     * @dev Caller must approve this contract for at least `sum(amounts)` beforehand.
     * @param token ERC-20 token contract address.
     * @param recipients Array of recipient addresses.
     * @param amounts Array of token amounts corresponding to each recipient.
     */
    function batchSendERC20(
        address token,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external nonReentrant {
        uint256 len = recipients.length;
        if (len == 0) revert EmptyRecipients();
        if (len > MAX_RECIPIENTS) revert TooManyRecipients();
        if (amounts.length != len) revert LengthMismatch();
        if (token == address(0)) revert ZeroAddress();

        IERC20 erc20 = IERC20(token);
        uint256 total = 0;

        for (uint256 i = 0; i < len; ) {
            if (recipients[i] == address(0)) revert ZeroAddress();
            if (amounts[i] == 0) revert ZeroAmount();
            total += amounts[i];
            unchecked { ++i; }
        }

        // Pull total from sender upfront (single approval check)
        erc20.safeTransferFrom(msg.sender, address(this), total);

        for (uint256 i = 0; i < len; ) {
            erc20.safeTransfer(recipients[i], amounts[i]);
            unchecked { ++i; }
        }

        emit BatchERC20Sent(msg.sender, token, len, total);
    }

    /**
     * @notice Send equal ERC-20 amounts to multiple recipients.
     * @dev Caller must approve this contract for at least `amountEach * recipients.length`.
     */
    function batchSendERC20Equal(
        address token,
        address[] calldata recipients,
        uint256 amountEach
    ) external nonReentrant {
        uint256 len = recipients.length;
        if (len == 0) revert EmptyRecipients();
        if (len > MAX_RECIPIENTS) revert TooManyRecipients();
        if (token == address(0)) revert ZeroAddress();
        if (amountEach == 0) revert ZeroAmount();

        IERC20 erc20 = IERC20(token);
        uint256 total = amountEach * len;

        erc20.safeTransferFrom(msg.sender, address(this), total);

        for (uint256 i = 0; i < len; ) {
            if (recipients[i] == address(0)) revert ZeroAddress();
            erc20.safeTransfer(recipients[i], amountEach);
            unchecked { ++i; }
        }

        emit BatchERC20Sent(msg.sender, token, len, total);
    }

    // ── View ──────────────────────────────────────────────────────────────────

    /**
     * @notice Calculate total of an amounts array.
     */
    function sumAmounts(uint256[] calldata amounts) external pure returns (uint256 total) {
        for (uint256 i = 0; i < amounts.length; ) {
            total += amounts[i];
            unchecked { ++i; }
        }
    }
}
