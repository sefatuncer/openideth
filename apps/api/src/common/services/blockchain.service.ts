import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

// Contract ABIs (minimal interfaces for the methods we call)
const PROPERTY_REGISTRY_ABI = [
  'function registerProperty(bytes32 dataHash, string uri) returns (uint256)',
  'function verifyProperty(uint256 propertyId)',
  'function getProperty(uint256 propertyId) view returns (tuple(address owner, bytes32 dataHash, bool isVerified, string uri, uint256 registeredAt))',
  'event PropertyRegistered(uint256 indexed propertyId, address indexed owner, bytes32 dataHash, string uri)',
  'event PropertyVerified(uint256 indexed propertyId, address indexed verifier)',
];

const RENTAL_AGREEMENT_ABI = [
  'function createAgreement(address tenant, uint256 propertyId, uint256 monthlyRent, uint256 depositAmount, uint256 startDate, uint256 endDate, bytes32 documentHash) returns (uint256)',
  'function signAgreement(uint256 agreementId)',
  'function terminateAgreement(uint256 agreementId, string reason)',
  'event AgreementCreated(uint256 indexed agreementId, address indexed landlord, address indexed tenant, uint256 propertyId)',
  'event AgreementSigned(uint256 indexed agreementId, address indexed signer)',
  'event AgreementActivated(uint256 indexed agreementId)',
];

const ESCROW_ABI = [
  'function deposit(address landlord, uint256 releaseTime) payable returns (uint256)',
  'function depositToken(address landlord, address token, uint256 amount, uint256 releaseTime) returns (uint256)',
  'function release(uint256 escrowId)',
  'function refund(uint256 escrowId)',
  'function dispute(uint256 escrowId)',
  'function resolveDispute(uint256 escrowId, bool toTenant)',
  'event Deposited(uint256 indexed escrowId, address indexed tenant, address indexed landlord, uint256 amount, address token)',
  'event Released(uint256 indexed escrowId)',
  'event Refunded(uint256 indexed escrowId)',
  'event Disputed(uint256 indexed escrowId, address indexed by)',
];

const PAYMENT_PROCESSOR_ABI = [
  'function payRent(uint256 agreementId, address payee) payable',
  'function payRentToken(uint256 agreementId, address payee, address token, uint256 amount)',
  'event RentPaid(uint256 indexed paymentId, address indexed payer, address indexed payee, uint256 amount, uint256 fee, address token, uint256 agreementId)',
];

const REWARD_TOKEN_ABI = [
  'function mint(address to, uint256 amount)',
  'function balanceOf(address account) view returns (uint256)',
];

@Injectable()
export class BlockchainService implements OnModuleInit {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: ethers.JsonRpcProvider | null = null;
  private signer: ethers.Wallet | null = null;

  // Contract instances (typed as any for dynamic ABI method access)
  propertyRegistry: any = null;
  rentalAgreement: any = null;
  escrowContract: any = null;
  paymentProcessor: any = null;
  rewardToken: any = null;

  private enabled = false;

  constructor(private config: ConfigService) {}

  onModuleInit() {
    const rpcUrl = this.config.get<string>('ETHEREUM_RPC_URL');
    const privateKey = this.config.get<string>('DEPLOYER_PRIVATE_KEY');

    if (!rpcUrl || !privateKey) {
      this.logger.warn('Blockchain not configured — contract interactions disabled');
      return;
    }

    try {
      this.provider = new ethers.JsonRpcProvider(rpcUrl);
      this.signer = new ethers.Wallet(privateKey, this.provider);
      this.enabled = true;
      this.logger.log(`Blockchain service connected to ${rpcUrl}`);
    } catch (error) {
      this.logger.error(`Failed to initialize blockchain: ${error}`);
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  initContracts(addresses: {
    propertyRegistry?: string;
    rentalAgreement?: string;
    escrowContract?: string;
    paymentProcessor?: string;
    rewardToken?: string;
  }) {
    if (!this.signer) return;

    if (addresses.propertyRegistry) {
      this.propertyRegistry = new ethers.Contract(addresses.propertyRegistry, PROPERTY_REGISTRY_ABI, this.signer);
    }
    if (addresses.rentalAgreement) {
      this.rentalAgreement = new ethers.Contract(addresses.rentalAgreement, RENTAL_AGREEMENT_ABI, this.signer);
    }
    if (addresses.escrowContract) {
      this.escrowContract = new ethers.Contract(addresses.escrowContract, ESCROW_ABI, this.signer);
    }
    if (addresses.paymentProcessor) {
      this.paymentProcessor = new ethers.Contract(addresses.paymentProcessor, PAYMENT_PROCESSOR_ABI, this.signer);
    }
    if (addresses.rewardToken) {
      this.rewardToken = new ethers.Contract(addresses.rewardToken, REWARD_TOKEN_ABI, this.signer);
    }

    this.logger.log('Contract instances initialized');
  }

  async estimateGas(contract: ethers.Contract, method: string, args: unknown[]): Promise<bigint> {
    const fn = contract[method];
    if (!fn) throw new Error(`Method ${method} not found on contract`);
    return fn.estimateGas(...args);
  }

  async getBalance(address: string): Promise<string> {
    if (!this.provider) throw new Error('Blockchain not configured');
    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  getSignerAddress(): string | null {
    return this.signer?.address ?? null;
  }
}
