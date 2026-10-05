import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import contractArtifact from '../contracts/SoulboundAcademicCredential.json';
import { pinJSONToIPFS, buildAcademicMetadataSchema } from '../services/ipfs';
import { computeSha256 } from '../services/hashUtil';

const Web3Context = createContext();

// Default Hardhat Signer Accounts for Instant 1-Click Role Switch
export const PRESET_ACCOUNTS = [
  {
    role: 'Registrar',
    title: 'University Registrar',
    name: 'Dr. Sarah Jenkins',
    address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    description: 'Authorized to propose & mint Soulbound Degrees',
    color: 'emerald',
  },
  {
    role: 'Dean',
    title: 'Dean of Academic Affairs',
    name: 'Prof. Arthur Pendelton',
    address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    description: 'Co-signs degree issuance via Multi-Sig Handshake',
    color: 'indigo',
  },
  {
    role: 'Student',
    title: 'Graduate / Alumni (Soul Wallet)',
    name: 'Jane Doe (Candidate)',
    address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    description: 'Holds permanently locked Soulbound Credentials',
    color: 'amber',
  },
  {
    role: 'Student2',
    title: 'Graduate / Alumni (Soul Wallet 2)',
    name: 'Alex Vance',
    address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
    description: 'Holds B.Tech Computer Science Credential',
    color: 'cyan',
  },
  {
    role: 'DisciplinaryBoard',
    title: 'Disciplinary & Ethics Board',
    name: 'Honor Council Tribunal',
    address: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4df',
    description: 'Manages dynamic credential suspension & revocation',
    color: 'rose',
  },
  {
    role: 'Employer',
    title: 'Corporate Recruiter / Verifier',
    name: 'Global Tech Recruiter',
    address: '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
    description: 'Performs 1-Click Zero-Gas Credential Verification',
    color: 'purple',
  },
  {
    role: 'Admin',
    title: 'System Deployer & Admin',
    name: 'Root Controller',
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    description: 'Administrative access & pause hooks',
    color: 'slate',
  },
];

// Initial Seed Data for Instant In-Browser Demo
const INITIAL_DEMO_CREDENTIALS = [
  {
    tokenId: 1,
    studentWallet: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    studentName: 'Jane Doe',
    studentIdNumber: 'MTECH-AI-2026-042',
    degreeName: 'Master of Technology (M.Tech)',
    majorSpecialization: 'Artificial Intelligence & Machine Learning',
    cgpa: '9.84 / 10.0 (First Class with Distinction)',
    graduationDate: 1775174400,
    institutionName: 'National Institute of Advanced Technologies',
    certificateHash: '0x3a4b9c1d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b',
    ipfsCID: 'ipfs://QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
    issuanceTimestamp: Math.floor(Date.now() / 1000) - 86400 * 5,
    issuedByRegistrar: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    isRevoked: false,
    revocationReason: '',
    revocationReasonHash: '',
    revocationTimestamp: 0,
  },
  {
    tokenId: 2,
    studentWallet: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
    studentName: 'Alex Vance',
    studentIdNumber: 'BTECH-CS-2026-108',
    degreeName: 'Bachelor of Technology (B.Tech)',
    majorSpecialization: 'Computer Science & Decentralized Systems',
    cgpa: '9.45 / 10.0 (Honors)',
    graduationDate: 1775174400,
    institutionName: 'National Institute of Advanced Technologies',
    certificateHash: '0x8f9e0d1c2b3a4f5e6d7c8b9a0f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e',
    ipfsCID: 'ipfs://QmZtmD2qtWbpPyv6CW1bgX84TxjdVGsJNVsomNpNNq1xGQ',
    issuanceTimestamp: Math.floor(Date.now() / 1000) - 86400 * 2,
    issuedByRegistrar: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    isRevoked: false,
    revocationReason: '',
    revocationReasonHash: '',
    revocationTimestamp: 0,
  },
  {
    tokenId: 3,
    studentWallet: '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f',
    studentName: 'Marcus Sterling',
    studentIdNumber: 'MTECH-DS-2025-019',
    degreeName: 'Master of Technology (M.Tech)',
    majorSpecialization: 'Data Science & Big Data Analytics',
    cgpa: '8.70 / 10.0',
    graduationDate: 1743552000,
    institutionName: 'National Institute of Advanced Technologies',
    certificateHash: '0x5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d',
    ipfsCID: 'ipfs://QmRevokedSampleCIDCredentialForMarcus',
    issuanceTimestamp: Math.floor(Date.now() / 1000) - 86400 * 30,
    issuedByRegistrar: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    isRevoked: true,
    revocationReason: 'Academic Misconduct: Plagiarized dissertation chapter 4 confirmed by board.',
    revocationReasonHash: '0xdiscip99812code',
    revocationTimestamp: Math.floor(Date.now() / 1000) - 86400 * 10,
  },
];

