/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getClients, createClient, updateClient } from '@/lib/api/clients';
import { getVendors, createVendor, updateVendor } from '@/lib/api/vendors';
import { getJobs, createJob, approveJob } from '@/lib/api/jobs';
import { getAllCandidates, createCandidate, updateCandidate, deleteCandidate } from '@/lib/api/candidates';
import type { Client, Vendor, Job, Candidate, AgentLog } from '@/types';
import { supabase } from '@/lib/supabase';

interface DataContextType {
  clients: Client[];
  vendors: Vendor[];
  jobs: Job[];
  candidates: Candidate[];
  logs: AgentLog[];
  loading: boolean;
  refreshAll: () => Promise<void>;
  addClient: (data: Partial<Client>) => Promise<void>;
  addVendor: (data: Partial<Vendor>) => Promise<void>;
  addJob: (data: Partial<Job>) => Promise<void>;
  addCandidate: (data: Partial<Candidate>) => Promise<void>;
  updateCandidateStatus: (id: string, status: Candidate['status'], stage: Candidate['stage']) => Promise<void>;
  approveJobWithBudget: (id: string, budget: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshAll = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [cData, vData, jData, candData] = await Promise.all([
        getClients(),
        getVendors(),
        getJobs(),
        getAllCandidates(),
      ]);
      setClients(cData);
      setVendors(vData);
      setJobs(jData);
      setCandidates(candData);

      // Fetch logs
      const { data: logsData, error: logsError } = await supabase
        .from('agent_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (logsError) {
        console.error('Error fetching agent logs:', logsError);
      }
      
      if (logsData) {
        setLogs(logsData.map(l => ({
          id: l.id,
          type: l.type,
          level: l.level === 'success' ? 'success' : (l.level || 'info'),
          message: l.message,
          status: l.status,
          metadata: l.metadata,
          companyId: l.company_id,
          createdAt: l.created_at
        })));
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Realtime logs
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('agent_logs_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'agent_logs' },
        (payload) => {
          setLogs(prev => [payload.new as AgentLog, ...prev].slice(0, 50));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addClient = async (data: Partial<Client>) => {
    await createClient(data);
    await refreshAll();
  };

  const addVendor = async (data: Partial<Vendor>) => {
    await createVendor(data);
    await refreshAll();
  };

  const addJob = async (data: Partial<Job>) => {
    await createJob(data);
    await refreshAll();
  };

  const addCandidate = async (data: Partial<Candidate>) => {
    await createCandidate(data);
    await refreshAll();
  };

  const updateCandidateStatus = async (id: string, status: Candidate['status'], stage: Candidate['stage']) => {
    await updateCandidate(id, { status, stage });
    await refreshAll();
  };

  const approveJobWithBudget = async (id: string, budget: string) => {
    await approveJob(id, budget);
    await refreshAll();
  };

  return (
    <DataContext.Provider value={{
      clients, vendors, jobs, candidates, logs, loading,
      refreshAll, addClient, addVendor, addJob, addCandidate,
      updateCandidateStatus, approveJobWithBudget
    }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
