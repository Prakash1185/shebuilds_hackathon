# SheCan — Project Documentation (Code Blooded)

## 1. Project Overview

| Field | Details |
| --- | --- |
| Project name | SheCan |
| Team name | Code Blooded |
| Track / theme | Women Empowerment / Hackathon |
| One-line pitch | An AI-powered platform helping women build, grow, and scale their businesses. |
| Repository link | https://github.com/codeblooded/shecan |
| Live demo link | https://shecan.vercel.app |
| Demo video link | https://youtube.com/watch?v=demo |
| Presentation / slides | https://docs.google.com/presentation/d/demo |

## 2. Team Members and Roles

| Name | Role | Responsibilities | Contact |
| --- | --- | --- | --- |
| Prakash Kumar | Team Lead | Planning, coordination, backend | prakash@codeblooded.dev |
| Ankit Jha | Developer | Frontend, integrations | ankit@codeblooded.dev |
| Anisha Kashyap | Designer | UI/UX, branding | anisha@codeblooded.dev |

## 3. Problem Statement

- **The problem:** Women entrepreneurs lack accessible tools to build online stores, learn business skills, and connect with investors.
- **Who is affected:** Women entrepreneurs, especially first-time founders.
- **Why it matters:** Empowering women economically drives community growth.
- **Existing solutions and their gaps:** Fragmented tools; no single AI-assisted platform.

## 4. Proposed Solution

- **Overview:** SheCan combines store building, learning, community, and funding in one AI-powered platform.
- **Unique value:** Gemini AI + Cloudinary image uploads + MongoDB, all in one dashboard.
- **Key features:**
    - AI design generator
    - Store builder with product image uploads
    - Learning hub & AI mentor
    - Community & partner matching
    - Growth & funding tracker
- **Out of scope (for now):** Payments, native mobile app.

## 5. Tech Stack and Architecture

| Layer | Technology | Why we chose it |
| --- | --- | --- |
| Frontend | Next.js 16 | Fast, modern, App Router |
| Backend | Next.js API routes | Simple, co-located |
| Database | MongoDB | Flexible schema |
| APIs / Services | Gemini, Cloudinary | AI + media |
| Hosting / Deployment | Vercel | Easy deploy |
| Tools | GitHub, Figma | Collaboration |

**Architecture overview:** Next.js frontend talks to API routes; Gemini for AI, Cloudinary for images, MongoDB for data.

**Data flow:** User action -> API route -> service (Gemini/Cloudinary/Mongo) -> response.

## 6. Feature Tracker

| Feature | Owner | Priority | Status | Notes |
| --- | --- | --- | --- | --- |
| Store builder | Prakash Kumar | High | Done | Cloudinary uploads |
| AI design generator | Ankit Jha | High | Done | Gemini fallback |
| Learning hub | Anisha Kashyap | Medium | Done | Static courses |
| Community | Ankit Jha | Medium | Done | Partner matching |
| Funding tracker | Prakash Kumar | Medium | Done | Mock data |

## 7. 15-Day Progress Tracker

| Day | Date | Focus for the day | Status |
| --- | --- | --- | --- |
| Day 1 | 2026-10-19 | Team formation & brainstorming | Done |
| Day 2 | 2026-10-20 | Problem validation & research | Done |
| Day 3 | 2026-10-21 | Scope, wireframes & plan | Done |
| Day 4 | 2026-10-22 | Project setup & base architecture | Done |
| Day 5 | 2026-10-23 | Core features | Done |
| Day 6 | 2026-10-24 | Integrations (Cloudinary, Gemini) | Done |
| Day 7 | 2026-10-25 | Implementation & final submission | Done |

## 8. Daily Log

### Day 1
- **Goals:** Team formation and brainstorming
- **Completed:** Roles assigned
- **Blockers:** None
- **Learnings:** Aligned on vision
- **Plan:** Research

... (all days completed) ...

## 9. Challenges and Solutions

| Challenge | Day faced | How we solved it | Lesson learned |
| --- | --- | --- | --- |
| No Gemini key | Day 9 | Added dummy fallback | Graceful degradation |
| Unconfigured image host | Day 12 | Updated next.config | Configure hosts early |

## 10. Testing and Setup Notes

- **How to run:**
    1. Clone repo
    2. `npm install`
    3. Configure `.env`
    4. `npm run dev`
- **Testing approach:** Manual + typecheck
- **Known issues:** None major
- **Test accounts:** demo@shecan.dev / demo123

## 11. Final Submission Checklist

- [x] Project name, pitch, team details
- [x] Problem & solution explained
- [x] Repository public with README
- [x] No secrets in code
- [x] Live demo works
- [x] Demo video recorded
- [x] Pitch ready
- [x] Daily log updated
- [x] Screenshots added
- [x] Notion shared
- [x] Submitted before deadline

## 12. Screenshots and Demo Media

![Home](./public/screenshots/home.png)
![Dashboard](./public/screenshots/dashboard.png)

## 13. Future Scope

- Payments integration
- Mobile app
- More AI features

## 14. Resources and References

| Resource | Link | Used for |
| --- | --- | --- |
| Next.js docs | https://nextjs.org/docs | Framework |
| Cloudinary docs | https://cloudinary.com/docs | Image uploads |
| Gemini docs | https://ai.google.dev | AI |

## 15. Acknowledgments

Thanks to organizers, mentors, and open-source community.

---

*Built during Hacktober Hack Days by Code Blooded.*
