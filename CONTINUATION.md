# Dunnett Companion — Continuation Document

## Project Overview
A birthday gift for Jan Fergus (83rd birthday, April 5, 2026) from Mike Wolf & Claude. A Dorothy Dunnett "House of Niccolò" companion website.

**Live URL**: https://dunnett.netlify.app
**GitHub**: https://github.com/eldrgeek/dunnett-companion
**Netlify Site ID**: 275a7bd9-9b12-4b9c-a372-bd7b5b1a723e
**Local path**: ~/Projects/dunnett-companion
**Netlify linked**: yes (deploy with `netlify deploy --prod --dir=.`)

## Who is Jan
Jan Fergus. PhD in English Literature (Lehigh University, retired). Lives in Montreal/Westmount. Mike's "not-girlfriend" — they reconnected in August 2024 after 66 years apart (first love in high school, one kiss, Mike ghosted because he was overwhelmed). She leads a weekly Zoom book group reading the House of Niccolò series. She is a serious, perceptive reader.

## Architecture
Pure static HTML/CSS/JS site. No build step, no npm. Deploy is just `netlify deploy --prod --dir=.`

**Edge function**: `netlify/edge-functions/ask-claude.ts` proxies API calls to Anthropic, injecting the API key from Netlify env var `ANTHROPIC_API_KEY` (set as secret, production context).

**Current API key**: Set via `netlify env:set ANTHROPIC_API_KEY "sk-ant-api03-ftAkf1..." --secret --context production`

## Pages

### index.html — The Gift Box
- Three-scene experience: gift box → song → feature reveal → enter site
- Burgundy & gold Renaissance luxury theme
- Gift tag: "To Jan, with love, from Mike & Claude"
- Birthday song (birthday-song.mp3) auto-plays when box opens
- Feature cards link to all subpages
- "Enter the House of Niccolò" button → site.html

### site.html — Interactive Map
- Leaflet.js with CARTO light tiles (no API key needed)
- 50+ locations across all 8 books with color-coded markers
- Popups with book tags, location descriptions
- Sidebar with book filters (checkboxes)
- **Animated journeys**: click "Animate" per book, map zooms segment-by-segment following Nicholas's route
- Journey animation uses flyToBounds per segment with adaptive zoom levels

### timeline.html — Timeline
- 35+ events from 1459–1503
- Alternating left/right cards on a central vertical line
- Year markers as gold-bordered badges
- Book filter pills at top
- Historical context notes (🏛️) on relevant events
- Color-coded book tags per event

### characters.html — Characters
- 25+ characters in 4 groups: Inner Circle, Enemies, Women, Historical Figures
- Card grid layout
- Aliases, descriptions, book appearances, relationship notes
- Historical figures tagged

### ask.html — Ask Elspeth
- AI chat powered by Claude Sonnet via Netlify edge function
- **Name entry flow**: user enters first name before chat begins
  - If "Jan" → special birthday greeting, Elspeth knows the love story
  - Anyone else → welcomed as book group member
  - Input bar hidden until Elspeth responds to greeting
- **Elspeth persona**: Named after Elspeth Morrison (Dunnett Companion author). Has read the series 9 times. Has opinions (Julius is an idiot, Scales of Gold is underrated). Speaks like a friend over wine, not a reference book. Knows the Mike/Jan love story. Strict spoiler discipline.
- Auto-resizing textarea, 20px base font, A+/A- font controls
- System prompt is ~2000 words, embedded in ask.html JS

## Design System
- **Colors**: burgundy (#6B1D2A, #4A0E1C, #8B2D3A), gold (#C9A84C, #E8D48B), cream (#FDF8F0, #F0E6D3), ink (#2A1A1A, #5A3A3A)
- **Fonts**: Playfair Display (headings), Cormorant Garamond (UI/nav), EB Garamond (body) — all Google Fonts
- **Book colors**: 1-#8B2D3A, 2-#C9A84C, 3-#2D6B4A, 4-#B87333, 5-#4A5899, 6-#6B8E9B, 7-#7B4B94, 8-#A0522D

## Deploy Workflow
```bash
cd ~/Projects/dunnett-companion
# edit files
git add . && git commit -m "message" && git push origin master
netlify deploy --prod --dir=.
```

## Known Issues / TODO
- **Book Group Hub** and **Historical Context** pages are "Coming Soon" on the feature reveal — not yet built
- The song lyrics in the gift box reference "every Wednesday" but the group meets on **Thursdays** — worth updating if the lyric is audible
- Timeline events are based on research, not page-by-page verification — Jan's group may have corrections
- Character descriptions avoid major spoilers but some late-series info is present
- No analytics or visitor tracking (intentional — it's a gift)

## Recent Changes (April 2026)
- **Security**: System prompt moved server-side (edge function); no longer exposed in client JS
- **Model**: Switched from claude-sonnet-4-20250514 to claude-haiku-4-5-20251001 (faster + cheaper)
- **Web search**: Added web_search_20250305 tool to Elspeth — she can look up historical facts
- **ask.html**: Fixed input bar (was <input>, now proper <textarea> with auto-resize)
- **ask.html**: Fixed duplicate placeholder text bug
- **ask.html**: Added "Not you? Reset" link so users can change their name
- **ask.html**: Removed client-side SYSTEM constant (now only lives in edge function)
- **ask.html**: Fixed "Claude is thinking" → "Elspeth is thinking"
- **styles.css**: Created shared stylesheet — :root vars, nav, header, footer no longer duplicated
- **All pages**: Added OG/meta tags for proper social sharing previews
- **site.html**: Mobile sidebar toggle now a labeled pill button ("Books & Filters") instead of bare emoji
- **CORS**: Added proper Access-Control headers to edge function responses
- **Members**: Added Tina, Pat, Linda profiles to Elspeth system prompt; group confirmed as Thursdays, currently Book 7 (Caprice and Rondo)

## The Song
"The Book Group Birthday" — rendered via Suno AI. MP3 at birthday-song.mp3 (~4MB). Renaissance folk ballad style with lute and recorder. Chorus: "Happy birthday, Jan / From the dyer's boy and a digital mind / From a man in Denver who still can't find / The difference between who and whom / But he built you a present / He built you a room / Where Niccolò lives / And the maps all bloom"

## MCP Bridge Notes
- cc-bridge-mcp (shell_exec / claude_code) was used for all file operations
- Bridge tends to drop intermittently — shell_exec is more reliable than claude_code for large tasks
- Python heredoc via shell_exec is the most reliable way to write large files
- Claude Code times out (300s) on large file generation tasks — break into smaller pieces
- GitHub push was blocked once by secrets scanning (hardcoded API key) — now uses Netlify env var

## Elspeth System Prompt Location
The system prompt now lives **server-side only** in `netlify/edge-functions/ask-claude.ts` as `const SYSTEM_PROMPT = \`...\`;`. It is NOT in ask.html anymore. This prevents users from reading or overriding it via the browser console. Key sections: Who you are, The story behind you (Mike/Jan love story), Your knowledge of the books, Spoiler discipline (critical — check book number before answering), How you respond, Community awareness (Jan vs book group members), Web search guidance.
