#!/usr/bin/env node

/**
 * Script to detect affected deployable apps and trigger Vercel deployments.
 * Usage: node tools/scripts/deploy-affected.mjs [preview|production]
 */

import { execSync } from "node:child_process";

const mode = process.argv[2] || "preview";
const isProd = mode === "production";

console.log(`=== Deploy Affected Apps (${mode.toUpperCase()}) ===`);

// Deployable web apps and their respective configuration
const APP_CONFIG = {
  "astra-aviation-rag": {
    dir: "apps/astra-aviation-rag",
    projectIdEnv: "VERCEL_PROJECT_ID_AVIATION_RAG",
  },
  "astra-document-summary": {
    dir: "apps/astra-document-summary",
    projectIdEnv: "VERCEL_PROJECT_ID_DOCUMENT_SUMMARY",
  },
  "astra-interview-assistant": {
    dir: "apps/astra-interview-assistant",
    projectIdEnv: "VERCEL_PROJECT_ID_INTERVIEW_ASSISTANT",
  },
  "astra-mcp-server": {
    dir: "apps/astra-mcp-server",
    projectIdEnv: "VERCEL_PROJECT_ID_MCP_SERVER",
  },
};

// Determine base commit for affected comparison
let baseCommit = process.env.NX_BASE;
const headCommit = process.env.NX_HEAD || "HEAD";

if (!baseCommit) {
  try {
    baseCommit = execSync("git rev-parse HEAD~1", { encoding: "utf8" }).trim();
  } catch (err) {
    baseCommit = "HEAD~1";
  }
}

console.log(`Calculating affected projects with base: ${baseCommit}, head: ${headCommit}`);

let affectedApps = [];
try {
  const output = execSync(
    `npx nx show projects --affected --base=${baseCommit} --head=${headCommit} --type=app`,
    { encoding: "utf8" }
  );
  affectedApps = output
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => Boolean(s) && Boolean(APP_CONFIG[s]));
} catch (err) {
  console.warn("Failed to query affected apps via nx show, checking deployable targets directly:", err.message);
  affectedApps = Object.keys(APP_CONFIG);
}

if (affectedApps.length === 0) {
  console.log("No deployable applications were affected by this commit. Skipping deployment.");
  process.exit(0);
}

console.log(`Affected deployable apps: ${affectedApps.join(", ")}`);

const vercelToken = process.env.VERCEL_TOKEN;
const vercelOrgId = process.env.VERCEL_ORG_ID;

if (!vercelToken) {
  console.error("Missing required environment variable: VERCEL_TOKEN");
  process.exit(1);
}

for (const app of affectedApps) {
  const config = APP_CONFIG[app];
  const projectId = process.env[config.projectIdEnv];

  console.log(`\nDeploying ${app} (${config.dir})...`);

  const prodFlag = isProd ? "--prod" : "";
  const orgFlag = vercelOrgId ? `--scope=${vercelOrgId}` : "";

  const deployCmd = `npx vercel deploy ${prodFlag} ${orgFlag} --token=${vercelToken} --yes`;

  try {
    const env = {
      ...process.env,
      VERCEL_PROJECT_ID: projectId || process.env.VERCEL_PROJECT_ID || "",
      VERCEL_ORG_ID: vercelOrgId || "",
    };

    execSync(deployCmd, {
      cwd: config.dir,
      stdio: "inherit",
      env,
    });
    console.log(`Successfully deployed ${app}!`);
  } catch (err) {
    console.error(`Failed to deploy ${app}: ${err.message}`);
    process.exit(1);
  }
}

console.log("\nAll affected applications deployed successfully.");
