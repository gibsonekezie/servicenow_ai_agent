# Lab Tutorial: Building a ServiceNow AI Agent using the ServiceNow SDK

Welcome to this step-by-step lab tutorial! In this hands-on guide, you will learn how to build, configure, and deploy an **AI Agent** on the ServiceNow platform using the official **ServiceNow SDK** (`@servicenow/sdk`) and TypeScript.

---

## 🎯 Objectives
By the end of this lab, you will understand:
1. The architecture of ServiceNow SDK applications (`@servicenow/sdk`).
2. How to define application schemas, custom tables, business logic, and security ACLs as code.
3. How to build custom tools (Subflows, Actions, or Script Includes) for AI Agents.
4. How to instantiate, configure, and deploy an **AI Agent** using metadata-as-code.
5. How to test and verify your AI Agent workflow on a ServiceNow instance.

---

## 🛠️ Prerequisites & Setup

### 1. Requirements
* **Node.js** (v18 or higher recommended)
* **npm** or **pnpm**
* **ServiceNow CLI / SDK** installed (`npm install -g @servicenow/cli`)
* Access to a **ServiceNow Developer Instance** (Vancouver / Washington / Zurich releases or newer) with **AI Agent Studio / Now Assist** enabled.

### 2. Initializing the Project
If you are building from scratch, initialize a new ServiceNow SDK workspace:
```bash
now-sdk init servicenow_ai_agent --scope x_snc_ai_agent
cd servicenow_ai_agent
npm install
```

---

## 📁 Repository & Codebase Structure

A standard ServiceNow SDK workspace follows this structure:

```text
servicenow_ai_agent/
├── now.config.json           # ServiceNow CLI deployment & scope configuration
├── package.json              # Project dependencies (@servicenow/sdk, typescript)
├── tsconfig.json             # TypeScript compiler settings
└── src/
    ├── server/
    │   ├── tables/
    │   │   └── ai_agent_task.ts   # Custom table definitions for the agent
    │   ├── tools/
    │   │   └── updateTaskStatus.ts# Custom tool / subflow exposed to the AI Agent
    │   └── agents/
    │       └── serviceAgent.ts    # Main AI Agent metadata & prompt definition
    └── security/
        └── acl.ts                 # Access control rules for the agent & tables
```

---

## 🔬 Step-by-Step Codebase Walkthrough

### Step 1: Define Custom Data Schema (`src/server/tables/ai_agent_task.ts`)
We begin by defining the target data structure using Fluent TS definitions from `@servicenow/sdk/core`.

```typescript
import { Table, StringColumn, ChoiceColumn, ReferenceColumn } from '@servicenow/sdk/core';

export const x_snc_ai_agent_task = Table({
  name: 'x_snc_ai_agent_task',
  label: 'AI Agent Task',
  schema: {
    short_description: StringColumn({ label: 'Short Description', maxLength: 160, mandatory: true }),
    description: StringColumn({ label: 'Description', maxLength: 4000 }),
    status: ChoiceColumn({
      label: 'Status',
      choices: {
        new: { label: 'New' },
        in_progress: { label: 'In Progress' },
        resolved: { label: 'Resolved' },
        closed: { label: 'Closed' }
      },
      defaultValue: 'new'
    }),
    assigned_to: ReferenceColumn({
      label: 'Assigned To',
      referenceTable: 'sys_user'
    })
  }
});
```

---

### Step 2: Implement AI Agent Tools (`src/server/tools/updateTaskStatus.ts`)
AI Agents need **Tools** (CRUD operations, Subflows, or Server Scripts) to interact with platform data and execute operations. Here, we define a tool that updates the task status.

```typescript
import { ScriptInclude } from '@servicenow/sdk/core';

export const AgentToolUtils = ScriptInclude({
  name: 'AgentToolUtils',
  script: (inputs, outputs) => {
    return {
      updateTaskStatus: function (taskId: string, newStatus: string): boolean {
        var gr = new GlideRecord('x_snc_ai_agent_task');
        if (gr.get(taskId)) {
          gr.setValue('status', newStatus);
          gr.update();
          return true;
        }
        return false;
      }
    };
  }
});
```

---

### Step 3: Define Security & ACL Access (`src/security/acl.ts`)
To adhere to enterprise security and Zero Trust rules, explicitly define access rights for the AI Agent execution context:

```typescript
import { AccessRule } from '@servicenow/sdk/core';

export const TaskTableACL = AccessRule({
  name: 'x_snc_ai_agent_task_write',
  type: 'record',
  operation: 'write',
  table: 'x_snc_ai_agent_task',
  securityAttribute: 'user_is_authenticated'
});
```

---

### Step 4: Construct the AI Agent Metadata (`src/server/agents/serviceAgent.ts`)
Now, bring the schema, tools, and instructions together into an **AI Agent definition** using `@servicenow/sdk/ai`.

```typescript
import { AIAgent } from '@servicenow/sdk/ai';

export const IncidentResolutionAgent = AIAgent({
  name: 'IncidentResolutionAgent',
  label: 'Incident & Task Resolution Agent',
  description: 'Autonomous AI agent that triages incoming tickets, checks context, and executes task status updates.',
  
  // Execution security context
  authMode: 'DynamicUser', // Runs with the context of the interacting user
  
  // High-level system persona and instructions
  instructions: `
    You are an intelligent IT Service Management Assistant.
    Your objective is to:
    1. Read task descriptions carefully.
    2. Assess whether all required information is provided.
    3. Use the 'AgentToolUtils.updateTaskStatus' tool to move tasks to 'In Progress' or 'Resolved' based on context.
    4. Provide a succinct summary of actions taken back to the user.
  `,

  // Connect tools available to this agent
  tools: [
    {
      name: 'updateTaskStatus',
      type: 'script_include',
      reference: 'AgentToolUtils.updateTaskStatus',
      description: 'Updates the status field on a given x_snc_ai_agent_task record.'
    }
  ],

  // Execution behavior: Supervised asks for approval; Autonomous runs automatically
  executionMode: 'Supervised'
});
```

---

## 🚀 Build and Deployment

### 1. Validate and Build TypeScript Code
Run the SDK build command to transpile TypeScript definitions into validated ServiceNow XML/JSON metadata artifacts:

```bash
now-sdk build
```

### 2. Deploy to ServiceNow Instance
Authenticate to your target ServiceNow instance alias and install the scoped application:

```bash
# Add instance alias (if not already configured)
now-sdk auth --alias dev_instance --url https://your-instance.service-now.com --username admin

# Install application to instance
now-sdk install --alias dev_instance
```

---

## 🧪 Verification and Testing

1. Log into your **ServiceNow Instance**.
2. Navigate to **All > AI Agent Studio > AI Agents**.
3. Locate **Incident & Task Resolution Agent** (`IncidentResolutionAgent`).
4. Click **Test Agent** or open the **Now Assist Panel**.
5. Input a prompt:  
   > *"I have a task record with ID `SYS_ID_HERE`. Please update its status to In Progress and summarize what you did."*
6. Verify that the agent calls `AgentToolUtils.updateTaskStatus` and updates the record accordingly in the `x_snc_ai_agent_task` table.

---

## 💡 Best Practices Summary
* **Grounding & Scope:** Keep agent tools limited to the minimum set of permissions necessary (Least Privilege Principle).
* **Execution Mode:** Use `Supervised` mode during development and initial deployment before transitioning high-confidence workflows to `Autonomous`.
* **SDK Feedback Loop:** Leverage `now-sdk build` locally to catch type errors, missing properties, or invalid references before deploying to the platform.