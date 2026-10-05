const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("===============================================================");
  console.log("🚀 Deploying SoulboundAcademicCredential (EIP-5192) Platform...");
  console.log("===============================================================");

  const [deployer, registrar, dean, disciplinaryBoard, student1, student2] =
    await hre.ethers.getSigners();

  console.log(`Deployer Admin Account:        ${deployer.address}`);
  console.log(`Registrar Account:             ${registrar ? registrar.address : deployer.address}`);
  console.log(`Dean Account:                  ${dean ? dean.address : deployer.address}`);
  console.log(`Disciplinary Board Account:    ${disciplinaryBoard ? disciplinaryBoard.address : deployer.address}`);

  const SoulboundFactory = await hre.ethers.getContractFactory("SoulboundAcademicCredential");
  const contract = await SoulboundFactory.deploy(
    "National Institute of Technology - Soulbound Degree Registry",
    "NITSBT",
    deployer.address,
    registrar ? registrar.address : deployer.address,
    dean ? dean.address : deployer.address,
    disciplinaryBoard ? disciplinaryBoard.address : deployer.address
  );

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log(`\n✅ Soulbound Contract Deployed Successfully!`);
  console.log(`📜 Contract Address: ${contractAddress}`);
  console.log(`🌐 Network: ${hre.network.name} (Chain ID: ${hre.network.config.chainId || 31337})`);

  // Export contract artifact and address to frontend
  const clientContractsDir = path.join(__dirname, "..", "client", "src", "contracts");
  if (!fs.existsSync(clientContractsDir)) {
    fs.mkdirSync(clientContractsDir, { recursive: true });
  }

  const contractArtifact = await hre.artifacts.readArtifact("SoulboundAcademicCredential");

  const deploymentData = {
    address: contractAddress,
    network: hre.network.name,
    chainId: hre.network.config.chainId || 31337,
    deployedAt: new Date().toISOString(),
    accounts: {
      admin: deployer.address,
      registrar: registrar ? registrar.address : deployer.address,
      dean: dean ? dean.address : deployer.address,
      disciplinaryBoard: disciplinaryBoard ? disciplinaryBoard.address : deployer.address,
      student1: student1 ? student1.address : "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      student2: student2 ? student2.address : "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    },
    abi: contractArtifact.abi,
  };

  fs.writeFileSync(
    path.join(clientContractsDir, "SoulboundAcademicCredential.json"),
    JSON.stringify(deploymentData, null, 2)
  );

  console.log(`💾 Exported contract metadata & ABI to client/src/contracts/SoulboundAcademicCredential.json`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
