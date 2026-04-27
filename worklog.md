---
Task ID: 1
Agent: Main Agent
Task: Improve Hermes Agent section in PuspaCare with Retail Agent Dashboard design

Work Log:
- Read existing Hermes components (hermes-panel, hermes-message, hermes-fab, hermes-chat-header, hermes-settings, hermes-store)
- Read hermes-store.ts, advanced-tools.ts, types.ts, quick-actions.ts
- Updated hermes-store.ts with new execution trace types (AgentStep, AgentStepStatus, HermesViewMode)
- Added addStep/updateStep/clearSteps/finalizeSteps methods to store
- Added activeSteps state for real-time execution tracing
- Added viewMode (panel/fullscreen) for dual-mode display
- Created execution-trace.tsx - ExecutionTrace component with Framer Motion animations, step status indicators, relative timestamps, tool name badges
- Created hermes-message-v2.tsx - Redesigned messages with Zinc/Black/Emerald design system (user=black bg, assistant=zinc-50 bg), client action buttons, copy on hover
- Created hermes-chat-input.tsx - Auto-resize textarea, black send button, provider/model/tools status bar, Stripe/Linear style
- Created hermes-dashboard.tsx - Full-page dashboard with sidebar nav, execution trace panel (right), chat (left), panel mode (floating), quick actions
- Updated hermes-fab.tsx - Rounded corners, cleaner design
- Updated hermes-settings.tsx - Zinc/Black design system, rounded-xl elements, uppercase labels
- Updated page.tsx - Replaced HermesPanel with HermesDashboard
- Verified all new files compile without TypeScript errors
- Verified dev server running and page loads (200)

Stage Summary:
- Hermes Agent completely redesigned with Retail Agent Dashboard style
- Two view modes: Panel (floating) and Fullscreen (with sidebar + trace + chat)
- Execution Trace shows real-time AI processing steps (Planning → Tool Call → Success)
- Design system: Zinc/Black/Emerald (Stripe/Linear inspired), rounded-3xl, no indigo/blue
- All components use Framer Motion for smooth animations
- Chat input with auto-resize, keyboard shortcuts, status bar
- Quick actions available in both panel and fullscreen modes
- Provider settings redesigned with black primary buttons
