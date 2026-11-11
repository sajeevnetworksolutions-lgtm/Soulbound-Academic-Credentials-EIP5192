const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const paperCohorts = require("../client/src/data/paperCohorts.json");

async function main() {
  console.log("🌱 Seeding Paper Table II Synthetic Academic Credential Testbed (N = 18)...");

  const [deployer, registrar, dean, student1, student2, disciplinaryBoard] =
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

  const undergrads = paperCohorts.credentials.filter((c) => c.cohortKey === "undergrad");
  const multisigs = paperCohorts.credentials.filter((c) => c.cohortKey === "multisig");
  const disciplinaries = paperCohorts.credentials.filter((c) => c.cohortKey === "disciplinary");

  // 1. Cohort 1 (N = 6): Active Undergraduates - Direct Registrar Issuance
  console.log(`\n📘 Cohort 1: Seeding ${undergrads.length} Active Undergraduates (Direct Registrar)...`);
  for (const st of undergrads) {
    const tx = await contract.connect(registrar).issueDegree(
      st.studentWallet,
      st.studentName,
      st.studentIdNumber,
      st.degreeName,
      st.majorSpecialization,
      st.cgpa,
      st.graduationDate,
      st.institutionName,
      st.certificateHash,
      st.ipfsCID
    );
    await tx.wait();
    console.log(`  ✔ Token #${st.tokenId}: ${st.studentName} (${st.studentIdNumber})`);
  }

  // 2. Cohort 2 (N = 6): Dual Multi-Sig Postgraduates - Registrar Proposal + Dean Co-Sign + Execution
  console.log(`\n🔐 Cohort 2: Seeding ${multisigs.length} Dual Multi-Sig Postgraduates (Registrar + Dean)...`);
  for (let i = 0; i < multisigs.length; i++) {
    const st = multisigs[i];
    const proposalId = i + 1;
    await (
      await contract.connect(registrar).proposeDegreeIssuance(
        st.studentWallet,
        st.studentName,
        st.studentIdNumber,
        st.degreeName,
        st.majorSpecialization,
        st.cgpa,
        st.graduationDate,
        st.institutionName,
        st.certificateHash,
        st.ipfsCID
      )
    ).wait();

    await (await contract.connect(dean).approveProposalByDean(proposalId)).wait();
    await (await contract.connect(registrar).executeProposal(proposalId)).wait();
    console.log(`  ✔ Token #${st.tokenId} (Proposal #${proposalId} Co-Signed): ${st.studentName}`);
  }

  // 3. Cohort 3 (N = 6): Disciplinary Cases - Mint + Ethics Revocation + Appellate Reinstatement
  console.log(`\n⚖️ Cohort 3: Seeding ${disciplinaries.length} Disciplinary Cases (Revoked / Reinstated)...`);
  for (const st of disciplinaries) {
    await (
      await contract.connect(registrar).issueDegree(
        st.studentWallet,
        st.studentName,
        st.studentIdNumber,
        st.degreeName,
        st.majorSpecialization,
        st.cgpa,
        st.graduationDate,
        st.institutionName,
        st.certificateHash,
        st.ipfsCID
      )
    ).wait();

    const reasonText =
      st.revocationReason || "Ethics Panel Audit: Temporary suspension pending review.";
    const reasonHash =
      st.revocationReasonHash || hre.ethers.id(`disciplinary_case_${st.tokenId}`);

    await (
      await contract.connect(disciplinaryBoard).revokeDegree(st.tokenId, reasonHash, reasonText)
    ).wait();

    if (st.wasReinstated) {
      await (
        await contract
          .connect(disciplinaryBoard)
          .reinstateDegree(st.tokenId, st.reinstatementNote || "Cleared on Appeal")
      ).wait();
      console.log(`  ✔ Token #${st.tokenId} [REINSTATED]: ${st.studentName}`);
    } else {
      console.log(`  ✔ Token #${st.tokenId} [REVOKED]: ${st.studentName}`);
    }
  }

  // 4. Create pending Proposal #7 awaiting live Dean Co-Signature
  const pendingProp = paperCohorts.proposals.find((p) => !p.executed);
  if (pendingProp) {
    await (
      await contract.connect(registrar).proposeDegreeIssuance(
        pendingProp.studentWallet,
        pendingProp.studentName,
        pendingProp.studentIdNumber,
        pendingProp.degreeName,
        pendingProp.majorSpecialization,
        pendingProp.cgpa,
        pendingProp.graduationDate,
        pendingProp.institutionName,
        pendingProp.certificateHash,
        pendingProp.ipfsCID
      )
    ).wait();
    console.log(`\n📝 Pending Multi-Sig Proposal #7 created for Dean Co-Sign: ${pendingProp.studentName}`);
  }

  console.log(`\n✨ N = ${await contract.totalIssuedCredentials()} Credentials Seeded & EIP-5192 Locked!`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });
