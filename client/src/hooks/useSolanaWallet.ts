import { useCallback, useEffect, useState } from 'react';
import { Connection, PublicKey, Transaction, VersionedTransaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';

/**
 * Solana wallet integration hook for SEEKER LEGACY PROTOCOL
 * Provides wallet connection, balance queries, and transaction operations
 */

export interface WalletState {
  isConnected: boolean;
  publicKey: PublicKey | null;
  balance: number;
  isLoading: boolean;
  error: string | null;
}

export interface TransactionResult {
  signature: string;
  status: 'confirmed' | 'failed' | 'pending';
  error?: string;
}

const SOLANA_RPC_ENDPOINT = 'https://api.mainnet-beta.solana.com';
const COMMITMENT = 'confirmed';

export function useSolanaWallet() {
  const wallet = useWallet();
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    publicKey: null,
    balance: 0,
    isLoading: false,
    error: null,
  });

  const connection = new Connection(SOLANA_RPC_ENDPOINT, COMMITMENT);

  /**
   * Update wallet state when wallet connection changes
   */
  useEffect(() => {
    const updateWalletState = async () => {
      if (!wallet.publicKey) {
        setWalletState({
          isConnected: false,
          publicKey: null,
          balance: 0,
          isLoading: false,
          error: null,
        });
        return;
      }

      setWalletState(prev => ({ ...prev, isLoading: true }));

      try {
        const balance = await connection.getBalance(wallet.publicKey);
        setWalletState({
          isConnected: true,
          publicKey: wallet.publicKey,
          balance: balance / LAMPORTS_PER_SOL,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setWalletState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch balance',
        }));
      }
    };

    updateWalletState();
  }, [wallet.publicKey]);

  /**
   * Connect wallet
   */
  const connect = useCallback(async () => {
    try {
      setWalletState(prev => ({ ...prev, isLoading: true, error: null }));
      if (wallet.connect) {
        await wallet.connect();
      }
    } catch (error) {
      setWalletState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to connect wallet',
      }));
    }
  }, [wallet]);

  /**
   * Disconnect wallet
   */
  const disconnect = useCallback(async () => {
    try {
      setWalletState(prev => ({ ...prev, isLoading: true }));
      if (wallet.disconnect) {
        await wallet.disconnect();
      }
      setWalletState({
        isConnected: false,
        publicKey: null,
        balance: 0,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setWalletState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to disconnect wallet',
      }));
    }
  }, [wallet]);

  /**
   * Get current wallet balance
   */
  const getBalance = useCallback(async (publicKey?: PublicKey): Promise<number> => {
    try {
      const key = publicKey || wallet.publicKey;
      if (!key) throw new Error('No wallet connected');

      const balance = await connection.getBalance(key);
      return balance / LAMPORTS_PER_SOL;
    } catch (error) {
      console.error('Failed to get balance:', error);
      throw error;
    }
  }, [wallet.publicKey]);

  /**
   * Send SOL to a recipient
   */
  const sendSol = useCallback(
    async (toAddress: string, amount: number): Promise<TransactionResult> => {
      try {
        if (!wallet.publicKey || !wallet.signTransaction) {
          throw new Error('Wallet not connected');
        }

        const toPubkey = new PublicKey(toAddress);
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey,
            lamports: amount * LAMPORTS_PER_SOL,
          })
        );

        const latestBlockhash = await connection.getLatestBlockhash();
        transaction.recentBlockhash = latestBlockhash.blockhash;
        transaction.feePayer = wallet.publicKey;

        const signedTransaction = await wallet.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signedTransaction.serialize());

        // Wait for confirmation
        const confirmation = await connection.confirmTransaction(signature, COMMITMENT);

        return {
          signature,
          status: confirmation.value.err ? 'failed' : 'confirmed',
          error: confirmation.value.err ? 'Transaction failed' : undefined,
        };
      } catch (error) {
        return {
          signature: '',
          status: 'failed',
          error: error instanceof Error ? error.message : 'Transaction failed',
        };
      }
    },
    [wallet.publicKey, wallet.signTransaction]
  );

  /**
   * Sign a transaction
   */
  const signTransaction = useCallback(
    async (transaction: Transaction): Promise<Transaction> => {
      if (!wallet.signTransaction) {
        throw new Error('Wallet does not support signing');
      }

      return await wallet.signTransaction(transaction);
    },
    [wallet.signTransaction]
  );

  /**
   * Sign multiple transactions
   */
  const signAllTransactions = useCallback(
    async (transactions: Transaction[]): Promise<Transaction[]> => {
      if (!wallet.signAllTransactions) {
        throw new Error('Wallet does not support signing multiple transactions');
      }

      return await wallet.signAllTransactions(transactions);
    },
    [wallet.signAllTransactions]
  );

  /**
   * Send a custom transaction
   */
  const sendTransaction = useCallback(
    async (transaction: Transaction): Promise<TransactionResult> => {
      try {
        if (!wallet.publicKey || !wallet.signTransaction) {
          throw new Error('Wallet not connected');
        }

        const latestBlockhash = await connection.getLatestBlockhash();
        transaction.recentBlockhash = latestBlockhash.blockhash;
        transaction.feePayer = wallet.publicKey;

        const signedTransaction = await wallet.signTransaction(transaction);
        const signature = await connection.sendRawTransaction(signedTransaction.serialize());

        // Wait for confirmation
        const confirmation = await connection.confirmTransaction(signature, COMMITMENT);

        return {
          signature,
          status: confirmation.value.err ? 'failed' : 'confirmed',
          error: confirmation.value.err ? 'Transaction failed' : undefined,
        };
      } catch (error) {
        return {
          signature: '',
          status: 'failed',
          error: error instanceof Error ? error.message : 'Transaction failed',
        };
      }
    },
    [wallet.publicKey, wallet.signTransaction]
  );

  /**
   * Get transaction details
   */
  const getTransactionDetails = useCallback(
    async (signature: string) => {
      try {
        const transaction = await connection.getTransaction(signature, {
          commitment: COMMITMENT,
          maxSupportedTransactionVersion: 0,
        });
        return transaction;
      } catch (error) {
        console.error('Failed to get transaction details:', error);
        throw error;
      }
    },
    []
  );

  /**
   * Monitor transaction status
   */
  const monitorTransaction = useCallback(
    async (signature: string, maxRetries = 30): Promise<TransactionResult> => {
      let retries = 0;

      while (retries < maxRetries) {
        try {
          const confirmation = await connection.getSignatureStatus(signature);

          if (confirmation.value?.confirmationStatus === 'confirmed' || confirmation.value?.confirmationStatus === 'finalized') {
            return {
              signature,
              status: 'confirmed',
            };
          }

          if (confirmation.value?.err) {
            return {
              signature,
              status: 'failed',
              error: 'Transaction failed',
            };
          }

          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 1000));
          retries++;
        } catch (error) {
          console.error('Error monitoring transaction:', error);
          retries++;
        }
      }

      return {
        signature,
        status: 'pending',
        error: 'Transaction confirmation timeout',
      };
    },
    []
  );

  return {
    // State
    walletState,
    wallet,
    connection,

    // Methods
    connect,
    disconnect,
    getBalance,
    sendSol,
    signTransaction,
    signAllTransactions,
    sendTransaction,
    getTransactionDetails,
    monitorTransaction,
  };
}
