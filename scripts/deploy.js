const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("===============================================================");
  console.log("🚀 Deploying SoulboundAcademicCredential (EIP-5192) Platform...");
  console.log("🏛️  Sri Siddhartha Institute of Technology (SSAHE), Tumakuru");
  console.log("===============================================================");

  // Matches frontend PRESET_ACCOUNTS indices cleanly (Accounts #0..#6)
  const [deployer, registrar, dean, student1, student2, disciplinaryBoard, employer] =
    await hre.ethers.getSigners();

  console.log(`Deployer Admin (#0):        ${deployer.address}`);
  console.log(`Registrar (#1):             ${registrar ? registrar.address : deployer.address}`);
  console.log(`Dean (#2):                  ${dean ? dean.address : deployer.address}`);
  console.log(`Student 1 (#3):             ${student1 ? student1.address : deployer.address}`);
  console.log(`Student 2 (#4):             ${student2 ? student2.address : deployer.address}`);
  console.log(`Disciplinary Board (#5):    ${disciplinaryBoard ? disciplinaryBoard.address : deployer.address}`);
  console.log(`Employer (#6):              ${employer ? employer.address : deployer.address}`);

  const SoulboundFactory = await hre.ethers.getContractFactory("SoulboundAcademicCredential");
  const contract = await SoulboundFactory.deploy(
    "Sri Siddhartha Academy of Higher Education - Soulbound Degree Registry",
    "SSITSBT",
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
    institution: "Sri Siddhartha Institute of Technology (SSAHE), Tumakuru",
    deployedAt: new Date().toISOString(),
    accounts: {
      admin: deployer.address,
      registrar: registrar ? registrar.address : deployer.address,
      dean: dean ? dean.address : deployer.address,
      student1: student1 ? student1.address : "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
      student2: student2 ? student2.address : "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
      disciplinaryBoard: disciplinaryBoard ? disciplinaryBoard.address : deployer.address,
      employer: employer ? employer.address : "0x976EA74026E726554dB657fA54763abd0C3a0aa9",
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
