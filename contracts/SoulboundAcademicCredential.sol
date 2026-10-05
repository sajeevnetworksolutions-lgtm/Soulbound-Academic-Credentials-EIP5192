// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IERC5192.sol";

/**
 * @title SoulboundAcademicCredential
 * @notice Decentralized, Non-Transferable Academic Credential Verification Platform
 *         utilizing EIP-5192 Soulbound Tokens, Role-Based Multi-Sig Authorization,
 *         and IPFS Decentralized Storage.
 * @dev Fully overrides ERC-721 transfer functions to enforce permanent non-transferability.
 */
contract SoulboundAcademicCredential is ERC721, AccessControl, Pausable, ReentrancyGuard, IERC5192 {

    // Custom Error Definitions for maximum gas efficiency
    error ErrSoulboundNonTransferable();
    error ErrUnauthorizedCaller();
    error ErrDegreeRevoked();
    error ErrDegreeNotFound();
    error ErrDegreeAlreadyValid();
    error ErrProposalAlreadyApproved();
    error ErrProposalNotApprovedByDean();
    error ErrProposalAlreadyExecuted();
    error ErrInvalidAddress();
    error ErrInvalidCertificateHash();
    error ErrArrayLengthMismatch();

    // Role Identifiers
    bytes32 public constant REGISTRAR_ROLE = keccak256("REGISTRAR_ROLE");
    bytes32 public constant DEAN_ROLE = keccak256("DEAN_ROLE");
    bytes32 public constant DISCIPLINARY_BOARD_ROLE = keccak256("DISCIPLINARY_BOARD_ROLE");

    // Interface ID for EIP-5192: 0xb45a3c0e
    bytes4 private constant _INTERFACE_ID_EIP5192 = 0xb45a3c0e;

    // Academic Credential Data Structure
    struct Credential {
        uint256 tokenId;
        address studentWallet;
        string studentName;
        string studentIdNumber;
        string degreeName;
        string majorSpecialization;
        string cgpa;
        uint256 graduationDate;
        string institutionName;
        string certificateHash; // SHA-256 hash of certificate PDF
        string ipfsCID;         // IPFS CID containing EIP-721 JSON metadata
        uint256 issuanceTimestamp;
        address issuedByRegistrar;
        bool isRevoked;
        string revocationReason;
        string revocationReasonHash;
        uint256 revocationTimestamp;
    }

    // Dual-Signature Proposal Structure (Registrar + Dean Authorization)
    struct MultiSigProposal {
        uint256 proposalId;
        address studentWallet;
        string studentName;
        string studentIdNumber;
        string degreeName;
        string majorSpecialization;
        string cgpa;
        uint256 graduationDate;
        string institutionName;
        string certificateHash;
        string ipfsCID;
        address proposedBy;
        uint256 proposedTimestamp;
        bool deanApproved;
        address approvedByDean;
        uint256 deanApprovalTimestamp;
        bool executed;
        uint256 mintedTokenId;
    }

    // State Variables
    uint256 private _nextTokenId = 1;
    uint256 private _nextProposalId = 1;

    // Storage Mappings
    mapping(uint256 => string) private _tokenURIs;
    mapping(uint256 => Credential) private _credentials;
    mapping(string => uint256) private _certificateHashToTokenId;
    mapping(address => uint256[]) private _studentTokenIds;
    mapping(uint256 => MultiSigProposal) private _proposals;
    uint256[] private _allTokenIds;
    uint256[] private _allProposalIds;

    // Events
    event DegreeIssued(
        uint256 indexed tokenId,
        address indexed studentWallet,
        string studentName,
        string degreeName,
        string certificateHash,
        string ipfsCID,
        address indexed issuedBy
    );

    event DegreeRevoked(
        uint256 indexed tokenId,
        address indexed studentWallet,
        string reasonHash,
        string reason,
        address indexed revokedBy,
        uint256 timestamp
    );

    event DegreeReinstated(
        uint256 indexed tokenId,
        address indexed studentWallet,
        string reason,
        address indexed reinstatedBy,
        uint256 timestamp
    );

    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed studentWallet,
        string studentName,
        string degreeName,
        address indexed proposedBy
    );

    event ProposalApprovedByDean(
        uint256 indexed proposalId,
        address indexed deanAddress,
        uint256 timestamp
    );

    event ProposalExecuted(
        uint256 indexed proposalId,
        uint256 indexed tokenId,
        address indexed studentWallet
    );

    constructor(
        string memory name_,
        string memory symbol_,
        address admin_,
        address registrar_,
        address dean_,
        address disciplinaryBoard_
    ) ERC721(name_, symbol_) {
        if (admin_ == address(0)) revert ErrInvalidAddress();
        
        address defaultRegistrar = registrar_ != address(0) ? registrar_ : admin_;
        address defaultDean = dean_ != address(0) ? dean_ : admin_;
        address defaultBoard = disciplinaryBoard_ != address(0) ? disciplinaryBoard_ : admin_;

        _grantRole(DEFAULT_ADMIN_ROLE, admin_);
        _grantRole(REGISTRAR_ROLE, defaultRegistrar);
        _grantRole(DEAN_ROLE, defaultDean);
        _grantRole(DISCIPLINARY_BOARD_ROLE, defaultBoard);
    }

    // =========================================================================
    // EIP-5192 Soulbound Token Non-Transferability Enforcement
    // =========================================================================

    /**
     * @notice Returns whether a token is locked (permanently soulbound).
     * @dev Compliant with EIP-5192 standard. Returns true for all valid minted tokens.
     */
    function locked(uint256 tokenId) external view override returns (bool) {
        if (_ownerOf(tokenId) == address(0)) {
            revert ErrDegreeNotFound();
        }
        return true;
    }

    /**
     * @dev Overrides ERC-721 _update to strictly block any transfers once minted.
     *      Only minting (from == address(0)) is permitted.
     */
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal virtual override whenNotPaused returns (address) {
        address from = _ownerOf(tokenId);

        // Allow minting (from == 0) and burning (to == 0). Block transfers.
        if (from != address(0) && to != address(0)) {
            revert ErrSoulboundNonTransferable();
        }

        return super._update(to, tokenId, auth);
    }

    /**
     * @dev Overrides approve to prevent approvals for Soulbound Tokens.
     */
    function approve(address /* to */, uint256 /* tokenId */) public virtual override {
        revert ErrSoulboundNonTransferable();
    }

    /**
     * @dev Overrides setApprovalForAll to prevent operator approvals for Soulbound Tokens.
     */
    function setApprovalForAll(address /* operator */, bool /* approved */) public virtual override {
        revert ErrSoulboundNonTransferable();
    }

    /**
     * @notice Returns token URI for metadata schema.
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        if (_ownerOf(tokenId) == address(0)) revert ErrDegreeNotFound();
        return _tokenURIs[tokenId];
    }

    // =========================================================================
    // Direct Issuance Logic (University Registrar)
    // =========================================================================

    function _issueDegreeCore(
        address studentWallet,
        string memory studentName,
        string memory studentIdNumber,
        string memory degreeName,
        string memory majorSpecialization,
        string memory cgpa,
        uint256 graduationDate,
        string memory institutionName,
        string memory certificateHash,
        string memory ipfsCID
    ) internal returns (uint256) {
        if (studentWallet == address(0)) revert ErrInvalidAddress();
        if (bytes(certificateHash).length == 0) revert ErrInvalidCertificateHash();

        uint256 tokenId = _nextTokenId++;

        // Mint token directly to student's soulbound wallet
        _safeMint(studentWallet, tokenId);
        _tokenURIs[tokenId] = ipfsCID;

        // Store complete academic credential record
        _credentials[tokenId] = Credential({
            tokenId: tokenId,
            studentWallet: studentWallet,
            studentName: studentName,
            studentIdNumber: studentIdNumber,
            degreeName: degreeName,
            majorSpecialization: majorSpecialization,
            cgpa: cgpa,
            graduationDate: graduationDate,
            institutionName: institutionName,
            certificateHash: certificateHash,
            ipfsCID: ipfsCID,
            issuanceTimestamp: block.timestamp,
            issuedByRegistrar: msg.sender,
            isRevoked: false,
            revocationReason: "",
            revocationReasonHash: "",
            revocationTimestamp: 0
        });

        _certificateHashToTokenId[certificateHash] = tokenId;
        _studentTokenIds[studentWallet].push(tokenId);
        _allTokenIds.push(tokenId);

        // Emit standard EIP-5192 Locked event
        emit Locked(tokenId);

        // Emit comprehensive issuance audit event
        emit DegreeIssued(
            tokenId,
            studentWallet,
            studentName,
            degreeName,
            certificateHash,
            ipfsCID,
            msg.sender
        );

        return tokenId;
    }

    function issueDegree(
        address studentWallet,
        string memory studentName,
        string memory studentIdNumber,
        string memory degreeName,
        string memory majorSpecialization,
        string memory cgpa,
        uint256 graduationDate,
        string memory institutionName,
        string memory certificateHash,
        string memory ipfsCID
    ) public onlyRole(REGISTRAR_ROLE) nonReentrant whenNotPaused returns (uint256) {
        return _issueDegreeCore(
            studentWallet,
            studentName,
            studentIdNumber,
            degreeName,
            majorSpecialization,
            cgpa,
            graduationDate,
            institutionName,
            certificateHash,
            ipfsCID
        );
    }

    function issueBatchDegrees(
        address[] memory studentWallets,
        string[] memory studentNames,
        string[] memory studentIdNumbers,
        string[] memory degreeNames,
        string[] memory majorSpecializations,
        string[] memory cgpas,
        uint256[] memory graduationDates,
        string[] memory institutionNames,
        string[] memory certificateHashes,
        string[] memory ipfsCIDs
    ) external onlyRole(REGISTRAR_ROLE) nonReentrant whenNotPaused returns (uint256[] memory) {
        uint256 batchSize = studentWallets.length;
        if (
            studentNames.length != batchSize ||
            studentIdNumbers.length != batchSize ||
            degreeNames.length != batchSize ||
            majorSpecializations.length != batchSize ||
            cgpas.length != batchSize ||
            graduationDates.length != batchSize ||
            institutionNames.length != batchSize ||
            certificateHashes.length != batchSize ||
            ipfsCIDs.length != batchSize
        ) {
            revert ErrArrayLengthMismatch();
        }

        uint256[] memory mintedIds = new uint256[](batchSize);

        for (uint256 i = 0; i < batchSize; i++) {
            mintedIds[i] = _issueDegreeCore(
                studentWallets[i],
                studentNames[i],
                studentIdNumbers[i],
                degreeNames[i],
                majorSpecializations[i],
                cgpas[i],
                graduationDates[i],
                institutionNames[i],
                certificateHashes[i],
                ipfsCIDs[i]
            );
        }

        return mintedIds;
    }

    // =========================================================================
    // Multi-Signature Authorization Handshake (Registrar + Dean)
    // =========================================================================

    function proposeDegreeIssuance(
        address studentWallet,
        string memory studentName,
        string memory studentIdNumber,
        string memory degreeName,
        string memory majorSpecialization,
        string memory cgpa,
        uint256 graduationDate,
        string memory institutionName,
        string memory certificateHash,
        string memory ipfsCID
    ) external onlyRole(REGISTRAR_ROLE) whenNotPaused returns (uint256) {
        if (studentWallet == address(0)) revert ErrInvalidAddress();
        if (bytes(certificateHash).length == 0) revert ErrInvalidCertificateHash();

        uint256 proposalId = _nextProposalId++;

        _proposals[proposalId] = MultiSigProposal({
            proposalId: proposalId,
            studentWallet: studentWallet,
            studentName: studentName,
            studentIdNumber: studentIdNumber,
            degreeName: degreeName,
            majorSpecialization: majorSpecialization,
            cgpa: cgpa,
            graduationDate: graduationDate,
            institutionName: institutionName,
            certificateHash: certificateHash,
            ipfsCID: ipfsCID,
            proposedBy: msg.sender,
            proposedTimestamp: block.timestamp,
            deanApproved: false,
            approvedByDean: address(0),
            deanApprovalTimestamp: 0,
            executed: false,
            mintedTokenId: 0
        });

        _allProposalIds.push(proposalId);

        emit ProposalCreated(proposalId, studentWallet, studentName, degreeName, msg.sender);
        return proposalId;
    }

    function approveProposalByDean(uint256 proposalId) external onlyRole(DEAN_ROLE) whenNotPaused {
        MultiSigProposal storage prop = _proposals[proposalId];
        if (prop.studentWallet == address(0)) revert ErrDegreeNotFound();
        if (prop.deanApproved) revert ErrProposalAlreadyApproved();
        if (prop.executed) revert ErrProposalAlreadyExecuted();

        prop.deanApproved = true;
        prop.approvedByDean = msg.sender;
        prop.deanApprovalTimestamp = block.timestamp;

        emit ProposalApprovedByDean(proposalId, msg.sender, block.timestamp);
    }

    function executeProposal(uint256 proposalId) external onlyRole(REGISTRAR_ROLE) nonReentrant whenNotPaused returns (uint256) {
        MultiSigProposal storage prop = _proposals[proposalId];
        if (prop.studentWallet == address(0)) revert ErrDegreeNotFound();
        if (!prop.deanApproved) revert ErrProposalNotApprovedByDean();
        if (prop.executed) revert ErrProposalAlreadyExecuted();

        prop.executed = true;

        uint256 tokenId = _issueDegreeCore(
            prop.studentWallet,
            prop.studentName,
            prop.studentIdNumber,
            prop.degreeName,
            prop.majorSpecialization,
            prop.cgpa,
            prop.graduationDate,
            prop.institutionName,
            prop.certificateHash,
            prop.ipfsCID
        );

        prop.mintedTokenId = tokenId;

        emit ProposalExecuted(proposalId, tokenId, prop.studentWallet);
        return tokenId;
    }

    // =========================================================================
    // Dynamic On-Chain Revocation Hooks (Disciplinary Board)
    // =========================================================================

    function revokeDegree(
        uint256 tokenId,
        string memory reasonHash,
        string memory reason
    ) external onlyRole(DISCIPLINARY_BOARD_ROLE) whenNotPaused {
        if (_ownerOf(tokenId) == address(0)) revert ErrDegreeNotFound();
        Credential storage cred = _credentials[tokenId];
        if (cred.isRevoked) revert ErrDegreeRevoked();

        cred.isRevoked = true;
        cred.revocationReason = reason;
        cred.revocationReasonHash = reasonHash;
        cred.revocationTimestamp = block.timestamp;

        emit DegreeRevoked(
            tokenId,
            cred.studentWallet,
            reasonHash,
            reason,
            msg.sender,
            block.timestamp
        );
    }

    function reinstateDegree(
        uint256 tokenId,
        string memory reason
    ) external onlyRole(DISCIPLINARY_BOARD_ROLE) whenNotPaused {
        if (_ownerOf(tokenId) == address(0)) revert ErrDegreeNotFound();
        Credential storage cred = _credentials[tokenId];
        if (!cred.isRevoked) revert ErrDegreeAlreadyValid();

        cred.isRevoked = false;
        cred.revocationReason = "";
        cred.revocationReasonHash = "";
        cred.revocationTimestamp = 0;

        emit DegreeReinstated(
            tokenId,
            cred.studentWallet,
            reason,
            msg.sender,
            block.timestamp
        );
    }

    // =========================================================================
    // 1-Click Zero-Gas Employer & Public Verification Views (< 1.5s latency)
    // =========================================================================

    function verifyDegree(
        address studentAddress,
        uint256 tokenId
    ) external view returns (
        bool isValid,
        bool isRevoked,
        Credential memory cred
    ) {
        address actualOwner = _ownerOf(tokenId);
        if (actualOwner == address(0)) {
            return (false, false, cred);
        }

        cred = _credentials[tokenId];
        bool ownerMatches = (actualOwner == studentAddress);
        isRevoked = cred.isRevoked;
        isValid = ownerMatches && !isRevoked;

        return (isValid, isRevoked, cred);
    }

    function verifyByCertificateHash(
        string memory certHash
    ) external view returns (
        bool exists,
        bool isValid,
        bool isRevoked,
        Credential memory cred
    ) {
        uint256 tokenId = _certificateHashToTokenId[certHash];
        if (tokenId == 0) {
            return (false, false, false, cred);
        }

        cred = _credentials[tokenId];
        exists = true;
        isRevoked = cred.isRevoked;
        isValid = !isRevoked;

        return (exists, isValid, isRevoked, cred);
    }

    function getCredential(uint256 tokenId) external view returns (Credential memory) {
        if (_ownerOf(tokenId) == address(0)) revert ErrDegreeNotFound();
        return _credentials[tokenId];
    }

    function getStudentCredentials(address student) external view returns (Credential[] memory) {
        uint256[] memory tokenIds = _studentTokenIds[student];
        Credential[] memory results = new Credential[](tokenIds.length);
        for (uint256 i = 0; i < tokenIds.length; i++) {
            results[i] = _credentials[tokenIds[i]];
        }
        return results;
    }

    function getAllProposals() external view returns (MultiSigProposal[] memory) {
        MultiSigProposal[] memory results = new MultiSigProposal[](_allProposalIds.length);
        for (uint256 i = 0; i < _allProposalIds.length; i++) {
            results[i] = _proposals[_allProposalIds[i]];
        }
        return results;
    }

    function getProposal(uint256 proposalId) external view returns (MultiSigProposal memory) {
        MultiSigProposal memory prop = _proposals[proposalId];
        if (prop.studentWallet == address(0)) revert ErrDegreeNotFound();
        return prop;
    }

    function totalIssuedCredentials() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    function getAllCredentials() external view returns (Credential[] memory) {
        Credential[] memory results = new Credential[](_allTokenIds.length);
        for (uint256 i = 0; i < _allTokenIds.length; i++) {
            results[i] = _credentials[_allTokenIds[i]];
        }
        return results;
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721, AccessControl) returns (bool) {
        return interfaceId == _INTERFACE_ID_EIP5192 || super.supportsInterface(interfaceId);
    }
}
