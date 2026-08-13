import React, { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { useSolanaWallet } from '@/hooks/useSolanaWallet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, Play, Pause, RotateCcw, Zap, TrendingUp, Activity } from 'lucide-react';

/**
 * Autonomous Agent Dashboard Component
 * Displays real-time agent execution status and controls
 */

interface ExecutionStatus {
  executionId: string;
  skillType: string;
  priority: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  duration?: number;
}

export function AutonomousAgentDashboard() {
  const { user } = useAuth();
  const { walletState, connect, disconnect, getBalance } = useSolanaWallet();
  const [queueStatus, setQueueStatus] = useState<any>(null);
  const [executions, setExecutions] = useState<ExecutionStatus[]>([]);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);

  // Get queue status
  const { data: queue } = trpc.wallet.getQueueStatus.useQuery(undefined, {
    enabled: isAutoRefresh,
    refetchInterval: 5000,
  });

  // Start autonomous agent
  const startAgentMutation = trpc.wallet.startAutonomousAgent.useMutation();
  const stopAgentMutation = trpc.wallet.stopAutonomousAgent.useMutation();
  const queueSkillMutation = trpc.wallet.queueSkillExecution.useMutation();

  useEffect(() => {
    if (queue) {
      setQueueStatus(queue);
      if (queue.queue) {
        setExecutions(
          queue.queue.map((execution) => ({
            ...execution,
            status: (execution as { status?: ExecutionStatus["status"] }).status ?? "pending",
          }))
        );
      }
    }
  }, [queue]);

  const handleStartAgent = async (agentId: number) => {
    try {
      const result = await startAgentMutation.mutateAsync({ agentId });
      console.log('Agent started:', result);
    } catch (error) {
      console.error('Failed to start agent:', error);
    }
  };

  const handleStopAgent = async (agentId: number) => {
    try {
      const result = await stopAgentMutation.mutateAsync({ agentId });
      console.log('Agent stopped:', result);
    } catch (error) {
      console.error('Failed to stop agent:', error);
    }
  };

  const handleQueueSkill = async (skillType: string, agentId: number) => {
    try {
      const result = await queueSkillMutation.mutateAsync({
        skillType: skillType as any,
        agentId,
        parameters: {},
        priority: 'high',
      });
      console.log('Skill queued:', result);
    } catch (error) {
      console.error('Failed to queue skill:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Autonomous Agent Control Center</h2>
          <p className="text-sm text-muted-foreground">Real-time agent execution and automation</p>
        </div>
        <Button
          variant={isAutoRefresh ? 'default' : 'outline'}
          onClick={() => setIsAutoRefresh(!isAutoRefresh)}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          {isAutoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
        </Button>
      </div>

      {/* Wallet Status */}
      <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold mb-2">Wallet Connection</h3>
            <div className="space-y-1 text-sm">
              <p>
                Status:{' '}
                <span className={walletState.isConnected ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>
                  {walletState.isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </p>
              {walletState.publicKey && (
                <>
                  <p>Address: {walletState.publicKey.toString().slice(0, 8)}...</p>
                  <p>Balance: {walletState.balance.toFixed(4)} SOL</p>
                </>
              )}
            </div>
          </div>
          <Button
            onClick={walletState.isConnected ? disconnect : connect}
            variant={walletState.isConnected ? 'destructive' : 'default'}
          >
            {walletState.isConnected ? 'Disconnect' : 'Connect Wallet'}
          </Button>
        </div>
      </Card>

      {/* Queue Status */}
      {queueStatus && (
        <Card className="p-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-500">{queueStatus.queueSize}</div>
              <p className="text-sm text-muted-foreground">Queued Tasks</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-500">{queueStatus.activeExecutions}</div>
              <p className="text-sm text-muted-foreground">Active Executions</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-500">{executions.length}</div>
              <p className="text-sm text-muted-foreground">Total Executions</p>
            </div>
          </div>
        </Card>
      )}

      {/* Execution Queue */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center">
          <Activity className="w-5 h-5 mr-2 text-purple-500" />
          Execution Queue
        </h3>

        {executions.length === 0 ? (
          <div className="text-center py-8">
            <Zap className="w-12 h-12 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-muted-foreground">No active executions</p>
          </div>
        ) : (
          <div className="space-y-3">
            {executions.map((execution) => (
              <div
                key={execution.executionId}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">{execution.skillType}</p>
                  <p className="text-xs text-muted-foreground">
                    ID: {execution.executionId.slice(0, 12)}...
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                    execution.priority === 'high' ? 'bg-red-500/20 text-red-500' :
                    execution.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-500' :
                    'bg-blue-500/20 text-blue-500'
                  }`}>
                    {execution.priority.toUpperCase()}
                  </span>
                  <span className={`text-xs font-semibold px-2 py-1 rounded ${
                    execution.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                    execution.status === 'failed' ? 'bg-red-500/20 text-red-500' :
                    execution.status === 'executing' ? 'bg-blue-500/20 text-blue-500' :
                    'bg-gray-500/20 text-gray-500'
                  }`}>
                    {execution.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Agent Controls */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-purple-500" />
          Agent Controls
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={() => handleStartAgent(1)}
            className="bg-green-500 hover:bg-green-600"
            disabled={!walletState.isConnected}
          >
            <Play className="w-4 h-4 mr-2" />
            Start Agent
          </Button>
          <Button
            onClick={() => handleStopAgent(1)}
            className="bg-red-500 hover:bg-red-600"
            disabled={!walletState.isConnected}
          >
            <Pause className="w-4 h-4 mr-2" />
            Stop Agent
          </Button>
          <Button
            onClick={() => handleQueueSkill('token_distribution', 1)}
            variant="outline"
            disabled={!walletState.isConnected}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Queue Token Distribution
          </Button>
          <Button
            onClick={() => handleQueueSkill('revenue_tracking', 1)}
            variant="outline"
            disabled={!walletState.isConnected}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Calculate Revenue
          </Button>
        </div>
      </Card>

      {/* Status Messages */}
      {walletState.error && (
        <Card className="p-4 bg-red-500/10 border-red-500/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-500">Error</p>
              <p className="text-sm text-red-500/80">{walletState.error}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
