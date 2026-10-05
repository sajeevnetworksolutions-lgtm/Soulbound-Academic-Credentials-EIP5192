const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SoulboundAcademicCredential (EIP-5192) - M.Tech Research Test Suite", function () {
  let contract;
  let admin, registrar, dean, disciplinaryBoard, student1, student2, employer, attacker;

  const sampleDegree = {
    studentName: "Jane Doe",
    studentIdNumber: "MTECH-2026-084",
    degreeName: "Master of Technology",
    majorSpecialization: "Artificial Intelligence & Machine Learning",
    cgpa: "9.62 / 10.0",
    graduationDate: 1775174400, // 2026 epoch
    institutionName: "National Institute of Advanced Technologies",
    certificateHash: "0x3a4b9c1d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b",
    ipfsCID: "ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG",
  };

  beforeEach(async function () {
    [admin, registrar, dean, disciplinaryBoard, student1, student2, employer, attacker] =
      await ethers.getSigners();

    const SoulboundFactory = await ethers.getContractFactory("SoulboundAcademicCredential");
    contract = await SoulboundFactory.deploy(
      "Academic Soulbound Credential",
      "ASBT",
      admin.address,
      registrar.address,
      dean.address,
      disciplinaryBoard.address
    );
    await contract.waitForDeployment();
  });

  describe("1. Deployment & EIP-165 / EIP-5192 Interface Support", function () {
    it("Should properly assign initial roles to designated university authorities", async function () {
      const REGISTRAR_ROLE = await contract.REGISTRAR_ROLE();
      const DEAN_ROLE = await contract.DEAN_ROLE();
      const DISCIPLINARY_BOARD_ROLE = await contract.DISCIPLINARY_BOARD_ROLE();

      expect(await contract.hasRole(REGISTRAR_ROLE, registrar.address)).to.be.true;
      expect(await contract.hasRole(DEAN_ROLE, dean.address)).to.be.true;
      expect(await contract.hasRole(DISCIPLINARY_BOARD_ROLE, disciplinaryBoard.address)).to.be.true;
      expect(await contract.hasRole(REGISTRAR_ROLE, attacker.address)).to.be.false;
    });

    it("Should support EIP-5192 Soulbound Token interface (0xb45a3c0e)", async function () {
      const EIP5192_INTERFACE_ID = "0xb45a3c0e";
      expect(await contract.supportsInterface(EIP5192_INTERFACE_ID)).to.be.true;
    });
  });

  describe("2. Single Credential Issuance & EIP-5192 Locking", function () {
    it("Should allow Registrar to issue Soulbound Degree and emit Locked event", async function () {
      const tx = await contract.connect(registrar).issueDegree(
        student1.address,
        sampleDegree.studentName,
        sampleDegree.studentIdNumber,
        sampleDegree.degreeName,
        sampleDegree.majorSpecialization,
        sampleDegree.cgpa,
        sampleDegree.graduationDate,
        sampleDegree.institutionName,
        sampleDegree.certificateHash,
        sampleDegree.ipfsCID
      );

      const receipt = await tx.wait();
      expect(receipt.status).to.equal(1);

      // Verify EIP-5192 Locked event
      await expect(tx)
        .to.emit(contract, "Locked")
        .withArgs(1n);

      // Verify DegreeIssued event
      await expect(tx)
        .to.emit(contract, "DegreeIssued")
        .withArgs(
          1n,
          student1.address,
          sampleDegree.studentName,
          sampleDegree.degreeName,
          sampleDegree.certificateHash,
          sampleDegree.ipfsCID,
          registrar.address
        );

      // Verify locked(1) returns true (EIP-5192)
      expect(await contract.locked(1n)).to.be.true;
      expect(await contract.ownerOf(1n)).to.equal(student1.address);
      expect(await contract.tokenURI(1n)).to.equal(sampleDegree.ipfsCID);
    });

    it("Should prevent unauthorized callers from issuing credentials", async function () {
      await expect(
        contract.connect(attacker).issueDegree(
          attacker.address,
          "Fraudulent Student",
          "FAKE-001",
          "Ph.D. in Computer Science",
          "Cybersecurity",
          "10.0 / 10.0",
          sampleDegree.graduationDate,
          sampleDegree.institutionName,
          sampleDegree.certificateHash,
          sampleDegree.ipfsCID
        )
      ).to.be.revertedWithCustomError(contract, "AccessControlUnauthorizedAccount");
    });
  });

  describe("3. Non-Transferability Enforcement (Soulbound Property)", function () {
    beforeEach(async function () {
      await contract.connect(registrar).issueDegree(
        student1.address,
        sampleDegree.studentName,
        sampleDegree.studentIdNumber,
        sampleDegree.degreeName,
        sampleDegree.majorSpecialization,
        sampleDegree.cgpa,
        sampleDegree.graduationDate,
        sampleDegree.institutionName,
        sampleDegree.certificateHash,
        sampleDegree.ipfsCID
      );
    });

    it("Should strictly REVERT when student attempts to transfer degree via transferFrom", async function () {
      await expect(
        contract.connect(student1).transferFrom(student1.address, student2.address, 1n)
      ).to.be.revertedWithCustomError(contract, "ErrSoulboundNonTransferable");
    });

    it("Should strictly REVERT when student attempts safeTransferFrom", async function () {
      await expect(
        contract.connect(student1)["safeTransferFrom(address,address,uint256)"](
          student1.address,
          student2.address,
          1n
        )
      ).to.be.revertedWithCustomError(contract, "ErrSoulboundNonTransferable");
    });

    it("Should strictly REVERT when student attempts to approve third-party spender", async function () {
      await expect(
        contract.connect(student1).approve(employer.address, 1n)
      ).to.be.revertedWithCustomError(contract, "ErrSoulboundNonTransferable");
    });

    it("Should strictly REVERT when student attempts setApprovalForAll", async function () {
      await expect(
        contract.connect(student1).setApprovalForAll(employer.address, true)
      ).to.be.revertedWithCustomError(contract, "ErrSoulboundNonTransferable");
    });
  });

  describe("4. Multi-Signature Handshake Workflow (Registrar + Dean)", function () {
    it("Should execute proposal only after Dean co-signature is verified", async function () {
      // 1. Registrar proposes issuance
      const propTx = await contract.connect(registrar).proposeDegreeIssuance(
        student2.address,
        "John Smith",
        "MTECH-2026-085",
        sampleDegree.degreeName,
        sampleDegree.majorSpecialization,
        "9.40 / 10.0",
        sampleDegree.graduationDate,
        sampleDegree.institutionName,
        "0x9876543210abcdef9876543210abcdef9876543210abcdef9876543210abcdef",
        "ipfs://QmSampleCIDForJohnSmith"
      );

      await expect(propTx)
        .to.emit(contract, "ProposalCreated")
        .withArgs(1n, student2.address, "John Smith", sampleDegree.degreeName, registrar.address);

      // 2. Execution before Dean approval must fail
      await expect(
        contract.connect(registrar).executeProposal(1n)
      ).to.be.revertedWithCustomError(contract, "ErrProposalNotApprovedByDean");

      // 3. Unauthorized attacker cannot approve
      await expect(
        contract.connect(attacker).approveProposalByDean(1n)
      ).to.be.revertedWithCustomError(contract, "AccessControlUnauthorizedAccount");

      // 4. Dean co-signs
      await expect(contract.connect(dean).approveProposalByDean(1n))
        .to.emit(contract, "ProposalApprovedByDean");

      // 5. Registrar executes proposal
      const execTx = await contract.connect(registrar).executeProposal(1n);
      await expect(execTx)
        .to.emit(contract, "ProposalExecuted")
        .withArgs(1n, 1n, student2.address);

      expect(await contract.ownerOf(1n)).to.equal(student2.address);
      expect(await contract.locked(1n)).to.be.true;
    });
  });

  describe("5. Dynamic On-Chain Revocation Logic (Disciplinary Board)", function () {
    beforeEach(async function () {
      await contract.connect(registrar).issueDegree(
        student1.address,
        sampleDegree.studentName,
        sampleDegree.studentIdNumber,
        sampleDegree.degreeName,
        sampleDegree.majorSpecialization,
        sampleDegree.cgpa,
        sampleDegree.graduationDate,
        sampleDegree.institutionName,
        sampleDegree.certificateHash,
        sampleDegree.ipfsCID
      );
    });

    it("Should allow Disciplinary Board to revoke credential and invalidate verification", async function () {
      const reasonHash = "0xdiscip999hashcode";
      const reasonText = "Revoked due to thesis plagiarism confirmed by inquiry panel.";

      const revokeTx = await contract.connect(disciplinaryBoard).revokeDegree(1n, reasonHash, reasonText);
      await expect(revokeTx)
        .to.emit(contract, "DegreeRevoked");

      const [isValid, isRevoked, cred] = await contract.verifyDegree(student1.address, 1n);
      expect(isValid).to.be.false;
      expect(isRevoked).to.be.true;
      expect(cred.revocationReason).to.equal(reasonText);
    });

    it("Should allow Disciplinary Board to reinstate degree upon successful appeal", async function () {
      await contract.connect(disciplinaryBoard).revokeDegree(1n, "0xhash", "Suspended pending review");
      
      const reinstateTx = await contract.connect(disciplinaryBoard).reinstateDegree(1n, "Cleared by appellate tribunal");
      await expect(reinstateTx).to.emit(contract, "DegreeReinstated");

      const [isValid, isRevoked] = await contract.verifyDegree(student1.address, 1n);
      expect(isValid).to.be.true;
      expect(isRevoked).to.be.false;
    });
  });

  describe("6. 1-Click Zero-Gas Employer Verification Engine", function () {
    beforeEach(async function () {
      await contract.connect(registrar).issueDegree(
        student1.address,
        sampleDegree.studentName,
        sampleDegree.studentIdNumber,
        sampleDegree.degreeName,
        sampleDegree.majorSpecialization,
        sampleDegree.cgpa,
        sampleDegree.graduationDate,
        sampleDegree.institutionName,
        sampleDegree.certificateHash,
        sampleDegree.ipfsCID
      );
    });

    it("Should verify genuine credential instantly with 0 gas", async function () {
      const [isValid, isRevoked, cred] = await contract.verifyDegree(student1.address, 1n);
      expect(isValid).to.be.true;
      expect(isRevoked).to.be.false;
      expect(cred.studentName).to.equal(sampleDegree.studentName);
      expect(cred.cgpa).to.equal(sampleDegree.cgpa);
      expect(cred.institutionName).to.equal(sampleDegree.institutionName);
    });

    it("Should reject verification if student address does not match token owner", async function () {
      const [isValid, isRevoked] = await contract.verifyDegree(attacker.address, 1n);
      expect(isValid).to.be.false;
      expect(isRevoked).to.be.false;
    });

    it("Should verify degree by PDF Cryptographic Hash (Drag & Drop verification)", async function () {
      const [exists, isValid, isRevoked, cred] = await contract.verifyByCertificateHash(sampleDegree.certificateHash);
      expect(exists).to.be.true;
      expect(isValid).to.be.true;
      expect(isRevoked).to.be.false;
      expect(cred.tokenId).to.equal(1n);
      expect(cred.studentWallet).to.equal(student1.address);
    });

    it("Should return non-existent for unrecorded certificate hash", async function () {
      const [exists, isValid] = await contract.verifyByCertificateHash("0xfakehash1234567890");
      expect(exists).to.be.false;
      expect(isValid).to.be.false;
    });
  });

  describe("7. Batch Issuance for Cohorts", function () {
    it("Should issue degrees in batch to multiple graduates", async function () {
      const wallets = [student1.address, student2.address];
      const names = ["Student One", "Student Two"];
      const rollNos = ["MTECH-001", "MTECH-002"];
      const degrees = ["M.Tech AI", "M.Tech AI"];
      const majors = ["Deep Learning", "NLP"];
      const cgpas = ["9.50", "9.20"];
      const dates = [1775174400, 1775174400];
      const univs = ["NIAT", "NIAT"];
      const hashes = ["0xhash111111111111111111", "0xhash222222222222222222"];
      const cids = ["ipfs://QmBatch1", "ipfs://QmBatch2"];

      const tx = await contract.connect(registrar).issueBatchDegrees(
        wallets,
        names,
        rollNos,
        degrees,
        majors,
        cgpas,
        dates,
        univs,
        hashes,
        cids
      );
      await tx.wait();

      expect(await contract.totalIssuedCredentials()).to.equal(2n);
      expect(await contract.ownerOf(1n)).to.equal(student1.address);
      expect(await contract.ownerOf(2n)).to.equal(student2.address);
    });
  });
});
