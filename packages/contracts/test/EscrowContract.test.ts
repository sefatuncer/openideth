import { expect } from 'chai';
import { ethers } from 'hardhat';
import { time } from '@nomicfoundation/hardhat-network-helpers';
import { EscrowContract, RewardToken } from '../typechain-types';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

describe('EscrowContract', () => {
  let escrow: EscrowContract;
  let token: RewardToken;
  let admin: SignerWithAddress;
  let tenant: SignerWithAddress;
  let landlord: SignerWithAddress;

  const ONE_ETH = ethers.parseEther('1');
  const ONE_DAY = 86400;

  beforeEach(async () => {
    [admin, tenant, landlord] = await ethers.getSigners();

    const tokenFactory = await ethers.getContractFactory('RewardToken');
    token = await tokenFactory.deploy(admin.address);

    const escrowFactory = await ethers.getContractFactory('EscrowContract');
    escrow = await escrowFactory.deploy(admin.address);
  });

  describe('ETH Deposit', () => {
    it('should create an escrow with ETH', async () => {
      const releaseTime = (await time.latest()) + ONE_DAY;
      const tx = await escrow.connect(tenant).deposit(landlord.address, releaseTime, { value: ONE_ETH });
      await expect(tx).to.emit(escrow, 'Deposited');

      const e = await escrow.getEscrow(0);
      expect(e.tenant).to.equal(tenant.address);
      expect(e.landlord).to.equal(landlord.address);
      expect(e.amount).to.equal(ONE_ETH);
      expect(e.status).to.equal(0n); // Active
    });
  });

  describe('Token Deposit', () => {
    it('should create an escrow with ERC20 tokens', async () => {
      const amount = ethers.parseEther('500');
      await token.mint(tenant.address, amount);
      await token.connect(tenant).approve(await escrow.getAddress(), amount);

      const releaseTime = (await time.latest()) + ONE_DAY;
      const tx = await escrow.connect(tenant).depositToken(landlord.address, await token.getAddress(), amount, releaseTime);
      await expect(tx).to.emit(escrow, 'Deposited');

      const e = await escrow.getEscrow(0);
      expect(e.amount).to.equal(amount);
      expect(e.token).to.equal(await token.getAddress());
    });
  });

  describe('Release', () => {
    it('should release ETH escrow after release time', async () => {
      const releaseTime = (await time.latest()) + ONE_DAY;
      await escrow.connect(tenant).deposit(landlord.address, releaseTime, { value: ONE_ETH });

      await time.increaseTo(releaseTime);

      await expect(escrow.connect(landlord).release(0)).to.emit(escrow, 'Released');

      const e = await escrow.getEscrow(0);
      expect(e.status).to.equal(1n); // Released
    });

    it('should reject release before release time', async () => {
      const releaseTime = (await time.latest()) + ONE_DAY;
      await escrow.connect(tenant).deposit(landlord.address, releaseTime, { value: ONE_ETH });

      await expect(escrow.connect(landlord).release(0)).to.be.revertedWith('Release time not reached');
    });
  });

  describe('Refund', () => {
    it('should allow arbitrator to refund', async () => {
      const releaseTime = (await time.latest()) + ONE_DAY;
      await escrow.connect(tenant).deposit(landlord.address, releaseTime, { value: ONE_ETH });

      await expect(escrow.refund(0)).to.emit(escrow, 'Refunded');

      const e = await escrow.getEscrow(0);
      expect(e.status).to.equal(2n); // Refunded
    });
  });

  describe('Dispute', () => {
    it('should allow tenant to dispute', async () => {
      const releaseTime = (await time.latest()) + ONE_DAY;
      await escrow.connect(tenant).deposit(landlord.address, releaseTime, { value: ONE_ETH });

      await expect(escrow.connect(tenant).dispute(0)).to.emit(escrow, 'Disputed');
    });

    it('should allow arbitrator to resolve dispute', async () => {
      const releaseTime = (await time.latest()) + ONE_DAY;
      await escrow.connect(tenant).deposit(landlord.address, releaseTime, { value: ONE_ETH });

      await escrow.connect(tenant).dispute(0);

      await expect(escrow.resolveDispute(0, true)).to.emit(escrow, 'DisputeResolved').withArgs(0, true);
      const e = await escrow.getEscrow(0);
      expect(e.status).to.equal(2n); // Refunded (toTenant=true)
    });

    it('should reject dispute from non-party', async () => {
      const releaseTime = (await time.latest()) + ONE_DAY;
      await escrow.connect(tenant).deposit(landlord.address, releaseTime, { value: ONE_ETH });

      await expect(escrow.connect(admin).dispute(0)).to.be.revertedWith('Not a party');
    });
  });

  describe('Withdraw (pull pattern)', () => {
    it('should allow withdrawal of released ETH', async () => {
      const releaseTime = (await time.latest()) + ONE_DAY;
      await escrow.connect(tenant).deposit(landlord.address, releaseTime, { value: ONE_ETH });

      await time.increaseTo(releaseTime);
      await escrow.connect(landlord).release(0);

      const balanceBefore = await ethers.provider.getBalance(landlord.address);
      const tx = await escrow.connect(landlord).withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
      const balanceAfter = await ethers.provider.getBalance(landlord.address);

      expect(balanceAfter + gasUsed - balanceBefore).to.equal(ONE_ETH);
    });
  });
});
