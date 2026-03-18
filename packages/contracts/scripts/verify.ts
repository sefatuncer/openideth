import { run } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const addressesPath = path.join(__dirname, '..', 'deployed-addresses.json');
  if (!fs.existsSync(addressesPath)) {
    throw new Error('deployed-addresses.json not found. Deploy first.');
  }

  const addresses = JSON.parse(fs.readFileSync(addressesPath, 'utf-8'));

  const contracts = [
    { name: 'RewardToken', address: addresses.RewardToken, args: [addresses.deployer] },
    { name: 'PropertyRegistry', address: addresses.PropertyRegistry, args: [addresses.deployer] },
    { name: 'EscrowContract', address: addresses.EscrowContract, args: [addresses.deployer] },
    { name: 'RentalAgreement', address: addresses.RentalAgreement, args: [addresses.deployer] },
    { name: 'PaymentProcessor', address: addresses.PaymentProcessor, args: [addresses.deployer, addresses.deployer, 250] },
  ];

  for (const contract of contracts) {
    try {
      console.log(`Verifying ${contract.name} at ${contract.address}...`);
      await run('verify:verify', {
        address: contract.address,
        constructorArguments: contract.args,
      });
      console.log(`${contract.name} verified!`);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes('Already Verified')) {
        console.log(`${contract.name} already verified.`);
      } else {
        console.error(`Failed to verify ${contract.name}:`, message);
      }
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
