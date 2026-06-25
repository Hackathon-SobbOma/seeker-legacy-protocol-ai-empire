import React, { useState, useEffect } from 'react';
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Activity, DollarSign, RefreshCw } from 'lucide-react';

// Mock data
const agentData = [
  { name: 'Agent 1', status: 'active', trades: 24, profit: 1250, roi: 12.5 },
  { name: 'Agent 2', status: 'active', trades: 18, profit: 890, roi: 8.9 },
  { name: 'Agent 3', status: 'paused', trades: 12, profit: 450, roi: 4.5 },
];

const revenueData = [
  { date: 'Mon', revenue: 2400, profit: 1240 },
  { date: 'Tue', revenue: 1398, profit: 1221 },
  { date: 'Wed', revenue: 9800, profit: 2290 },
  { date: 'Thu', revenue: 3908, profit: 2000 },
  { date: 'Fri', revenue: 4800, profit: 2181 },
  { date: 'Sat', revenue: 3800, profit: 2500 },
  { date: 'Sun', revenue: 4300, profit: 2100 },
];

const tokenDistribution = [
  { name: 'Allocated', value: 650000 },
  { name: 'Distributed', value: 350000 },
  { name: 'Reserved', value: 200000 },
];

const COLORS = ['#a855f7', '#3b82f6', '#10b981'];

export default function Dashboard() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-500/5">
      {/* Header */}
      <div className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={() => setLocation('/')}>
              Home
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Agents</p>
                <p className="text-3xl font-bold mt-2">3</p>
              </div>
              <Activity className="w-10 h-10 text-purple-500/20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Trades</p>
                <p className="text-3xl font-bold mt-2">54</p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-500/20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Profit</p>
                <p className="text-3xl font-bold mt-2 text-green-500">$2,590</p>
              </div>
              <DollarSign className="w-10 h-10 text-green-500/20" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg ROI</p>
                <p className="text-3xl font-bold mt-2">8.6%</p>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-500/20" />
            </div>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Weekly Revenue</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis stroke="rgba(255,255,255,0.5)" />
                <YAxis stroke="rgba(255,255,255,0.5)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px' }}
                />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#a855f7" strokeWidth={2} />
                <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Token Distribution */}
          <Card className="p-6">
            <h3 className="text-lg font-bold mb-4">Token Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tokenDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${(value / 1000).toFixed(0)}k`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {tokenDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Agents Table */}
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4">Trading Agents</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  <th className="text-left py-3 px-4 font-semibold">Agent</th>
                  <th className="text-left py-3 px-4 font-semibold">Status</th>
                  <th className="text-right py-3 px-4 font-semibold">Trades</th>
                  <th className="text-right py-3 px-4 font-semibold">Profit</th>
                  <th className="text-right py-3 px-4 font-semibold">ROI</th>
                  <th className="text-center py-3 px-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {agentData.map((agent) => (
                  <tr
                    key={agent.name}
                    className="border-b border-border/30 hover:bg-surface/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedAgent(agent.name)}
                  >
                    <td className="py-3 px-4">{agent.name}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        agent.status === 'active'
                          ? 'bg-green-500/20 text-green-500'
                          : 'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        {agent.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">{agent.trades}</td>
                    <td className="py-3 px-4 text-right text-green-500 font-semibold">${agent.profit}</td>
                    <td className="py-3 px-4 text-right">{agent.roi}%</td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedAgent(agent.name);
                        }}
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Selected Agent Details */}
        {selectedAgent && (
          <Card className="p-6 border-purple-500/50 bg-purple-500/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">{selectedAgent} Details</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedAgent(null)}
              >
                Close
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-lg font-semibold mt-1">Active</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Wallet</p>
                <p className="text-lg font-semibold mt-1 font-mono text-xs">Solana...</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Trade</p>
                <p className="text-lg font-semibold mt-1">2 hours ago</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Next Trade</p>
                <p className="text-lg font-semibold mt-1">In 45 min</p>
              </div>
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="p-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
          <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setLocation('/wallet')} className="bg-purple-500 hover:bg-purple-600">
              Connect Wallet
            </Button>
            <Button variant="outline">
              Create New Agent
            </Button>
            <Button variant="outline">
              View Transactions
            </Button>
            <Button variant="outline">
              Export Report
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
