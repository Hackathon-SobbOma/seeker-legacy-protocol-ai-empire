# SEEKER LEGACY PROTOCOL - API Documentation

## Overview

SEEKER LEGACY PROTOCOL is a comprehensive Web3 trading agent platform with autonomous execution, Solana wallet integration, and real-time analytics. This document describes the complete API surface.

## Authentication

All protected endpoints require Manus OAuth authentication. The session is automatically managed via cookies.

```typescript
// Check authentication status
const { data: user } = trpc.auth.me.useQuery();

// Logout
const logout = trpc.auth.logout.useMutation();
```

## Wallet Operations

### Queue Skill Execution

Queue an autonomous skill for execution with priority-based processing.

**Endpoint:** `wallet.queueSkillExecution`

**Input:**
```typescript
{
  skillType: 'agent_management' | 'token_distribution' | 'transaction_monitoring' | 'revenue_tracking' | 'task_completion',
  agentId: number,
  parameters: Record<string, unknown>,
  priority: 'low' | 'medium' | 'high'
}
```

**Output:**
```typescript
{
  success: boolean,
  executionId: string,
  message: string
}
```

**Example:**
```typescript
const { mutateAsync } = trpc.wallet.queueSkillExecution.useMutation();
const result = await mutateAsync({
  skillType: 'token_distribution',
  agentId: 1,
  parameters: {
    recipientAddress: 'wallet_address',
    amount: '100',
    tokenMint: 'token_mint'
  },
  priority: 'high'
});
```

### Get Execution Status

Retrieve the status of a queued or running skill execution.

**Endpoint:** `wallet.getExecutionStatus`

**Input:**
```typescript
{
  executionId: string
}
```

**Output:**
```typescript
{
  found: boolean,
  success?: boolean,
  executionId?: string,
  agentId?: number,
  taskType?: string,
  transactionHash?: string,
  output?: Record<string, unknown>,
  error?: string,
  duration?: number
}
```

### Cancel Execution

Cancel a queued skill execution.

**Endpoint:** `wallet.cancelExecution`

**Input:**
```typescript
{
  executionId: string
}
```

**Output:**
```typescript
{
  success: boolean,
  message: string
}
```

### Get Queue Status

Get real-time status of the execution queue.

**Endpoint:** `wallet.getQueueStatus`

**Output:**
```typescript
{
  queueSize: number,
  activeExecutions: number,
  queue: Array<{
    executionId: string,
    skillType: string,
    priority: 'low' | 'medium' | 'high'
  }>
}
```

### Send SOL

Send SOL tokens to a recipient address.

**Endpoint:** `wallet.sendSol`

**Input:**
```typescript
{
  toAddress: string,
  amount: number,
  agentId?: number
}
```

**Output:**
```typescript
{
  success: boolean,
  transactionHash: string,
  toAddress: string,
  amount: number,
  status: 'pending' | 'confirmed' | 'failed',
  message: string
}
```

### Transfer Token

Transfer SPL tokens to a recipient address.

**Endpoint:** `wallet.transferToken`

**Input:**
```typescript
{
  toAddress: string,
  amount: string,
  tokenMint: string,
  agentId?: number
}
```

**Output:**
```typescript
{
  success: boolean,
  executionId: string,
  toAddress: string,
  amount: string,
  tokenMint: string,
  status: 'queued',
  message: string
}
```

### Get Transaction Details

Retrieve details about a specific transaction.

**Endpoint:** `wallet.getTransactionDetails`

**Input:**
```typescript
{
  transactionHash: string
}
```

**Output:**
```typescript
{
  transactionHash: string,
  status: 'pending' | 'confirmed' | 'failed',
  from: string,
  to: string,
  amount: number,
  fee: number,
  timestamp: Date,
  confirmations: number
}
```

### Monitor Transaction

Start monitoring a transaction for status updates.

**Endpoint:** `wallet.monitorTransaction`

**Input:**
```typescript
{
  transactionHash: string
}
```

