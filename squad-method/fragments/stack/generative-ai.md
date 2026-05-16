---
fragment: stack/generative-ai
description: Generative AI and agentic workflow patterns, LLM integration, prompt engineering
load_when: "stack.frameworks includes langchain OR stack.frameworks includes llamaindex OR stack.frameworks includes openai OR stack.frameworks includes anthropic OR stack.frameworks includes crewai OR stack.frameworks includes autogen"
token_estimate: 400
---

# Generative AI & Agentic Workflows Stack Context

## Core Patterns

| Pattern | Preferred | Avoid |
|---|---|---|
| LLM integration | SDK-based (OpenAI, Anthropic, Vertex AI) | Raw HTTP without retry/backoff |
| Orchestration | LangChain, LlamaIndex, CrewAI, AutoGen | Monolithic prompt chains |
| Prompt mgmt | Versioned prompt templates, few-shot | Hardcoded prompts in code |
| Embeddings | Dedicated vector DB (Pinecone, Chroma, Weaviate, pgvector) | Recomputing embeddings per request |
| RAG | Chunking + embedding + retrieval + generation pipeline | Stuffing entire documents into context |
| Agents | Tool-calling with structured outputs | Free-form text parsing for actions |
| Eval | Automated evals (DeepEval, Ragas, custom) | Manual "looks good" testing |
| Observability | LangSmith, Langfuse, Arize, Helicone | No tracing on LLM calls |
| Caching | Semantic cache (GPTCache) or exact-match cache | No caching on repeated queries |
| Guardrails | NeMo Guardrails, Guardrails AI, custom validators | Raw LLM output to users |

## Agentic Architecture Patterns

### Tool-Calling Agent

```python
from openai import OpenAI

tools = [
    {
        "type": "function",
        "function": {
            "name": "search_codebase",
            "description": "Search the codebase for a pattern or file",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Search query"},
                    "file_type": {"type": "string", "description": "File extension filter"},
                },
                "required": ["query"],
            },
        },
    }
]

response = client.chat.completions.create(
    model="gpt-4o",
    messages=messages,
    tools=tools,
    tool_choice="auto",
)
```

### Multi-Agent Workflow (CrewAI Pattern)

```python
from crewai import Agent, Task, Crew

researcher = Agent(
    role="Research Analyst",
    goal="Find and analyze relevant information",
    backstory="Expert at finding patterns in data",
    tools=[search_tool, web_tool],
    llm=llm,
)

writer = Agent(
    role="Technical Writer",
    goal="Create clear documentation from research findings",
    backstory="Specialist in technical communication",
    llm=llm,
)

crew = Crew(
    agents=[researcher, writer],
    tasks=[research_task, write_task],
    process=Process.sequential,  # or Process.hierarchical
)
result = crew.kickoff()
```

### RAG Pipeline

```python
# 1. Document loading & chunking
from langchain.text_splitter import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
chunks = splitter.split_documents(documents)

# 2. Embedding & vector store
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings

vectorstore = Chroma.from_documents(chunks, OpenAIEmbeddings())

# 3. Retrieval-augmented generation
retriever = vectorstore.as_retriever(search_kwargs={"k": 5})
qa_chain = RetrievalQA.from_chain_type(llm=llm, retriever=retriever)
answer = qa_chain.invoke({"query": user_question})
```

## Prompt Engineering Best Practices

- **System prompts**: Define role, constraints, output format
- **Few-shot examples**: Include 2-3 representative examples
- **Chain-of-thought**: "Let's think step by step" for reasoning tasks
- **Structured output**: JSON mode or function calling for parseable results
- **Prompt versioning**: Track prompt changes like code changes
- **Temperature tuning**: Low (0-0.3) for factual, higher (0.7-1.0) for creative

## Evaluation & Testing

| Eval Type | Tools | What It Tests |
|---|---|---|
| **Retrieval quality** | Ragas (context_precision, context_recall) | RAG retriever effectiveness |
| **Generation quality** | DeepEval, custom rubrics | Answer correctness, faithfulness |
| **Agent behavior** | Trajectory eval, tool-call accuracy | Agent decision quality |
| **Hallucination** | Groundedness checks, citation verification | Factual accuracy |
| **Latency/Cost** | LangSmith traces, Helicone logs | Performance budgets |

## Security & Safety

- Never expose API keys — use environment variables or secret managers
- Implement rate limiting on LLM-powered endpoints
- Validate and sanitize user inputs before LLM calls (prompt injection defense)
- Use guardrails to filter harmful/off-topic outputs
- Log all LLM interactions for audit trail
- Implement cost controls (token budgets, model fallback)
- PII detection and redaction before sending to external LLMs

## Cost Optimization

- Use smaller models for classification/routing, larger for generation
- Cache repeated queries (semantic or exact-match)
- Batch API calls where possible
- Use streaming for user-facing responses (perceived latency)
- Monitor token usage per feature/endpoint
- Evaluate open-source models (Llama, Mistral) for suitable tasks

## Anti-Patterns to Flag

- No observability on LLM calls (can't debug or optimize)
- Hardcoded prompts without versioning
- No evaluation pipeline (shipping untested AI features)
- Stuffing full documents into context instead of RAG
- Missing retry/backoff on API calls (rate limits, transient errors)
- No guardrails on user-facing LLM outputs
- Synchronous LLM calls blocking request handlers
- No cost monitoring (surprise bills)
