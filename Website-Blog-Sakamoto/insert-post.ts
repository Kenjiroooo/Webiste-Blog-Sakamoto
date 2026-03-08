import db from './src/db.js';

const title = 'SYNERGY: Bridging AI, Startups, and Secure Governance';
const slug = 'synergy-bridging-ai-startups-secure-governance';
const content = `Ready to bridge the gap between AI, Startups, and Secure Governance?

The future isn't just coming; it's being coded, scaled, and secured right now. Join us for SYNERGY, a high-impact 3-day webinar series designed for innovators, developers, and visionaries. 

**Dates:** March 4–6, 2026  
**Time:** 8:00 AM – 12:00 PM  
**Format:** Live via Zoom (Registration is FREE!)  
**Register:** [https://badgermint.app](https://badgermint.app)

*Organized by UPICT Association Inc.*

## The Game Plan

### Day 1: Scaling at the Speed of Thought
*Focus: Industrial AI Agents and the Vibe Coding Revolution*

* **The Future Work: Exploiting the Vibe Coding Revolution** - *Joshua Bascos (Senior System Developer)*
* **From Prompt to Production: Mastering Agentic AI** - *Warly Dela Cruz (Senior Data Engineer)*

### Day 2: The Lean Architect
*Focus: Design Thinking and Scalable Solo-Founding*

* **Design Thinking for Disruptors: Building Products People Actually Want** - *Nestor Feland Panopio (COO, IAM Contact Solutions)*
* **Solo but Scalable: Architecting a One-Person Tech Powerhouse** - *Ed Casulla (CEO/CTO, Aeonsprint Solutions Inc.)*

### Day 3: Fortifying E-Governance
*Focus: Blockchain and Zero Trust Security*

* **The Decentralized State: Redefining Public Trust through Blockchain-Enabled Identity** - *Tzar Umang (COO/CTO, Makerspace Innovhub)*
* **Implementing Zero Trust and Decentralized Identity for Secure E-Governance** - *Christian Idia (CEO, Digiforce IT Services)*

## Why Attend?
Whether you're a solo founder looking to build a "one-person powerhouse" or a tech professional navigating the world of Agentic AI and Blockchain, this series provides the blueprint for the next era of technology. Secure your spot now!`;

const author = 'UPICT Association Inc.';
const category = 'AI & ML';
const tags = 'ai, startups, cybersecurity, blockchain, web3, governance';
const featuredImage = 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1000'; // placeholder tech image
const status = 'Published';

const insertPost = db.prepare(`
  INSERT INTO posts (title, slug, content, author, category, tags, featuredImage, status)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

try {
    insertPost.run(title, slug, content, author, category, tags, featuredImage, status);
    console.log("Post inserted successfully!");
} catch (e) {
    console.error("Error inserting post:", e);
}
