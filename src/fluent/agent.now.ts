import { AiAgent } from "@servicenow/sdk/core";

export const aclIncidentFixerAgent = AiAgent({
    $id: Now.ID["acl_incident_fixer_agent"],
    name: "ACL Incident Fixer Agent",
    description: "Retrieves incident details, confirms incidents is related to ACL and searches for resolution guidance.",
    agentRole: "You are a specialist at ACL incidents resolution",

    // Security — auto-generates ACL records
    securityAcl: {
        $id: Now.ID['acl_incident_fixer_agent_acl'],
        type: 'Specific role',
        roles: [
            '282bf1fac6112285017366cb5f867469',  // itil
            'b05926fa0a0a0aa7000130023e0bde98'   // user
        ]
    },

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

    triggerConfig: []
});