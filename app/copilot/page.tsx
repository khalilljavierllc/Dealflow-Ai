"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Send, Sparkles } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui"
import { useLeads } from "@/lib/use-store"
import { buildCopilotReply } from "@/lib/copilot"

type Msg = { role: "user" | "assistant"; content: string }

const SUGGESTIONS = [
  "What are my hottest deals?",
  "How much is in my pipeline?",
  "Which deals need action today?",
  "Summarize my portfolio",
]

export default function CopilotPage() {
  const { leads, isSample } = useLeads()
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  const greeting = useMemo(
    () =>
      `Hi — I'm your DealFlow copilot. I read your ${leads.length} ${
        isSample ? "sample " : ""
      }deals directly, so ask me anything about your pipeline, scoring, or next moves.`,
    [leads.length, isSample],
  )

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [messages])

  function send(text: string) {
    const q = text.trim()
    if (!q) return
    const reply = buildCopilotReply(q, leads)
    setMessages((m) => [
      ...m,
      { role: "user", content: q },
      { role: "assistant", content: reply },
    ])
    setInput("")
  }

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 3rem)" }}>
      <PageHeader
        title="AI Copilot"
        subtitle="Ask questions about your deals in plain English"
      />

      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto rounded-xl border border-line bg-panel/50 p-4"
      >
        <div className="flex gap-3">
          <Avatar />
          <div className="max-w-[80%] rounded-2xl rounded-tl-sm border border-line bg-panel px-4 py-3 text-sm leading-relaxed">
            {greeting}
          </div>
        </div>

        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-sm font-medium text-primary-foreground">
                {m.content}
              </div>
            </div>
          ) : (
            <div key={i} className="flex gap-3">
              <Avatar />
              <div className="max-w-[80%] whitespace-pre-wrap rounded-2xl rounded-tl-sm border border-line bg-panel px-4 py-3 text-sm leading-relaxed">
                {m.content}
              </div>
            </div>
          ),
        )}

        {messages.length === 0 ? (
          <div className="flex flex-wrap gap-2 pt-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-full border border-line bg-panel-2 px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-primary/50 hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
        className="mt-3 flex items-center gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your pipeline..."
          className="flex-1 rounded-xl border border-line bg-panel px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <Button variant="primary" type="submit" aria-label="Send">
          <Send size={16} />
        </Button>
      </form>
      <p className="mt-2 text-center text-[11px] text-muted-foreground">
        Answers are generated from your local deal data using a rule-based model.
        Connect an LLM via <code className="text-muted">/api/analyze</code> for
        free-form reasoning.
      </p>
    </div>
  )
}

function Avatar() {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground">
      <Sparkles size={15} />
    </span>
  )
}
