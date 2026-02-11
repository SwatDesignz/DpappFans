"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import Link from "next/link";
import { useAccount } from "wagmi";

export default function Home() {
  const { isConnected, address } = useAccount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500">
      {/* Navigation */}
      <nav className="glass-dark backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">DpappFans</h1>
            </div>
            <div className="flex items-center gap-4">
              {isConnected && (
                <>
                  <Link
                    href="/upload"
                    className="text-white hover:text-gray-200 transition"
                  >
                    Upload
                  </Link>
                  <Link
                    href="/explore"
                    className="text-white hover:text-gray-200 transition"
                  >
                    Explore
                  </Link>
                </>
              )}
              <ConnectButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-6xl font-extrabold text-white mb-6">
            The Future of Creator Economy
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
            A decentralized platform where creators own their content and fans
            directly support their favorite artists with blockchain technology
          </p>

          {!isConnected ? (
            <div className="inline-block">
              <ConnectButton />
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-white">Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</p>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/upload"
                  className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                >
                  Start Creating
                </Link>
                <Link
                  href="/explore"
                  className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition"
                >
                  Explore Creators
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Features Grid */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon="🔐"
            title="True Ownership"
            description="Content encrypted with Lit Protocol. Only you control access."
          />
          <FeatureCard
            icon="💎"
            title="USDC Payments"
            description="Stable, transparent payments on Polygon or Base chain."
          />
          <FeatureCard
            icon="🌐"
            title="Decentralized Storage"
            description="Content stored permanently on IPFS. No centralized servers."
          />
          <FeatureCard
            icon="💳"
            title="Crypto + Fiat"
            description="Accept both blockchain payments and credit cards."
          />
          <FeatureCard
            icon="🎨"
            title="Creator Tokens"
            description="Issue your own tokens for exclusive access and benefits."
          />
          <FeatureCard
            icon="⚡"
            title="Instant Payouts"
            description="No middlemen. Funds go directly to your wallet."
          />
        </div>

        {/* Stats */}
        <div className="mt-24 glass-dark rounded-2xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <StatCard number="0%" label="Platform Fee*" note="Launch promo" />
            <StatCard number="100%" label="Creator Revenue" />
            <StatCard number="∞" label="Content Lifetime" note="IPFS storage" />
            <StatCard number="<1s" label="Payment Speed" />
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-24">
          <h3 className="text-4xl font-bold text-white text-center mb-12">
            How It Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <StepCard
              number="1"
              title="For Creators"
              steps={[
                "Connect your wallet",
                "Create subscription plans",
                "Upload and encrypt content",
                "Share with subscribers",
                "Receive payments instantly",
              ]}
            />
            <StepCard
              number="2"
              title="For Fans"
              steps={[
                "Connect your wallet",
                "Browse creators",
                "Subscribe with USDC or card",
                "Access exclusive content",
                "Support your favorites with tips",
              ]}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-24 border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white/60">
          <p>Built with ❤️ on Polygon & Base • Powered by Lit Protocol & IPFS</p>
          <p className="mt-2 text-sm">
            *Platform fee may change after launch. Current holders grandfathered.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="glass-dark rounded-xl p-6 hover:scale-105 transition-transform">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-white/70">{description}</p>
    </div>
  );
}

function StatCard({
  number,
  label,
  note,
}: {
  number: string;
  label: string;
  note?: string;
}) {
  return (
    <div>
      <div className="text-4xl font-bold text-white mb-2">{number}</div>
      <div className="text-white/80">{label}</div>
      {note && <div className="text-xs text-white/50 mt-1">{note}</div>}
    </div>
  );
}

function StepCard({
  number,
  title,
  steps,
}: {
  number: string;
  title: string;
  steps: string[];
}) {
  return (
    <div className="glass-dark rounded-xl p-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold text-white">
          {number}
        </div>
        <h4 className="text-2xl font-bold text-white">{title}</h4>
      </div>
      <ul className="space-y-3">
        {steps.map((step, idx) => (
          <li key={idx} className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-white/80">{step}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
