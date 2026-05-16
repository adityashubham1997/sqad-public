---
rubric: generative-ai
description: Generative AI and agentic workflow review checks
load_when: "stack.frameworks includes langchain OR stack.frameworks includes llamaindex OR stack.frameworks includes openai OR stack.frameworks includes anthropic OR stack.frameworks includes crewai OR stack.frameworks includes autogen"
---

# Generative AI Review Rubric

| ID | Check | Rule | Severity if Failed |
|---|---|---|---|
| GAI-1 | **Exposed API key** | LLM API key hardcoded or committed to source → fail | CRITICAL |
| GAI-2 | **No prompt injection defense** | User input passed directly to LLM without sanitization or guardrails → fail | CRITICAL |
| GAI-3 | **No LLM observability** | LLM calls without tracing/logging (LangSmith, Langfuse, etc.) → fail | MAJOR |
| GAI-4 | **No evaluation pipeline** | AI feature shipped without automated eval (correctness, faithfulness) → fail | MAJOR |
| GAI-5 | **Hardcoded prompts** | Prompt text inline in code without versioning or template management → fail | MAJOR |
| GAI-6 | **No retry/backoff** | LLM API call without retry logic for rate limits and transient errors → fail | MAJOR |
| GAI-7 | **No cost controls** | Missing token budget, model fallback, or usage monitoring → fail | MAJOR |
| GAI-8 | **No guardrails** | LLM output returned to user without content filtering or validation → fail | MAJOR |
| GAI-9 | **Synchronous LLM** | Blocking LLM call in request handler without streaming or async → fail | MINOR |
| GAI-10 | **Context stuffing** | Full documents stuffed into context instead of RAG retrieval → fail | MINOR |
