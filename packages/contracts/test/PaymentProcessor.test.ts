import { expect } from 'chai';
import { ethers } from 'hardhat';
import { PaymentProcessor, RewardToken } from '../typechain-types';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

describe('PaymentProcessor', () => {
  let processor: PaymentProcessor;
  let token: RewardToken;
  let admin: SignerWithAddress;
  let payer: SignerWithAddress;
  let payee: SignerWithAddress;
  let treasury: SignerWithAddress;

  const ONE_ETH = ethers.parseEther('1');
  const FEE_BPS = 250n; // 2.5%

  beforeEach(async () => {
    [admin, payer, payee, treasury] = await ethers.getSigners();

    const tokenFactory = await ethers.getContractFactory('RewardToken');
    token = await tokenFactory.deploy(admin.address);

    const processorFactory = await ethers.getContractFactory('PaymentProcessor');
    processor = await processorFactory.deploy(admin.address, treasury.address, FEE_BPS);
  });

  describe('ETH Payment', () => {
    it('should process ETH rent payment with fee split', async () => {
      const treasuryBefore = await ethers.provider.getBalance(treasury.address);

      const tx = await processor.connect(payer).payRent(0, payee.address, { value: ONE_ETH });
      await expect(tx).to.emit(processor, 'RentPaid');

      const payment = await processor.getPayment(0);
      expect(payment.payer).to.equal(payer.address);
      expect(payment.payee).to.equal(payee.address);
      expect(payment.amount).to.equal(ONE_ETH);

      const expectedFee = ONE_ETH * FEE_BPS / 10000n;
      expect(payment.platformFee).to.equal(expectedFee);

      const treasuryAfter = await ethers.provider.getBalance(treasury.address);
      expect(treasuryAfter - treasuryBefore).to.equal(expectedFee);
    });

    it('should reject zero ETH payment', async () => {
      await expect(processor.connect(payer).payRent(0, payee.address, { value: 0 }))
        .to.be.revertedWith('Must pay ETH');
    });
  });

  describe('Token Payment', () => {
    it('should process ERC20 rent payment with fee split', async () => {
      const amount = ethers.parseEther('1000');
      await token.mint(payer.address, amount);
      await token.connect(payer).approve(await processor.getAddress(), amount);

      const tokenAddress = await token.getAddress();
      const tx = await processor.connect(payer).payRentToken(0, payee.address, tokenAddress, amount);
      await expect(tx).to.emit(processor, 'RentPaid');

      const expectedFee = amount * FEE_BPS / 10000n;
      const expectedNet = amount - expectedFee;

      expect(await token.balanceOf(payee.address)).to.equal(expectedNet);
      expect(await token.balanceOf(treasury.address)).to.equal(expectedFee);
    });
  });

  describe('Fee Management', () => {
    it('should update platform fee', async () => {
      await expect(processor.setPlatformFee(500))
        .to.emit(processor, 'PlatformFeeUpdated').withArgs(250, 500);
      expect(await processor.platformFeeBps()).to.equal(500);
    });

    it('should reject fee above 10%', async () => {
      await expect(processor.setPlatformFee(1001)).to.be.revertedWith('Fee too high');
    });

    it('should reject fee update from non-admin', async () => {
      await expect(processor.connect(payer).setPlatformFee(100)).to.be.reverted;
    });
  });

  describe('Treasury', () => {
    it('should update treasury address', async () => {
      await expect(processor.setTreasury(payer.address))
        .to.emit(processor, 'TreasuryUpdated').withArgs(treasury.address, payer.address);
      expect(await processor.treasury()).to.equal(payer.address);
    });

    it('should reject zero address treasury', async () => {
      await expect(processor.setTreasury(ethers.ZeroAddress)).to.be.revertedWith('Invalid treasury');
    });
  });
});
