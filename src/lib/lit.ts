import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { LitNetwork } from "@lit-protocol/constants";
import { ethers } from "ethers";

let litNodeClient: any = null;

/**
 * Initialize Lit Protocol client
 */
export async function initLitClient() {
  if (litNodeClient) return litNodeClient;

  const client = new LitJsSdk.LitNodeClient({
    litNetwork: (process.env.NEXT_PUBLIC_LIT_NETWORK as LitNetwork) || LitNetwork.DatilDev,
    debug: process.env.NODE_ENV === "development",
  });

  await client.connect();
  litNodeClient = client;

  return client;
}

/**
 * Get Lit client instance
 */
export function getLitClient() {
  if (!litNodeClient) {
    throw new Error("Lit client not initialized. Call initLitClient() first.");
  }
  return litNodeClient;
}

/**
 * Create Unified Access Control Conditions for subscription-gated content
 */
export function createSubscriptionAccessConditions(
  chainId: number,
  subscriptionManagerAddress: string,
  subscriberAddress: string,
  planId: number
) {
  return [
    {
      conditionType: "evmContract",
      contractAddress: subscriptionManagerAddress,
      functionName: "isSubscriptionActive",
      functionParams: [subscriberAddress, planId.toString()],
      functionAbi: {
        name: "isSubscriptionActive",
        type: "function",
        stateMutability: "view",
        inputs: [
          { type: "address", name: "subscriber" },
          { type: "uint256", name: "planId" },
        ],
        outputs: [{ type: "bool", name: "" }],
      },
      chain: getChainName(chainId),
      returnValueTest: {
        key: "",
        comparator: "=",
        value: "true",
      },
    },
  ];
}

/**
 * Create Unified Access Control Conditions for PPV content
 */
export function createPPVAccessConditions(
  chainId: number,
  ppvManagerAddress: string,
  viewerAddress: string,
  contentId: string
) {
  return [
    {
      conditionType: "evmContract",
      contractAddress: ppvManagerAddress,
      functionName: "hasAccess",
      functionParams: [viewerAddress, contentId],
      functionAbi: {
        name: "hasAccess",
        type: "function",
        stateMutability: "view",
        inputs: [
          { type: "address", name: "viewer" },
          { type: "bytes32", name: "contentId" },
        ],
        outputs: [{ type: "bool", name: "" }],
      },
      chain: getChainName(chainId),
      returnValueTest: {
        key: "",
        comparator: "=",
        value: "true",
      },
    },
  ];
}

/**
 * Create Unified Access Control Conditions for creator token holders
 */
export function createCreatorTokenAccessConditions(
  chainId: number,
  creatorTokenAddress: string,
  holderAddress: string,
  creatorAddress: string,
  minBalance: number
) {
  return [
    {
      conditionType: "evmContract",
      contractAddress: creatorTokenAddress,
      functionName: "holdsCreatorToken",
      functionParams: [holderAddress, creatorAddress],
      functionAbi: {
        name: "holdsCreatorToken",
        type: "function",
        stateMutability: "view",
        inputs: [
          { type: "address", name: "holder" },
          { type: "address", name: "creator" },
        ],
        outputs: [{ type: "uint256", name: "balance" }],
      },
      chain: getChainName(chainId),
      returnValueTest: {
        key: "",
        comparator: ">=",
        value: minBalance.toString(),
      },
    },
  ];
}

/**
 * Encrypt content using Lit Protocol
 */
export async function encryptContent(
  content: string | Uint8Array,
  accessControlConditions: any[],
  chainId: number
): Promise<{
  ciphertext: string;
  dataToEncryptHash: string;
}> {
  const client = await initLitClient();

  const { ciphertext, dataToEncryptHash } = await LitJsSdk.encryptString(
    {
      accessControlConditions,
      dataToEncrypt: content,
    },
    client
  );

  return {
    ciphertext,
    dataToEncryptHash,
  };
}

/**
 * Decrypt content using Lit Protocol
 */
export async function decryptContent(
  ciphertext: string,
  dataToEncryptHash: string,
  accessControlConditions: any[],
  chainId: number,
  authSig: any
): Promise<string> {
  const client = await initLitClient();

  const decryptedString = await LitJsSdk.decryptToString(
    {
      accessControlConditions,
      ciphertext,
      dataToEncryptHash,
      authSig,
      chain: getChainName(chainId),
    },
    client
  );

  return decryptedString;
}

/**
 * Encrypt file for upload
 */
export async function encryptFile(
  file: File,
  accessControlConditions: any[],
  chainId: number
): Promise<{
  encryptedFile: Blob;
  encryptedSymmetricKey: any;
}> {
  const client = await initLitClient();

  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  const { ciphertext, dataToEncryptHash } = await LitJsSdk.encryptString(
    {
      accessControlConditions,
      dataToEncrypt: uint8Array,
    },
    client
  );

  return {
    encryptedFile: new Blob([ciphertext]),
    encryptedSymmetricKey: dataToEncryptHash,
  };
}

/**
 * Get authentication signature for Lit Protocol
 */
export async function getAuthSig(signer: ethers.Signer) {
  const address = await signer.getAddress();
  const message = `Sign this message to decrypt content from DpappFans.\n\nTimestamp: ${Date.now()}`;
  
  const signature = await signer.signMessage(message);

  return {
    sig: signature,
    derivedVia: "web3.eth.personal.sign",
    signedMessage: message,
    address: address,
  };
}

/**
 * Helper to get chain name for Lit Protocol
 */
function getChainName(chainId: number): string {
  const chainNames: { [key: number]: string } = {
    137: "polygon",
    80002: "polygonAmoy",
    8453: "base",
    84532: "baseSepolia",
    1337: "localhost",
  };
  return chainNames[chainId] || "polygon";
}
