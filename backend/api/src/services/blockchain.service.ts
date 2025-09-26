import { randomUUID } from 'crypto';
import {
  Contract,
  JsonRpcProvider,
  Wallet,
  ContractTransactionResponse,
  TransactionReceipt,
  ethers
} from 'ethers';
import { env } from '../config/env';
import { BlockchainTransactionModel, OnChainTransactionType, TransactionType } from '../models/transaction.model';

const batteryAbi = [
  'function registerPassport(string serialNumber, bytes32 vehicleHash, bytes32 originHash, address initialOwner) returns (bytes32)',
  'function recordOwnershipTransfer(bytes32 passportId, address to, bytes32 documentationHash)',
  'function addCertificationHash(bytes32 passportId, string category, bytes32 certificationHash)',
  'function logLifecycleEvent(bytes32 passportId, uint8 phase, bytes32 eventHash)',
  'function recordSecondLifeDecision(bytes32 passportId, bool eligible, bytes32 documentationHash)',
  'function recordRecyclingAction(bytes32 passportId, uint8 action, bytes32 documentationHash)',
  'function settleChargingPayment(bytes32 passportId, address station, uint256 amountWei, bytes32 sessionHash) payable',
  'function recordWarrantyClaim(bytes32 passportId, bytes32 claimHash)'
];

const provider = new JsonRpcProvider(env.BLOCKCHAIN_RPC_URL);
const wallet = new Wallet(env.BLOCKCHAIN_PRIVATE_KEY, provider);
const contract = new Contract(env.BATTERY_CONTRACT_ADDRESS, batteryAbi, wallet);

const { ZeroHash, toUtf8Bytes, keccak256, solidityPackedKeccak256, isHexString, getAddress } = ethers;

type Hex32 = `0x${string}`;

const toBytes32 = (value?: string | null): Hex32 => {
  if (!value || value.trim().length === 0) {
    return ZeroHash as Hex32;
  }

  const trimmed = value.trim();
  if (isHexString(trimmed, 32)) {
    return trimmed as Hex32;
  }

  return keccak256(toUtf8Bytes(trimmed)) as Hex32;
};

const normalizePassportId = (value: string): Hex32 => {
  if (!isHexString(value, 32)) {
    throw new Error('passportId must be a 32-byte hex string');
  }
  return value as Hex32;
};

const computePassportId = (serialNumber: string, vehicleHash: Hex32) =>
  solidityPackedKeccak256(['string', 'bytes32'], [serialNumber, vehicleHash]);

const persistTransaction = async (
  type: OnChainTransactionType,
  tx: ContractTransactionResponse,
  receipt: TransactionReceipt | null,
  payload: Record<string, unknown>
) => {
  const status = receipt?.status === 0 ? 'failed' : 'confirmed';
  const transaction = await BlockchainTransactionModel.create({
    txId: tx.hash,
    type,
    status,
    payload: {
      ...payload,
      txHash: tx.hash,
      blockNumber: receipt?.blockNumber ?? null,
      gasUsed: receipt?.gasUsed?.toString() ?? null
    }
  });

  if (status === 'failed') {
    throw new Error('Blockchain transaction failed');
  }

  return transaction;
};

const waitAndPersist = async (
  type: OnChainTransactionType,
  payload: Record<string, unknown>,
  action: () => Promise<ContractTransactionResponse>
) => {
  const tx = await action();
  const receipt = await tx.wait();
  const transaction = await persistTransaction(type, tx, receipt, payload);
  return { transaction, receipt };
};

const lifecyclePhaseMap: Record<string, number> = {
  manufactured: 0,
  deployed: 1,
  maintenance: 2,
  endoflife: 3,
  'end-of-life': 3
};

const recyclingActionMap: Record<string, number> = {
  none: 0,
  scheduled: 1,
  intransit: 2,
  'in-transit': 2,
  received: 3,
  completed: 4
};

export type BlockchainActionInput =
  | {
      type: 'passport';
      serialNumber: string;
      vehicleVin: string;
      originDocument?: string;
      ownerAddress: string;
    }
  | {
      type: 'ownership';
      passportId: string;
      toAddress: string;
      documentationHash?: string;
    }
  | {
      type: 'certification';
      passportId: string;
      category: string;
      documentHash: string;
    }
  | {
      type: 'lifecycle';
      passportId: string;
      phase: string;
      eventData?: string;
    }
  | {
      type: 'secondLife';
      passportId: string;
      eligible: boolean;
      documentHash?: string;
    }
  | {
      type: 'recycling';
      passportId: string;
      action: string;
      documentHash?: string;
    }
  | {
      type: 'charging';
      passportId: string;
      stationAddress: string;
      amountWei: string;
      sessionId: string;
    }
  | {
      type: 'warranty';
      passportId: string;
      claimReference: string;
    };

