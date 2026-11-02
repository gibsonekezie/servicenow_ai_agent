# Lab Tutorial: Building a ServiceNow AI Agent using the ServiceNow SDK

Welcome to this step-by-step lab tutorial! In this hands-on guide, you will learn how to build, configure, and deploy an **AI Agent** on the ServiceNow platform using the official **ServiceNow SDK** (`@servicenow/sdk`) and TypeScript.

---

## 🎯 Objectives
By the end of this lab, you will understand:
1. The architecture of ServiceNow SDK applications (`@servicenow/sdk`).
2. How to define agent tools and security ACLs as code.
3. How to instantiate, configure, and deploy an **AI Agent** using servicenow sdk.
4. How to test and verify your AI Agent workflow on a ServiceNow instance.

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
    ├── fluent/
    │    └── agent.now.ts     # Custom table definitions for the agent 
    │    
    └── server/
        └── script.ts         # Glide logic definition
```

---

## 🔬 Step-by-Step  Walkthrough
I split the code into four sections to reiterate points stated in the previous post

### Step 1: Define AI Agent(`src/fluent/agent,now.ts`)
We begin by defining the AI agent using Fluent TS definitions from `@servicenow/sdk/core`. The $id variable creates a human readable identifier for AI agent and following that are definitions for agent structure(name, description and agentRole ). Remember this three fields needs to be unique and explicit.


```typescript
import { AiAgent } from "@servicenow/sdk/core";

export const aclIncidentFixerAgent = AiAgent({
    $id: Now.ID["acl_incident_fixer_agent"],               
    name: "ACL Incident Fixer Agent",                       
    description: "Retrieves incident details, confirms incidents is related to ACL and searches for resolution guidance.",
    agentRole: "You are a specialist at ACL incidents resolution",
    
    //...rest of the code
})
```

---

### Step 2: Implement Security ACL (`src/fluent/agent,now.ts`)
Security ACL is required for AI Agents definitions. The security ACL defines who can invoke the ai agent. the $id gets assigned to the generated security ACl on servicenow instance. The specific role type ensures that only users with the listed roles can invoke the agent. 

```typescript
    securityAcl: {
        $id: Now.ID['acl_incident_fixer_agent_acl'],
        type: 'Specific role',
        roles: [
            '282bf1fac6112285017366cb5f867469',  // itil
            'b05926fa0a0a0aa7000130023e0bde98'   // user
        ]
    },
```

---

### Step 3: agentDescriptor (`src/security/acl.ts`)
This records the agent's creator on sn_aia_agent_config.agent_descriptor. The following lines handles version management and agent instructions.
```typescript
    agentDescriptor: 'created_by_build_agent',
    channel: 'nap_and_va',
    recordType: 'custom',
    processingMessage: "Analyzing your incident request...",
    postProcessingMessage: "Incident analysis complete.",

    versionDetails: [{
        name: "V1",
        number: 1,
        state: "published",
        instructions: `Incidents are disruption or unavailability of a service or simply issue faced by an user. Your objective is to understand the issue, verify that it relates to ACL incident and recommend next steps for resolution.

Step 1: Extract the incident number from the user's request.

Step 2: Use the Lookup Incident tool to fetch details.

Step 3: Fetch details of the incident. If details of the incident are not available then check the correctness of the incident number. DO NOT move forward if the incident details are not fetched. The details are the field values.

Step 3: Present details in bullet-point format.

Step 4: Use AIA Web Search for resolution guidance.

Step 5: Recommend next steps. NEVER modify without user approval.

Step 6: Ask for approval using this sentence: "Please respond 'yes' to accept the fixes or 'no' to reject them." Do not repeat the recommendation content in this step to avoid duplication.

Step 7: Collect user's response.
Step 7.1: ONLY accept a simple and exact "yes" or "no" as valid response. Any other response will be invalid, which include "approve", "update", "yes for category", etc..

Step 7.2: If the response is invalid, ACKNOWLEDGE that:
"The response is not supported. Please provide a simple 'yes' or 'no'."
Then wait for user to give a valid response. DO NOT PROCEED without a valid response.

Step 7.3: If user APPROVES recommendations.
If the user responds with "yes", apply incident resolution.


Step 7.4: If user REJECTS recommendations.
If the user responds with "no", ACKNOWLEDGE the rejection by saying, "The recommendations have been rejected and no updates will be made." Then end the conversation.

8. Update the incident with the approved values.

7. End with a thank you note.`
    }],
```

---
### Step 4: Build Agent Tools (`src/security/acl.ts`)
AI agent need **Tools** (CRUD operations, Subflows, or Server Scripts) to interact with platform data and execute instructed operations. Here, we define a tool that updates the task status.

```typescript
    tools: [
        {
            active: true,
            name: "Lookup Incident",
            description: "Searches for incidents by number",
            executionMode: "autopilot",
            type: "crud",
            recordType: "custom",
            preMessage: "Searching for the incident...",
            postMessage: "Incident details retrieved.",
            inputs: {
                operationName: "lookup",
                table: "incident",
                inputFields: [
                    { name: "incident_number", description: "Incident number", mandatory: false }
                ],
                queryCondition: "number={{incident_number}}",
                returnFields: [
                    { name: "number" },
                    { name: "short_description" },
                    { name: "state" },
                    { name: "priority" },
                    { name: "assigned_to", referenceConfig: { table: "sys_user", field: "name" } }
                ]
            }
        },
        {
            type: "web_automation",
            name: "AIA Web Search",
            active: true,
            preMessage: "Searching the web...",
            postMessage: "Web search results retrieved."
        }
    ],
```

---
### Step 4: Construct Trigger (`src/security/acl.ts`)
Remember I told you triggers are optional. I chose not to define any.

```typescript
triggerConfig: []
```

---
### PS: Didn't select any Authentication
By default if you don't select an authentication type your AI agent gets assigned a Dynamic User.

```typescript
triggerConfig: []
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
3. Locate **ACL Incident Fixer Agent** (`aclIncidentFixerAgent`).
4. Click **Test Agent** or open the **Now Assist Panel**.
5. Input a prompt:  
   > *"I have an incident record with ID `SYS_ID_HERE`. Please update its status to In Progress and summarize what you did."*
6. Verify that the agent looksup incident using `incident_number` and updates the record accordingly in the `x_snc_ai_agent_task` table.

---

## 💡 Best Practices Summary
* **Grounding & Scope:** Keep agent tools limited to the minimum set of permissions necessary (Least Privilege Principle).
* **Execution Mode:** Use `Supervised` mode during development and initial deployment before transitioning high-confidence workflows to `Autonomous`.
* **SDK Feedback Loop:** Leverage `now-sdk build` locally to catch type errors, missing properties, or invalid references before deploying to the platform.