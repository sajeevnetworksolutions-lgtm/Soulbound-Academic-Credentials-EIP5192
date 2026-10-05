// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title IERC5192 Minimal Soulbound NFTs
 * @dev See https://eips.ethereum.org/EIPS/eip-5192
 */
interface IERC5192 {
    /**
     * @notice Emitted when the locking status is changed to locked.
     * @dev If a token is minted and is already locked, this event MUST be emitted with tokenId.
     */
    event Locked(uint256 tokenId);

    /**
     * @notice Emitted when the locking status is changed to unlocked.
     */
    event Unlocked(uint256 tokenId);

    /**
     * @notice Returns the locking status of an Soulbound Token.
     * @dev SBTs assigned to an owner that cannot be transferred MUST return true.
     * @param tokenId The identifier for an NFT.
     */
    function locked(uint256 tokenId) external view returns (bool);
}
