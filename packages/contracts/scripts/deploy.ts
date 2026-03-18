import { ethers } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with account:', deployer.address);
  console.log('Account balance:', (await ethers.provider.getBalance(deployer.address)).toString());

  // 1. Deploy RewardToken
  const RewardToken = await ethers.getContractFactory('RewardToken');
  const rewardToken = await RewardToken.deploy(deployer.address);
  await rewardToken.waitForDeployment();
  const rewardTokenAddress = await rewardToken.getAddress();
  console.log('RewardToken deployed to:', rewardTokenAddress);

  // 2. Deploy PropertyRegistry
  const PropertyRegistry = await ethers.getContractFactory('PropertyRegistry');
  const propertyRegistry = await PropertyRegistry.deploy(deployer.address);
  await propertyRegistry.waitForDeployment();
  const propertyRegistryAddress = await propertyRegistry.getAddress();
  console.log('PropertyRegistry deployed to:', propertyRegistryAddress);

  // 3. Deploy EscrowContract
  const EscrowContract = await ethers.getContractFactory('EscrowContract');
  const escrowContract = await EscrowContract.deploy(deployer.address);
  await escrowContract.waitForDeployment();
  const escrowContractAddress = await escrowContract.getAddress();
  console.log('EscrowContract deployed to:', escrowContractAddress);

  // 4. Deploy RentalAgreement
  const RentalAgreement = await ethers.getContractFactory('RentalAgreement');
  const rentalAgreement = await RentalAgreement.deploy(deployer.address);
  await rentalAgreement.waitForDeployment();
  const rentalAgreementAddress = await rentalAgreement.getAddress();
  console.log('RentalAgreement deployed to:', rentalAgreementAddress);

  // 5. Deploy PaymentProcessor (250 bps = 2.5% fee)
  const PaymentProcessor = await ethers.getContractFactory('PaymentProcessor');
  const paymentProcessor = await PaymentProcessor.deploy(deployer.address, deployer.address, 250);
  await paymentProcessor.waitForDeployment();
  const paymentProcessorAddress = await paymentProcessor.getAddress();
  console.log('PaymentProcessor deployed to:', paymentProcessorAddress);

  // Save addresses to JSON
  const addresses = {
    RewardToken: rewardTokenAddress,
    PropertyRegistry: propertyRegistryAddress,
    EscrowContract: escrowContractAddress,
    RentalAgreement: rentalAgreementAddress,
    PaymentProcessor: paymentProcessorAddress,
    deployer: deployer.address,
    network: (await ethers.provider.getNetwork()).name,
    timestamp: new Date().toISOString(),
  };

  const outputPath = path.join(__dirname, '..', 'deployed-addresses.json');
  fs.writeFileSync(outputPath, JSON.stringify(addresses, null, 2));
  console.log('\nAddresses saved to:', outputPath);
  console.log('\nDeployment complete!');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
