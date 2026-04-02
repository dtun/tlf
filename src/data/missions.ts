export interface MissionStep {
  step: number;
  instruction: string;
}

export interface Mission {
  id: string;
  category: 'content' | 'events' | 'funding' | 'advocacy';
  title: string;
  description: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  timeEstimate: string;
  steps: MissionStep[];
  evidencePrompt: string;
  exampleEvidence: string;
}

export const MISSIONS: Mission[] = [
  // -- CONTENT --
  {
    id: 'content-social-post',
    category: 'content',
    title: 'Share a UBI Post',
    description: 'Create and publish a post about Universal Basic Income or TLF on any social platform.',
    points: 10,
    difficulty: 'easy',
    timeEstimate: '15 min',
    steps: [
      { step: 1, instruction: 'Choose a platform: Instagram, X, LinkedIn, TikTok, or Facebook.' },
      { step: 2, instruction: 'Write a post explaining what UBI is, why it matters, or sharing a TLF program. Keep it personal and authentic.' },
      { step: 3, instruction: 'Include at least one of: @Foundation_TLF tag, #UBI hashtag, or a link to thelogicalfoundation.org.' },
      { step: 4, instruction: 'Publish the post and copy the public URL.' },
    ],
    evidencePrompt: 'Paste the public URL to your post.',
    exampleEvidence: 'https://www.instagram.com/p/ABC123...',
  },
  {
    id: 'content-video',
    category: 'content',
    title: 'Create a UBI Video',
    description: 'Film and post a video about UBI, homelessness, or TLF. Reels, TikToks, and YouTube Shorts all count.',
    points: 50,
    difficulty: 'medium',
    timeEstimate: '1-2 hrs',
    steps: [
      { step: 1, instruction: 'Pick a topic: your personal take on UBI, a TLF program explainer, a reaction to a news story, or an interview with someone affected by poverty.' },
      { step: 2, instruction: 'Film a video at least 60 seconds long. You do not need professional equipment — phone video is fine.' },
      { step: 3, instruction: 'Add captions if possible (improves reach by 40%).' },
      { step: 4, instruction: 'Post to any platform and tag @Foundation_TLF or use #UBI.' },
      { step: 5, instruction: 'Copy the public URL to your video.' },
    ],
    evidencePrompt: 'Paste the public URL to your video.',
    exampleEvidence: 'https://www.tiktok.com/@yourhandle/video/123...',
  },
  {
    id: 'content-article',
    category: 'content',
    title: 'Write a UBI Article',
    description: 'Publish a written piece about UBI on Medium, Substack, LinkedIn, or your own blog.',
    points: 75,
    difficulty: 'medium',
    timeEstimate: '2-3 hrs',
    steps: [
      { step: 1, instruction: 'Choose an angle: personal story, policy argument, research summary, or local Arizona focus.' },
      { step: 2, instruction: 'Write at least 500 words. Cite at least one study or data point.' },
      { step: 3, instruction: 'Link to thelogicalfoundation.org at least once.' },
      { step: 4, instruction: 'Publish publicly and copy the URL.' },
    ],
    evidencePrompt: 'Paste the public URL to your article.',
    exampleEvidence: 'https://medium.com/@yourhandle/why-ubi-works-...',
  },
  {
    id: 'content-press',
    category: 'content',
    title: 'Get TLF in the Press',
    description: 'Pitch a journalist, podcast, or media outlet and get The Logical Foundation mentioned.',
    points: 200,
    difficulty: 'hard',
    timeEstimate: '3-5 hrs',
    steps: [
      { step: 1, instruction: 'Identify a journalist, podcast host, or media outlet that covers poverty, housing, nonprofits, or Arizona news.' },
      { step: 2, instruction: 'Draft a pitch email: introduce TLF, share a compelling stat (e.g. 100% housing rate in 2024 pilot), and offer an interview with our founder.' },
      { step: 3, instruction: 'Send the pitch to info@thelogicalfoundation.org first so we can coordinate.' },
      { step: 4, instruction: 'Once coverage is published, copy the URL.' },
    ],
    evidencePrompt: 'Paste the URL to the published article, podcast episode, or media mention.',
    exampleEvidence: 'https://tucsonsentinel.com/local/report/...',
  },
  // -- EVENTS --
  {
    id: 'events-house-party',
    category: 'events',
    title: 'Host a House Party',
    description: 'Invite friends, family, or colleagues to a private gathering to learn about UBI and TLF.',
    points: 150,
    difficulty: 'medium',
    timeEstimate: '3-4 hrs',
    steps: [
      { step: 1, instruction: 'Invite at least 5 people to your home or a private venue.' },
      { step: 2, instruction: 'Email info@thelogicalfoundation.org to request a presentation deck and talking points.' },
      { step: 3, instruction: 'Present TLF\'s mission, the 2024 pilot results, and how guests can get involved.' },
      { step: 4, instruction: 'Collect email addresses from attendees who want to stay informed.' },
      { step: 5, instruction: 'Send the collected emails to info@thelogicalfoundation.org after the event.' },
    ],
    evidencePrompt: 'Describe the event: date, number of attendees, and any pledges or sign-ups collected. Attach a photo if possible.',
    exampleEvidence: 'Hosted 8 people on June 14. Shared the 2024 pilot results. 3 people signed up for the newsletter and 1 made a pledge. Photo: [link]',
  },
  {
    id: 'events-public',
    category: 'events',
    title: 'Host a Public Event',
    description: 'Organize a public awareness or fundraising event — tabling, panel, community meeting, or fundraiser.',
    points: 300,
    difficulty: 'hard',
    timeEstimate: '8-12 hrs',
    steps: [
      { step: 1, instruction: 'Choose a format: tabling at a farmers market, a panel discussion, a community meeting, or a fundraising dinner.' },
      { step: 2, instruction: 'Secure a venue and date. Email info@thelogicalfoundation.org to coordinate materials and support.' },
      { step: 3, instruction: 'Promote the event on social media at least one week in advance.' },
      { step: 4, instruction: 'Host the event. Collect attendee emails and any donations.' },
      { step: 5, instruction: 'Send a follow-up report to info@thelogicalfoundation.org with attendance, funds raised, and emails collected.' },
    ],
    evidencePrompt: 'Describe the event: format, date, location, attendance, funds raised, and emails collected. Include a photo or social media post link.',
    exampleEvidence: 'Tabled at Rillito Farmers Market on July 4. ~40 conversations, 12 email sign-ups, $150 raised. Photo: [link]',
  },
  {
    id: 'events-referral',
    category: 'events',
    title: 'Refer a New Pledger',
    description: 'Personally introduce someone who creates a UBI Giving Pledge account.',
    points: 50,
    difficulty: 'easy',
    timeEstimate: '30 min',
    steps: [
      { step: 1, instruction: 'Share the app link (app.thelogicalfoundation.org) with someone in your network.' },
      { step: 2, instruction: 'Walk them through the pledge process or answer their questions.' },
      { step: 3, instruction: 'Ask them to mention your name or email when they sign up.' },
    ],
    evidencePrompt: 'Provide the name and email of the person you referred who signed up.',
    exampleEvidence: 'Referred Jane Smith (jane@example.com) — she signed up on June 20.',
  },
  // -- FUNDING --
  {
    id: 'funding-fundraise-100',
    category: 'funding',
    title: 'Raise $100',
    description: 'Fundraise $100 for TLF through any channel — birthday campaign, peer-to-peer, or direct ask.',
    points: 100,
    difficulty: 'easy',
    timeEstimate: '1-2 hrs',
    steps: [
      { step: 1, instruction: 'Set up a GiveButter fundraiser at givebutter.com or use our donate page.' },
      { step: 2, instruction: 'Share your fundraiser link with friends, family, and your social network.' },
      { step: 3, instruction: 'Reach $100 in donations.' },
      { step: 4, instruction: 'Copy the fundraiser URL or screenshot showing total raised.' },
    ],
    evidencePrompt: 'Paste your fundraiser URL or a screenshot showing the total amount raised.',
    exampleEvidence: 'https://givebutter.com/yourfundraiser — raised $120 as of June 15.',
  },
  {
    id: 'funding-fundraise-500',
    category: 'funding',
    title: 'Raise $500',
    description: 'Fundraise $500 for TLF. Bonus multiplier applied.',
    points: 600,
    difficulty: 'medium',
    timeEstimate: '4-8 hrs',
    steps: [
      { step: 1, instruction: 'Set up a GiveButter fundraiser or coordinate a workplace giving campaign.' },
      { step: 2, instruction: 'Identify your top 10 potential donors and reach out personally — a personal ask converts 3x better than a mass message.' },
      { step: 3, instruction: 'Follow up once after 5 days with anyone who hasn\'t responded.' },
      { step: 4, instruction: 'Reach $500 in donations.' },
    ],
    evidencePrompt: 'Paste your fundraiser URL or a screenshot showing $500+ raised.',
    exampleEvidence: 'https://givebutter.com/yourfundraiser — raised $550.',
  },
  {
    id: 'funding-corporate',
    category: 'funding',
    title: 'Connect a Corporate Giving Program',
    description: 'Identify and connect TLF to a corporate matching program, employee giving campaign, or CSR fund.',
    points: 400,
    difficulty: 'hard',
    timeEstimate: '3-6 hrs',
    steps: [
      { step: 1, instruction: 'Identify a company with a corporate giving or matching program. Check if your own employer has one at benevity.com or cybergrants.com.' },
      { step: 2, instruction: 'Verify TLF is eligible (we are a registered 501(c)(3), EIN# 88-3607946).' },
      { step: 3, instruction: 'Submit TLF to the program or connect us to the CSR contact. Email info@thelogicalfoundation.org with the contact details.' },
      { step: 4, instruction: 'Confirm the connection has been made and provide the company name and contact.' },
    ],
    evidencePrompt: 'Provide the company name, program name, contact person, and current status of the connection.',
    exampleEvidence: 'Connected TLF to Microsoft Philanthropies matching program. Contact: Jane Doe (jane@microsoft.com). Application submitted June 10.',
  },
  {
    id: 'funding-foundation',
    category: 'funding',
    title: 'Introduce a Foundation or Major Donor',
    description: 'Make a warm introduction between TLF and a foundation, philanthropist, or major donor ($10K+).',
    points: 500,
    difficulty: 'hard',
    timeEstimate: '2-4 hrs',
    steps: [
      { step: 1, instruction: 'Identify a foundation, family office, or individual philanthropist who funds poverty, housing, or UBI-related work.' },
      { step: 2, instruction: 'Research their giving priorities and confirm alignment with TLF\'s mission.' },
      { step: 3, instruction: 'Make a warm introduction via email, connecting them directly with info@thelogicalfoundation.org.' },
      { step: 4, instruction: 'Follow up to confirm the introduction was received.' },
    ],
    evidencePrompt: 'Provide the name of the foundation or donor, their focus area, and confirmation that the introduction email was sent.',
    exampleEvidence: 'Introduced TLF to the Arizona Community Foundation (focus: housing + poverty). Sent intro email June 12 — both parties confirmed receipt.',
  },
  {
    id: 'funding-grant-research',
    category: 'funding',
    title: 'Research a Grant Opportunity',
    description: 'Find and document a grant opportunity that TLF should apply for.',
    points: 75,
    difficulty: 'medium',
    timeEstimate: '1-2 hrs',
    steps: [
      { step: 1, instruction: 'Search for grants at candid.org/grants, grants.gov, or foundation websites.' },
      { step: 2, instruction: 'Find a grant aligned with UBI, homelessness, poverty reduction, or Arizona community development.' },
      { step: 3, instruction: 'Document: grant name, funder, amount, deadline, eligibility, and application link.' },
      { step: 4, instruction: 'Email the details to info@thelogicalfoundation.org.' },
    ],
    evidencePrompt: 'Provide the grant name, funder, amount, deadline, and application link.',
    exampleEvidence: 'Robert Wood Johnson Foundation — Health and Poverty grant. Up to $500K. Deadline: Sept 1. Link: rwjf.org/grants/...',
  },
  // -- ADVOCACY --
  {
    id: 'advocacy-elected',
    category: 'advocacy',
    title: 'Contact an Elected Official',
    description: 'Call, email, or meet with a local, state, or federal elected official about UBI or homelessness.',
    points: 25,
    difficulty: 'easy',
    timeEstimate: '20 min',
    steps: [
      { step: 1, instruction: 'Find your representatives at usa.gov/elected-officials.' },
      { step: 2, instruction: 'Choose a specific ask: support for a UBI pilot, increased homelessness funding, or AZ Tax Credit expansion.' },
      { step: 3, instruction: 'Call their office or send an email. Be specific: name the bill or program you support.' },
      { step: 4, instruction: 'Note the official\'s name, office, and the response you received.' },
    ],
    evidencePrompt: 'Name the official you contacted, their office, your ask, and the response (if any).',
    exampleEvidence: 'Called Rep. Grijalva\'s Tucson office on June 8. Asked for support of HR 1234 (UBI pilot funding). Staffer took notes and said they\'d pass it along.',
  },
  {
    id: 'advocacy-testimony',
    category: 'advocacy',
    title: 'Give Public Testimony',
    description: 'Speak at a city council, county board, or state legislature hearing about UBI or homelessness.',
    points: 150,
    difficulty: 'hard',
    timeEstimate: '3-4 hrs',
    steps: [
      { step: 1, instruction: 'Find an upcoming public hearing on homelessness, housing, or poverty at your city council or state legislature.' },
      { step: 2, instruction: 'Sign up to give public comment (usually 2-3 minutes).' },
      { step: 3, instruction: 'Email info@thelogicalfoundation.org for talking points and support.' },
      { step: 4, instruction: 'Attend and deliver your testimony. Mention TLF and our 2024 pilot results.' },
      { step: 5, instruction: 'Record or note the date, body, and topic of the hearing.' },
    ],
    evidencePrompt: 'Provide the date, governing body, hearing topic, and a summary of your testimony. A recording or written transcript earns bonus consideration.',
    exampleEvidence: 'Testified at Tucson City Council on June 18 re: homelessness action plan. Cited TLF pilot — 100% housing rate at $3K/person. Video: [link]',
  },
];

