"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useCreatePlan } from "@/hooks/useSubscription";
import { uploadContentMetadata, uploadToIPFS, uploadThumbnail } from "@/lib/ipfs";
import { encryptFile, createSubscriptionAccessConditions } from "@/lib/lit";
import { useChainId } from "wagmi";
import { getContractsForChain } from "@/lib/contracts";
import toast from "react-hot-toast";

export default function CreatorUpload() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const contracts = getContractsForChain(chainId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contentFile, setContentFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [planId, setPlanId] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (!address || !isConnected) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!contentFile || !title || !planId) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("Encrypting and uploading content...");

    try {
      // Step 1: Create access control conditions for Lit Protocol
      const accessConditions = createSubscriptionAccessConditions(
        chainId,
        contracts.subscriptionManager,
        address, // This will be checked for any subscriber
        parseInt(planId)
      );

      // Step 2: Encrypt the content file
      const { encryptedFile, encryptedSymmetricKey } = await encryptFile(
        contentFile,
        accessConditions,
        chainId
      );

      // Step 3: Upload encrypted file to IPFS
      const encryptedBlob = new File([encryptedFile], "encrypted-content", {
        type: contentFile.type,
      });
      const encryptedFileCid = await uploadToIPFS(encryptedBlob);

      // Step 4: Upload thumbnail if provided
      let thumbnailCid = "";
      if (thumbnailFile) {
        thumbnailCid = await uploadThumbnail(thumbnailFile);
      }

      // Step 5: Create and upload metadata
      const metadata = {
        title,
        description,
        encryptedFileCid,
        encryptedSymmetricKey: JSON.stringify(encryptedSymmetricKey),
        accessControlConditions: accessConditions,
        contentType: contentFile.type,
        thumbnail: thumbnailCid,
        creator: address,
        timestamp: Date.now(),
      };

      const metadataCid = await uploadContentMetadata(metadata);

      toast.success("Content uploaded successfully!", { id: toastId });
      
      console.log("Content metadata CID:", metadataCid);
      console.log("Share this CID with your subscribers!");

      // Reset form
      setTitle("");
      setDescription("");
      setContentFile(null);
      setThumbnailFile(null);
      setPlanId("");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload content", { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <h1 className="text-3xl font-bold mb-4">Creator Upload</h1>
        <p className="text-gray-600 mb-8">Connect your wallet to upload content</p>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Upload Premium Content</h1>

      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium mb-2">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Content title"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            rows={4}
            placeholder="Describe your content"
          />
        </div>

        {/* Plan ID */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Subscription Plan ID *
          </label>
          <input
            type="number"
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Plan ID for access control"
          />
          <p className="text-sm text-gray-500 mt-1">
            Only subscribers to this plan can access the content
          </p>
        </div>

        {/* Content File */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Content File *
          </label>
          <input
            type="file"
            onChange={(e) => setContentFile(e.target.files?.[0] || null)}
            className="w-full px-4 py-2 border rounded-lg"
            accept="image/*,video/*"
          />
        </div>

        {/* Thumbnail */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Thumbnail (optional)
          </label>
          <input
            type="file"
            onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
            className="w-full px-4 py-2 border rounded-lg"
            accept="image/*"
          />
        </div>

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? "Uploading..." : "Encrypt & Upload to IPFS"}
        </button>

        {/* Info Box */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">How it works:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Content is encrypted client-side with Lit Protocol</li>
            <li>Encrypted content is uploaded to IPFS via Web3.Storage</li>
            <li>Only subscribers with active access can decrypt</li>
            <li>Share the metadata CID with your subscribers</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
