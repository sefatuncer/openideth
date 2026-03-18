import { expect } from 'chai';
import { ethers } from 'hardhat';
import { time } from '@nomicfoundation/hardhat-network-helpers';
import { RentalAgreement } from '../typechain-types';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';

describe('RentalAgreement', () => {
  let agreement: RentalAgreement;
  let admin: SignerWithAddress;
  let landlordSigner: SignerWithAddress;
  let tenantSigner: SignerWithAddress;
  let other: SignerWithAddress;

  const monthlyRent = ethers.parseEther('1');
  const depositAmt = ethers.parseEther('2');
  const docHash = ethers.keccak256(ethers.toUtf8Bytes('lease-agreement.pdf'));

  beforeEach(async () => {
    [admin, landlordSigner, tenantSigner, other] = await ethers.getSigners();
    const factory = await ethers.getContractFactory('RentalAgreement');
    agreement = await factory.deploy(admin.address);
  });

  async function createTestAgreement() {
    const now = await time.latest();
    const startDate = now + 86400;
    const endDate = now + 86400 * 365;
    await agreement.connect(landlordSigner).createAgreement(
      tenantSigner.address, 0, monthlyRent, depositAmt, startDate, endDate, docHash,
    );
  }

  describe('Create', () => {
    it('should create an agreement', async () => {
      await createTestAgreement();

      const a = await agreement.getAgreement(0);
      expect(a.landlord).to.equal(landlordSigner.address);
      expect(a.tenant).to.equal(tenantSigner.address);
      expect(a.monthlyRent).to.equal(monthlyRent);
      expect(a.status).to.equal(0); // Draft
    });

    it('should reject self-rental', async () => {
      const now = await time.latest();
      await expect(
        agreement.connect(landlordSigner).createAgreement(
          landlordSigner.address, 0, monthlyRent, depositAmt, now + 86400, now + 86400 * 365, docHash,
        ),
      ).to.be.revertedWith('Cannot rent to yourself');
    });
  });

  describe('Sign', () => {
    it('should activate after both parties sign', async () => {
      await createTestAgreement();

      await expect(agreement.connect(landlordSigner).signAgreement(0)).to.emit(agreement, 'AgreementSigned');
      let a = await agreement.getAgreement(0);
      expect(a.landlordSigned).to.be.true;
      expect(a.status).to.equal(0); // Still Draft

      await expect(agreement.connect(tenantSigner).signAgreement(0)).to.emit(agreement, 'AgreementActivated');
      a = await agreement.getAgreement(0);
      expect(a.tenantSigned).to.be.true;
      expect(a.status).to.equal(1); // Active
    });

    it('should reject double signing', async () => {
      await createTestAgreement();
      await agreement.connect(landlordSigner).signAgreement(0);
      await expect(agreement.connect(landlordSigner).signAgreement(0)).to.be.revertedWith('Already signed');
    });

    it('should reject signing from non-party', async () => {
      await createTestAgreement();
      await expect(agreement.connect(other).signAgreement(0)).to.be.revertedWith('Not a party');
    });
  });

  describe('Terminate', () => {
    it('should terminate an active agreement', async () => {
      await createTestAgreement();
      await agreement.connect(landlordSigner).signAgreement(0);
      await agreement.connect(tenantSigner).signAgreement(0);

      await expect(agreement.connect(landlordSigner).terminateAgreement(0, 'Lease violation'))
        .to.emit(agreement, 'AgreementTerminated');

      const a = await agreement.getAgreement(0);
      expect(a.status).to.equal(2); // Terminated
    });

    it('should reject termination of non-active agreement', async () => {
      await createTestAgreement();
      await expect(agreement.connect(landlordSigner).terminateAgreement(0, 'reason'))
        .to.be.revertedWith('Not active');
    });
  });

  describe('Document Verification', () => {
    it('should verify correct document hash', async () => {
      await createTestAgreement();
      expect(await agreement.verifyDocument(0, docHash)).to.be.true;
    });

    it('should reject incorrect document hash', async () => {
      await createTestAgreement();
      const wrongHash = ethers.keccak256(ethers.toUtf8Bytes('wrong'));
      expect(await agreement.verifyDocument(0, wrongHash)).to.be.false;
    });
  });
});