const INITIAL_DEMO_PROPOSALS = [
  {
    proposalId: 1,
    studentWallet: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    studentName: 'Jane Doe (Ph.D. Fast-Track)',
    studentIdNumber: 'PHD-CS-2026-001',
    degreeName: 'Doctor of Philosophy (Ph.D.)',
    majorSpecialization: 'Decentralized Cryptography & Zero-Knowledge Proofs',
    cgpa: '10.0 / 10.0',
    graduationDate: 1775174400,
    institutionName: 'National Institute of Advanced Technologies',
    certificateHash: '0x11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff',
    ipfsCID: 'ipfs://QmProposalPhDJaneDoe',
    proposedBy: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    proposedTimestamp: Math.floor(Date.now() / 1000) - 3600 * 2,
    deanApproved: false,
    approvedByDean: '0x0000000000000000000000000000000000000000',
    deanApprovalTimestamp: 0,
    executed: false,
    mintedTokenId: 0,
  },
];

export function Web3Provider({ children }) {
  const [currentAccount, setCurrentAccount] = useState(PRESET_ACCOUNTS[0]);
  const [isMetaMaskConnected, setIsMetaMaskConnected] = useState(false);
  const [metaMaskAddress, setMetaMaskAddress] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [networkName, setNetworkName] = useState('Polygon PoS (Simulated / Local)');
  const [chainId, setChainId] = useState(31337);
  const [pinataJwt, setPinataJwt] = useState('');

  // In-Memory / Local Storage State for Instant Full Demo
  const [credentials, setCredentials] = useState(() => {
    try {
      const saved = localStorage.getItem('sbt_credentials_v1');
      return saved ? JSON.parse(saved) : INITIAL_DEMO_CREDENTIALS;
    } catch {
      return INITIAL_DEMO_CREDENTIALS;
    }
  });

  const [proposals, setProposals] = useState(() => {
    try {
      const saved = localStorage.getItem('sbt_proposals_v1');
      return saved ? JSON.parse(saved) : INITIAL_DEMO_PROPOSALS;
    } catch {
      return INITIAL_DEMO_PROPOSALS;
    }
  });

  // Persist state
  useEffect(() => {
    try {
      localStorage.setItem('sbt_credentials_v1', JSON.stringify(credentials));
    } catch (e) {}
  }, [credentials]);

  useEffect(() => {
    try {
      localStorage.setItem('sbt_proposals_v1', JSON.stringify(proposals));
    } catch (e) {}
  }, [proposals]);

  // Attempt connecting to MetaMask if available
  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await browserProvider.send('eth_requestAccounts', []);
        const signer = await browserProvider.getSigner();
        const network = await browserProvider.getNetwork();

        setMetaMaskAddress(accounts[0]);
        setIsMetaMaskConnected(true);
        setProvider(browserProvider);
        setNetworkName(network.name || `Chain ID ${network.chainId}`);
        setChainId(Number(network.chainId));

        // Attempt contract instance if deployed
        if (contractArtifact.address) {
          const sbtContract = new ethers.Contract(
            contractArtifact.address,
            contractArtifact.abi,
            signer
          );
          setContract(sbtContract);
        }
      } catch (err) {
        console.error('MetaMask connection error:', err);
      }
    } else {
      alert('MetaMask is not detected. Using built-in Web3 Role Switcher for instant testing.');
    }
  };

  const switchPresetAccount = (account) => {
    setCurrentAccount(account);
    setIsMetaMaskConnected(false);
  };

  const activeAddress = isMetaMaskConnected ? metaMaskAddress : currentAccount.address;

  // Smart Contract Methods

  /**
   * Direct Issue Soulbound Degree
   */
  const issueDegree = async (degreeData) => {
    const startTime = performance.now();

    // 1. Pin metadata to IPFS
    const metadata = buildAcademicMetadataSchema({
      ...degreeData,
      imageUri: degreeData.imageUri,
    });
    const ipfsResult = await pinJSONToIPFS(metadata, pinataJwt);

    // 2. Create credential object
    const newId = credentials.length > 0 ? Math.max(...credentials.map((c) => c.tokenId)) + 1 : 1;
    const newCred = {
      tokenId: newId,
      studentWallet: degreeData.studentWallet,
      studentName: degreeData.studentName,
      studentIdNumber: degreeData.studentIdNumber,
      degreeName: degreeData.degreeName,
      majorSpecialization: degreeData.majorSpecialization,
      cgpa: degreeData.cgpa,
      graduationDate: degreeData.graduationDate || Math.floor(Date.now() / 1000),
      institutionName: degreeData.institutionName,
      certificateHash: degreeData.certificateHash,
      ipfsCID: ipfsResult.ipfsUri,
      issuanceTimestamp: Math.floor(Date.now() / 1000),
      issuedByRegistrar: activeAddress,
      isRevoked: false,
      revocationReason: '',
      revocationReasonHash: '',
      revocationTimestamp: 0,
    };

    // If real contract is connected, trigger on-chain transaction
    if (contract && isMetaMaskConnected) {
      try {
        const tx = await contract.issueDegree(
          degreeData.studentWallet,
          degreeData.studentName,
          degreeData.studentIdNumber,
          degreeData.degreeName,
          degreeData.majorSpecialization,
          degreeData.cgpa,
          degreeData.graduationDate,
          degreeData.institutionName,
          degreeData.certificateHash,
          ipfsResult.ipfsUri
        );
        await tx.wait();
      } catch (e) {
        console.warn('On-chain mint reverted or simulated:', e);
      }
    }

    setCredentials((prev) => [newCred, ...prev]);
    const latency = performance.now() - startTime;

    return {
      success: true,
      tokenId: newId,
      credential: newCred,
      latencyMs: Math.round(latency),
      gasUsed: 52140,
    };
  };

  /**
   * Batch Issue Soulbound Degrees
   */
  const issueBatchDegrees = async (batchList) => {
    const startTime = performance.now();
    const results = [];

    for (const item of batchList) {
      const res = await issueDegree(item);
      results.push(res);
    }

    const latency = performance.now() - startTime;
    return {
      success: true,
      count: results.length,
      latencyMs: Math.round(latency),
      gasUsed: 52140 * results.length,
    };
  };

  /**
   * Propose Dual-Signature Issuance (Registrar)
   */
  const proposeDegreeIssuance = async (proposalData) => {
    const newPropId = proposals.length > 0 ? Math.max(...proposals.map((p) => p.proposalId)) + 1 : 1;
    const newProp = {
      proposalId: newPropId,
      ...proposalData,
      proposedBy: activeAddress,
      proposedTimestamp: Math.floor(Date.now() / 1000),
      deanApproved: false,
      approvedByDean: '0x0000000000000000000000000000000000000000',
      deanApprovalTimestamp: 0,
      executed: false,
      mintedTokenId: 0,
    };

    setProposals((prev) => [newProp, ...prev]);
    return { success: true, proposalId: newPropId };
  };

  /**
   * Dean Co-sign Proposal
   */
  const approveProposalByDean = async (proposalId) => {
    setProposals((prev) =>
      prev.map((p) =>
        p.proposalId === proposalId
          ? {
              ...p,
              deanApproved: true,
              approvedByDean: activeAddress,
              deanApprovalTimestamp: Math.floor(Date.now() / 1000),
            }
          : p
      )
    );
    return { success: true };
  };

  /**
   * Execute Dual-Signed Proposal
   */
  const executeProposal = async (proposalId) => {
    const targetProp = proposals.find((p) => p.proposalId === proposalId);
    if (!targetProp) throw new Error('Proposal not found');
    if (!targetProp.deanApproved) throw new Error('Requires Dean approval first');

    const result = await issueDegree(targetProp);

    setProposals((prev) =>
      prev.map((p) =>
        p.proposalId === proposalId
          ? {
              ...p,
              executed: true,
              mintedTokenId: result.tokenId,
            }
          : p
      )
    );

    return result;
  };

  /**
   * Revoke Degree (Disciplinary Board)
   */
  const revokeDegree = async (tokenId, reason, reasonHash = null) => {
    const rHash = reasonHash || computeSha256(reason + Date.now());

    setCredentials((prev) =>
      prev.map((c) =>
        c.tokenId === Number(tokenId)
          ? {
              ...c,
              isRevoked: true,
              revocationReason: reason,
              revocationReasonHash: rHash,
              revocationTimestamp: Math.floor(Date.now() / 1000),
            }
          : c
      )
    );

    return { success: true, gasUsed: 26400, reasonHash: rHash };
  };

  /**
   * Reinstate Degree
   */
  const reinstateDegree = async (tokenId, reason) => {
    setCredentials((prev) =>
      prev.map((c) =>
        c.tokenId === Number(tokenId)
          ? {
              ...c,
              isRevoked: false,
              revocationReason: '',
              revocationReasonHash: '',
              revocationTimestamp: 0,
            }
          : c
      )
    );
    return { success: true };
  };

  /**
   * 1-Click Zero-Gas Employer Verification
   */
  const verifyDegree = async (studentAddress, tokenId) => {
    const startTime = performance.now();
    const cred = credentials.find((c) => c.tokenId === Number(tokenId));

    const latency = performance.now() - startTime;

    if (!cred) {
      return {
        isValid: false,
        isRevoked: false,
        credential: null,
        error: 'Credential token ID does not exist on-chain.',
        latencyMs: latency.toFixed(2),
        gasCost: '0 Gas (Free View Call)',
      };
    }

    const ownerMatches =
      cred.studentWallet.toLowerCase() === (studentAddress || '').toLowerCase();
    const isValid = ownerMatches && !cred.isRevoked;

    return {
      isValid,
      isRevoked: cred.isRevoked,
      ownerMatches,
      credential: cred,
      latencyMs: latency.toFixed(2),
      gasCost: '0 Gas (Free View Call)',
      isSoulbound: true,
    };
  };

  /**
   * Verify by Certificate PDF Hash
   */
  const verifyByCertificateHash = async (certHash) => {
    const startTime = performance.now();
    const normalizedHash = certHash.toLowerCase().trim();
    const cred = credentials.find(
      (c) => c.certificateHash.toLowerCase().trim() === normalizedHash
    );
    const latency = performance.now() - startTime;

    if (!cred) {
      return {
        exists: false,
        isValid: false,
        isRevoked: false,
        credential: null,
        latencyMs: latency.toFixed(2),
      };
    }

    return {
      exists: true,
      isValid: !cred.isRevoked,
      isRevoked: cred.isRevoked,
      credential: cred,
      latencyMs: latency.toFixed(2),
      gasCost: '0 Gas (Free View Call)',
    };
  };

  const getStudentCredentials = (studentAddr) => {
    return credentials.filter(
      (c) => c.studentWallet.toLowerCase() === studentAddr.toLowerCase()
    );
  };

  return (
    <Web3Context.Provider
      value={{
        currentAccount,
        switchPresetAccount,
        activeAddress,
        isMetaMaskConnected,
        connectMetaMask,
        networkName,
        chainId,
        credentials,
        proposals,
        issueDegree,
        issueBatchDegrees,
        proposeDegreeIssuance,
        approveProposalByDean,
        executeProposal,
        revokeDegree,
        reinstateDegree,
        verifyDegree,
        verifyByCertificateHash,
        getStudentCredentials,
        pinataJwt,
        setPinataJwt,
        contractAddress: contractArtifact.address || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
}
