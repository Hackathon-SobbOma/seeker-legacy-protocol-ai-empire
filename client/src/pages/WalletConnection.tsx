import React, { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useSolanaWallet } from '@/hooks/useSolanaWallet';
import { AutonomousAgentDashboard } from '@/components/AutonomousAgentDashboard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Wallet, Send, TrendingUp, Activity, Copy, Check } from 'lucide-react';
import { useLocation } from 'wouter';

/**
 * Wallet Connection Page
 * Main interface for wallet management and autonomous agent control
 */

export default function WalletConnection() {
  const wallet = useWallet();
  const { walletState, connect, disconnect, sendSol, getBalance } = useSolanaWallet();
  const [, navigate] = useLocation();
  const [recipientAddress, setRecipientAddress] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Redirect to home if no wallet connected after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!walletState.isConnected && !wallet.connecting) {
        // User can still use the page without wallet connected
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [walletState.isConnected, wallet.connecting]);

  const handleSendSol = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientAddress || !sendAmount) {
      alert('Please enter recipient address and amount');
      return;
    }

    setIsLoading(true);
    try {
      const result = await sendSol(recipientAddress, parseFloat(sendAmount));
      if (result.status === 'confirmed') {
        setSuccessMessage(`Transaction confirmed! Signature: ${result.signature.slice(0, 20)}...`);
        setRecipientAddress('');
        setSendAmount('');
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        alert(`Transaction failed: ${result.error}`);
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const copyAddress = () => {
    if (walletState.publicKey) {
      navigator.clipboard.writeText(walletState.publicKey.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-500/5">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wallet className="w-6 h-6 text-purple-500" />
            <h1 className="text-xl font-bold">SEEKER LEGACY PROTOCOL</h1>
          </div>
          <Button variant="outline" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wallet Status Card */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-purple-500" />
                Wallet Status
              </h2>

              <div className="space-y-4">
                {/* Wallet Connection Button */}
                <div className="flex justify-center">
                  <WalletMultiButton />
                </div>

                {/* Wallet Info */}
                {walletState.isConnected && walletState.publicKey ? (
                  <div className="space-y-3 bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Wallet Address</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-xs bg-background px-2 py-1 rounded flex-1 truncate">
                          {walletState.publicKey.toString()}
                        </code>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={copyAddress}
                          className="p-1 h-auto"
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">SOL Balance</Label>
                      <p className="text-2xl font-bold text-green-500 mt-1">
                        {walletState.balance.toFixed(4)} SOL
                      </p>
                    </div>

                    {walletState.error && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded p-2">
                        <p className="text-xs text-red-500">{walletState.error}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                    <p className="text-sm text-yellow-500 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>Connect your Solana wallet to access autonomous agent features</span>
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Send SOL Card */}
            {walletState.isConnected && (
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Send className="w-5 h-5 text-purple-500" />
                  Send SOL
                </h3>

                <form onSubmit={handleSendSol} className="space-y-4">
                  <div>
                    <Label htmlFor="recipient">Recipient Address</Label>
                    <Input
                      id="recipient"
                      placeholder="Enter Solana wallet address"
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      disabled={isLoading}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="amount">Amount (SOL)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      value={sendAmount}
                      onChange={(e) => setSendAmount(e.target.value)}
                      disabled={isLoading}
                      className="mt-2"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-purple-500 hover:bg-purple-600"
                    disabled={isLoading || !recipientAddress || !sendAmount}
                  >
                    {isLoading ? 'Processing...' : 'Send SOL'}
                  </Button>
                </form>

                {successMessage && (
                  <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded">
                    <p className="text-sm text-green-500">{successMessage}</p>
                  </div>
                )}
              </Card>
            )}

            {/* Autonomous Agent Dashboard */}
            <Card className="p-6">
              <AutonomousAgentDashboard />
            </Card>

            {/* Network Info Card */}
            <Card className="p-6 bg-blue-500/5 border-blue-500/20">
              <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                Network Information
              </h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Network:</span>{' '}
                  <span className="font-semibold">Mainnet Beta</span>
                </p>
                <p>
                  <span className="text-muted-foreground">RPC Endpoint:</span>{' '}
                  <span className="font-mono text-xs">api.mainnet-beta.solana.com</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Commitment:</span>{' '}
                  <span className="font-semibold">Confirmed</span>
                </p>
              </div>
            </Card>

            {/* Quick Links */}
            <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20">
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={() => window.open('https://solscan.io/', '_blank')}
                  className="text-sm"
                >
                  Solscan Explorer
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open('https://phantom.app/', '_blank')}
                  className="text-sm"
                >
                  Phantom Wallet
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open('https://solanafaucet.com/', '_blank')}
                  className="text-sm"
                >
                  SOL Faucet
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="text-sm"
                >
                  Dashboard
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
