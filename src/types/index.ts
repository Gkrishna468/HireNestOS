/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'admin' | 'manager' | 'recruiter' | 'vendor' | 'client' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  company?: string;
  avatar?: string;
  phone?: string;
  status: 'active' | 'inactive';
}

export interface Client {
  id: string;
  company: string;
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  industry?: string;
  budget?: string;
  contactPerson?: string;
  website?: string;
  clientCode?: string;
  notes?: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  id: string;
  name: string;
  type: 'vendor' | 'recruiter';
  company?: string;
  email?: string;
  phone?: string;
  location?: string;
  specialization?: string[];
  isRecruiter?: boolean;
  recruiterCompany?: string;
  vendorCode?: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  type: string;
  salary?: string;
  budget?: string;
  skills: string[];
  experienceRequired?: string;
  openings: number;
  submissionsCount: number;
  status: 'open' | 'closed' | 'filled' | 'pending';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  clientId?: string;
  clientName?: string;
  userId?: string;
  closedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  skills: string[];
  experience: number;
  yearsExperience?: number;
  currentCompany?: string;
  currentTitle?: string;
  expectedSalary?: string;
  location?: string;
  status: 'active' | 'inactive' | 'placed' | 'interviewing';
  stage: 'sourced' | 'screening' | 'interview' | 'offer' | 'onboarding' | 'hired' | 'rejected';
  vendorId?: string;
  vendorName?: string;
  vendorCode?: string;
  clientId?: string;
  jobId?: string;
  jobTitle?: string;
  resumeUrl?: string;
  notes?: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Resume {
  id: string;
  fileName: string;
  candidateId?: string;
  candidateName?: string;
  extractedText?: string;
  parsedData?: any;
  extractedSkills?: string[];
  source: 'direct' | 'gmail' | 'portal';
  url?: string;
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FollowUp {
  id: string;
  entityType: 'client' | 'vendor' | 'candidate' | 'job' | 'recruiter';
  entityId: string;
  entityName?: string;
  message: string;
  status: 'pending' | 'completed';
  dueDate: string;
  userId?: string;
  createdAt: string;
}

export interface Deal {
  id: string;
  jobId: string;
  candidateId: string;
  vendorId?: string;
  clientId: string;
  clientName: string;
  jobTitle: string;
  candidateName: string;
  status: 'prospect' | 'sourcing' | 'submitted' | 'interview' | 'offered' | 'placed' | 'paid';
  offeredCtc?: number;
  finalCtc: number;
  commissionPercent: number;
  revenueAmount: number;
  vendorShare: number;
  payoutAmount: number;
  profitAmount: number;
  paymentReceived: boolean;
  joinedDate?: string;
  userId?: string;
  createdAt: string;
}

export interface Submission {
  id: string;
  jobId: string;
  candidateId: string;
  vendorId?: string;
  candidateName: string;
  jobTitle: string;
  status: 'submitted' | 'shortlisted' | 'interview' | 'offered' | 'hired' | 'rejected';
  notes?: string;
  userId?: string;
  createdAt: string;
}

export interface AgentLog {
  id: string;
  type: 'email' | 'resume' | 'ai_match' | 'followup' | 'system' | 'shortlist' | 'notify' | 'revenue';
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  status: 'running' | 'success' | 'error' | 'paused' | 'idle';
  metadata?: any;
  companyId?: string;
  createdAt: string;
}