export const executeBlockchainAction = async (input: BlockchainActionInput) => {
  switch (input.type) {
    case 'passport': {
      const vehicleHash = toBytes32(input.vehicleVin);
      const originHash = input.originDocument ? toBytes32(input.originDocument) : toBytes32(`${input.serialNumber}:${input.vehicleVin}`);
      const ownerAddress = getAddress(input.ownerAddress);
      const passportId = computePassportId(input.serialNumber, vehicleHash as Hex32);

      const { transaction } = await waitAndPersist(
        'passport',
        {
          serialNumber: input.serialNumber,
          vehicleVin: input.vehicleVin,
          vehicleHash,
          originHash,
          ownerAddress,
          passportId
        },
        () => contract.registerPassport(input.serialNumber, vehicleHash, originHash, ownerAddress)
      );

      return { transaction, passportId };
    }
    case 'ownership': {
      const passportId = normalizePassportId(input.passportId);
      const toAddress = getAddress(input.toAddress);
      const documentationHash = toBytes32(input.documentationHash ?? `${passportId}:${toAddress}`);

      const { transaction } = await waitAndPersist(
        'ownership',
        {
          passportId,
          toAddress,
          documentationHash
        },
        () => contract.recordOwnershipTransfer(passportId, toAddress, documentationHash)
      );

      return { transaction };
    }
    case 'certification': {
      const passportId = normalizePassportId(input.passportId);
      const certificationHash = toBytes32(input.documentHash);

      const { transaction } = await waitAndPersist(
        'certification',
        {
          passportId,
          category: input.category,
          certificationHash
        },
        () => contract.addCertificationHash(passportId, input.category, certificationHash)
      );

      return { transaction };
    }
    case 'lifecycle': {
      const passportId = normalizePassportId(input.passportId);
      const normalizedPhase = input.phase.trim().toLowerCase();
      const phaseValue = lifecyclePhaseMap[normalizedPhase];
      if (phaseValue === undefined) {
        throw new Error('Unsupported lifecycle phase');
      }
      const eventHash = toBytes32(input.eventData ?? `${passportId}:${normalizedPhase}:${Date.now()}`);

      const { transaction } = await waitAndPersist(
        'lifecycle',
        {
          passportId,
          phase: normalizedPhase,
          eventHash
        },
        () => contract.logLifecycleEvent(passportId, phaseValue, eventHash)
      );

      return { transaction };
    }
    case 'secondLife': {
      const passportId = normalizePassportId(input.passportId);
      const documentationHash = toBytes32(input.documentHash ?? `${passportId}:secondLife:${input.eligible}`);

      const { transaction } = await waitAndPersist(
        'secondLife',
        {
          passportId,
          eligible: input.eligible,
          documentationHash
        },
        () => contract.recordSecondLifeDecision(passportId, input.eligible, documentationHash)
      );

      return { transaction };
    }
    case 'recycling': {
      const passportId = normalizePassportId(input.passportId);
      const normalizedAction = input.action.trim().toLowerCase();
      const actionValue = recyclingActionMap[normalizedAction];
      if (actionValue === undefined) {
        throw new Error('Unsupported recycling action');
      }
      const documentationHash = toBytes32(input.documentHash ?? `${passportId}:${normalizedAction}`);

      const { transaction } = await waitAndPersist(
        'recycling',
        {
          passportId,
          action: normalizedAction,
          documentationHash
        },
        () => contract.recordRecyclingAction(passportId, actionValue, documentationHash)
      );

      return { transaction };
    }
    case 'charging': {
      const passportId = normalizePassportId(input.passportId);
      const stationAddress = getAddress(input.stationAddress);
      const amount = BigInt(input.amountWei);
      const sessionHash = toBytes32(input.sessionId);

      const { transaction } = await waitAndPersist(
        'charging',
        {
          passportId,
          stationAddress,
          amountWei: amount.toString(),
          sessionHash
        },
        () => contract.settleChargingPayment(passportId, stationAddress, amount, sessionHash, { value: amount })
      );

      return { transaction };
    }
    case 'warranty': {
      const passportId = normalizePassportId(input.passportId);
      const claimHash = toBytes32(input.claimReference);

      const { transaction } = await waitAndPersist(
        'warranty',
        {
          passportId,
          claimHash
        },
        () => contract.recordWarrantyClaim(passportId, claimHash)
      );

      return { transaction };
    }
    default:
      throw new Error('Unsupported blockchain action');
  }
};

export const getRecentTransactions = async (limit = 50) => {
  return BlockchainTransactionModel.find().sort({ createdAt: -1 }).limit(limit).lean();
};

export const getTransactionById = async (txId: string) => {
  return BlockchainTransactionModel.findOne({ txId }).lean();
};

type OffChainTransactionType = Extract<TransactionType, 'alert' | 'battery' | 'ownership' | 'charging'>;

export const recordBlockchainTransaction = async (
  type: OffChainTransactionType,
  payload: Record<string, unknown>
) => {
  const txId = randomUUID();
  return BlockchainTransactionModel.create({
    txId,
    type,
    status: 'pending',
    payload: {
      ...payload,
      recordedAt: new Date().toISOString()
    }
  });
};
