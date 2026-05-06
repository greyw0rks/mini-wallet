// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ContactBook
 * @author CeloWallet
 * @notice On-chain, per-wallet address book. Each wallet owns its own contacts.
 *         Contacts are stored on-chain so they're portable across devices and frontends.
 */
contract ContactBook {

    // ── Structs ───────────────────────────────────────────────────────────────

    struct Contact {
        string  name;       // Display name (max 50 chars)
        address wallet;     // Wallet address
        uint40  createdAt;  // Unix timestamp
    }

    // ── Storage ───────────────────────────────────────────────────────────────

    /// @dev owner → array of contacts
    mapping(address => Contact[]) private _contacts;

    // ── Events ────────────────────────────────────────────────────────────────

    event ContactAdded(address indexed owner, uint256 indexed index, string name, address wallet);
    event ContactUpdated(address indexed owner, uint256 indexed index, string name, address wallet);
    event ContactRemoved(address indexed owner, uint256 indexed index);

    // ── Errors ────────────────────────────────────────────────────────────────

    error NameTooLong();
    error ZeroAddress();
    error IndexOutOfBounds();
    error NameEmpty();
    error TooManyContacts();

    // ── Constants ─────────────────────────────────────────────────────────────

    uint256 public constant MAX_CONTACTS = 500;
    uint256 public constant MAX_NAME_LENGTH = 50;

    // ── Write ─────────────────────────────────────────────────────────────────

    /**
     * @notice Add a new contact to the caller's address book.
     * @param name  Display name for the contact.
     * @param wallet Address of the contact.
     */
    function addContact(string calldata name, address wallet) external {
        _validateContact(name, wallet);
        if (_contacts[msg.sender].length >= MAX_CONTACTS) revert TooManyContacts();

        uint256 idx = _contacts[msg.sender].length;
        _contacts[msg.sender].push(Contact({
            name:      name,
            wallet:    wallet,
            createdAt: uint40(block.timestamp)
        }));

        emit ContactAdded(msg.sender, idx, name, wallet);
    }

    /**
     * @notice Update an existing contact by index.
     * @param index Contact index in the caller's list.
     * @param name  New display name.
     * @param wallet New wallet address.
     */
    function updateContact(uint256 index, string calldata name, address wallet) external {
        _validateContact(name, wallet);
        if (index >= _contacts[msg.sender].length) revert IndexOutOfBounds();

        Contact storage c = _contacts[msg.sender][index];
        c.name   = name;
        c.wallet = wallet;

        emit ContactUpdated(msg.sender, index, name, wallet);
    }

    /**
     * @notice Remove a contact by index (swap-and-pop to avoid gaps).
     * @param index Contact index in the caller's list.
     */
    function removeContact(uint256 index) external {
        Contact[] storage list = _contacts[msg.sender];
        if (index >= list.length) revert IndexOutOfBounds();

        uint256 last = list.length - 1;
        if (index != last) {
            list[index] = list[last];
        }
        list.pop();

        emit ContactRemoved(msg.sender, index);
    }

    // ── Read ──────────────────────────────────────────────────────────────────

    /**
     * @notice Get all contacts for the caller.
     */
    function getContacts() external view returns (Contact[] memory) {
        return _contacts[msg.sender];
    }

    /**
     * @notice Get all contacts for any address (public address books are useful for dApps).
     */
    function getContactsOf(address owner) external view returns (Contact[] memory) {
        return _contacts[owner];
    }

    /**
     * @notice Get a single contact by index for the caller.
     */
    function getContact(uint256 index) external view returns (Contact memory) {
        if (index >= _contacts[msg.sender].length) revert IndexOutOfBounds();
        return _contacts[msg.sender][index];
    }

    /**
     * @notice Get the number of contacts the caller has.
     */
    function contactCount() external view returns (uint256) {
        return _contacts[msg.sender].length;
    }

    // ── Internal ──────────────────────────────────────────────────────────────

    function _validateContact(string calldata name, address wallet) internal pure {
        if (bytes(name).length == 0) revert NameEmpty();
        if (bytes(name).length > MAX_NAME_LENGTH) revert NameTooLong();
        if (wallet == address(0)) revert ZeroAddress();
    }
}
