'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import ActivityDot from '@/components/ui/ActivityDot'
import SharePanel from '@/components/projects/SharePanel'
import { Message, Task, Decision, ProjectMember, Profile } from '@/lib/types'

interface ProjectWorkspaceClientProps {
  project: any
  currentUserId: string
  members: (ProjectMember & { profiles?: Profile })[]
  initialMessages: (Message & { profiles?: Profile })[]
  tasks: (Task & { profiles?: Profile })[]
  decisions: (Decision & { profiles?: Profile })[]
  isMember: boolean
}

type Tab = 'chat' | 'tasks' | 'decisions' | 'share'

export default function ProjectWorkspaceClient({
  project,
  currentUserId,
  members,
  initialMessages,
  tasks: initialTasks,
  decisions: initialDecisions,
  isMember: _isMember,
}: ProjectWorkspaceClientProps) {
  const [activeTab, setActiveTab] = useState<Tab>('chat')
  const [messages, setMessages] = useState(initialMessages)
  const [tasks, setTasks] = useState(initialTasks)
  const [decisions, setDecisions] = useState(initialDecisions)
  const [newMessage, setNewMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [showAddTask, setShowAddTask] = useState(false)
  const [newTaskAssignee, setNewTaskAssignee] = useState('')
  const [showAddDecision, setShowAddDecision] = useState(false)
  const [newDecision, setNewDecision] = useState({ title: '', description: '' })
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const idea = project.ideas
  const currentMember = members.find((m) => m.user_id === currentUserId)

  // Real-time messages
  useEffect(() => {
    const channel = supabase
      .channel(`project:${project.id}:messages`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `project_id=eq.${project.id}`,
        },
        async (payload) => {
          const { data } = await supabase
            .from('messages')
            .select('*, profiles(*)')
            .eq('id', payload.new.id)
            .single()
          if (data) {
            setMessages((prev) => [...prev, data])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [project.id, supabase])

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!newMessage.trim() || sendingMessage) return
    setSendingMessage(true)

    await supabase.from('messages').insert({
      project_id: project.id,
      sender_id: currentUserId,
      content: newMessage.trim(),
    })

    setNewMessage('')
    setSendingMessage(false)
  }

  const addTask = async () => {
    if (!newTaskTitle.trim()) return

    const { data } = await supabase
      .from('tasks')
      .insert({
        project_id: project.id,
        title: newTaskTitle.trim(),
        assigned_to: newTaskAssignee || null,
        created_by: currentUserId,
        status: 'open',
      })
      .select('*, profiles(*)')
      .single()

    if (data) {
      setTasks((prev) => [data, ...prev])
    }

    setNewTaskTitle('')
    setNewTaskAssignee('')
    setShowAddTask(false)
  }

  const updateTaskStatus = async (taskId: string, status: string) => {
    await supabase
      .from('tasks')
      .update({
        status,
        completed_at: status === 'done' ? new Date().toISOString() : null,
      })
      .eq('id', taskId)

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status } : t))
    )
  }

  const addDecision = async () => {
    if (!newDecision.title.trim()) return

    const { data } = await supabase
      .from('decisions')
      .insert({
        project_id: project.id,
        title: newDecision.title.trim(),
        description: newDecision.description.trim() || null,
        agreed_by: [currentUserId],
        created_by: currentUserId,
      })
      .select('*, profiles(*)')
      .single()

    if (data) {
      setDecisions((prev) => [data, ...prev])
    }

    setNewDecision({ title: '', description: '' })
    setShowAddDecision(false)
  }

  const taskStatusColor: Record<string, string> = {
    open: 'text-mid border-mid',
    in_progress: 'text-blue-400 border-blue-400',
    done: 'text-accent border-accent',
  }

  return (
    <div className="min-h-screen bg-black flex">
      {/* Left column - Team */}
      <div className="w-64 flex-shrink-0 bg-grey border-r border-dark flex flex-col">
        <div className="p-5 border-b border-dark">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-[3px] h-4 bg-accent" />
            <span className="font-mono text-[10px] uppercase tracking-widest text-mid">PROJECT</span>
          </div>
          <p className="font-mono text-sm text-white font-medium leading-tight">
            {project.name || idea?.teaser?.slice(0, 50)}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`font-mono text-[9px] uppercase tracking-widest border px-1.5 py-0.5 ${
              project.status === 'active' ? 'border-accent text-accent' : 'border-dark text-mid'
            }`}>
              {project.status}
            </span>
          </div>
        </div>

        {/* Team list */}
        <div className="flex-1 p-4">
          <span className="font-mono text-[9px] uppercase tracking-widest text-mid block mb-3">
            TEAM ({members.length})
          </span>
          <div className="space-y-1">
            {members.map((member) => {
              const name = member.profiles?.full_name || 'Anonymous'
              const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
              const isMe = member.user_id === currentUserId

              return (
                <div key={member.id} className={`flex items-center gap-2 px-2 py-2 ${isMe ? 'bg-dark' : ''}`}>
                  <div className="w-6 h-6 bg-dark border border-dark flex items-center justify-center flex-shrink-0">
                    <span className="font-mono text-[9px] text-mid">{initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-[11px] text-white truncate">{name}</span>
                      <ActivityDot lastActiveAt={member.last_active_at} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[9px] uppercase text-mid">{member.role}</span>
                      {currentMember && (
                        <span className="font-mono text-[9px] text-accent">{member.equity_percent}%</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Equity summary */}
          {currentMember && (
            <div className="mt-6 pt-4 border-t border-dark">
              <span className="font-mono text-[9px] uppercase tracking-widest text-mid block mb-3">EQUITY</span>
              {members.map((m) => (
                <div key={m.id} className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[10px] text-mid truncate flex-1">
                    {m.profiles?.full_name?.split(' ')[0] || 'Anon'}
                  </span>
                  <span className="font-mono text-[10px] text-accent">{m.equity_percent}%</span>
                </div>
              ))}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-dark">
                <span className="font-mono text-[10px] text-mid">IDfy</span>
                <span className="font-mono text-[10px] text-mid">{project.idfy_equity_percent}%</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center column - Activity */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Tabs */}
        <div className="flex border-b border-dark">
          {([
            { key: 'chat', label: 'GROUP CHAT' },
            { key: 'tasks', label: 'TASKS' },
            { key: 'decisions', label: 'DECISIONS' },
            { key: 'share', label: 'SHARE' },
          ] as { key: Tab; label: string }[]).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-3 font-mono text-[10px] uppercase tracking-widest border-r border-dark transition-colors ${
                activeTab === tab.key
                  ? 'text-white bg-dark border-b-2 border-b-accent'
                  : 'text-mid hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Chat */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <p className="font-mono text-sm text-mid">No messages yet. Start the conversation.</p>
                </div>
              )}
              {messages.map((msg) => {
                const isMe = msg.sender_id === currentUserId
                const senderName = msg.profiles?.full_name || 'Anonymous'
                const time = new Date(msg.created_at).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                })

                return (
                  <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                    <div className="w-7 h-7 bg-grey border border-dark flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="font-mono text-[9px] text-mid">
                        {senderName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                      </span>
                    </div>
                    <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[10px] text-mid">{isMe ? 'you' : senderName}</span>
                        <span className="font-mono text-[9px] text-mid opacity-50">{time}</span>
                      </div>
                      <div className={`px-4 py-2.5 ${isMe ? 'bg-accent text-black' : 'bg-grey border border-dark text-white'}`}>
                        <p className="font-mono text-sm leading-relaxed">{msg.content}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-dark p-4 flex gap-3">
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="Type a message..."
                className="flex-1 bg-grey border border-dark px-4 py-3 text-sm text-white placeholder-mid focus:border-accent outline-none"
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || sendingMessage}
                className="bg-accent text-black font-mono text-[11px] uppercase tracking-widest px-5 py-3 hover:opacity-90 disabled:opacity-40"
              >
                SEND
              </button>
            </div>
          </div>
        )}

        {/* Tasks */}
        {activeTab === 'tasks' && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <span className="font-mono text-[10px] uppercase tracking-widest text-mid">
                {tasks.filter((t) => t.status !== 'done').length} OPEN
              </span>
              <button
                onClick={() => setShowAddTask(!showAddTask)}
                className="bg-accent text-black font-mono text-[10px] uppercase tracking-widest px-4 py-2 hover:opacity-90"
              >
                + ADD TASK
              </button>
            </div>

            {showAddTask && (
              <div className="bg-grey border border-dark p-4 mb-4">
                <input
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Task title..."
                  className="w-full bg-dark border border-dark px-3 py-2.5 text-sm text-white placeholder-mid focus:border-accent outline-none mb-3"
                />
                <select
                  value={newTaskAssignee}
                  onChange={(e) => setNewTaskAssignee(e.target.value)}
                  className="w-full bg-dark border border-dark px-3 py-2.5 text-sm text-white focus:border-accent outline-none mb-3"
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.user_id} value={m.user_id}>
                      {m.profiles?.full_name || 'Anonymous'}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button onClick={addTask} className="bg-accent text-black font-mono text-[10px] uppercase tracking-widest px-4 py-2">
                    ADD
                  </button>
                  <button onClick={() => setShowAddTask(false)} className="border border-dark text-mid font-mono text-[10px] uppercase tracking-widest px-4 py-2 hover:text-white hover:border-white transition-colors">
                    CANCEL
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {tasks.length === 0 && (
                <p className="font-mono text-sm text-mid text-center py-8">No tasks yet.</p>
              )}
              {tasks.map((task) => (
                <div key={task.id} className={`bg-grey border border-dark p-4 flex items-start gap-4 ${task.status === 'done' ? 'opacity-50' : ''}`}>
                  <button
                    onClick={() => updateTaskStatus(task.id, task.status === 'done' ? 'open' : 'done')}
                    className={`w-4 h-4 border flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                      task.status === 'done' ? 'bg-accent border-accent' : 'border-dark hover:border-accent'
                    }`}
                  >
                    {task.status === 'done' && <span className="text-black text-[8px]">✓</span>}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`font-mono text-sm ${task.status === 'done' ? 'line-through text-mid' : 'text-white'}`}>
                      {task.title}
                    </p>
                    {task.profiles && (
                      <p className="font-mono text-[10px] text-mid mt-0.5">
                        Assigned to {task.profiles.full_name}
                      </p>
                    )}
                  </div>
                  <select
                    value={task.status}
                    onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                    className={`bg-transparent border px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest outline-none text-right ${taskStatusColor[task.status] || 'text-mid border-dark'}`}
                  >
                    <option value="open">OPEN</option>
                    <option value="in_progress">IN PROGRESS</option>
                    <option value="done">DONE</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Decisions */}
        {activeTab === 'decisions' && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <span className="font-mono text-[10px] uppercase tracking-widest text-mid">
                {decisions.length} DECISIONS LOGGED
              </span>
              <button
                onClick={() => setShowAddDecision(!showAddDecision)}
                className="bg-accent text-black font-mono text-[10px] uppercase tracking-widest px-4 py-2 hover:opacity-90"
              >
                + LOG DECISION
              </button>
            </div>

            {showAddDecision && (
              <div className="bg-grey border border-dark p-4 mb-4">
                <input
                  value={newDecision.title}
                  onChange={(e) => setNewDecision({ ...newDecision, title: e.target.value })}
                  placeholder="Decision title..."
                  className="w-full bg-dark border border-dark px-3 py-2.5 text-sm text-white placeholder-mid focus:border-accent outline-none mb-3"
                />
                <textarea
                  value={newDecision.description}
                  onChange={(e) => setNewDecision({ ...newDecision, description: e.target.value })}
                  placeholder="Context and rationale..."
                  rows={3}
                  className="w-full bg-dark border border-dark px-3 py-2.5 text-sm text-white placeholder-mid focus:border-accent outline-none resize-none mb-3"
                />
                <div className="flex gap-2">
                  <button onClick={addDecision} className="bg-accent text-black font-mono text-[10px] uppercase tracking-widest px-4 py-2">
                    LOG
                  </button>
                  <button onClick={() => setShowAddDecision(false)} className="border border-dark text-mid font-mono text-[10px] uppercase tracking-widest px-4 py-2 hover:text-white hover:border-white transition-colors">
                    CANCEL
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-3">
              {decisions.length === 0 && (
                <p className="font-mono text-sm text-mid text-center py-8">No decisions logged yet.</p>
              )}
              {decisions.map((decision) => (
                <div key={decision.id} className="bg-grey border border-dark p-5">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="font-mono text-sm text-white">{decision.title}</h3>
                    <span className="font-mono text-[10px] text-mid flex-shrink-0">
                      {new Date(decision.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {decision.description && (
                    <p className="font-mono text-[11px] text-mid leading-relaxed mb-3">{decision.description}</p>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-mid">AGREED BY</span>
                    <span className="font-mono text-[9px] text-accent">
                      {decision.agreed_by.length} member{decision.agreed_by.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Share panel */}
        {activeTab === 'share' && idea && (
          <div className="flex-1 overflow-y-auto p-6">
            <SharePanel
              idea={{
                id: idea.id,
                teaser: idea.teaser || '',
                category: idea.category || null,
                equity_offered_percent: idea.equity_offered_percent ?? null,
              }}
              projectName={project.name || idea.teaser?.slice(0, 40) || 'Project'}
              appUrl={typeof window !== 'undefined' ? window.location.origin : ''}
            />
          </div>
        )}
      </div>

      {/* Right column - Info */}
      <div className="w-56 flex-shrink-0 bg-grey border-l border-dark p-5">
        <div className="space-y-6">
          <div>
            <span className="font-mono text-[9px] uppercase tracking-widest text-mid block mb-2">STATUS</span>
            <span className={`font-mono text-[11px] uppercase tracking-widest border px-2 py-0.5 ${
              project.status === 'active' ? 'border-accent text-accent' : 'border-dark text-mid'
            }`}>
              {project.status}
            </span>
          </div>

          {idea && (
            <div>
              <span className="font-mono text-[9px] uppercase tracking-widest text-mid block mb-2">ORIGINAL IDEA</span>
              <p className="font-mono text-[11px] text-white leading-relaxed">
                {idea.teaser?.slice(0, 80)}{idea.teaser?.length > 80 ? '...' : ''}
              </p>
            </div>
          )}

          <div>
            <span className="font-mono text-[9px] uppercase tracking-widest text-mid block mb-2">FOUNDED</span>
            <p className="font-mono text-[11px] text-white">
              {new Date(project.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>

          <div>
            <span className="font-mono text-[9px] uppercase tracking-widest text-mid block mb-2">QUICK LINKS</span>
            <div className="space-y-1">
              {members.map((m) => (
                <div key={m.id} className="font-mono text-[10px] text-mid hover:text-white transition-colors cursor-pointer">
                  {m.profiles?.full_name?.split(' ')[0] || 'Anonymous'} →
                </div>
              ))}
            </div>
          </div>

          {idea && (
            <div>
              <a
                href={`/ideas/${idea.id}`}
                className="font-mono text-[10px] uppercase tracking-widest text-mid hover:text-accent transition-colors block"
              >
                VIEW IDEA →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
