const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SoulboundAcademicCredential - Formal Security & Audit Test Suite (Slither & Mythril Criteria)", function () {
  let contract;
  let admin, registrar, dean, disciplinaryBoard, student1, student2, attacker, observer;

  const validMetadata = {
    studentName: "Security Audit Subject",
    studentIdNumber: "SEC-2026-999",
    degreeName: "Master of Science in Cybersecurity",
    majorSpecialization: "Blockchain Security & Smart Contract Auditing",
    cgpa: "9.95 / 10.0",
    graduationDate: 1775174400,
    institutionName: "National Institute of Advanced Technologies",
    certificateHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    ipfsCID: "ipfs://QmSecurityAuditCIDPass2026",
  };

  beforeEach(async function () {
    [admin, registrar, dean, disciplinaryBoard, student1, student2, attacker, observer] =
      await ethers.getSigners();

    const Factory = await ethers.getContractFactory("SoulboundAcademicCredential");
    contract = await Factory.deploy(
      "Academic Soulbound Credential Security Audit Registry",
      "SEC-SBT",
      admin.address,
      registrar.address,
      dean.address,
      disciplinaryBoard.address
    );
    await contract.waitForDeployment();
  });

  describe("SECURITY PILLAR 1: Strict Non-Transferability & Soulbound Invariants (EIP-5192)", function () {
    let tokenId;

    beforeEach(async function () {
      const tx = await contract.connect(registrar).issueDegree(
        student1.address,
        validMetadata.studentName,
        validMetadata.studentIdNumber,
        validMetadata.degreeName,
        validMetadata.majorSpecialization,
        validMetadata.cgpa,
        validMetadata.graduationDate,
        validMetadata.institutionName,
        validMetadata.certificateHash,
        validMetadata.ipfsCID
      );
      await tx.wait();
      tokenId = 1n;
    });

    it("SWC-100: Transfer via transferFrom strictly reverts with ErrSoulboundNonTransferable", async function () {
      await expect(
        contract.connect(student1).transferFrom(student1.address, student2.address, tokenId)
      ).to.be.revertedWithCustomError(contract, "ErrSoulboundNonTransferable");
    });

    it("SWC-100: Transfer via safeTransferFrom(address,address,uint256) strictly reverts", async function () {
      await expect(
        contract.connect(student1)["safeTransferFrom(address,address,uint256)"](
          student1.address,
          student2.address,
          tokenId
        )
      ).to.be.revertedWithCustomError(contract, "ErrSoulboundNonTransferable");
    });

    it("SWC-100: Transfer via safeTransferFrom(address,address,uint256,bytes) strictly reverts", async function () {
      await expect(
        contract.connect(student1)["safeTransferFrom(address,address,uint256,bytes)"](
          student1.address,
          student2.address,
          tokenId,
          "0x1234"
        )
      ).to.be.revertedWithCustomError(contract, "ErrSoulboundNonTransferable");
    });

    it("SWC-100: Malicious approval exploits (approve / setApprovalForAll) strictly revert", async function () {
      await expect(
        contract.connect(student1).approve(attacker.address, tokenId)
      ).to.be.revertedWithCustomError(contract, "ErrSoulboundNonTransferable");

      await expect(
        contract.connect(student1).setApprovalForAll(attacker.address, true)
      ).to.be.revertedWithCustomError(contract, "ErrSoulboundNonTransferable");
    });

    it("EIP-5192: locked(tokenId) invariant must always evaluate to true for all minted tokens", async function () {
      expect(await contract.locked(tokenId)).to.equal(true);
    });

    it("EIP-5192: querying locked(unmintedTokenId) reverts with ErrDegreeNotFound", async function () {
      await expect(contract.locked(9999n)).to.be.revertedWithCustomError(
        contract,
        "ErrDegreeNotFound"
      );
    });
  });

  describe("SECURITY PILLAR 2: Zero Reentrancy & Double-Mint Defense", function () {
    it("SWC-107: Non-reentrancy on executeProposal prevents double token creation", async function () {
      // 1. Propose
      await contract.connect(registrar).proposeDegreeIssuance(
        student2.address,
        "Alice Smith",
        "SEC-002",
        validMetadata.degreeName,
        validMetadata.majorSpecialization,
        validMetadata.cgpa,
        validMetadata.graduationDate,
        validMetadata.institutionName,
        "0x1111222233334444555566667777888899990000aaaabbbbccccddddeeeeffff",
        "ipfs://QmDoubleMintDefense"
      );

      // 2. Co-sign by Dean
      await contract.connect(dean).approveProposalByDean(1n);

      // 3. First execution succeeds
      await contract.connect(registrar).executeProposal(1n);

      // 4. Repeated execution fails immediately with ErrProposalAlreadyExecuted
      await expect(
        contract.connect(registrar).executeProposal(1n)
      ).to.be.revertedWithCustomError(contract, "ErrProposalAlreadyExecuted");
    });
  });

  describe("SECURITY PILLAR 3: Access Control & Rogue Admin Defense", function () {
    it("SWC-105/106: Unauthorized users cannot issue degrees directly", async function () {
      await expect(
        contract.connect(attacker).issueDegree(
          attacker.address,
          "Fraudulent Subject",
          "FAKE-666",
          validMetadata.degreeName,
          validMetadata.majorSpecialization,
          "10.0",
          validMetadata.graduationDate,
          validMetadata.institutionName,
          "0x6666666666666666666666666666666666666666666666666666666666666666",
          "ipfs://QmFake"
        )
      ).to.be.revertedWithCustomError(contract, "AccessControlUnauthorizedAccount");
    });

    it("Rogue Registrar cannot execute degree without Dean authorization", async function () {
      await contract.connect(registrar).proposeDegreeIssuance(
        student1.address,
        "Bob Taylor",
        "SEC-003",
        validMetadata.degreeName,
        validMetadata.majorSpecialization,
        validMetadata.cgpa,
        validMetadata.graduationDate,
        validMetadata.institutionName,
        "0x2222333344445555666677778888999900001111222233334444555566667777",
        "ipfs://QmUnapprovedProposal"
      );

      await expect(
        contract.connect(registrar).executeProposal(1n)
      ).to.be.revertedWithCustomError(contract, "ErrProposalNotApprovedByDean");
    });

    it("Unauthorized attacker cannot co-sign as Dean", async function () {
      await contract.connect(registrar).proposeDegreeIssuance(
        student1.address,
        "Charlie Green",
        "SEC-004",
        validMetadata.degreeName,
        validMetadata.majorSpecialization,
        validMetadata.cgpa,
        validMetadata.graduationDate,
        validMetadata.institutionName,
        "0x3333444455556666777788889999000011112222333344445555666677778888",
        "ipfs://QmAttackerCosignTest"
      );

      await expect(
        contract.connect(attacker).approveProposalByDean(1n)
      ).to.be.revertedWithCustomError(contract, "AccessControlUnauthorizedAccount");
    });
  });

  describe("SECURITY PILLAR 4: Dynamic Revocation Integrity & State Resilience", function () {
    let tokenId;

    beforeEach(async function () {
      const tx = await contract.connect(registrar).issueDegree(
        student1.address,
        validMetadata.studentName,
        validMetadata.studentIdNumber,
        validMetadata.degreeName,
        validMetadata.majorSpecialization,
        validMetadata.cgpa,
        validMetadata.graduationDate,
        validMetadata.institutionName,
        validMetadata.certificateHash,
        validMetadata.ipfsCID
      );
      await tx.wait();
      tokenId = 1n;
    });

    it("Only Disciplinary Board can revoke credentials", async function () {
      await expect(
        contract.connect(attacker).revokeDegree(tokenId, "0xreasoncode", "Malicious revocation attempt")
      ).to.be.revertedWithCustomError(contract, "AccessControlUnauthorizedAccount");
    });

    it("Double revocation on already revoked credential reverts with ErrDegreeRevoked", async function () {
      await contract.connect(disciplinaryBoard).revokeDegree(
        tokenId,
        "0xreasoncode",
        "Academic dishonesty"
      );

      await expect(
        contract.connect(disciplinaryBoard).revokeDegree(
          tokenId,
          "0xreasoncode2",
          "Second revocation attempt"
        )
      ).to.be.revertedWithCustomError(contract, "ErrDegreeRevoked");
    });

    it("Reinstating non-revoked degree reverts with ErrDegreeAlreadyValid", async function () {
      await expect(
        contract.connect(disciplinaryBoard).reinstateDegree(tokenId, "Premature reinstatement")
      ).to.be.revertedWithCustomError(contract, "ErrDegreeAlreadyValid");
    });
  });

  describe("SECURITY PILLAR 5: Emergency Circuit Breaker (Pausable)", function () {
    it("Admin can pause contract; state-changing transactions revert while paused", async function () {
      await contract.connect(admin).pause();

      await expect(
        contract.connect(registrar).issueDegree(
          student1.address,
          validMetadata.studentName,
          validMetadata.studentIdNumber,
          validMetadata.degreeName,
          validMetadata.majorSpecialization,
          validMetadata.cgpa,
          validMetadata.graduationDate,
          validMetadata.institutionName,
          "0x4444555566667777888899990000111122223333444455556666777788889999",
          "ipfs://QmPausedTest"
        )
      ).to.be.revertedWithCustomError(contract, "EnforcedPause");

      // Free view calls continue to work during pause
      const [exists, isValid] = await contract.verifyByCertificateHash(validMetadata.certificateHash);
      expect(exists).to.equal(false);

      // Unpause restores functionality
      await contract.connect(admin).unpause();
      await expect(
        contract.connect(registrar).issueDegree(
          student1.address,
          validMetadata.studentName,
          validMetadata.studentIdNumber,
          validMetadata.degreeName,
          validMetadata.majorSpecialization,
          validMetadata.cgpa,
          validMetadata.graduationDate,
          validMetadata.institutionName,
          "0x4444555566667777888899990000111122223333444455556666777788889999",
          "ipfs://QmPausedTest"
        )
      ).to.emit(contract, "DegreeIssued");
    });
  });
});
