const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🌱 Seeding Demo Soulbound Academic Credentials...");

  const [deployer, registrar, dean, disciplinaryBoard, student1, student2] =
    await hre.ethers.getSigners();

  const clientContractPath = path.join(
    __dirname,
    "..",
    "client",
    "src",
    "contracts",
    "SoulboundAcademicCredential.json"
  );

  if (!fs.existsSync(clientContractPath)) {
    console.error("❌ Contract metadata not found. Run deploy script first.");
    return;
  }

  const deploymentData = JSON.parse(fs.readFileSync(clientContractPath, "utf8"));
  const contract = await hre.ethers.getContractAt(
    "SoulboundAcademicCredential",
    deploymentData.address,
    registrar
  );

  const demoStudents = [
    {
      wallet: student1.address,
      name: "Dr. Jane Doe",
      rollNo: "MTECH-AI-2026-042",
      degree: "Master of Technology (M.Tech)",
      major: "Artificial Intelligence & Machine Learning",
      cgpa: "9.84 / 10.0 (First Class with Distinction)",
      gradDate: 1775174400,
      university: "National Institute of Advanced Technologies",
      certHash: "0x3a4b9c1d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b",
      cid: "ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
    },
    {
      wallet: student2.address,
      name: "Alex Vance",
      rollNo: "BTECH-CS-2026-108",
      degree: "Bachelor of Technology (B.Tech)",
      major: "Computer Science & Decentralized Systems",
      cgpa: "9.45 / 10.0 (Honors)",
      gradDate: 1775174400,
      university: "National Institute of Advanced Technologies",
      certHash: "0x8f9e0d1c2b3a4f5e6d7c8b9a0f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e",
      cid: "ipfs://QmZtmD2qtWbpPyv6CW1bgX84TxjdVGsJNVsomNpNNq1xGQ",
    },
  ];

  for (const st of demoStudents) {
    console.log(`\n🎓 Issuing Soulbound Degree to ${st.name} (${st.wallet})...`);
    const tx = await contract.issueDegree(
      st.wallet,
      st.name,
      st.rollNo,
      st.degree,
      st.major,
      st.cgpa,
      st.gradDate,
      st.university,
      st.certHash,
      st.cid
    );
    await tx.wait();
    console.log(`✅ Degree Issued & Locked via EIP-5192 standard!`);
  }

  console.log("\n✨ Demo Credential Seeding Complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });
