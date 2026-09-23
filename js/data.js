/**
 * Event Data Service & Storage Engine
 * Contains default schedule data directly from the official Inauguration Poster
 * and provides LocalStorage persistence with multi-tab sync.
 */

const STORAGE_KEY = 'parrticipant_event_data_v1';
const ADMIN_PASS_KEY = 'parrticipant_admin_pass';
const DEFAULT_PASS = 'admin2026';

const DEFAULT_EVENT_DATA = {
  general: {
    title: "SCHEDULE-INAUGURATION",
    subtitle: "Annual Tech Symposium & Innovation Summit",
    organization: "Department of Computer Science & Engineering",
    eventDate: "2026-09-23",
    startTime: "08:30 AM",
    endTime: "05:00 PM",
    venue: "Campus Tech Hub & Main Auditorium",
    announcement: "⚡ Welcome Participants! Check-in starts at 08:30 AM at the Reception Desk.",
    announcementActive: true,
    tagline: "Inspire • Innovate • Transform"
  },
  venues: [
    { id: "v1", name: "Main Auditorium", description: "Grand Ceremonies, Keynotes & Valedictory", capacity: "600 Pax" },
    { id: "v2", name: "CSE Innovation Lab", description: "Demo Stall Exhibitions & Prototype Scrutiny", capacity: "120 Pax" },
    { id: "v3", name: "Computing Lab 2 & 3", description: "Mini Hackathon Sprints & Code Evaluations", capacity: "150 Pax" },
    { id: "v4", name: "Auditorium Annex", description: "Tech Debate Arena & Poster Design Challenge", capacity: "100 Pax" },
    { id: "v5", name: "Dining Pavilion", description: "High Tea & Networking Lunch Break", capacity: "500 Pax" }
  ],
  categories: [
    { id: "ceremony", name: "Ceremony & Keynote", color: "#d97706", badge: "Ceremony" },
    { id: "hackathon", name: "Mini Hackathon", color: "#2563eb", badge: "Hackathon" },
    { id: "demo", name: "Demo Stall", color: "#059669", badge: "Exhibition" },
    { id: "debate", name: "Debate & Contests", color: "#7c3aed", badge: "Competition" },
    { id: "workshop", name: "Workshop", color: "#0891b2", badge: "Workshop" },
    { id: "break", name: "Breaks & Movement", color: "#64748b", badge: "Networking" }
  ],
  schedule: [
    {
      id: "sch-1",
      time: "08:30 AM",
      rawTime: "08:30",
      title: "Registration & Desk Check-In",
      category: "ceremony",
      venue: "Main Reception & Registration Desks",
      description: "Participant badge collection, welcome kit distribution, and ID verification.",
      status: "scheduled",
      speaker: "Organizing Committee",
      isHighlight: true
    },
    {
      id: "sch-2",
      time: "09:30 AM",
      rawTime: "09:30",
      title: "Inaugural Ceremony & Keynote Address",
      category: "ceremony",
      venue: "Main Auditorium",
      description: "Ceremonial lamp lighting, presidential address, and keynote speech by industry leaders.",
      status: "scheduled",
      speaker: "Chief Dignitaries & Head of Department",
      isHighlight: true
    },
    {
      id: "sch-3",
      time: "10:00 AM",
      rawTime: "10:00",
      title: "High Tea & Venue Movement",
      category: "break",
      venue: "Central Lawn & Dining Pavilion",
      description: "Refreshments, informal networking, and transition of teams to respective event venues.",
      status: "scheduled",
      speaker: "Hospitality Team",
      isHighlight: false
    },
    {
      id: "sch-4",
      time: "11:30 AM",
      rawTime: "11:30",
      title: "Demo Stall Exhibition — Round 1",
      category: "demo",
      venue: "CSE Innovation Lab",
      description: "First round of project demos, hardware/software prototypes review by pre-jury mentors.",
      status: "scheduled",
      speaker: "Exhibitor Teams & Mentor Panel",
      isHighlight: true
    },
    {
      id: "sch-5",
      time: "11:30 AM",
      rawTime: "11:30",
      title: "Mini Hackathon — Sprint Phase 1",
      category: "hackathon",
      venue: "Computing Lab 2 & 3",
      description: "Problem statement unveiling and commencement of rapid development sprint.",
      status: "scheduled",
      speaker: "Technical Mentors",
      isHighlight: true
    },
    {
      id: "sch-6",
      time: "11:30 AM",
      rawTime: "11:30",
      title: "Poster Designing Challenge",
      category: "debate",
      venue: "Auditorium Annex",
      description: "Live visual design and creative infographic challenge on cutting-edge tech themes.",
      status: "scheduled",
      speaker: "Design Jury",
      isHighlight: false
    },
    {
      id: "sch-7",
      time: "11:30 AM",
      rawTime: "11:30",
      title: "Workshop",
      category: "workshop",
      venue: "Seminar Hall A",
      description: "Hands-on masterclass on Applied AI and Modern Cloud Systems.",
      status: "scheduled",
      speaker: "Visiting Technical Specialist",
      isHighlight: false
    },
    {
      id: "sch-8",
      time: "01:00 PM",
      rawTime: "13:00",
      title: "Lunch Break",
      category: "break",
      venue: "Dining Pavilion",
      description: "Buffet lunch, relaxation, and informal team sync.",
      status: "scheduled",
      speaker: "Catering & Hospitality",
      isHighlight: false
    },
    {
      id: "sch-9",
      time: "02:00 PM",
      rawTime: "14:00",
      title: "Demo Stall — Final Jury Scoring",
      category: "demo",
      venue: "CSE Innovation Lab",
      description: "Final evaluation round by industry jury panel with live scoring on innovation, viability and tech stack.",
      status: "scheduled",
      speaker: "Distinguished Industry Jury",
      isHighlight: true
    },
    {
      id: "sch-10",
      time: "02:00 PM",
      rawTime: "14:00",
      title: "Mini Hackathon — Code Freeze & Live Pitch",
      category: "hackathon",
      venue: "Computing Lab 2 & 3",
      description: "Final git commit push, code freeze, followed by 3-minute lightning pitches and demo to judges.",
      status: "scheduled",
      speaker: "Hackathon Finalists",
      isHighlight: true
    },
    {
      id: "sch-11",
      time: "02:00 PM",
      rawTime: "14:00",
      title: "Tech Debate Arena: Prelims & Finals",
      category: "debate",
      venue: "Auditorium Annex",
      description: "Head-to-head intellectual debate on AI ethics, cyber autonomy, and tech regulations.",
      status: "scheduled",
      speaker: "Debate Adjudicators",
      isHighlight: false
    },
    {
      id: "sch-12",
      time: "03:30 PM",
      rawTime: "15:30",
      title: "Results Consolidation & Seating in Auditorium",
      category: "ceremony",
      venue: "Main Auditorium",
      description: "Jury score compilation, verification by controllers, and attendees assembling for valediction.",
      status: "scheduled",
      speaker: "Tabulation Board",
      isHighlight: false
    },
    {
      id: "sch-13",
      time: "03:45 PM",
      rawTime: "15:45",
      title: "Valedictory Function & Prize Distribution",
      category: "ceremony",
      venue: "Main Auditorium",
      description: "Declaration of winners, trophy presentation, certificates of excellence, and sponsor felicitations.",
      status: "scheduled",
      speaker: "Chief Guest & Patrons",
      isHighlight: true
    },
    {
      id: "sch-14",
      time: "04:45 PM",
      rawTime: "16:45",
      title: "National Anthem, Group Photos & Dispersal",
      category: "ceremony",
      venue: "Main Auditorium & Portico",
      description: "Official photo op with participants, jury, faculty, and playing of the National Anthem.",
      status: "scheduled",
      speaker: "All Participants & Dignitaries",
      isHighlight: false
    },
    {
      id: "sch-15",
      time: "05:00 PM",
      rawTime: "17:00",
      title: "END OF THE PROGRAM",
      category: "break",
      venue: "Event Concluded",
      description: "Thank you for joining! Safe travels and see you next year.",
      status: "scheduled",
      speaker: "Event Chairs",
      isHighlight: true
    }
  ],
  roadmap: [
    {
      id: "rm-1",
      phaseNumber: "Phase 01",
      title: "Induction, Inauguration & Keynote",
      timeRange: "08:30 AM – 10:30 AM",
      badge: "Foundation",
      status: "upcoming",
      summary: "Kicking off the summit with badge check-in, dignitary introductions, keynote speeches, and morning tea.",
      deliverables: ["Welcome Kit & ID Verification", "Opening Ceremony in Main Auditorium", "High Tea & Venue Movement"]
    },
    {
      id: "rm-2",
      phaseNumber: "Phase 02",
      title: "Parallel Innovation Tracks & Sprint Launch",
      timeRange: "11:30 AM – 01:00 PM",
      badge: "Execution",
      status: "upcoming",
      summary: "Multi-track concurrent sessions featuring Hackathon Sprint 1, Demo Stall preliminary round, hands-on workshop, and poster design challenge.",
      deliverables: ["Mini Hackathon Sprint 1 kickoff", "Demo Stall Round 1 prototype reviews", "Poster Designing Challenge submission", "Applied AI Masterclass Workshop"]
    },
    {
      id: "rm-3",
      phaseNumber: "Phase 03",
      title: "Code Freeze, Jury Defense & Debate Arena",
      timeRange: "02:00 PM – 03:30 PM",
      badge: "Scrutiny",
      status: "upcoming",
      summary: "High-stakes afternoon evaluations including live code pitching, final jury scoring, and the Tech Debate showdown.",
      deliverables: ["Hackathon Git Freeze & Live Demo Pitch", "Demo Stall Grand Jury Evaluation", "Tech Debate Championship Finals"]
    },
    {
      id: "rm-4",
      phaseNumber: "Phase 04",
      title: "Valedictory, Awards Ceremony & Wrap-up",
      timeRange: "03:30 PM – 05:00 PM",
      badge: "Celebration",
      status: "upcoming",
      summary: "Results consolidation, valedictory address, trophy and cash prize distribution, national anthem, and group photography.",
      deliverables: ["Score tabulation & auditorium seating", "Prize distribution & felicitations", "National anthem & official photo op"]
    }
  ]
};

