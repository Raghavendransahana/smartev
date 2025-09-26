// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

/**
 * @title BatteryLifecycleTracker
 * @dev Production-grade EV battery passport registry aligned with flexiEV API flows.
 */
contract BatteryLifecycleTracker is AccessControl, ReentrancyGuard {
    using EnumerableSet for EnumerableSet.Bytes32Set;

    // ------------------------------------------------------------
    // Roles
    // ------------------------------------------------------------
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    bytes32 public constant RECYCLER_ROLE = keccak256("RECYCLER_ROLE");
    bytes32 public constant STATION_ROLE = keccak256("STATION_ROLE");

    // ------------------------------------------------------------
    // Structs & Enums
    // ------------------------------------------------------------
    enum LifecyclePhase {
        Manufactured,
        Deployed,
        Maintenance,
        EndOfLife
    }

    enum RecyclingAction {
        None,
        Scheduled,
        InTransit,
        Received,
        Completed
    }

    struct Passport {
        bytes32 passportId;
        string serialNumber;
        bytes32 vehicleHash;
        bytes32 originHash;
        address manufacturer;
        address currentOwner;
        uint256 registeredAt;
        bool active;
    }

    struct OwnershipRecord {
        address from;
        address to;
        uint256 timestamp;
        bytes32 documentationHash;
    }

    struct CertificationRecord {
        bytes32 certificationHash;
        string category;
        address issuer;
        uint256 issuedAt;
    }

    struct LifecycleEventRecord {
        LifecyclePhase phase;
        bytes32 eventHash;
        uint256 timestamp;
        address actor;
    }

    struct SecondLifeRecord {
        bool exists;
        bool eligible;
        address issuer;
        bytes32 documentationHash;
        uint256 decidedAt;
    }

    struct RecyclingRecord {
        RecyclingAction action;
        address handler;
        bytes32 documentationHash;
        uint256 timestamp;
    }

    struct WarrantyClaim {
        bytes32 claimHash;
        address claimant;
        uint256 timestamp;
    }

    // ------------------------------------------------------------
    // Storage
    // ------------------------------------------------------------
    mapping(bytes32 => Passport) private passports;
    mapping(bytes32 => OwnershipRecord[]) private ownershipHistory;
    mapping(bytes32 => CertificationRecord[]) private certifications;
    mapping(bytes32 => LifecycleEventRecord[]) private lifecycleEvents;
    mapping(bytes32 => SecondLifeRecord) private secondLifeDecisions;
    mapping(bytes32 => RecyclingRecord[]) private recyclingHistory;
    mapping(bytes32 => WarrantyClaim[]) private warrantyClaims;
    mapping(address => EnumerableSet.Bytes32Set) private ownerToPassports;
    mapping(bytes32 => bytes32) private vinToPassport;

    // ------------------------------------------------------------
    // Events
    // ------------------------------------------------------------
    event PassportRegistered(
        bytes32 indexed passportId,
        string serialNumber,
        bytes32 indexed vehicleHash,
        address indexed manufacturer,
        address initialOwner,
        uint256 timestamp
    );

    event OwnershipRecorded(
        bytes32 indexed passportId,
        address indexed from,
        address indexed to,
        bytes32 documentationHash,
        uint256 timestamp
    );

    event CertificationStored(
        bytes32 indexed passportId,
        string category,
        bytes32 certificationHash,
        address indexed issuer,
        uint256 timestamp
    );

    event LifecycleEventLogged(
        bytes32 indexed passportId,
        LifecyclePhase phase,
        bytes32 eventHash,
        address indexed actor,
        uint256 timestamp
    );

    event SecondLifeDecisionRecorded(
        bytes32 indexed passportId,
        bool eligible,
        address indexed issuer,
        bytes32 documentationHash,
        uint256 timestamp
    );

    event RecyclingActionRecorded(
        bytes32 indexed passportId,
        RecyclingAction action,
        address indexed handler,
        bytes32 documentationHash,
        uint256 timestamp
    );

    event ChargingPaymentSettled(
        bytes32 indexed passportId,
        address indexed owner,
        address indexed station,
        uint256 amountWei,
        bytes32 sessionHash,
        uint256 timestamp
    );

    event WarrantyClaimLogged(
        bytes32 indexed passportId,
        bytes32 claimHash,
        address indexed claimant,
        uint256 timestamp
    );

    // ------------------------------------------------------------
    // Constructor
    // ------------------------------------------------------------
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MANUFACTURER_ROLE, msg.sender);
        _grantRole(AUDITOR_ROLE, msg.sender);
    }

    // ------------------------------------------------------------
    // Core Passport Functions
    // ------------------------------------------------------------
    function registerPassport(
        string calldata serialNumber,
        bytes32 vehicleHash,
        bytes32 originHash,
        address initialOwner
    ) external onlyRole(MANUFACTURER_ROLE) returns (bytes32 passportId) {
        require(bytes(serialNumber).length > 0, "Serial required");
        require(vehicleHash != bytes32(0), "Vehicle hash required");
        require(initialOwner != address(0), "Owner required");

        passportId = keccak256(abi.encodePacked(serialNumber, vehicleHash));
        require(passports[passportId].registeredAt == 0, "Passport exists");
        require(vinToPassport[vehicleHash] == 0, "Vehicle already linked");

        passports[passportId] = Passport({
            passportId: passportId,
            serialNumber: serialNumber,
            vehicleHash: vehicleHash,
            originHash: originHash,
            manufacturer: msg.sender,
            currentOwner: initialOwner,
            registeredAt: block.timestamp,
            active: true
        });

        ownershipHistory[passportId].push(
            OwnershipRecord({
                from: address(0),
                to: initialOwner,
                timestamp: block.timestamp,
                documentationHash: originHash
            })
        );

        ownerToPassports[initialOwner].add(passportId);
        vinToPassport[vehicleHash] = passportId;

        emit PassportRegistered(passportId, serialNumber, vehicleHash, msg.sender, initialOwner, block.timestamp);
    }

    function recordOwnershipTransfer(bytes32 passportId, address to, bytes32 documentationHash) external {
        Passport storage passport = _requireActivePassport(passportId);
        address owner = passport.currentOwner;
        require(owner == msg.sender || hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Unauthorized");
        require(to != address(0), "New owner required");

        passport.currentOwner = to;
        ownerToPassports[owner].remove(passportId);
        ownerToPassports[to].add(passportId);

        ownershipHistory[passportId].push(
            OwnershipRecord({
                from: owner,
                to: to,
                timestamp: block.timestamp,
                documentationHash: documentationHash
            })
        );

        emit OwnershipRecorded(passportId, owner, to, documentationHash, block.timestamp);
    }

    function addCertificationHash(bytes32 passportId, string calldata category, bytes32 certificationHash) external {
        _requireActivePassport(passportId);
        require(certificationHash != bytes32(0), "Hash required");
        require(
            hasRole(MANUFACTURER_ROLE, msg.sender) ||
                hasRole(AUDITOR_ROLE, msg.sender) ||
                hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Unauthorized"
        );

        certifications[passportId].push(
            CertificationRecord({
                certificationHash: certificationHash,
                category: category,
                issuer: msg.sender,
                issuedAt: block.timestamp
            })
        );

        emit CertificationStored(passportId, category, certificationHash, msg.sender, block.timestamp);
    }

    function logLifecycleEvent(bytes32 passportId, LifecyclePhase phase, bytes32 eventHash) external {
        Passport storage passport = _requireActivePassport(passportId);
        require(eventHash != bytes32(0), "Hash required");
        require(
            msg.sender == passport.currentOwner ||
                hasRole(MANUFACTURER_ROLE, msg.sender) ||
                hasRole(AUDITOR_ROLE, msg.sender) ||
                hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Unauthorized"
        );

        lifecycleEvents[passportId].push(
            LifecycleEventRecord({
                phase: phase,
                eventHash: eventHash,
                timestamp: block.timestamp,
                actor: msg.sender
            })
        );

        emit LifecycleEventLogged(passportId, phase, eventHash, msg.sender, block.timestamp);
    }

    function recordSecondLifeDecision(bytes32 passportId, bool eligible, bytes32 documentationHash) external {
        _requireActivePassport(passportId);
        require(
            hasRole(MANUFACTURER_ROLE, msg.sender) ||
                hasRole(AUDITOR_ROLE, msg.sender) ||
                hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Unauthorized"
        );

        secondLifeDecisions[passportId] = SecondLifeRecord({
            exists: true,
            eligible: eligible,
            issuer: msg.sender,
            documentationHash: documentationHash,
            decidedAt: block.timestamp
        });

        emit SecondLifeDecisionRecorded(passportId, eligible, msg.sender, documentationHash, block.timestamp);
    }

    function recordRecyclingAction(bytes32 passportId, RecyclingAction action, bytes32 documentationHash) external {
        Passport storage passport = _requireActivePassport(passportId);
        require(hasRole(RECYCLER_ROLE, msg.sender) || hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Unauthorized");

        recyclingHistory[passportId].push(
            RecyclingRecord({
                action: action,
                handler: msg.sender,
                documentationHash: documentationHash,
                timestamp: block.timestamp
            })
        );

        if (action == RecyclingAction.Completed) {
            passport.active = false;
            ownerToPassports[passport.currentOwner].remove(passportId);
            passport.currentOwner = address(0);
        }

        emit RecyclingActionRecorded(passportId, action, msg.sender, documentationHash, block.timestamp);
    }

    function settleChargingPayment(
        bytes32 passportId,
        address payable station,
        uint256 amountWei,
        bytes32 sessionHash
    ) external payable nonReentrant {
        Passport storage passport = _requireActivePassport(passportId);
        require(passport.currentOwner == msg.sender, "Only owner");
        require(hasRole(STATION_ROLE, station) || hasRole(DEFAULT_ADMIN_ROLE, station), "Station not approved");
        require(msg.value == amountWei, "Incorrect payment");
        require(sessionHash != bytes32(0), "Session hash required");

        (bool sent, ) = station.call{value: amountWei}("");
        require(sent, "Payment failed");

        emit ChargingPaymentSettled(passportId, msg.sender, station, amountWei, sessionHash, block.timestamp);
    }

    function recordWarrantyClaim(bytes32 passportId, bytes32 claimHash) external {
        Passport storage passport = _requireActivePassport(passportId);
        require(claimHash != bytes32(0), "Claim hash required");
        require(
            msg.sender == passport.currentOwner ||
                hasRole(MANUFACTURER_ROLE, msg.sender) ||
                hasRole(AUDITOR_ROLE, msg.sender) ||
                hasRole(DEFAULT_ADMIN_ROLE, msg.sender),
            "Unauthorized"
        );

        warrantyClaims[passportId].push(
            WarrantyClaim({
                claimHash: claimHash,
                claimant: msg.sender,
                timestamp: block.timestamp
            })
        );

        emit WarrantyClaimLogged(passportId, claimHash, msg.sender, block.timestamp);
    }

    // ------------------------------------------------------------
    // Views
    // ------------------------------------------------------------
    function getPassport(bytes32 passportId) external view returns (Passport memory) {
        return passports[passportId];
    }

    function getPassportByVehicle(bytes32 vehicleHash) external view returns (bytes32) {
        return vinToPassport[vehicleHash];
    }

    function getOwnershipHistory(bytes32 passportId) external view returns (OwnershipRecord[] memory) {
        return ownershipHistory[passportId];
    }

    function getCertifications(bytes32 passportId) external view returns (CertificationRecord[] memory) {
        return certifications[passportId];
    }

    function getLifecycleEvents(bytes32 passportId) external view returns (LifecycleEventRecord[] memory) {
        return lifecycleEvents[passportId];
    }

    function getSecondLifeRecord(bytes32 passportId) external view returns (SecondLifeRecord memory) {
        return secondLifeDecisions[passportId];
    }

    function getRecyclingHistory(bytes32 passportId) external view returns (RecyclingRecord[] memory) {
        return recyclingHistory[passportId];
    }

    function getWarrantyClaims(bytes32 passportId) external view returns (WarrantyClaim[] memory) {
        return warrantyClaims[passportId];
    }

    function getPassportsByOwner(address owner) external view returns (bytes32[] memory) {
        return ownerToPassports[owner].values();
    }

    // ------------------------------------------------------------
    // Internal helpers
    // ------------------------------------------------------------
    function _requireActivePassport(bytes32 passportId) private view returns (Passport storage passport) {
        passport = passports[passportId];
        require(passport.registeredAt != 0, "Passport missing");
        require(passport.active, "Passport inactive");
    }
}
