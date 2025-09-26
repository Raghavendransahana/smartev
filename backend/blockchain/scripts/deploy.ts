import { promises as fs } from 'fs';
import path from 'path';
import { ethers, network } from 'hardhat';

const parseAddressList = (value?: string) =>
  value
    ?.split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0) ?? [];

async function grantRoleIfNeeded(contract: any, roleId: string, address: string, label: string) {
  const normalized = ethers.getAddress(address);
  const alreadyHasRole = await contract.hasRole(roleId, normalized);
  if (alreadyHasRole) {
    console.log(`ℹ️  ${label} role already granted to ${normalized}`);
    return;
  }

  const tx = await contract.grantRole(roleId, normalized);
  const receipt = await tx.wait();
  console.log(`✅ Granted ${label} role to ${normalized} (tx: ${receipt?.transactionHash ?? tx.hash})`);
}

async function main() {
  const [deployer] = await ethers.getSigners();
  if (!deployer) {
    throw new Error('Hardhat signers not found. Configure your network credentials.');
  }

  console.log('👷 Using deployer:', deployer.address);
  console.log('   Network:', network.name);

  const factory = await ethers.getContractFactory('BatteryLifecycleTracker');
  console.log('⏳ Deploying BatteryLifecycleTracker...');
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  const deploymentTxHash = contract.deploymentTransaction()?.hash ?? 'unknown';

  console.log('✅ Deployment complete');
  console.log('   Contract address:', contractAddress);
  console.log('   Deployment tx:', deploymentTxHash);

  const manufacturerRoleAddresses = parseAddressList(process.env.MANUFACTURER_ROLE_ADDRESSES);
  const auditorRoleAddresses = parseAddressList(process.env.AUDITOR_ROLE_ADDRESSES);
  const recyclerRoleAddresses = parseAddressList(process.env.RECYCLER_ROLE_ADDRESSES);
  const stationRoleAddresses = parseAddressList(process.env.STATION_ROLE_ADDRESSES);

  const grants: Array<{ label: string; roleId: string; addresses: string[] }> = [
    { label: 'MANUFACTURER_ROLE', roleId: await contract.MANUFACTURER_ROLE(), addresses: manufacturerRoleAddresses },
    { label: 'AUDITOR_ROLE', roleId: await contract.AUDITOR_ROLE(), addresses: auditorRoleAddresses },
    { label: 'RECYCLER_ROLE', roleId: await contract.RECYCLER_ROLE(), addresses: recyclerRoleAddresses },
    { label: 'STATION_ROLE', roleId: await contract.STATION_ROLE(), addresses: stationRoleAddresses }
  ];

  for (const grant of grants) {
    for (const address of grant.addresses) {
      await grantRoleIfNeeded(contract, grant.roleId, address, grant.label);
    }
  }

  const deploymentRecord = {
    network: network.name,
    chainId: network.config?.chainId ?? null,
    contract: 'BatteryLifecycleTracker',
    address: contractAddress,
    deployer: deployer.address,
    deploymentTxHash,
    timestamp: new Date().toISOString(),
    roles: {
      manufacturer: manufacturerRoleAddresses,
      auditor: auditorRoleAddresses,
      recycler: recyclerRoleAddresses,
      station: stationRoleAddresses
    }
  };

  const deploymentsDir = path.resolve(__dirname, '..', 'deployments');
  await fs.mkdir(deploymentsDir, { recursive: true });
  const filePath = path.join(
    deploymentsDir,
    `battery-lifecycle-tracker-${network.name}-${Date.now()}.json`
  );
  await fs.writeFile(filePath, JSON.stringify(deploymentRecord, null, 2));

  console.log('📝 Deployment record saved to', filePath);
}

main().catch((error) => {
  console.error('❌ Deployment failed:', error);
  process.exitCode = 1;
});
