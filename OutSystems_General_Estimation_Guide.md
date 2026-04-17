# OutSystems General Estimation Guide

This guide provides a baseline for estimating common OutSystems development tasks. These figures represent the effort required for implementation, unit testing, and basic documentation.

## 1. Feature Estimation Benchmarks

| Category | Task | Complexity | Effort (Hrs) | Description/Considerations |
| :--- | :--- | :--- | :--- | :--- |
| **Data Modeling** | New Entity | Low | 0.5 - 1 | Basic attributes + standard indexes. |
| | Complex Entity Change | Med | 2 - 4 | Adding attributes to large entities (impacts publish time). |
| | Static Entity | Low | 0.5 | Used for dropdowns/enums. |
| **UI Development** | Standard CRUD Screen | Low | 2 - 4 | Scaffolding List/Detail screens. |
| | Custom Dashboard | High | 8 - 16 | Charts, multiple aggregates, complex filters. |
| | Reusable Block | Med | 4 - 6 | Input parameters, events, local state management. |
| **Business Logic** | Simple Server Action | Low | 1 - 2 | Basic validation and single CRUD operation. |
| | Complex Logic Action | High | 8 - 24 | Multiple external calls, error handling, mapping. |
| | Timer (Background Job) | Med | 4 - 8 | Batch processing with "Check Timeout" logic. |
| **Integrations** | Consume REST API | Med | 4 - 8 | JSON mapping, auth, and wrapper actions. |
| | Expose REST API | Med | 4 - 6 | Security, documentation (Swagger), and logic. |
| **Workflows (BPT)** | Simple Activity | Med | 6 - 10 | Sequential flow with 1-2 participants. |
| | Complex Process | High | 24 - 40+ | Parallel paths, conditional starts, SLA triggers. |
| **Security/Misc** | RBAC Implementation | Med | 4 - 8 | Defining roles and wrapping logic in CheckRole. |
| | Email Notification | Low | 2 - 4 | Template design and trigger logic. |

---

## 2. The "OutSystems Multiplier" (Estimation Factors)

Apply these multipliers to the base numbers to account for environment-specific complexity:

1.  **Legacy Data (+20%)**: For external SQL databases with inconsistent naming or types.
2.  **Mobile Offline (+50%)**: Developing offline-first requires complex data sync logic.
3.  **Custom UI/UX (+30%)**: For "Pixel Perfect" CSS that deviates from OutSystems UI defaults.
4.  **Large-Scale Environment (+10%)**: Accounts for longer "One-Click Publish" times in complex infrastructures.

---

## 3. Quick Sizing Rule of Thumb

*   **Small Feature (< 8 hrs)**: Single screen, simple logic change, or minor bug fix.
*   **Medium Feature (16 - 24 hrs)**: Integrated module with independent data, UI, and logic.
*   **Large Feature (40+ hrs)**: Entire sub-systems (e.g., a new Approvals Engine or Integration Hub).

---

## 4. Best Practices for Accurate Estimation

*   **Prototype First**: For high-risk integrations, spend 2-4 hours on a POC before committing to a final estimate.
*   **Buffer for Refactoring**: Always include a 10-15% "Refactoring Buffer" for architectural adjustments during development.
*   **Define 'Done'**: Ensure the estimate includes Unit Testing and Peer Review time.
