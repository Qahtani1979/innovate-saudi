/**
 * Step 16: Communication Plan
 * AI prompt and schema for generating communication strategy
 */

export const getStep16Prompt = (context, wizardData) => {
  return `You are a strategic communications expert for Saudi Arabia's Ministry of Municipalities and Housing (MoMAH) with expertise in Innovation & R&D communication.

## MoMAH COMMUNICATION CONTEXT:
- Internal Channels: Ministry portal, Amanat intranets, email, workshops, townhalls
- External Channels: Balady portal, social media, press releases, stakeholder events
- Innovation Communication: Tech showcases, pilot demos, R&D partnership announcements, innovation awards
- Key Audiences: Municipal staff, citizens, tech partners, research institutions, government agencies

## STRATEGIC PLAN CONTEXT:
- Plan Name: ${context.planName}
- Vision: ${context.vision}
- Stakeholders: ${(wizardData.stakeholders || []).length} identified
- Focus Technologies: ${(wizardData.focus_technologies || []).join(', ') || 'AI_ML, IOT, DIGITAL_TWINS'}
- Key Pillars: ${(wizardData.strategic_pillars || []).slice(0, 3).map(p => p.name_en).join(', ') || 'Not defined'}

## KEY STAKEHOLDERS (from Step 3):
${(wizardData.stakeholders || []).slice(0, 8).map(s => '- ' + (s.name_en || s.name_ar) + ' (' + s.type + ')').join('\n') || 'Not defined'}

---

## REQUIREMENTS:
Generate comprehensive communication plan with INNOVATION/R&D messaging.

### PART 1: KEY MESSAGES (Generate 8-12 messages)
For EACH message, provide bilingual content:
- text_en / text_ar: Clear, compelling message (1-2 sentences)
- type: "announcement" | "update" | "alert" | "milestone" | "success" | "educational"
- audience: "citizens" | "municipalities" | "partners" | "leadership" | "media" | "academia" | "staff" | "investors"
- channel: "portal" | "email" | "social" | "press" | "events" | "newsletter" | "intranet" | "workshops" | "mobile_app" | "tv_radio" | "video" | "podcast"

**MANDATORY Innovation Messages (include at least 4):**
- "Innovation Vision" - Why innovation matters for MoMAH and citizens
- "Technology Leadership" - How emerging technologies will transform services
- "R&D Partnership Value" - Benefits of KACST/university/vendor partnerships
- "Pilot Program Updates" - Regular updates on innovation pilots
- "AI/Digital Transformation" - SDAIA-aligned AI adoption messaging
- "Innovation Success Stories" - Case studies and wins from pilots
- "Capability Building" - Staff training and digital skills development
- "Citizen Benefits" - How innovation improves citizen experience

**Message Examples:**
- "MoMAH is pioneering AI-powered municipal services in partnership with SDAIA and KACST, delivering smarter, faster services for citizens"
- "Our innovation pilots in ${(wizardData.target_regions || ['Riyadh', 'Jeddah']).slice(0, 2).join(' and ')} are testing cutting-edge solutions that will transform municipal services nationwide"

### PART 2: INTERNAL CHANNELS (Generate 5-7 channels)
For EACH channel, provide (BILINGUAL):
- name_en / name_ar: Channel name
- type: "portal" | "email" | "social" | "press" | "events" | "newsletter" | "intranet" | "workshops" | "mobile_app" | "tv_radio" | "video" | "podcast"
- purpose_en / purpose_ar: What it's used for
- frequency: "daily" | "weekly" | "biweekly" | "monthly" | "quarterly" | "as_needed"
- owner_en / owner_ar: Who manages it (e.g., "Communications Team" / "فريق الاتصالات")

**MANDATORY Innovation Internal Channels:**
- "Innovation Newsletter" - Monthly R&D updates, pilot progress, tech insights
- "Innovation Townhall/Webinar" - Quarterly showcases of pilot demos and tech updates
- "Innovation Community of Practice" - Ongoing forum for innovation champions
- "R&D Partnership Portal" - Updates from KACST/university partnerships

### PART 3: EXTERNAL CHANNELS (Generate 5-7 channels)
For EACH channel, provide:
- name_en / name_ar: Channel name
- type: "portal" | "email" | "social" | "press" | "events" | "newsletter" | "intranet" | "workshops" | "mobile_app" | "tv_radio" | "video" | "podcast"
- purpose_en / purpose_ar: What it's used for
- audience: Target external audience
- frequency: "daily" | "weekly" | "biweekly" | "monthly" | "quarterly" | "as_needed"

**MANDATORY Innovation External Channels:**
- "Innovation Showcase Events" - Annual/bi-annual tech demonstrations for stakeholders
- "Tech Partnership Announcements" - Press releases for R&D partnership milestones
- "Pilot Launch Campaigns" - Citizen awareness for new technology pilots
- "Innovation Awards/Recognition" - Highlight innovation achievements

Be specific to Saudi municipal context. Reference actual platforms and stakeholders.`;
};

export const step16Schema = {
  type: 'object',
  properties: {
    master_narrative_en: { type: 'string' },
    master_narrative_ar: { type: 'string' },
    target_audiences: { type: 'array', items: { type: 'string', enum: ['citizens', 'municipalities', 'partners', 'leadership', 'media', 'academia', 'staff', 'investors'] } },
    key_messages: { 
      type: 'array', 
      items: { 
        type: 'object', 
        required: ['text_en', 'text_ar', 'type', 'audience', 'channel'],
        properties: { 
          text_en: { type: 'string' }, 
          text_ar: { type: 'string' },
          type: { type: 'string', enum: ['announcement', 'update', 'alert', 'milestone', 'success', 'educational'] },
          audience: { type: 'string', enum: ['citizens', 'municipalities', 'partners', 'leadership', 'media', 'academia', 'staff', 'investors'] },
          channel: { type: 'string', enum: ['portal', 'email', 'social', 'press', 'events', 'newsletter', 'intranet', 'workshops', 'mobile_app', 'tv_radio', 'video', 'podcast'] }
        } 
      } 
    },
    internal_channels: { 
      type: 'array', 
      items: { 
        type: 'object',
        required: ['name_en', 'name_ar', 'type', 'purpose_en', 'purpose_ar', 'frequency', 'owner_en', 'owner_ar'],
        properties: { 
          name_en: { type: 'string' }, 
          name_ar: { type: 'string' },
          type: { type: 'string', enum: ['portal', 'email', 'social', 'press', 'events', 'newsletter', 'intranet', 'workshops', 'mobile_app', 'tv_radio', 'video', 'podcast'] },
          purpose_en: { type: 'string' },
          purpose_ar: { type: 'string' },
          frequency: { type: 'string', enum: ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'as_needed'] },
          owner_en: { type: 'string' },
          owner_ar: { type: 'string' }
        } 
      } 
    },
    external_channels: { 
      type: 'array', 
      items: { 
        type: 'object',
        required: ['name_en', 'name_ar', 'type', 'purpose_en', 'purpose_ar', 'frequency', 'audience'],
        properties: { 
          name_en: { type: 'string' }, 
          name_ar: { type: 'string' },
          type: { type: 'string', enum: ['portal', 'email', 'social', 'press', 'events', 'newsletter', 'intranet', 'workshops', 'mobile_app', 'tv_radio', 'video', 'podcast'] },
          purpose_en: { type: 'string' },
          purpose_ar: { type: 'string' },
          frequency: { type: 'string', enum: ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'as_needed'] },
          audience: { type: 'string' }
        } 
      } 
    }
  }
};
