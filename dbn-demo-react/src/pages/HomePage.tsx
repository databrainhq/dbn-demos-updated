import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    title: "Dashboard Embed",
    description: "Embed a full dashboard with configurable options, CSV export, fullscreen, and more.",
    hash: "#dashboard",
  },
  {
    title: "Metric Embed",
    description: "Embed individual metric cards with custom sizing, chart types, and filter positions.",
    hash: "#metric",
  },
  {
    title: "Theming",
    description: "Apply light/dark themes via the theme JSON attribute or saved theme-name presets.",
    hash: "#theming",
  },
  {
    title: "Multi-Tenant",
    description: "Switch clients to see row-level security, dashboard filters, and per-client provisioning.",
    hash: "#multitenant",
  },
  {
    title: "AI Chat & Self-Serve",
    description: "Enable AI-powered data querying and end-user metric creation with drag-and-drop or chat.",
    hash: "#selfserve",
  },
];

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Databrain Embed Reference</h1>
        <p className="text-muted-foreground text-lg">
          A comprehensive starter showing every major Databrain embedding feature.
          Each page demonstrates a different capability — explore them from the nav above.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Start</CardTitle>
          <CardDescription>Get a dashboard running in 3 steps</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p><strong>1.</strong> Create a Data App in <a href="https://app.usedatabrain.com" target="_blank" rel="noopener" className="underline">app.usedatabrain.com</a> and copy the API token.</p>
          <p><strong>2.</strong> Set <code className="bg-muted px-1 rounded">DATABRAIN_API_TOKEN</code> and <code className="bg-muted px-1 rounded">DATA_APP_NAME</code> in <code className="bg-muted px-1 rounded">backend/.env</code>.</p>
          <p><strong>3.</strong> Set <code className="bg-muted px-1 rounded">VITE_DEFAULT_DASHBOARD_ID</code> in the root <code className="bg-muted px-1 rounded">.env</code> to an embed ID from your Data App.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>MCP Server Setup</CardTitle>
          <CardDescription>Automate setup with the Databrain MCP server</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>Add the <strong>Databrain MCP server</strong> in your IDE (Cursor, VS Code, etc.) and set the service token in MCP settings. Then use the runbook workflows:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Setup from scratch:</strong> create_datasource → sync_datasource → create_datamart → create_workspace → create_data_app → create_api_token → create_embed → generate_guest_token</li>
            <li><strong>Brand my embed:</strong> apply_embed_preset or customize_embed_theme + configure_chart_appearance</li>
            <li><strong>Add filters:</strong> configure_filters</li>
            <li><strong>Localize:</strong> configure_internationalization</li>
            <li><strong>Enable self-serve:</strong> configure_embed_options with metric creation flags</li>
          </ul>
          <p>See <code className="bg-muted px-1 rounded">GUIDES.md</code> and <code className="bg-muted px-1 rounded">LLM_INSTRUCTIONS.md</code> for detailed runbooks.</p>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-semibold mb-4">Feature Pages</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((f) => (
            <a key={f.hash} href={f.hash} className="block">
              <Card className="h-full hover:border-primary transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{f.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{f.description}</p>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </div>

      <div className="text-sm text-muted-foreground space-y-1 pb-8">
        <p><a href="https://docs.usedatabrain.com" target="_blank" rel="noopener" className="underline">Databrain Docs</a> · <a href="https://docs.usedatabrain.com/developer-docs/helpers/component-options-reference" target="_blank" rel="noopener" className="underline">Component Options</a> · <a href="https://docs.usedatabrain.com/developer-docs/helpers/api-reference/token" target="_blank" rel="noopener" className="underline">Guest Token API</a></p>
      </div>
    </div>
  );
}
