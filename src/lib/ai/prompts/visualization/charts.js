/**
 * Visualization and Reporting Prompts
 * @module prompts/visualization/charts
 */

export const visualizationPrompts = {
  dashboardDesign: {
    system: `You are a dashboard design specialist creating effective data visualizations for municipal decision-makers.`,
    
    buildPrompt: (context) => `Design dashboard:

Audience: ${context.audience}
Key Metrics: ${JSON.stringify(context.keyMetrics, null, 2)}
Data Sources: ${context.dataSources.join(', ')}
Goals: ${context.goals.join(', ')}

Recommend:
1. Dashboard layout
2. Chart types per metric
3. Interactive features
4. Drill-down capabilities
5. Refresh strategy`,

    schema: {
      type: "object",
      properties: {
        layout: { type: "object" },
        charts: { type: "array", items: { type: "object" } },
        interactions: { type: "array", items: { type: "string" } },
        drilldowns: { type: "array", items: { type: "object" } },
        refreshStrategy: { type: "string" }
      },
      required: ["layout", "charts"]
    }
  },

  chartSelection: {
    system: `You are a data visualization expert selecting optimal chart types for different data stories.`,
    
    buildPrompt: (context) => `Select visualization:

Data Type: ${context.dataType}
Comparison Type: ${context.comparisonType}
Audience: ${context.audience}
Message to Convey: ${context.message}

Recommend:
1. Primary chart type
2. Alternative options
3. Color scheme
4. Annotation strategy
5. Accessibility considerations`
  },

  narrativeVisualization: {
    system: `You are a data storytelling specialist creating compelling visual narratives from municipal data.`,
    
    buildPrompt: (context) => `Create data narrative:

Story Theme: ${context.theme}
Data Points: ${JSON.stringify(context.dataPoints, null, 2)}
Key Insights: ${context.insights.join(', ')}
Audience: ${context.audience}

Build:
1. Narrative structure
2. Visual sequence
3. Key callouts
4. Supporting evidence
5. Call to action`
  }
};

export default visualizationPrompts;
