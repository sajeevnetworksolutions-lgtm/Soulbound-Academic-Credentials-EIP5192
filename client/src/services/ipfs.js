import { computeSha256 } from './hashUtil';

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
 * Generate a realistic IPFS CID (Base58-like string prefixed with Qm)
 */
export function generateRealisticCID(content) {
  const hashHex = computeSha256(typeof content === 'string' ? content : JSON.stringify(content)).replace('0x', '');
  // Base58 characters
  const alphabet = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  let cid = 'Qm';
  for (let i = 0; i < 44; i++) {
    const byte = parseInt(hashHex.substr((i * 2) % 60, 2), 16) || (i * 7);
    cid += alphabet[byte % alphabet.length];
  }
  return cid;
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
 * Builds standard EIP-721 / OpenSea compatible metadata schema with academic fields
 */
export function buildAcademicMetadataSchema({
  studentName,
  studentIdNumber,
  degreeName,
  majorSpecialization,
  cgpa,
  graduationDate,
  institutionName,
  certificateHash,
  imageUri,
}) {
  return {
    name: `${degreeName} - ${studentName}`,
    description: `Official Soulbound Academic Credential permanently locked to ${studentName}'s Ethereum soul wallet. Verified and minted in accordance with EIP-5192 standard by ${institutionName}.`,
    image: imageUri || `ipfs://QmDefaultDiplomaBadgeImage`,
    external_url: `https://verify.academic-credentials.edu/verify?hash=${certificateHash}`,
    attributes: [
      { trait_type: 'Student Name', value: studentName },
      { trait_type: 'Student Roll ID', value: studentIdNumber },
      { trait_type: 'Degree Program', value: degreeName },
      { trait_type: 'Specialization / Major', value: majorSpecialization },
      { trait_type: 'CGPA / Grade', value: cgpa },
      { trait_type: 'Graduation Date', value: new Date(graduationDate * 1000).toISOString().split('T')[0] },
      { trait_type: 'Issuing Institution', value: institutionName },
      { trait_type: 'Certificate Cryptographic Hash', value: certificateHash },
      { trait_type: 'Credential Standard', value: 'EIP-5192 Soulbound Token (SBT)' },
      { trait_type: 'Transferability', value: 'Strictly Non-Transferable (Locked)' },
    ],
  };
}