export const CATEGORY_CONFIG = {
  content:   { label: 'Content',   icon: '\u{1F4E3}', color: 'text-blue-400',   bg: 'bg-blue-900/20',   border: 'border-blue-700/40' },
  events:    { label: 'Events',    icon: '\u{1F389}', color: 'text-purple-400', bg: 'bg-purple-900/20', border: 'border-purple-700/40' },
  funding:   { label: 'Funding',   icon: '\u{1F4B0}', color: 'text-green-400',  bg: 'bg-green-900/20',  border: 'border-green-700/40' },
  advocacy:  { label: 'Advocacy',  icon: '\u{1F4E2}', color: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-700/40' },
} as const;

export const TIER_CONFIG = [
  { tier: 'seed',     min: 0,    max: 199,  label: 'Seed',     color: 'text-textMuted',  bg: 'bg-surface',        desc: 'Just getting started' },
  { tier: 'sprout',   min: 200,  max: 749,  label: 'Sprout',   color: 'text-green-400',  bg: 'bg-green-900/20',   desc: 'Growing your impact' },
  { tier: 'grower',   min: 750,  max: 1999, label: 'Grower',   color: 'text-blue-400',   bg: 'bg-blue-900/20',    desc: 'Making real change' },
  { tier: 'champion', min: 2000, max: 4999, label: 'Champion', color: 'text-purple-400', bg: 'bg-purple-900/20',  desc: 'Leading the movement' },
  { tier: 'legend',   min: 5000, max: null, label: 'Legend',   color: 'text-yellow-400', bg: 'bg-yellow-900/20',  desc: 'Transforming lives' },
];
