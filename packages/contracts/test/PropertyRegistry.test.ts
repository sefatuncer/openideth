import { expect } from 'chai';
import { ethers } from 'hardhat';
import { PropertyRegistry } from '../typechain-types';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

describe('PropertyRegistry', () => {
  let registry: PropertyRegistry;
  let admin: SignerWithAddress;
  let owner1: SignerWithAddress;
  let owner2: SignerWithAddress;

  const dataHash = ethers.keccak256(ethers.toUtf8Bytes('property-data-1'));
  const uri = 'ipfs://QmTest123';

  beforeEach(async () => {
    [admin, owner1, owner2] = await ethers.getSigners();
    const factory = await ethers.getContractFactory('PropertyRegistry');
    registry = await factory.deploy(admin.address);
  });

  describe('Register', () => {
    it('should register a property', async () => {
      const tx = await registry.connect(owner1).registerProperty(dataHash, uri);
      await expect(tx).to.emit(registry, 'PropertyRegistered').withArgs(0, owner1.address, dataHash, uri);

      const prop = await registry.getProperty(0);
      expect(prop.owner).to.equal(owner1.address);
      expect(prop.dataHash).to.equal(dataHash);
      expect(prop.isVerified).to.be.false;
      expect(prop.uri).to.equal(uri);
    });

    it('should track owner properties', async () => {
      await registry.connect(owner1).registerProperty(dataHash, uri);
      await registry.connect(owner1).registerProperty(dataHash, 'ipfs://QmTest456');
      const ids = await registry.getPropertiesByOwner(owner1.address);
      expect(ids.length).to.equal(2);
    });
  });

  describe('Verify', () => {
    it('should allow verifier to verify', async () => {
      await registry.connect(owner1).registerProperty(dataHash, uri);
      await expect(registry.verifyProperty(0)).to.emit(registry, 'PropertyVerified').withArgs(0, admin.address);

      const prop = await registry.getProperty(0);
      expect(prop.isVerified).to.be.true;
    });

    it('should reject double verification', async () => {
      await registry.connect(owner1).registerProperty(dataHash, uri);
      await registry.verifyProperty(0);
      await expect(registry.verifyProperty(0)).to.be.revertedWith('Already verified');
    });

    it('should reject verification from non-verifier', async () => {
      await registry.connect(owner1).registerProperty(dataHash, uri);
      await expect(registry.connect(owner1).verifyProperty(0)).to.be.reverted;
    });
  });

  describe('Transfer', () => {
    it('should transfer ownership', async () => {
      await registry.connect(owner1).registerProperty(dataHash, uri);
      await expect(registry.connect(owner1).transferOwnership(0, owner2.address))
        .to.emit(registry, 'PropertyTransferred').withArgs(0, owner1.address, owner2.address);

      const prop = await registry.getProperty(0);
      expect(prop.owner).to.equal(owner2.address);

      expect((await registry.getPropertiesByOwner(owner1.address)).length).to.equal(0);
      expect((await registry.getPropertiesByOwner(owner2.address)).length).to.equal(1);
    });

    it('should reject transfer from non-owner', async () => {
      await registry.connect(owner1).registerProperty(dataHash, uri);
      await expect(registry.connect(owner2).transferOwnership(0, owner2.address))
        .to.be.revertedWith('Not the owner');
    });
  });
});
