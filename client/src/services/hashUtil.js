import { sha256 } from 'js-sha256';
import { ethers } from 'ethers';

/**
 * Computes SHA-256 hash of a string or ArrayBuffer
 * @param {string | ArrayBuffer | Uint8Array} data
 * @returns {string} Hex-encoded SHA-256 hash with '0x' prefix
 */
export function computeSha256(data) {
  if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
    return '0x' + sha256(data);
  }
  return '0x' + sha256(String(data));
}

/**
 * Computes SHA-256 hash of a File or Blob asynchronously
 * @param {File | Blob} file
 * @returns {Promise<string>}
 */
export async function computeFileHash(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const buffer = e.target.result;
      const hash = computeSha256(buffer);
      resolve(hash);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Computes deterministic Keccak256 hash of academic metadata tuple
 */
export function computeAcademicMetadataHash(metadata) {
  const encoded = ethers.toUtf8Bytes(
    JSON.stringify({
      studentName: metadata.studentName,
      studentId: metadata.studentIdNumber,
      degree: metadata.degreeName,
      major: metadata.majorSpecialization,
      cgpa: metadata.cgpa,
      gradDate: metadata.graduationDate,
      institution: metadata.institutionName,
    })
  );
  return ethers.keccak256(encoded);
}

/**
 * Formats Ethereum addresses for UI display
 */
export function formatAddress(address) {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

/**
 * Formats timestamps into human-readable date strings
 */
export function formatDate(timestamp) {
  if (!timestamp) return 'N/A';
  const num = typeof timestamp === 'bigint' ? Number(timestamp) : Number(timestamp);
  const ms = num < 10000000000 ? num * 1000 : num;
  return new Date(ms).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
