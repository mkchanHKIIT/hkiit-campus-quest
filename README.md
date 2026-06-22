# HKIIT Campus Quest 3D
<img width="1267" height="634" alt="圖片" src="https://github.com/user-attachments/assets/c79be625-0645-4a66-90d1-4c7080b771e8" />

A **TypeScript + Three.js** 3D promotional game for the **Hong Kong Institute of Information Technology (HKIIT)**. Explore six campus locations across Hong Kong and complete a **dedicated quiz question for each programme area** (ICT, DMET, and Foundation).

## Quick start

```bash
cd hkiit-campus-quest
npm install
npm run dev
```

Open the URL shown (usually `http://localhost:5173`).

### Production build

```bash
npm run build
npm run preview
```

## Controls

| Input | Action |
|-------|--------|
| **WASD** / **Arrow keys** | Move your student avatar |
| **E** | Start programme area challenge (when near a campus) |

## Navigation

- **Green arrow** on the ground points to the next campus with incomplete programme areas
- **HUD banner** shows campus name (English + Chinese), distance, and compass direction
- **Minimap** in the sidebar shows Victoria Harbour, districts, and all 6 campuses
- **Floating labels** above each building show campus name and district
- **Coloured paths** on the map lead from Central toward each campus

## Programme areas (16 questions)

Each area has one unique question tied to its curriculum and careers:

### ICT (9 areas)
| Code | Programme |
|------|-----------|
| IT114103 | Telecommunications & Networking |
| IT114105 | Software Engineering |
| IT114107 | Game Software Development |
| IT114115 | Cloud & Data Centre Administration |
| IT114118 | AI & Mobile Applications Development |
| IT114122 | Cybersecurity |
| IT114124 | AI & Smart Technology |
| IT114126 | Data Science & AI |
| IT114127 | Applied AI |

### DMET (5 areas)
| Code | Programme |
|------|-----------|
| IT114206 | Games & Animation |
| IT114214 | Digital Media Technology |
| IT114208 | Theme Park & Theatre Creative Technology |
| FS113394 | Esports Technology (DVE) |
| FS113395 | Drone & Entertainment Technology (DVE) |

### Foundation (2 areas)
| Code | Programme |
|------|-----------|
| FS113002N | DFS — Information Technology |
| FS113002S | DFS — Digital Media Studies |

## Campuses

| Campus | Location |
|--------|----------|
| **Tsing Yi HQ** | VTC Tsing Yi Complex, 20A Tsing Yi Road |
| **Chai Wan** | 30 Shing Tai Road |
| **Kwun Tong** | 25 Hiu Ming Street |
| **Lee Wai Lee** | 3 King Ling Road, Tseung Kwan O |
| **Sha Tin** | 21 Yuen Wo Road |
| **Tuen Mun** | 18 Tsing Wun Road |

## Win condition

Master **all 16 programme areas** by visiting campuses and answering each area’s question correctly. Programme areas only need to be completed once (even if offered at multiple campuses).

## Project structure

```
src/
  main.ts              Entry point
  types.ts             Shared types
  data/
    programmeAreas.ts  16 areas + questions
    campuses.ts        6 campuses + 3D positions
  game/
    Game3D.ts          Three.js world & logic
  ui/
    UIManager.ts       HUD, quiz modals, badges
  style.css
```

## Links

- [HKIIT Programmes](https://www.hkiit.edu.hk/our-programmes)
- [About HKIIT](https://www.hkiit.edu.hk/about-hkiit)
