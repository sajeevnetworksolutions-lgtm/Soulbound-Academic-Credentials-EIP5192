const { expect } = require("chai");
const { ethers } = require("hardhat");
const paperCohorts = require("../client/src/data/paperCohorts.json");

describe("IEEE Paper Experimental Methodology - N=18 Cohort & Formal Proofs (SSIT / SSAHE)", function () {
  let contract;
  let admin, registrar, dean, student1, student2, disciplinaryBoard, employer, attacker;

  beforeEach(async function () {
    [admin, registrar, dean, student1, student2, disciplinaryBoard, employer, attacker] =
      await ethers.getSigners();

    const Factory = await ethers.getContractFactory("SoulboundAcademicCredential");
    contract = await Factory.deploy(
      "Sri Siddhartha Academy of Higher Education - Soulbound Degree Registry",
      "SSITSBT",
      admin.address,
      registrar.address,
      dean.address,
      disciplinaryBoard.address
    );
    await contract.waitForDeployment();
  });

  it("Should execute full Table II N=18 Stratified Testbed Cohort (6 Undergrad + 6 Multi-Sig + 6 Disciplinary)", async function () {
    const undergrads = paperCohorts.credentials.filter((c) => c.cohortKey === "undergrad");
    const multisigs = paperCohorts.credentials.filter((c) => c.cohortKey === "multisig");
    const disciplinaries = paperCohorts.credentials.filter((c) => c.cohortKey === "disciplinary");

    expect(undergrads.length).to.equal(6);
    expect(multisigs.length).to.equal(6);
    expect(disciplinaries.length).to.equal(6);

    // Cohort 1: Direct Registrar Issuance (N = 6)
    for (const c of undergrads) {
      await contract.connect(registrar).issueDegree(
        c.studentWallet,
        c.studentName,
        c.studentIdNumber,
        c.degreeName,
        c.majorSpecialization,
        c.cgpa,
        c.graduationDate,
        c.institutionName,
        c.certificateHash,
        c.ipfsCID
      );
    }

    // Cohort 2: Dual Multi-Sig Proposal + Dean Co-Sign + Execution (N = 6)
    for (let i = 0; i < multisigs.length; i++) {
      const c = multisigs[i];
      const proposalId = BigInt(i + 1);
      await contract.connect(registrar).proposeDegreeIssuance(
        c.studentWallet,
        c.studentName,
        c.studentIdNumber,
        c.degreeName,
        c.majorSpecialization,
        c.cgpa,
        c.graduationDate,
        c.institutionName,
        c.certificateHash,
        c.ipfsCID
      );
      await contract.connect(dean).approveProposalByDean(proposalId);
      await contract.connect(registrar).executeProposal(proposalId);
    }

    // Cohort 3: Disciplinary Sanctions & Appellate Reinstatement (N = 6)
    for (const c of disciplinaries) {
      await contract.connect(registrar).issueDegree(
        c.studentWallet,
        c.studentName,
        c.studentIdNumber,
        c.degreeName,
        c.majorSpecialization,
        c.cgpa,
        c.graduationDate,
        c.institutionName,
        c.certificateHash,
        c.ipfsCID
      );
      await contract
        .connect(disciplinaryBoard)
        .revokeDegree(c.tokenId, c.revocationReasonHash || ethers.id("ethics"), c.revocationReason || "Misconduct");

      if (c.wasReinstated) {
        await contract
          .connect(disciplinaryBoard)
          .reinstateDegree(c.tokenId, c.reinstatementNote || "Appellate exoneration");
      }
    }

    // Verify Total N = 18 minted credentials
    expect(await contract.totalIssuedCredentials()).to.equal(18n);

    // Verify EIP-5192 locked == true and Eq. (6) status across all 18 tokens
    let activeCount = 0;
    let revokedCount = 0;
    for (const c of paperCohorts.credentials) {
      expect(await contract.locked(c.tokenId)).to.equal(true);
      const [isValid, isRevoked, isLocked] = await contract.verifyDegreeStatusEq6(
        c.studentWallet,
        c.tokenId
      );
      expect(isLocked).to.equal(true);
      expect(isRevoked).to.equal(c.isRevoked);
      expect(isValid).to.equal(!c.isRevoked);

      const [exists, hashValid, hashRevoked] = await contract.verifyByCertificateHash(c.certificateHash);
      expect(exists).to.equal(true);
      expect(hashValid).to.equal(!c.isRevoked);
      expect(hashRevoked).to.equal(c.isRevoked);

      if (isRevoked) revokedCount++;
      else activeCount++;
    }

    expect(activeCount).to.equal(14);
    expect(revokedCount).to.equal(4);
  });

  it("Should demonstrate amortized batch efficiency on issueBatchDegrees() vs sequential direct minting", async function () {
    const firstBatch = paperCohorts.credentials.slice(0, 5);

    const singleTx = await contract.connect(registrar).issueDegree(
      firstBatch[0].studentWallet,
      firstBatch[0].studentName,
      firstBatch[0].studentIdNumber,
      firstBatch[0].degreeName,
      firstBatch[0].majorSpecialization,
      firstBatch[0].cgpa,
      firstBatch[0].graduationDate,
      firstBatch[0].institutionName,
      firstBatch[0].certificateHash,
      firstBatch[0].ipfsCID
    );
    const singleReceipt = await singleTx.wait();

    const batchTx = await contract.connect(registrar).issueBatchDegrees(
      firstBatch.map((c) => c.studentWallet),
      firstBatch.map((c) => c.studentName),
      firstBatch.map((c) => c.studentIdNumber),
      firstBatch.map((c) => c.degreeName),
      firstBatch.map((c) => c.majorSpecialization),
      firstBatch.map((c) => c.cgpa),
      firstBatch.map((c) => c.graduationDate),
      firstBatch.map((c) => c.institutionName),
      firstBatch.map((c) => c.certificateHash + "_b"),
      firstBatch.map((c) => c.ipfsCID)
    );
    const batchReceipt = await batchTx.wait();
    const gasPerCredentialInBatch = batchReceipt.gasUsed / BigInt(firstBatch.length);

    expect(gasPerCredentialInBatch).to.be.lessThan(singleReceipt.gasUsed);
  });
});
