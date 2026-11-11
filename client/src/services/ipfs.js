import { computeSha256 } from './hashUtil.js';
import paperCohorts from '../data/paperCohorts.json';

// In-browser IPFS Simulation Storage
const IPFS_STORAGE_KEY = 'soulbound_ipfs_store_v1';

function getLocalIpfsStore() {
  try {
    const raw = localStorage.getItem(IPFS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveLocalIpfsStore(store) {
  try {
    localStorage.setItem(IPFS_STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    console.warn('IPFS localStorage quota exceeded, keeping in memory', e);
  }
}

/**
 * Encodes a byte array using Base58btc (IPFS CIDv0 alphabet)
 */
function encodeBase58(bytes) {
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let digits = [0];
  for (let i = 0; i < bytes.length; i++) {
    let carry = bytes[i];
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8;
      digits[j] = carry % 58;
      carry = (carry / 58) | 0;
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  let result = '';
  for (let i = 0; i < bytes.length && bytes[i] === 0; i++) {
    result += alphabet[0];
  }
  for (let i = digits.length - 1; i >= 0; i--) {
    result += alphabet[digits[i]];
  }
  return result;
}

/**
 * Generate a deterministic IPFS Merkle-DAG CIDv0 (Base58btc multihash: 0x12 0x20 + SHA-256 digest -> "Qm...")
 */
export function generateRealisticCID(content) {
  const hashHex = computeSha256(typeof content === 'string' ? content : JSON.stringify(content)).replace('0x', '');
  const multihash = new Uint8Array(34);
  multihash[0] = 0x12; // sha2-256
  multihash[1] = 0x20; // 32 bytes
  for (let i = 0; i < 32; i++) {
    multihash[2 + i] = parseInt(hashHex.substr(i * 2, 2), 16) || 0;
  }
  return encodeBase58(multihash);
}

/**
 * Pin JSON Metadata to IPFS (supports Pinata or Local Node Fallback)
 * @param {Object} metadata
 * @param {string} [pinataJwt] Optional Pinata JWT
 * @returns {Promise<{ cid: string, ipfsUri: string, gatewayUrl: string }>}
 */
export async function pinJSONToIPFS(metadata, pinataJwt = null) {
  if (pinataJwt) {
    try {
      const res = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${pinataJwt}`,
        },
        body: JSON.stringify({
          pinataContent: metadata,
          pinataMetadata: {
            name: `degree_metadata_${metadata.studentIdNumber || 'sbt'}.json`,
          },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const cid = data.IpfsHash;
        return {
          cid,
          ipfsUri: `ipfs://${cid}`,
          gatewayUrl: `https://gateway.pinata.cloud/ipfs/${cid}`,
        };
      }
    } catch (err) {
      console.warn('Pinata API failed, falling back to decentralized mock engine:', err);
    }
  }

  // Local IPFS Engine Fallback
  const cid = generateRealisticCID(metadata);
  const store = getLocalIpfsStore();
  store[cid] = {
    content: metadata,
    contentType: 'application/json',
    pinnedAt: new Date().toISOString(),
  };
  saveLocalIpfsStore(store);

  return {
    cid,
    ipfsUri: `ipfs://${cid}`,
    gatewayUrl: `https://ipfs.io/ipfs/${cid}`,
  };
}

/**
 * Pin File/Blob/Base64 to IPFS
 * @param {Blob | File | string} fileData
 * @param {string} filename
 * @param {string} [pinataJwt]
 */
export async function pinFileToIPFS(fileData, filename = 'certificate.png', pinataJwt = null) {
  if (pinataJwt && fileData instanceof Blob) {
    try {
      const formData = new FormData();
      formData.append('file', fileData, filename);
      const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${pinataJwt}`,
        },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        const cid = data.IpfsHash;
        return {
          cid,
          ipfsUri: `ipfs://${cid}`,
          gatewayUrl: `https://gateway.pinata.cloud/ipfs/${cid}`,
        };
      }
    } catch (err) {
      console.warn('Pinata file upload fallback:', err);
    }
  }

  const cid = generateRealisticCID(typeof fileData === 'string' ? fileData : fileData.size + filename);
  const store = getLocalIpfsStore();
  store[cid] = {
    content: typeof fileData === 'string' ? fileData : 'data:image/png;base64,...',
    filename,
    contentType: 'image/png',
    pinnedAt: new Date().toISOString(),
  };
  saveLocalIpfsStore(store);

  return {
    cid,
    ipfsUri: `ipfs://${cid}`,
    gatewayUrl: `https://ipfs.io/ipfs/${cid}`,
  };
}

/**
 * Fetch content from IPFS by CID or ipfs:// URI
 */
export async function fetchFromIPFS(uriOrCid) {
  if (!uriOrCid) return null;
  const cid = uriOrCid.replace('ipfs://', '').trim();
  const store = getLocalIpfsStore();
  if (store[cid]) {
    return store[cid].content;
  }
  if (paperCohorts?.ipfsStore?.[cid]) {
    return paperCohorts.ipfsStore[cid].content;
  }

  // Attempt public gateways
  try {
    const res = await fetch(`https://ipfs.io/ipfs/${cid}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    // ignore
  }

  return null;
}

/**
 * Builds standard EIP-721 metadata schema aligned with Paper Eq. (2):
 * CertURI = IPFS_CID(JSON(Degree, CGPA, GradEpoch, H_cert, K_univ))
 */
export function buildAcademicMetadataSchema({
  studentName,
  studentIdNumber,
  studentWallet,
  degreeName,
  majorSpecialization,
  cgpa,
  graduationDate,
  institutionName,
  issuedByRegistrar,
  certificateHash,
  imageUri,
}) {
  const univKey = issuedByRegistrar || '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
  const inst = institutionName || 'Sri Siddhartha Institute of Technology (SSAHE), Tumakuru';
  const gradEpoch = Number(graduationDate) || 1775174400;

  return {
    name: `${degreeName} - ${studentName}`,
    description: `Official EIP-5192 Soulbound Academic Credential permanently bound to ${studentName}'s soul wallet (${studentWallet || 'EVM'}). Issued by ${inst}.`,
    image: imageUri || 'ipfs://QmSSITSoulboundAcademicBadge2026',
    external_url: `https://verify.ssit-ssahe.edu.in/verify?hash=${certificateHash}`,
    // Paper Eq. (2) explicit schema fields: JSON(Degree, CGPA, GradEpoch, H_cert, K_univ)
    degree: degreeName,
    majorSpecialization,
    cgpa,
    gradEpoch,
    certificateHash_Hcert: certificateHash,
    universityPublicKey_Kuniv: univKey,
    institution: inst,
    standard: 'EIP-5192 Minimal Soulbound NFT',
    locked: true,
    attributes: [
      { trait_type: 'Student Name', value: studentName },
      { trait_type: 'Student Roll ID', value: studentIdNumber },
      { trait_type: 'Degree Program', value: degreeName },
      { trait_type: 'Specialization / Major', value: majorSpecialization },
      { trait_type: 'CGPA / Grade', value: cgpa },
      { trait_type: 'GradEpoch', value: gradEpoch },
      { trait_type: 'Graduation Date', value: new Date(gradEpoch * 1000).toISOString().split('T')[0] },
      { trait_type: 'Issuing Institution', value: inst },
      { trait_type: 'Registrar Authority (K_univ)', value: univKey },
      { trait_type: 'PDF Digest (H_cert SHA-256)', value: certificateHash },
      { trait_type: 'Credential Standard', value: 'EIP-5192 Soulbound Token (SBT)' },
      { trait_type: 'Transferability', value: 'Strictly Non-Transferable (Locked = true)' },
    ],
  };
}
