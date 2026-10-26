const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("===============================================================");
  console.log("🟣 Deploying Soulbound Academic Credentials on Polygon Amoy...");
  console.log("===============================================================");

  const [deployer] = await hre.ethers.getSigners();
  console.log(`Deployer Account: ${deployer.address}`);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Deployer Balance: ${hre.ethers.formatEther(balance)} POL`);

  // Configurable Authorities (defaults to deployer if not customized)
  const registrarAddress = process.env.REGISTRAR_ADDRESS || deployer.address;
  const deanAddress = process.env.DEAN_ADDRESS || deployer.address;
  const disciplinaryBoardAddress = process.env.DISCIPLINARY_BOARD_ADDRESS || deployer.address;

  console.log(`Registrar Authority:          ${registrarAddress}`);
  console.log(`Dean Authority:               ${deanAddress}`);
  console.log(`Disciplinary Board Authority: ${disciplinaryBoardAddress}`);

  const SoulboundFactory = await hre.ethers.getContractFactory("SoulboundAcademicCredential");
  const contract = await SoulboundFactory.deploy(
    "National Institute of Technology - Soulbound Degree Registry",
    "NITSBT",
    deployer.address,
    registrarAddress,
    deanAddress,
    disciplinaryBoardAddress
  );

  console.log("⏳ Awaiting contract deployment transaction confirmation...");
  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log(`\n🎉 Contract Deployed Successfully on Polygon Amoy!`);
  console.log(`📜 Contract Address: ${contractAddress}`);
  console.log(`🔗 Polygonscan Explorer: https://amoy.polygonscan.com/address/${contractAddress}`);

  // Export metadata for client frontend
  const clientContractsDir = path.join(__dirname, "..", "client", "src", "contracts");
  if (!fs.existsSync(clientContractsDir)) {
    fs.mkdirSync(clientContractsDir, { recursive: true });
  }

  const contractArtifact = await hre.artifacts.readArtifact("SoulboundAcademicCredential");
  const deploymentData = {
    address: contractAddress,
    network: "polygonAmoy",
    chainId: 80002,
    deployedAt: new Date().toISOString(),
    accounts: {
      admin: deployer.address,
      registrar: registrarAddress,
      dean: deanAddress,
      disciplinaryBoard: disciplinaryBoardAddress,
    },
    explorerUrl: `https://amoy.polygonscan.com/address/${contractAddress}`,
    abi: contractArtifact.abi,
  };

  fs.writeFileSync(
    path.join(clientContractsDir, "SoulboundAcademicCredential.json"),
    JSON.stringify(deploymentData, null, 2)
  );

  console.log(`💾 Exported metadata to client/src/contracts/SoulboundAcademicCredential.json`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Polygon Amoy Deployment Failed:", error);
    process.exit(1);
  });
