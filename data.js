// SafeTalk Q3/2026 questions (by Gryffindor). Answers cropped from the Cabin Crew Manual Iss.04 Rev.03 (TR02).
// ref = CCM page number(s).
// fleet: null = both, 'A' = Airbus, 'B' = Boeing. page = page number in the original PDF.
window.SAFETALK = {
  title: "SafeTalk Q3/2026",
  by: "Gryffindor",
  sections: [
    { id: "safety", name: "Safety & Procedures", th: "ความปลอดภัย / ขั้นตอน" },
    { id: "firstaid", name: "First Aid", th: "ปฐมพยาบาล" },
    { id: "security", name: "Security", th: "การรักษาความปลอดภัย" }
  ],
  items: [
    { id: "g1", sec: "safety", no: "1", page: 1, q: "What shall Cabin Crew members be assigned to duties, and operate, on a particular aircraft type or variant according to CAAT regulations?", img: ["g1.webp"], ref: "1-6" },
    { id: "g2", sec: "safety", no: "2", page: 1, q: "What is the procedure of a non-commercial operations flight without passengers?", img: ["g2.webp"], ref: "1-14" },
    { id: "g3", sec: "safety", no: "3", page: 1, q: "How long shall Cabin Crew not undertake flying duties when acting as Blood and Bone Marrow donors?", img: ["g3.webp"], ref: "1-28" },
    { id: "g4", sec: "safety", no: "4", page: 1, q: "What are Cabin Crew actions in case of Unanticipated Turbulence?", img: ["g4.webp"], ref: "1-52" },
    { id: "g5", sec: "safety", no: "5", page: 1, q: "What are the cabin conditions in case of Moderate Turbulence?", img: ["g5.webp"], ref: "1-54" },
    { id: "g6", sec: "safety", no: "6", page: 1, q: "What are the conditions to carry a Large Musical Instrument / Diplomatic Bag onboard?", img: ["g6.webp"], ref: "2-40" },
    { id: "g7", sec: "safety", no: "7", page: 2, q: "What is the procedure to apply In-Seat Electrical Power Supplies?", img: ["g7.webp"], ref: "2-43" },
    { id: "g8", sec: "safety", no: "8", page: 2, q: "What are the PA announcements that Cabin Crew shall make during in-flight duties?", img: ["g8.webp"], ref: "2-56" },
    { id: "g9", sec: "safety", no: "9", page: 2, q: "When does the Sterile Flight Crew Compartment and No Contact Period start and end?", img: ["g9.webp"], ref: "2-57" },
    { id: "g10", sec: "safety", no: "10", page: 2, q: "What is the procedure of Re-Opening of Doors in Case of Abnormalities?", img: ["g10-1.webp", "g10-2.webp"], ref: "2-67, 2-68" },
    { id: "g11", sec: "safety", no: "11", page: 2, q: "What are the Categories of Passengers with Reduced Mobility (PRM)?", img: ["g11.webp"], ref: "2-72" },
    { id: "g12", sec: "safety", no: "12", page: 2, q: "What are the conditions to be carried with Pregnancy between 28 weeks to 32 weeks (inclusive)?", img: ["g12.webp"], ref: "2-80" },
    { id: "g13a", sec: "safety", no: "13", fleet: "A", page: 3, q: "How to operate the Emergency Locator Transmitter (ELT)? (following aircraft assignment)", img: ["g13a-1.webp", "g13a-2.webp", "g13a-3.webp", "g13a-4.webp", "g13a-5.webp", "g13a-6.webp"], ref: "3-65, 3-66, 3-67, 3-68, 3-69" },
    { id: "g13b", sec: "safety", no: "13", fleet: "B", page: 2, q: "How to operate the Water Fire Extinguisher?", img: ["g13b.webp"], ref: "3-93" },
    { id: "g14", sec: "safety", no: "14", page: 3, q: "How to operate the emergency lighting?", img: ["g14.webp"], ref: "4-56" },
    { id: "g15a", sec: "safety", no: "15", fleet: "A", page: 3, q: "What is the procedure of opening the door in case of Emergency – Crash Land?", img: ["g15a.webp"], ref: "4-91" },
    { id: "g15b", sec: "safety", no: "15", fleet: "B", page: 3, q: "What is the procedure of opening the door in case of Emergency – Crash Land?", img: ["g15b.webp"], ref: "7-78" },
    { id: "g16", sec: "safety", no: "16", page: 4, q: "What are the conditions under which Cabin Crew may initiate an evacuation without awaiting the Commander's decision?", img: ["g16.webp"], ref: "5-9" },
    { id: "g17", sec: "safety", no: "17", page: 4, q: "What is the brace position for Cabin Crew in an Aft-Facing Seat?", img: ["g17.webp"], ref: "5-35" },
    { id: "g18", sec: "safety", no: "18", page: 4, q: "What is the Ditching Evacuation Command (without raft)?", img: ["g18.webp"], ref: "5-42" },
    { id: "g19a", sec: "safety", no: "19", fleet: "A", page: 4, q: "How to brief the 1st PSP in Thai?", img: ["g19a.webp"], ref: "5-45" },
    { id: "g19b", sec: "safety", no: "19", fleet: "B", page: 4, q: "How to brief the 1st PSP in Thai (Crash Land and Ditching for P4)?", img: ["g19b.webp"], ref: "7-119" },
    { id: "g20", sec: "safety", no: "20", page: 4, q: "What are Cabin Crew actions in case of Lavatory Fire (door is hot)?", img: ["g20.webp"], ref: "5-129" },

    { id: "f1", sec: "firstaid", no: "1", page: 5, q: "How to operate the POB with 01 outlet (Flow Selector Knob on side)?", img: ["f1-1.webp", "f1-2.webp"], ref: "3-31, 3-32" },
    { id: "f2", sec: "firstaid", no: "2", page: 5, q: "What are the signs of life?", img: ["f2.webp"], ref: "6-11" },
    { id: "f3", sec: "firstaid", no: "3", page: 5, q: "What are the contents of the SAMPLE Technique?", img: ["f3.webp"], ref: "6-8" },
    { id: "f4", sec: "firstaid", no: "4", page: 5, q: "What are Cabin Crew actions when performing D – Danger?", img: ["f4.webp"], ref: "6-20" },
    { id: "f5", sec: "firstaid", no: "5", page: 5, q: "How to open A – Airway for an infant?", img: ["f5.webp"], ref: "6-25" },
    { id: "f6", sec: "firstaid", no: "6", page: 5, q: "What are the signs and symptoms of Fainting?", img: ["f6.webp"], ref: "6-31" },
    { id: "f7", sec: "firstaid", no: "7", page: 6, q: "What is the management of Total Choking – Conscious Infant?", img: ["f7.webp"], ref: "6-37" },
    { id: "f8", sec: "firstaid", no: "8", page: 6, q: "What is the management of Cardiac Arrest?", img: ["f8.webp"], ref: "6-42" },
    { id: "f9", sec: "firstaid", no: "9", page: 6, q: "What is the management of Stroke (conscious)?", img: ["f9.webp"], ref: "6-43" },
    { id: "f10", sec: "firstaid", no: "10", page: 6, q: "What are the causes of Seizures in Children?", img: ["f10.webp"], ref: "6-46" },
    { id: "f11", sec: "firstaid", no: "11", page: 6, q: "What are the signs and symptoms of Abdominal Emergencies?", img: ["f11.webp"], ref: "6-47" },
    { id: "f12", sec: "firstaid", no: "12", page: 6, q: "What is the management of a Close Wound?", img: ["f12.webp"], ref: "6-60" },
    { id: "f13", sec: "firstaid", no: "13", page: 7, q: "What is the management of Bone and Joint Sprain?", img: ["f13.webp"], ref: "6-64" },
    { id: "f14", sec: "firstaid", no: "14", page: 7, q: "What is the management of Asthma?", img: ["f14.webp"], ref: "6-44" },
    { id: "f15", sec: "firstaid", no: "15", page: 7, q: "What are the signs and symptoms of Airsickness?", img: ["f15.webp"], ref: "6-66" },

    { id: "s1", sec: "security", no: "1", page: 7, q: "What shall Cabin Crew monitor when performing an Aircraft Security Search / Check?", img: ["s1.webp"], ref: "2-33" },
    { id: "s2", sec: "security", no: "2", page: 8, q: "How many life vests shall Cabin Crew randomly check while performing an aircraft security check or search (referred to the threat level of each station)?", img: ["s2.webp"], ref: "2-33",
      note: "Level 1–3: check 10 life vests · Level 4: Airbus 23 / Boeing 24 life vests" },
    { id: "s3", sec: "security", no: "3", page: 8, q: "What information must Cabin Crew give the Flight Crew when a hijacker is observed onboard?", img: ["s3.webp"], ref: "5-81" },
    { id: "s4", sec: "security", no: "4", page: 8, q: "What are the prohibited actions when Cabin Crew find a suspicious item (bomb) onboard?", img: ["s4.webp"], ref: "5-93" },
    { id: "s5", sec: "security", no: "5", page: 8, q: "What is the Cabin Crew response prior to departure during Level 1 Disruptive Behavior, including suspicious or verbally threatening behavior?", img: ["s5.webp"], ref: "5-73" }
  ],
  manual: "Cabin Crew Manual Iss.04 / Rev.03 (TR02)",
  pages: 8
};
