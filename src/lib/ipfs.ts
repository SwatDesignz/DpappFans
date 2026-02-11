import { Web3Storage } from "web3.storage";

let web3StorageClient: Web3Storage | null = null;

/**
 * Initialize Web3.Storage client
 */
export function getWeb3StorageClient(): Web3Storage {
  if (!web3StorageClient) {
    const token = process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN;
    if (!token) {
      throw new Error("Web3.Storage token not configured");
    }
    web3StorageClient = new Web3Storage({ token });
  }
  return web3StorageClient;
}

/**
 * Upload file to IPFS via Web3.Storage
 */
export async function uploadToIPFS(file: File): Promise<string> {
  const client = getWeb3StorageClient();
  const cid = await client.put([file], {
    wrapWithDirectory: false,
  });
  return cid;
}

/**
 * Upload encrypted content metadata to IPFS
 */
export async function uploadContentMetadata(metadata: {
  title: string;
  description: string;
  encryptedFileCid: string;
  encryptedSymmetricKey: string;
  accessControlConditions: any[];
  contentType: string;
  thumbnail?: string;
  creator: string;
  timestamp: number;
}): Promise<string> {
  const client = getWeb3StorageClient();
  
  const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], {
    type: "application/json",
  });
  
  const metadataFile = new File([metadataBlob], "metadata.json", {
    type: "application/json",
  });

  const cid = await client.put([metadataFile], {
    wrapWithDirectory: false,
  });

  return cid;
}

/**
 * Fetch content from IPFS
 */
export async function fetchFromIPFS(cid: string): Promise<any> {
  const url = `https://${cid}.ipfs.w3s.link`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch from IPFS: ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type") || "";
  
  if (contentType.includes("application/json")) {
    return response.json();
  }
  
  return response.blob();
}

/**
 * Get IPFS gateway URL for a CID
 */
export function getIPFSUrl(cid: string): string {
  return `https://${cid}.ipfs.w3s.link`;
}

/**
 * Upload thumbnail image
 */
export async function uploadThumbnail(file: File): Promise<string> {
  return uploadToIPFS(file);
}
