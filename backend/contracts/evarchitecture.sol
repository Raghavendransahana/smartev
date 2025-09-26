// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;



import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol"; 
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title BatteryLifecycleTracker
 * @dev Smart contract for tracking EV battery lifecycle with passport-based identity and role-based permissions
 */
contract BatteryLifecycleTracker is AccessControl, ReentrancyGuard, EIP712 {
    using EnumerableSet for EnumerableSet.Bytes32Set;
    // -------------------- Roles --------------------
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    bytes32 public constant RECYCLER_ROLE = keccak256("RECYCLER_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    bytes32 public constant IOT_DEVICE_ROLE = keccak256("IOT_DEVICE_ROLE");

    // -------------------- Counters --------------------
    uint256 private _eventIdCounter;
    uint256 private _passportCounter; // Counter for total passports issued
    uint256 private _batteryIdCounter; // legacy numeric battery id counter

    // -------------------- Types --------------------
    enum BatteryStatus {
        Manufactured,
        InUse,
        MaintenanceRequired,
        SecondLife,
        Recycling,
        Recycled
    }

    enum EventType {
        Registration,
        OwnershipTransfer,
        Maintenance,
        TelemetryAlert,
        StatusChange,
        ComplianceCheck,
        Recycling
    }

    struct BatteryMetadata {
        string serialNumber;
        string manufacturer;
        uint256 manufactureDate;
        string chemistryType;
        uint256 initialCapacity; // mAh
        uint256 nominalVoltage; // mV
        string[] materials;
        uint256 carbonFootprint; // kg CO2e
        string[] complianceLabels;
        bool isActive;
        // --- Additive fields for secondary usage ---
        bool repurposeEligibility;
        string secondaryUsageType; // enum as string: stationary_storage, LMT_backup, other
        string certificationIssuer;
        uint256 certificationDate;
        string certificationId;
        string responsibilityTransferEntity;
        uint256 responsibilityTransferTimestamp;
    }

    struct TelemetryData {
        uint256 stateOfCharge; // 0-100
        uint256 stateOfHealth; // 0-100
        int256 temperature; // Celsius * 100
        uint256 cycleCount;
        uint256 lastUpdateTimestamp;
        uint256 lastServiceDate;
        bool maintenanceRequired;
        bool criticalAlert;
    }

    struct TelemetrySubmission {
        bytes32 passportId;
        uint256 stateOfCharge;
        uint256 stateOfHealth;
        int256 temperature;
        uint256 cycleCount;
        uint256 nonce;
        uint256 deadline;
    }

    struct LifecycleEvent {
        uint256 eventId;
        EventType eventType;
        uint256 timestamp;
        address initiator;
        string description;
        bytes32 dataHash;
        bool isVerified;
    }

    struct Battery {
        bytes32 passportId;
        BatteryMetadata metadata;
        TelemetryData telemetry;
        BatteryStatus status;
        address currentOwner;
        uint256 registrationTimestamp;
        uint256[] eventHistory;
        mapping(bytes32 => string) additionalData; // key = keccak256(abi.encodePacked(humanReadableKey))
    }

    // -------------------- Storage --------------------
    mapping(bytes32 => Battery) private batteries; // passportId => Battery
    mapping(string => bytes32) public serialNumberToPassportId; // serialNumber => passportId (bytes32(0) means unregistered)
    mapping(uint256 => LifecycleEvent) public lifecycleEvents; // eventId => event
    mapping(address => EnumerableSet.Bytes32Set) private ownerToPassports; // owner => passportIds set
    mapping(uint256 => bytes32) private eventToPassport; // eventId => passportId
    mapping(address => uint256) private deviceNonces; // device signer => nonce

    // Legacy mapping: stable legacy numeric battery ID -> passportId
    mapping(uint256 => bytes32) public legacyIdToPassportId;
    mapping(bytes32 => uint256) public passportIdToLegacyId;

    // -------------------- Constants --------------------
    bytes32 private constant _TELEMETRY_TYPEHASH = keccak256(
        "TelemetrySubmission(bytes32 passportId,uint256 stateOfCharge,uint256 stateOfHealth,int256 temperature,uint256 cycleCount,uint256 nonce,uint256 deadline)"
    );

    // -------------------- Events --------------------
    event PassportIssued(bytes32 indexed passportId, string serialNumber, address indexed manufacturer, uint256 timestamp);
    event TelemetryUpdated(bytes32 indexed passportId, uint256 stateOfCharge, uint256 stateOfHealth, int256 temperature, uint256 chargeCycles, uint256 timestamp);
    event StatusChanged(bytes32 indexed passportId, BatteryStatus oldStatus, BatteryStatus newStatus, uint256 timestamp);
    event OwnershipTransferred(bytes32 indexed passportId, address indexed previousOwner, address indexed newOwner, uint256 timestamp);
    event OwnershipRemoved(bytes32 indexed passportId, address indexed previousOwner, uint256 timestamp);
    event LifecycleEventRecorded(bytes32 indexed passportId, uint256 indexed eventId, EventType eventType, address indexed initiator, uint256 timestamp);
    event LifecycleEventVerified(bytes32 indexed passportId, uint256 indexed eventId, address indexed verifier, uint256 timestamp);
    event ComplianceValidated(bytes32 indexed passportId, string complianceType, bool isCompliant, uint256 timestamp);
    event PassportDeactivated(bytes32 indexed passportId, uint256 timestamp);

    // Legacy event for backward compatibility
    event BatteryRegistered(uint256 indexed batteryId, string serialNumber, address indexed manufacturer, uint256 timestamp);

    // --- New events for secondary usage ---
    event RepurposeDecision(bytes32 indexed passportId, bool eligible, uint256 soh, uint256 timestamp);
    event OperatorHandoff(bytes32 indexed passportId, string entityId, uint256 timestamp);
    event CertificationValidation(bytes32 indexed passportId, string issuer, uint256 date, string certificateId);

    // -------------------- Constructor --------------------
    constructor() EIP712("BatteryLifecycleTracker", "1") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MANUFACTURER_ROLE, msg.sender);
        _grantRole(AUDITOR_ROLE, msg.sender);
    }

    // -------------------- Core Functions --------------------

    /**
     * @dev Issue a new battery passport (replaces registerBattery)
     * Note: manufacturer must have MANUFACTURER_ROLE
     */
    function issuePassport(
        string memory _serialNumber,
        string memory _manufacturer,
        string memory _chemistryType,
        uint256 _initialCapacity,
        uint256 _nominalVoltage,
        string[] calldata _materials,
        uint256 _carbonFootprint,
        string[] calldata _complianceLabels
    ) external onlyRole(MANUFACTURER_ROLE) nonReentrant returns (bytes32) {
        // Use internal implementation so legacy register path can call it without external call problems
        return _issuePassportInternal(
            msg.sender, 
            _serialNumber, 
            _manufacturer, 
            _chemistryType, 
            _initialCapacity, 
            _nominalVoltage, 
            _materials, 
            _carbonFootprint, 
            _complianceLabels
        );
    }

    /**
     * @dev Legacy register path that returns a numeric batteryId (stable)
     */
    function registerBattery(
        string memory _serialNumber,
        string memory _manufacturer,
        string memory _chemistryType,
        uint256 _initialCapacity,
        uint256 _nominalVoltage,
        string[] calldata _materials,
        uint256 _carbonFootprint,
        string[] calldata _complianceLabels
    ) external onlyRole(MANUFACTURER_ROLE) nonReentrant returns (uint256) {
        // Issue passport using caller as manufacturer
        bytes32 passportId = _issuePassportInternal(
            msg.sender, 
            _serialNumber, 
            _manufacturer, 
            _chemistryType, 
            _initialCapacity, 
            _nominalVoltage, 
            _materials, 
            _carbonFootprint, 
            _complianceLabels
        );

        // Create stable legacy numeric ID
        _batteryIdCounter++;
        uint256 legacyId = _batteryIdCounter;

        legacyIdToPassportId[legacyId] = passportId;
        passportIdToLegacyId[passportId] = legacyId;

        // Emit legacy event with stable numeric ID
        emit BatteryRegistered(legacyId, _serialNumber, msg.sender, block.timestamp);

        return legacyId;
    }

    /**
     * @dev Internal shared passport issuance implementation
     */
    function _issuePassportInternal(
        address issuer,
        string memory _serialNumber,
        string memory _manufacturer,
        string memory _chemistryType,
        uint256 _initialCapacity,
        uint256 _nominalVoltage,
        string[] calldata _materials,
        uint256 _carbonFootprint,
        string[] calldata _complianceLabels
    ) internal returns (bytes32) {
        require(bytes(_serialNumber).length > 0, "Serial number cannot be empty");
        require(serialNumberToPassportId[_serialNumber] == bytes32(0), "Battery already has passport");

        // Increment counter before generation to embed updated value
        _passportCounter += 1;
        bytes32 passportId = keccak256(abi.encodePacked(_serialNumber, _manufacturer, block.timestamp, issuer, _passportCounter));

        // Initialize storage struct (mapping in struct is fine in storage)
        Battery storage newBattery = batteries[passportId];
        newBattery.passportId = passportId;
        newBattery.metadata.serialNumber = _serialNumber;
        newBattery.metadata.manufacturer = _manufacturer;
        newBattery.metadata.manufactureDate = block.timestamp;
        newBattery.metadata.chemistryType = _chemistryType;
        newBattery.metadata.initialCapacity = _initialCapacity;
        newBattery.metadata.nominalVoltage = _nominalVoltage;
        newBattery.metadata.carbonFootprint = _carbonFootprint;
        newBattery.metadata.isActive = true;

        // Explicitly copy calldata arrays to storage
        uint256 materialsLength = _materials.length;
        for (uint256 i = 0; i < materialsLength;) {
            newBattery.metadata.materials.push(_materials[i]);
            unchecked { ++i; }
        }
        
        uint256 labelsLength = _complianceLabels.length;
        for (uint256 i = 0; i < labelsLength;) {
            newBattery.metadata.complianceLabels.push(_complianceLabels[i]);
            unchecked { ++i; }
        }

        newBattery.status = BatteryStatus.Manufactured;
        newBattery.currentOwner = issuer;
        newBattery.registrationTimestamp = block.timestamp;

        serialNumberToPassportId[_serialNumber] = passportId;
        ownerToPassports[issuer].add(passportId);

        // record registration lifecycle event
        bytes32 dataHash = keccak256(abi.encodePacked(_serialNumber, _manufacturer, block.timestamp));
        _recordLifecycleEvent(passportId, EventType.Registration, "Battery passport issued", dataHash, issuer);

        emit PassportIssued(passportId, _serialNumber, issuer, block.timestamp);

        return passportId;
    }

    /**
     * @dev Update telemetry data for a battery
     */
    function updateTelemetry(
        bytes32 _passportId,
        uint256 _stateOfCharge,
        uint256 _stateOfHealth,
        int256 _temperature,
        uint256 _cycleCount
    ) public onlyRole(IOT_DEVICE_ROLE) {
        _applyTelemetryUpdate(
            _passportId,
            _stateOfCharge,
            _stateOfHealth,
            _temperature,
            _cycleCount,
            msg.sender
        );
    }

    function submitTelemetry(TelemetrySubmission calldata submission, bytes calldata signature) external nonReentrant {
        require(submission.deadline == 0 || block.timestamp <= submission.deadline, "Telemetry signature expired");

        address signer = _recoverTelemetrySigner(submission, signature);
        require(signer != address(0), "Invalid telemetry signature");
        require(hasRole(IOT_DEVICE_ROLE, signer), "Telemetry signer not authorized");

        require(submission.nonce == deviceNonces[signer], "Invalid telemetry nonce");
        deviceNonces[signer] += 1;

        _applyTelemetryUpdate(
            submission.passportId,
            submission.stateOfCharge,
            submission.stateOfHealth,
            submission.temperature,
            submission.cycleCount,
            signer
        );
    }

    /**
     * @dev Legacy updateTelemetry function for backward compatibility
     * Uses legacyIdToPassportId mapping to find passportId.
     */
    function updateTelemetryLegacy(
        uint256 _batteryId,
        uint256 _stateOfCharge,
        uint256 _stateOfHealth,
        int256 _temperature,
        uint256 _cycleCount
    ) external onlyRole(IOT_DEVICE_ROLE) {
        bytes32 passportId = legacyIdToPassportId[_batteryId];
        require(passportId != bytes32(0), "Legacy batteryId not found");
        updateTelemetry(passportId, _stateOfCharge, _stateOfHealth, _temperature, _cycleCount);
    }

    /**
     * @dev Transfer ownership of a battery
     */
    function transferOwnership(bytes32 _passportId, address _newOwner) public {
        require(_passportExists(_passportId), "Battery passport does not exist");
        require(_newOwner != address(0), "Invalid new owner address");

        Battery storage battery = batteries[_passportId];
        require(battery.metadata.isActive, "Battery passport inactive");
        require(battery.currentOwner == msg.sender || hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Not authorized");

        address previousOwner = battery.currentOwner;
        battery.currentOwner = _newOwner;

        _removeFromOwnerList(previousOwner, _passportId);
        ownerToPassports[_newOwner].add(_passportId);

        _recordLifecycleEvent(
            _passportId,
            EventType.OwnershipTransfer,
            "Ownership transferred",
            keccak256(abi.encodePacked(_passportId, previousOwner, _newOwner, block.timestamp)),
            msg.sender
        );

        emit OwnershipTransferred(_passportId, previousOwner, _newOwner, block.timestamp);
    }

    /**
     * @dev Legacy transferOwnership function for backward compatibility
     */
    function transferOwnershipLegacy(uint256 _batteryId, address _newOwner) external {
        bytes32 passportId = legacyIdToPassportId[_batteryId];
        require(passportId != bytes32(0), "Legacy batteryId not found");
        transferOwnership(passportId, _newOwner);
    }

    /**
     * @dev Change battery status
     */
    function changeBatteryStatus(bytes32 _passportId, BatteryStatus _newStatus) public {
        require(_passportExists(_passportId), "Battery passport does not exist");

        Battery storage battery = batteries[_passportId];
        require(battery.metadata.isActive, "Battery passport inactive");
        require(battery.currentOwner == msg.sender || hasRole(DEFAULT_ADMIN_ROLE, msg.sender) || hasRole(RECYCLER_ROLE, msg.sender), "Not authorized");

        BatteryStatus oldStatus = battery.status;
        battery.status = _newStatus;

        _recordLifecycleEvent(
            _passportId,
            EventType.StatusChange,
            string(abi.encodePacked("Status changed from ", _statusToString(oldStatus), " to ", _statusToString(_newStatus))),
            keccak256(abi.encodePacked(_passportId, uint256(oldStatus), uint256(_newStatus), block.timestamp)),
            msg.sender
        );

        emit StatusChanged(_passportId, oldStatus, _newStatus, block.timestamp);
    }

    /**
     * @dev Legacy changeBatteryStatus function for backward compatibility
     */
    function changeBatteryStatusLegacy(uint256 _batteryId, BatteryStatus _newStatus) external {
        bytes32 passportId = legacyIdToPassportId[_batteryId];
        require(passportId != bytes32(0), "Legacy batteryId not found");
        changeBatteryStatus(passportId, _newStatus);
    }

    /**
     * @dev Validate compliance for a battery
     */
    function validateCompliance(bytes32 _passportId, string memory _complianceType, bool _isCompliant) public onlyRole(AUDITOR_ROLE) {
        require(_passportExists(_passportId), "Battery passport does not exist");

        Battery storage battery = batteries[_passportId];
        require(battery.metadata.isActive, "Battery passport inactive");

        _recordLifecycleEvent(
            _passportId,
            EventType.ComplianceCheck,
            string(abi.encodePacked(_complianceType, " compliance: ", _isCompliant ? "PASS" : "FAIL")),
            keccak256(abi.encodePacked(_passportId, _complianceType, _isCompliant, block.timestamp)),
            msg.sender
        );

        emit ComplianceValidated(_passportId, _complianceType, _isCompliant, block.timestamp);
    }

    /**
     * @dev Legacy validateCompliance function for backward compatibility
     */
    function validateComplianceLegacy(uint256 _batteryId, string memory _complianceType, bool _isCompliant) external onlyRole(AUDITOR_ROLE) {
        bytes32 passportId = legacyIdToPassportId[_batteryId];
        require(passportId != bytes32(0), "Legacy batteryId not found");
        validateCompliance(passportId, _complianceType, _isCompliant);
    }

    function verifyLifecycleEvent(uint256 _eventId) external onlyRole(AUDITOR_ROLE) {
        bytes32 passportId = eventToPassport[_eventId];
        require(passportId != bytes32(0), "Lifecycle event not found");

        LifecycleEvent storage lifecycleEvent = lifecycleEvents[_eventId];
        require(!lifecycleEvent.isVerified, "Lifecycle event already verified");

        lifecycleEvent.isVerified = true;

        emit LifecycleEventVerified(passportId, _eventId, msg.sender, block.timestamp);
    }

    /**
     * @dev Deactivate a battery passport (end-of-life)
     */
    function deactivatePassport(bytes32 _passportId) external {
        require(_passportExists(_passportId), "Battery passport does not exist");

        Battery storage battery = batteries[_passportId];
        require(battery.metadata.isActive, "Battery passport already inactive");
        require(
            battery.currentOwner == msg.sender || 
            hasRole(DEFAULT_ADMIN_ROLE, msg.sender) || 
            hasRole(RECYCLER_ROLE, msg.sender), 
            "Not authorized"
        );

        address previousOwner = battery.currentOwner;
        battery.metadata.isActive = false;
        battery.status = BatteryStatus.Recycled;
        battery.currentOwner = address(0);

        // Remove from owner list and emit removal event
        if (_removeFromOwnerList(previousOwner, _passportId)) {
            emit OwnershipRemoved(_passportId, previousOwner, block.timestamp);
        }

        _recordLifecycleEvent(
            _passportId,
            EventType.Recycling,
            "Battery passport deactivated - End of life",
            keccak256(abi.encodePacked(_passportId, "deactivated", block.timestamp)),
            msg.sender
        );

        emit PassportDeactivated(_passportId, block.timestamp);
    }

    /**
     * @dev Update last service date
     */
    function updateServiceDate(bytes32 _passportId, uint256 _serviceDate) external {
        require(_passportExists(_passportId), "Battery passport does not exist");

        Battery storage battery = batteries[_passportId];
        require(battery.metadata.isActive, "Battery passport inactive");
        require(battery.currentOwner == msg.sender || hasRole(DEFAULT_ADMIN_ROLE, msg.sender) || hasRole(AUDITOR_ROLE, msg.sender), "Not authorized");

        battery.telemetry.lastServiceDate = _serviceDate;

        _recordLifecycleEvent(
            _passportId,
            EventType.Maintenance,
            "Service date updated",
            keccak256(abi.encodePacked(_passportId, "service_update", _serviceDate)),
            msg.sender
        );
    }

    // -------------------- Additional Data helpers --------------------

    function setAdditionalData(bytes32 _passportId, string calldata key, string calldata value) public {
        require(_passportExists(_passportId), "Battery passport does not exist");
        Battery storage battery = batteries[_passportId];
        require(battery.metadata.isActive, "Battery passport inactive");
        require(battery.currentOwner == msg.sender || hasRole(DEFAULT_ADMIN_ROLE, msg.sender), "Not authorized");
        bytes32 hashedKey = keccak256(abi.encodePacked(key));
        battery.additionalData[hashedKey] = value;
    }

    function getAdditionalData(bytes32 _passportId, string calldata key) public view returns (string memory) {
        require(_passportExists(_passportId), "Battery passport does not exist");
        bytes32 hashedKey = keccak256(abi.encodePacked(key));
        return batteries[_passportId].additionalData[hashedKey];
    }

    // Legacy additional data helpers (use mapping)
    function setAdditionalDataLegacy(uint256 _batteryId, string calldata key, string calldata value) external {
        bytes32 passportId = legacyIdToPassportId[_batteryId];
        require(passportId != bytes32(0), "Legacy batteryId not found");
        setAdditionalData(passportId, key, value);
    }

    function getAdditionalDataLegacy(uint256 _batteryId, string calldata key) external view returns (string memory) {
        bytes32 passportId = legacyIdToPassportId[_batteryId];
        require(passportId != bytes32(0), "Legacy batteryId not found");
        return getAdditionalData(passportId, key);
    }

    // -------------------- Internal --------------------

    function _applyTelemetryUpdate(
        bytes32 _passportId,
        uint256 _stateOfCharge,
        uint256 _stateOfHealth,
        int256 _temperature,
        uint256 _cycleCount,
        address _initiator
    ) internal {
        require(_passportExists(_passportId), "Battery passport does not exist");
        require(_stateOfCharge <= 100, "Invalid state of charge");
        require(_stateOfHealth <= 100, "Invalid state of health");

        Battery storage battery = batteries[_passportId];
        require(battery.metadata.isActive, "Battery passport inactive");

        bool wasMaintenanceRequired = battery.telemetry.maintenanceRequired;
        bool wasCritical = battery.telemetry.criticalAlert;

        battery.telemetry.stateOfCharge = _stateOfCharge;
        battery.telemetry.stateOfHealth = _stateOfHealth;
        battery.telemetry.temperature = _temperature;
        battery.telemetry.cycleCount = _cycleCount;
        battery.telemetry.lastUpdateTimestamp = block.timestamp;

        // thresholds are in Celsius*100
        battery.telemetry.maintenanceRequired = _stateOfHealth < 80 || _temperature > 6000 || _temperature < -2000;
        battery.telemetry.criticalAlert = _stateOfHealth < 70 || _temperature > 8000 || _temperature < -3000;

        if (!wasMaintenanceRequired && battery.telemetry.maintenanceRequired) {
            _recordLifecycleEvent(
                _passportId,
                EventType.TelemetryAlert,
                "Maintenance required - SOH or temperature threshold exceeded",
                keccak256(abi.encodePacked(_passportId, "maintenance_required", block.timestamp)),
                _initiator
            );
        }

        if (!wasCritical && battery.telemetry.criticalAlert) {
            _recordLifecycleEvent(
                _passportId,
                EventType.TelemetryAlert,
                "Critical alert - Immediate attention required",
                keccak256(abi.encodePacked(_passportId, "critical_alert", block.timestamp)),
                _initiator
            );
        }

        if (_stateOfHealth < 70 && battery.status == BatteryStatus.InUse) {
            _proposeSecondLife(_passportId, _initiator);
        }

        emit TelemetryUpdated(_passportId, _stateOfCharge, _stateOfHealth, _temperature, _cycleCount, block.timestamp);
    }

    function _proposeSecondLife(bytes32 _passportId, address _initiator) internal {
        Battery storage battery = batteries[_passportId];

        if (battery.telemetry.stateOfHealth >= 50) {
            battery.status = BatteryStatus.SecondLife;
            _recordLifecycleEvent(
                _passportId,
                EventType.StatusChange,
                "Automatic proposal for second-life usage based on SOH",
                keccak256(abi.encodePacked(_passportId, "second_life_proposal", block.timestamp)),
                _initiator
            );
        } else {
            battery.status = BatteryStatus.Recycling;
            _recordLifecycleEvent(
                _passportId,
                EventType.StatusChange,
                "Automatic proposal for recycling based on SOH",
                keccak256(abi.encodePacked(_passportId, "recycling_proposal", block.timestamp)),
                _initiator
            );
        }
    }

    function _proposeSecondLife(bytes32 _passportId) internal {
        _proposeSecondLife(_passportId, msg.sender);
    }

    // Legacy internal function for backward compatibility (kept but uses mapping)
    function _proposeSecondLife(uint256 _batteryId, address _initiator) internal {
        bytes32 passportId = legacyIdToPassportId[_batteryId];
        require(passportId != bytes32(0), "Legacy batteryId not found");
        _proposeSecondLife(passportId, _initiator);
    }

    function _proposeSecondLife(uint256 _batteryId) internal {
        _proposeSecondLife(_batteryId, msg.sender);
    }

    function _recordLifecycleEvent(
        bytes32 _passportId,
        EventType _eventType,
        string memory _description,
        bytes32 _dataHash
    ) internal {
        _recordLifecycleEvent(_passportId, _eventType, _description, _dataHash, msg.sender);
    }

    function _recordLifecycleEvent(
        bytes32 _passportId,
        EventType _eventType,
        string memory _description,
        bytes32 _dataHash,
        address _initiator
    ) internal {
        _eventIdCounter++;
        uint256 eventId = _eventIdCounter;

        lifecycleEvents[eventId] = LifecycleEvent({
            eventId: eventId,
            eventType: _eventType,
            timestamp: block.timestamp,
            initiator: _initiator,
            description: _description,
            dataHash: _dataHash,
            isVerified: false
        });

        batteries[_passportId].eventHistory.push(eventId);
        eventToPassport[eventId] = _passportId;

        emit LifecycleEventRecorded(_passportId, eventId, _eventType, _initiator, block.timestamp);
    }

    function _hashTelemetry(TelemetrySubmission calldata submission) internal view returns (bytes32) {
        return _hashTypedDataV4(
            keccak256(
                abi.encode(
                    _TELEMETRY_TYPEHASH,
                    submission.passportId,
                    submission.stateOfCharge,
                    submission.stateOfHealth,
                    submission.temperature,
                    submission.cycleCount,
                    submission.nonce,
                    submission.deadline
                )
            )
        );
    }

    function _recoverTelemetrySigner(TelemetrySubmission calldata submission, bytes calldata signature) internal view returns (address) {
        require(signature.length != 0, "Telemetry signature missing");
        return ECDSA.recover(_hashTelemetry(submission), signature);
    }

    function _requireAnyRole(address account, bytes32 roleA, bytes32 roleB, bytes32 roleC) internal view {
        bool authorized = hasRole(DEFAULT_ADMIN_ROLE, account);

        if (!authorized && roleA != bytes32(0)) {
            authorized = hasRole(roleA, account);
        }
        if (!authorized && roleB != bytes32(0)) {
            authorized = hasRole(roleB, account);
        }
        if (!authorized && roleC != bytes32(0)) {
            authorized = hasRole(roleC, account);
        }

        require(authorized, "Not authorized");
    }

    function _passportExists(bytes32 _passportId) internal view returns (bool) {
        return batteries[_passportId].registrationTimestamp != 0;
    }

    function _removeFromOwnerList(address _owner, bytes32 _passportId) internal returns (bool) {
        return ownerToPassports[_owner].remove(_passportId);
    }

    // Legacy internal functions for backward compatibility
    function _batteryExists(uint256 _batteryId) internal view returns (bool) {
        bytes32 passportId = legacyIdToPassportId[_batteryId];
        return passportId != bytes32(0) && _passportExists(passportId);
    }

    function _removeFromOwnerListByLegacyId(address _owner, uint256 _batteryId) internal {
        bytes32 passportId = legacyIdToPassportId[_batteryId];
        require(passportId != bytes32(0), "Legacy batteryId not found");
        _removeFromOwnerList(_owner, passportId);
    }

    function _statusToString(BatteryStatus _status) internal pure returns (string memory) {
        if (_status == BatteryStatus.Manufactured) return "Manufactured";
        if (_status == BatteryStatus.InUse) return "InUse";
        if (_status == BatteryStatus.MaintenanceRequired) return "MaintenanceRequired";
        if (_status == BatteryStatus.SecondLife) return "SecondLife";
        if (_status == BatteryStatus.Recycling) return "Recycling";
        if (_status == BatteryStatus.Recycled) return "Recycled";
        return "Unknown";
    }

    // -------------------- Views --------------------

    function getBatteryByPassport(bytes32 _passportId)
        external
        view
        returns (
            BatteryMetadata memory metadata,
            TelemetryData memory telemetry,
            BatteryStatus status,
            address currentOwner,
            uint256 registrationTimestamp
        )
    {
        require(_passportExists(_passportId), "Battery passport does not exist");
        Battery storage battery = batteries[_passportId];
        return (battery.metadata, battery.telemetry, battery.status, battery.currentOwner, battery.registrationTimestamp);
    }

    function getBatteryEventHistoryByPassport(bytes32 _passportId) external view returns (uint256[] memory) {
        require(_passportExists(_passportId), "Battery passport does not exist");
        return batteries[_passportId].eventHistory;
    }

    function getPassportsByOwner(address _owner) external view returns (bytes32[] memory) {
        return ownerToPassports[_owner].values();
    }

    function getPassportBySerialNumber(string memory _serialNumber) external view returns (bytes32) {
        return serialNumberToPassportId[_serialNumber];
    }

    function getDeviceNonce(address device) external view returns (uint256) {
        return deviceNonces[device];
    }

    function getTotalPassports() external view returns (uint256) {
        return _passportCounter;
    }

    function getTotalBatteries() external view returns (uint256) {
        return _batteryIdCounter;
    }

    function getBatteryEventHistory(uint256 _batteryId) external view returns (uint256[] memory) {
        bytes32 passportId = legacyIdToPassportId[_batteryId];
        if (passportId == bytes32(0)) {
            // Return empty array if legacy ID does not map to a passport
            return new uint256[](0);
        }
        require(_passportExists(passportId), "Battery passport does not exist");
        return batteries[passportId].eventHistory;
    }

    // -------------------- Legacy Views --------------------

    function getBattery(uint256 _batteryId)
        external
        view
        returns (
            BatteryMetadata memory metadata,
            TelemetryData memory telemetry,
            BatteryStatus status,
            address currentOwner,
            uint256 registrationTimestamp
        )
    {
        bytes32 passportId = legacyIdToPassportId[_batteryId];
        if (passportId == bytes32(0)) {
            // Return empty/default values if legacy ID does not map to a passport
            return (
                BatteryMetadata({
                    serialNumber: "",
                    manufacturer: "",
                    manufactureDate: 0,
                    chemistryType: "",
                    initialCapacity: 0,
                    nominalVoltage: 0,
                    materials: new string[](0),
                    carbonFootprint: 0,
                    complianceLabels: new string[](0),
                    isActive: false,
                    repurposeEligibility: false,
                    secondaryUsageType: "",
                    certificationIssuer: "",
                    certificationDate: 0,
                    certificationId: "",
                    responsibilityTransferEntity: "",
                    responsibilityTransferTimestamp: 0
                }),
                TelemetryData({
                    stateOfCharge: 0,
                    stateOfHealth: 0,
                    temperature: 0,
                    cycleCount: 0,
                    lastUpdateTimestamp: 0,
                    lastServiceDate: 0,
                    maintenanceRequired: false,
                    criticalAlert: false
                }),
                BatteryStatus.Manufactured, // Default status
                address(0),
                0
            );
        }

        Battery storage battery = batteries[passportId];

        return (
            battery.metadata,
            battery.telemetry,
            battery.status,
            battery.currentOwner,
            battery.registrationTimestamp
        );
    }

    /**
     * @dev Update repurposing metadata for a battery
     */
    function updateRepurposingMetadata(
        bytes32 _passportId,
        bool _repurposeEligibility,
        string memory _secondaryUsageType,
        string memory _certificationIssuer,
        string memory _certificationId,
        string memory _responsibilityTransferEntity
    ) external {
        require(_passportExists(_passportId), "Battery passport does not exist");
        _requireAnyRole(msg.sender, MANUFACTURER_ROLE, RECYCLER_ROLE, AUDITOR_ROLE);
        
        Battery storage battery = batteries[_passportId];
        require(battery.metadata.isActive, "Battery passport inactive");
        
        // Update repurposing fields
        battery.metadata.repurposeEligibility = _repurposeEligibility;
        battery.metadata.secondaryUsageType = _secondaryUsageType;
        battery.metadata.certificationIssuer = _certificationIssuer;
        battery.metadata.certificationDate = block.timestamp;
        battery.metadata.certificationId = _certificationId;
        battery.metadata.responsibilityTransferEntity = _responsibilityTransferEntity;
        battery.metadata.responsibilityTransferTimestamp = block.timestamp;
    }

    /**
     * @dev Emit repurpose decision event
     */
    function emitRepurposeDecision(bytes32 _passportId, bool _eligible, uint256 _soh) external {
        require(_passportExists(_passportId), "Battery passport does not exist");
        _requireAnyRole(msg.sender, MANUFACTURER_ROLE, RECYCLER_ROLE, AUDITOR_ROLE);
        require(batteries[_passportId].metadata.isActive, "Battery passport inactive");
        _recordLifecycleEvent(
            _passportId,
            EventType.StatusChange,
            _eligible ? "Repurpose eligibility confirmed" : "Repurpose eligibility revoked",
            keccak256(abi.encodePacked(_passportId, _eligible, _soh, block.timestamp)),
            msg.sender
        );
        emit RepurposeDecision(_passportId, _eligible, _soh, block.timestamp);
    }

    /**
     * @dev Emit operator handoff event
     */
    function emitOperatorHandoff(bytes32 _passportId, string memory _entityId) external {
        require(_passportExists(_passportId), "Battery passport does not exist");
        _requireAnyRole(msg.sender, MANUFACTURER_ROLE, RECYCLER_ROLE, AUDITOR_ROLE);
        require(batteries[_passportId].metadata.isActive, "Battery passport inactive");
        _recordLifecycleEvent(
            _passportId,
            EventType.OwnershipTransfer,
            string(abi.encodePacked("Operator handoff to ", _entityId)),
            keccak256(abi.encodePacked(_passportId, _entityId, block.timestamp)),
            msg.sender
        );
        emit OperatorHandoff(_passportId, _entityId, block.timestamp);
    }

    /**
     * @dev Emit certification validation event
     */
    function emitCertificationValidation(
        bytes32 _passportId,
        string memory _issuer,
        uint256 _date,
        string memory _certificateId
    ) external onlyRole(AUDITOR_ROLE) {
        require(_passportExists(_passportId), "Battery passport does not exist");
        require(batteries[_passportId].metadata.isActive, "Battery passport inactive");
        _recordLifecycleEvent(
            _passportId,
            EventType.ComplianceCheck,
            string(abi.encodePacked("Certification ", _certificateId, " issued by ", _issuer)),
            keccak256(abi.encodePacked(_passportId, _issuer, _date, _certificateId)),
            msg.sender
        );
        emit CertificationValidation(_passportId, _issuer, _date, _certificateId);
    }
}
