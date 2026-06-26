import { StateGraph, START, END } from "@langchain/langgraph";
import { ResearchStateAnnotation } from "./state";
import { companyResearchAgent } from "./agents/companyResearch";
import { financialAnalystAgent } from "./agents/financialAnalyst";
import { newsResearchAgent } from "./agents/newsResearch";
import { riskAssessmentAgent } from "./agents/riskAssessment";
import { valuationAgent } from "./agents/valuation";
import { investmentCommitteeAgent } from "./agents/investmentCommittee";

// Compile the workflow
const workflow = new StateGraph(ResearchStateAnnotation)
  .addNode("companyResearchNode", companyResearchAgent)
  .addNode("financialAnalystNode", financialAnalystAgent)
  .addNode("newsResearchNode", newsResearchAgent)
  .addNode("riskAssessmentNode", riskAssessmentAgent)
  .addNode("valuationNode", valuationAgent)
  .addNode("investmentCommitteeNode", investmentCommitteeAgent)
  // Define edges
  .addEdge(START, "companyResearchNode")
  .addEdge("companyResearchNode", "financialAnalystNode")
  .addEdge("financialAnalystNode", "newsResearchNode")
  .addEdge("newsResearchNode", "riskAssessmentNode")
  .addEdge("riskAssessmentNode", "valuationNode")
  .addEdge("valuationNode", "investmentCommitteeNode")
  .addEdge("investmentCommitteeNode", END);

export const app = workflow.compile();
