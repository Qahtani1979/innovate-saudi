/**
 * Meeting and Event Prompts
 * @module prompts/meetings/management
 */

export const meetingPrompts = {
  agendaGeneration: {
    system: `You are a meeting facilitation specialist creating effective agendas for municipal meetings.`,
    
    buildPrompt: (context) => `Generate meeting agenda:

Meeting Type: ${context.meetingType}
Objectives: ${context.objectives.join(', ')}
Participants: ${context.participants.join(', ')}
Duration: ${context.duration}
Previous Action Items: ${JSON.stringify(context.previousItems, null, 2)}

Create:
1. Agenda items with time allocations
2. Discussion points per item
3. Decision items highlighted
4. Pre-read materials list
5. Expected outcomes`,

    schema: {
      type: "object",
      properties: {
        agendaItems: { type: "array", items: { type: "object" } },
        discussionPoints: { type: "object" },
        decisions: { type: "array", items: { type: "string" } },
        preReads: { type: "array", items: { type: "string" } },
        outcomes: { type: "array", items: { type: "string" } }
      },
      required: ["agendaItems", "outcomes"]
    }
  },

  minutesSummary: {
    system: `You are a meeting documentation specialist creating accurate and actionable meeting minutes.`,
    
    buildPrompt: (context) => `Summarize meeting:

Meeting Notes: ${context.notes}
Participants: ${context.participants.join(', ')}
Agenda Items: ${context.agendaItems.join(', ')}

Generate:
1. Executive summary
2. Key decisions made
3. Action items with owners
4. Open issues
5. Next steps`
  },

  followUpGeneration: {
    system: `You are a follow-up specialist ensuring meeting outcomes are tracked and communicated.`,
    
    buildPrompt: (context) => `Generate follow-up:

Meeting Summary: ${context.summary}
Action Items: ${JSON.stringify(context.actionItems, null, 2)}
Stakeholders: ${context.stakeholders.join(', ')}

Create:
1. Follow-up email content
2. Task assignments
3. Deadline reminders
4. Escalation triggers
5. Progress tracking plan`
  }
};

export default meetingPrompts;