class EventDataManager {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEY)) {
      this.saveAll(DEFAULT_EVENT_DATA);
    }
  }

  getAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return JSON.parse(JSON.stringify(DEFAULT_EVENT_DATA));
      const parsed = JSON.parse(raw);
      if (!parsed.schedule) parsed.schedule = DEFAULT_EVENT_DATA.schedule;
      if (!parsed.roadmap) parsed.roadmap = DEFAULT_EVENT_DATA.roadmap;
      if (!parsed.general) parsed.general = DEFAULT_EVENT_DATA.general;
      if (!parsed.venues) parsed.venues = DEFAULT_EVENT_DATA.venues;
      if (!parsed.categories) parsed.categories = DEFAULT_EVENT_DATA.categories;
      return parsed;
    } catch (e) {
      console.error('Failed to parse event data, fallback to defaults', e);
      return JSON.parse(JSON.stringify(DEFAULT_EVENT_DATA));
    }
  }

  saveAll(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      this.dispatchUpdate();
      return true;
    } catch (e) {
      console.error('Error saving event data', e);
      return false;
    }
  }

  dispatchUpdate() {
    window.dispatchEvent(new CustomEvent('parrticipant_data_updated', {
      detail: { timestamp: Date.now() }
    }));
  }

  resetToDefault() {
    const fresh = JSON.parse(JSON.stringify(DEFAULT_EVENT_DATA));
    this.saveAll(fresh);
    return fresh;
  }

  // Schedule CRUD
  getSchedule() {
    return this.getAll().schedule || [];
  }

  addScheduleItem(item) {
    const data = this.getAll();
    const newItem = {
      id: 'sch-' + Date.now(),
      time: item.time || "12:00 PM",
      rawTime: item.rawTime || "12:00",
      title: item.title || "Untitled Session",
      category: item.category || "ceremony",
      venue: item.venue || "Main Auditorium",
      description: item.description || "",
      status: item.status || "scheduled",
      speaker: item.speaker || "Speaker TBA",
      isHighlight: !!item.isHighlight
    };
    data.schedule.push(newItem);
    this.saveAll(data);
    return newItem;
  }

  updateScheduleItem(id, updatedFields) {
    const data = this.getAll();
    const index = data.schedule.findIndex(s => s.id === id);
    if (index === -1) return false;
    data.schedule[index] = { ...data.schedule[index], ...updatedFields };
    this.saveAll(data);
    return data.schedule[index];
  }

  deleteScheduleItem(id) {
    const data = this.getAll();
    const beforeCount = data.schedule.length;
    data.schedule = data.schedule.filter(s => s.id !== id);
    if (data.schedule.length !== beforeCount) {
      this.saveAll(data);
      return true;
    }
    return false;
  }

  // Roadmap CRUD
  getRoadmap() {
    return this.getAll().roadmap || [];
  }

  addRoadmapItem(item) {
    const data = this.getAll();
    const newItem = {
      id: 'rm-' + Date.now(),
      phaseNumber: item.phaseNumber || `Phase 0${data.roadmap.length + 1}`,
      title: item.title || "New Milestone",
      timeRange: item.timeRange || "TBA",
      badge: item.badge || "Milestone",
      status: item.status || "upcoming",
      summary: item.summary || "",
      deliverables: Array.isArray(item.deliverables) ? item.deliverables : []
    };
    data.roadmap.push(newItem);
    this.saveAll(data);
    return newItem;
  }

  updateRoadmapItem(id, updatedFields) {
    const data = this.getAll();
    const index = data.roadmap.findIndex(r => r.id === id);
    if (index === -1) return false;
    data.roadmap[index] = { ...data.roadmap[index], ...updatedFields };
    this.saveAll(data);
    return data.roadmap[index];
  }

  deleteRoadmapItem(id) {
    const data = this.getAll();
    const beforeCount = data.roadmap.length;
    data.roadmap = data.roadmap.filter(r => r.id !== id);
    if (data.roadmap.length !== beforeCount) {
      this.saveAll(data);
      return true;
    }
    return false;
  }

  // General Settings
  updateGeneralSettings(general) {
    const data = this.getAll();
    data.general = { ...data.general, ...general };
    this.saveAll(data);
    return data.general;
  }

  // Export / Import
  exportJSON() {
    return JSON.stringify(this.getAll(), null, 2);
  }

  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.schedule || !Array.isArray(parsed.schedule)) {
        throw new Error('Invalid JSON format: missing schedule list');
      }
      this.saveAll(parsed);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }

  // Admin Auth Helpers
  getAdminPassword() {
    return localStorage.getItem(ADMIN_PASS_KEY) || DEFAULT_PASS;
  }

  verifyAdminPassword(password) {
    return password === this.getAdminPassword();
  }

  setAdminPassword(newPass) {
    if (!newPass || newPass.trim().length < 4) return false;
    localStorage.setItem(ADMIN_PASS_KEY, newPass.trim());
    return true;
  }
}

// Global instance available across scripts
window.EventData = new EventDataManager();
