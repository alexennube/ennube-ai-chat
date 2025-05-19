
# EnnubeChat 💬

**EnnubeChat** is a customizable, React-based AI chat interface component for integrating agent-based conversations into any web application. Designed for flexibility, real-time integrations, and enterprise use cases, EnnubeChat allows teams to deploy and manage AI agents with ease.

---

## 🚀 Features

- 🧠 Multi-agent architecture
- 🧩 Plug-and-play Webhook support
- ⚙️ TailwindCSS styling
- 🪄 Fully customizable UI
- 📞 Event hooks for message tracking, agent switching, and lifecycle analytics
- 🌐 Modern browser support
- 📦 Easy integration with React 18+ / Next.js 13+

---

## 🧰 Installation

```bash
npm install ennube-chat
```

---

## 🔧 Basic Usage

```tsx
import { EnnubeChat } from 'ennube-chat';

function App() {
  return (
    <div className="container">
      <EnnubeChat height="600px" width="100%" />
    </div>
  );
}
```

---

## 📌 Props

| Prop               | Type                                 | Default        | Description                                       |
|--------------------|--------------------------------------|----------------|---------------------------------------------------|
| `agents`           | `AgentContext[]`                     | Default agents | Custom list of AI agents                         |
| `initialAgent`     | `AgentContext`                       | `null`         | Agent selected on component load                 |
| `showHeader`       | `boolean`                            | `true`         | Show/hide header bar                             |
| `showFooter`       | `boolean`                            | `true`         | Show/hide chat input                             |
| `showAgentPanel`   | `boolean`                            | `true`         | Show/hide agent selector                         |
| `className`        | `string`                             | `""`           | Custom container class                           |
| `height`           | `string`                             | `"600px"`      | Height of chat component                         |
| `width`            | `string`                             | `"100%"`       | Width of chat component                          |
| `logoUrl`          | `string`                             | Internal logo  | Replace header logo                              |
| `headerTitle`      | `string`                             | `"Ennube.ai"`  | Title in header                                  |
| `inputPlaceholder` | `string`                             | `"Type your message..."` | Placeholder for chat input           |
| `onMessageSent`    | `(message: string) => void`          | `undefined`    | Callback for outgoing messages                   |
| `onMessageReceived`| `(message: string) => void`          | `undefined`    | Callback for incoming messages                   |
| `onAgentSelected`  | `(agent: AgentContext) => void`      | `undefined`    | Callback when user switches agent                |

---

## 🧠 Agent Configuration

```ts
interface AgentContext {
  agentId: string;
  agentName: string;
  agentDescription: string;
  agentImage?: string;
  capabilities?: string[];
  webhookUrl?: string;
  statusWebhookUrl?: string;
}
```

### Example Agent

```tsx
const agents = [
  {
    agentId: "support",
    agentName: "Support Bot",
    agentDescription: "Handles technical questions",
    agentImage: "/images/support.png",
    webhookUrl: "https://your-backend.com/webhook/support",
    statusWebhookUrl: "https://your-backend.com/status/support"
  }
];
```

---

## 🌐 Webhook API

### Request Format

```json
{
  "message": "What's your return policy?",
  "agentId": "support",
  "userId": "user_123",
  "conversationId": "conv_456",
  "messages": [
    { "role": "user", "content": "Hi" },
    { "role": "assistant", "content": "Hello! How can I help?" },
    { "role": "user", "content": "What's your return policy?" }
  ]
}
```

### Response Format

```json
{
  "output": "You can return items within 30 days of purchase.",
  "items": [ ...optional structured results... ]
}
```

### Async Support

If processing is long-running:

```json
{
  "jobId": "job_123"
}
```

---

## 🎨 Custom Styling

```tsx
<EnnubeChat
  className="rounded-xl shadow-xl"
  logoUrl="/images/company-logo.png"
  headerTitle="Acme Support"
/>
```

---

## 📡 Advanced Usage

### Event Tracking

```tsx
<EnnubeChat 
  onMessageSent={(msg) => analytics.track("message_sent", { msg })}
  onMessageReceived={(msg) => analytics.track("message_received", { msg })}
  onAgentSelected={(agent) => analytics.track("agent_selected", { agent })}
 />
```

### Single-Agent Mode

```tsx
<EnnubeChat 
  agents={[supportAgent]}
  initialAgent={supportAgent}
  showAgentPanel={false}
/>
```

---

## 🧱 Requirements

- React 18+
- TailwindCSS
- Next.js 13+ (if SSR is used)

---

## 🧪 Development

### Local Dev

```bash
npm install
npm run dev
```

### Build for Production

```bash
npm run build
```

### Run Tests

```bash
npm test
```

---

## 📁 File Structure

```
ennube-chat/
├── components/
├── contexts/
├── hooks/
├── lib/
├── index.ts
└── example-usage.tsx
```

---

## 🛡 Security Notes

- Sanitize all input before processing
- Use HTTPS for all webhook endpoints
- Add authentication to your APIs
- Consider rate-limiting message volume per session

---

## 📜 License

MIT License

---

## 🤝 Contributing

We welcome issues and pull requests! Please see `CONTRIBUTING.md` for how to get started.

---

## 📫 Support

For bugs or feature requests, open a GitHub issue. For commercial inquiries or integration help, email: [support@ennube.ai](mailto:support@ennube.ai)

---
