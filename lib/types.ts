export interface Profile {
  id: string
  full_name: string | null
  bio: string | null
  expertise: string[] | null
  invite_code_used: string | null
  invite_codes_remaining: number
  reputation_score: number
  is_admin?: boolean
  created_at: string
}

export interface InviteCode {
  id: string
  code: string
  created_by: string | null
  used_by: string | null
  used_at: string | null
  created_at: string
}

export interface Idea {
  id: string
  creator_id: string
  teaser: string
  full_description: string | null
  category: string | null
  target_audience: string | null
  why_it_doesnt_exist: string | null
  equity_offered_percent: number | null
  status: string
  timestamp_hash: string | null
  layer: number | null
  cover_image_url: string | null
  follower_count?: number
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface IdeaFollower {
  id: string
  idea_id: string
  email: string
  user_id: string | null
  followed_at: string
}

export interface IdeaInvitation {
  id: string
  idea_id: string
  invited_by: string
  invited_email: string
  invited_user_id: string | null
  status: string
  created_at: string
}

export interface FollowerNotification {
  id: string
  idea_id: string
  subject: string
  body: string
  sent_at: string
  sent_by: string
}

export interface NDAAcceptance {
  id: string
  user_id: string
  idea_id: string
  accepted_at: string
  ip_address: string | null
}

export interface Application {
  id: string
  idea_id: string
  applicant_id: string
  expertise_relevant: string | null
  hours_per_week: number | null
  expected_return: string | null
  equity_requested_percent: number | null
  equity_reasoning: string | null
  first_contribution: string | null
  time_horizon: string | null
  status: string
  counter_offer_equity: number | null
  counter_offer_note: string | null
  created_at: string
  updated_at: string
  profiles?: Profile
  ideas?: Idea
}

export interface Project {
  id: string
  idea_id: string
  name: string | null
  status: string
  idfy_equity_percent: number
  created_at: string
  ideas?: Idea
}

export interface ProjectMember {
  id: string
  project_id: string
  user_id: string
  role: string
  equity_percent: number
  vesting_months: number
  cliff_months: number
  joined_at: string
  last_active_at: string
  activity_score: number
  profiles?: Profile
}

export interface Message {
  id: string
  project_id: string
  sender_id: string
  recipient_id: string | null
  content: string
  created_at: string
  profiles?: Profile
}

export interface Task {
  id: string
  project_id: string
  assigned_to: string | null
  title: string
  description: string | null
  due_date: string | null
  status: string
  created_by: string | null
  created_at: string
  completed_at: string | null
  profiles?: Profile
}

export interface Decision {
  id: string
  project_id: string
  title: string
  description: string | null
  agreed_by: string[]
  created_by: string | null
  created_at: string
  profiles?: Profile
}

export interface InviteRequest {
  id: string
  email: string
  message: string | null
  invite_code: string | null
  status: string
  created_at: string
}