**Output:**
```typescript
{
  transactionHash: string,
  status: 'monitoring',
  executionId: string,
  message: string
}
```

### Get Wallet Balance

Get the balance of a wallet address.

**Endpoint:** `wallet.getWalletBalance`

**Input:**
```typescript
{
  walletAddress?: string
}
```

**Output:**
```typescript
{
  walletAddress: string,
  solBalance: number,
  tokens: Array<{
    mint: string,
    balance: number,
    decimals: number
  }>,
  totalValue: number
}
```

## Agent Management

### Start Autonomous Agent

Start an autonomous trading agent.

**Endpoint:** `wallet.startAutonomousAgent`

**Input:**
```typescript
{
  agentId: number
}
```

**Output:**
```typescript
{
  success: boolean,
  agentId: number,
  executionId: string,
  status: 'starting',
  message: string
}
```

### Stop Autonomous Agent

Stop a running autonomous agent.

**Endpoint:** `wallet.stopAutonomousAgent`

**Input:**
```typescript
{
  agentId: number
}
```

**Output:**
```typescript
{
  success: boolean,
  agentId: number,
  executionId: string,
  status: 'stopping',
  message: string
}
```

## Analytics & Reporting

### Calculate Revenue

Calculate revenue metrics for a specific period.

**Endpoint:** `wallet.calculateRevenue`

**Input:**
```typescript
{
  period: 'daily' | 'weekly' | 'monthly',
  agentId?: number
}
```

**Output:**
```typescript
{
  success: boolean,
  executionId: string,
  period: string,
  status: 'calculating',
  message: string
}
```

## Task Automation

### Complete Automated Task

Queue a task for automated completion.

**Endpoint:** `wallet.completeAutomatedTask`

**Input:**
```typescript
{
  taskId: number
}
```

**Output:**
```typescript
{
  success: boolean,
  taskId: number,
  executionId: string,
  status: 'executing',
  message: string
}
```

## Skill Types

### agent_management
Manages agent lifecycle: start, stop, pause, update configuration.

### token_distribution
Handles automated token transfers and distributions to recipients.

### transaction_monitoring
Monitors blockchain transactions for status updates and confirmations.

### revenue_tracking
Calculates and tracks revenue metrics and trading performance.

### task_completion
Executes and completes automated tasks in the system.

## Error Handling

All endpoints return errors in the following format:

```typescript
{
  code: string,
  message: string,
  details?: Record<string, unknown>
}
```

Common error codes:
- `UNAUTHORIZED` - User not authenticated
- `FORBIDDEN` - User lacks permission
- `NOT_FOUND` - Resource not found
- `INVALID_INPUT` - Input validation failed
- `INTERNAL_SERVER_ERROR` - Server error

## Rate Limiting

- Skill execution queue: 100 requests per minute
- Wallet operations: 50 requests per minute
- Transaction monitoring: 200 requests per minute

## WebSocket Events

Real-time updates are available through WebSocket connections:

- `execution:status` - Execution status updates
- `transaction:confirmed` - Transaction confirmation
- `agent:status` - Agent status changes
- `revenue:updated` - Revenue metrics updated

## Example Usage

```typescript
import { trpc } from '@/lib/trpc';

// Queue a token distribution
const { mutateAsync: queueSkill } = trpc.wallet.queueSkillExecution.useMutation();
const executionId = await queueSkill({
  skillType: 'token_distribution',
  agentId: 1,
  parameters: {
    recipientAddress: 'wallet_address',
    amount: '100',
    tokenMint: 'token_mint'
  },
  priority: 'high'
});

// Monitor execution
const { data: status } = trpc.wallet.getExecutionStatus.useQuery(
  { executionId },
  { refetchInterval: 5000 }
);

// Start agent
const { mutateAsync: startAgent } = trpc.wallet.startAutonomousAgent.useMutation();
await startAgent({ agentId: 1 });
```

## Support

For API support and issues, please refer to the main documentation or contact the development team.
