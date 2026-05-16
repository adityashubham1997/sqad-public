---
fragment: cloud/ansible
description: Ansible configuration management patterns and best practices
load_when: "cloud.iac includes ansible"
token_estimate: 600
---

# Ansible Configuration Management

## Project Structure

```
ansible/
├── inventories/
│   ├── production/
│   │   ├── hosts.yml
│   │   └── group_vars/
│   └── staging/
│       ├── hosts.yml
│       └── group_vars/
├── roles/
│   └── webserver/
│       ├── tasks/main.yml
│       ├── handlers/main.yml
│       ├── templates/
│       ├── files/
│       ├── vars/main.yml
│       └── defaults/main.yml
├── playbooks/
├── ansible.cfg
└── requirements.yml          # Galaxy roles/collections
```

## Best Practices

| Pattern | Preferred | Avoid |
|---|---|---|
| **Variables** | `group_vars/`, `host_vars/`, defaults in roles | Hardcoded values in tasks |
| **Secrets** | Ansible Vault, external secrets manager | Plain text passwords in vars |
| **Idempotency** | Declarative modules (`copy`, `template`, `apt`) | `command`/`shell` without `creates`/`removes` |
| **Handlers** | Notify handlers for service restarts | Restart in task (runs every time) |
| **Tags** | Tag tasks for selective execution | Running entire playbook for one change |
| **Testing** | Molecule + Testinfra, `--check` mode | No testing on roles |
| **Inventory** | Dynamic inventory (AWS, Azure, GCP plugins) | Static inventory for cloud hosts |

## Review Checks

| ID | Check | Severity |
|---|---|---|
| ANS-1 | **Plaintext secrets** — passwords/keys not encrypted with Vault | CRITICAL |
| ANS-2 | **Non-idempotent tasks** — `command`/`shell` without `changed_when`/`creates` | MAJOR |
| ANS-3 | **Hardcoded hosts** — IP addresses instead of inventory groups | MAJOR |
| ANS-4 | **No handlers** — services restarted inline instead of via handlers | MINOR |
| ANS-5 | **Missing `become`** — privileged operations without explicit escalation | MAJOR |
| ANS-6 | **No tags** — tasks not tagged for selective execution | MINOR |
