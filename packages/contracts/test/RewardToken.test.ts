import { expect } from 'chai';
import { ethers } from 'hardhat';
import { RewardToken } from '../typechain-types';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

describe('RewardToken', () => {
  let token: RewardToken;
  let admin: SignerWithAddress;
  let minter: SignerWithAddress;
  let user: SignerWithAddress;

  beforeEach(async () => {
    [admin, minter, user] = await ethers.getSigners();
    const factory = await ethers.getContractFactory('RewardToken');
    token = await factory.deploy(admin.address);
  });

  describe('Deployment', () => {
    it('should have correct name and symbol', async () => {
      expect(await token.name()).to.equal('OpenIDEth Reward');
      expect(await token.symbol()).to.equal('OIDR');
    });

    it('should grant admin and minter roles to deployer', async () => {
      const adminRole = await token.DEFAULT_ADMIN_ROLE();
      const minterRole = await token.MINTER_ROLE();
      expect(await token.hasRole(adminRole, admin.address)).to.be.true;
      expect(await token.hasRole(minterRole, admin.address)).to.be.true;
    });
  });

  describe('Minting', () => {
    it('should allow minter to mint tokens', async () => {
      await token.mint(user.address, ethers.parseEther('100'));
      expect(await token.balanceOf(user.address)).to.equal(ethers.parseEther('100'));
    });

    it('should reject minting from non-minter', async () => {
      await expect(token.connect(user).mint(user.address, ethers.parseEther('100'))).to.be.reverted;
    });

    it('should allow granted minter role to mint', async () => {
      const minterRole = await token.MINTER_ROLE();
      await token.grantRole(minterRole, minter.address);
      await token.connect(minter).mint(user.address, ethers.parseEther('50'));
      expect(await token.balanceOf(user.address)).to.equal(ethers.parseEther('50'));
    });
  });

  describe('Burning', () => {
    it('should allow user to burn own tokens', async () => {
      await token.mint(user.address, ethers.parseEther('100'));
      await token.connect(user).burn(ethers.parseEther('30'));
      expect(await token.balanceOf(user.address)).to.equal(ethers.parseEther('70'));
    });
  });

  describe('Pausable', () => {
    it('should prevent minting when paused', async () => {
      await token.pause();
      await expect(token.mint(user.address, ethers.parseEther('100'))).to.be.revertedWithCustomError(token, 'EnforcedPause');
    });

    it('should allow minting after unpause', async () => {
      await token.pause();
      await token.unpause();
      await token.mint(user.address, ethers.parseEther('100'));
      expect(await token.balanceOf(user.address)).to.equal(ethers.parseEther('100'));
    });

    it('should reject pause from non-admin', async () => {
      await expect(token.connect(user).pause()).to.be.reverted;
    });
  });

  describe('Transfer', () => {
    it('should allow transfer between accounts', async () => {
      await token.mint(user.address, ethers.parseEther('100'));
      await token.connect(user).transfer(minter.address, ethers.parseEther('40'));
      expect(await token.balanceOf(user.address)).to.equal(ethers.parseEther('60'));
      expect(await token.balanceOf(minter.address)).to.equal(ethers.parseEther('40'));
    });
  });
});
