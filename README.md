# Project Nexus: Proof of Work for Vixel

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Tech Stack](https://img.shields.io/badge/stack-Go%20%7C%20Templ%20%7C%20HTMX-blue)
![Security](https://img.shields.io/badge/security-PCI--Mindset-red)

A vertical-slice payment architecture demonstrating the "Locality of Behavior" through a Go-driven dashboard and a zero-dependency, PCI-isolated checkout widget.

---

## 🏗 Architectural Overview

Project Nexus demonstrates a high-integrity financial dashboard without the state overhead of standard SPAs (React/Next.js). It utilizes the **GOTH stack (Go, Templ, HTMX)** to build a resilient system where the backend serves as the undisputed single source of truth.

---

## ✨ Architectural Highlights

### 1. Server-Driven UI (Go + Templ)

- **Data Integrity**: Engineered a type-safe component library (`/components/`). By rendering UI directly from the Go structs (like the `models.Transaction` feed), we eliminate the risk of the frontend displaying out-of-sync financial data.
- **HTMX Auto-Polling**: Implemented a Live Transaction Feed that polls via `hx-trigger="every 10s"`, offloading state management entirely to the Go Orchestrator.

### 2. Embeddable Checkout Component (Vanilla TS)

- **Zero-Dependency Core**: Built the embeddable checkout script (`nexus.ts`) in pure Vanilla TypeScript. Compiled down to a single `< 10KB` library without framework overhead.
- **Shadow DOM Encapsulation**: Wrapped the payment UI inside an Open Shadow Root. This boundary prevents the host merchant's CSS from interfering with the checkout layout or spying on input fields via global event listeners.

### 3. Global Resilience Monitor (HTMX)

- Designed an HTMX listener (`htmx:afterRequest`) that acts as a global error boundary. If the backend encounters a failure (e.g., a 500 Network Timeout), the UI gracefully displays a "Connection Interrupted" overlay. This ensures the user is never left with a frozen state during a critical financial operation.

---

## 🚀 Running the Orchestrator

The project requires **Go (>= 1.20)** and **Node.js** (for building the widget).

```bash
# 1. Clone the repository
git clone https://github.com/GreyyDaze/vixel-nexus

# 2. Start the Go Server
cd vixel-nexus
go run cmd/server/main.go
```

Access the environments:

- **Merchant Dashboard**: `http://localhost:8080`
- **Widget Integration Demo**: `http://localhost:8080/static/test-merchant.html`

---

## 🧠 Technical Deep Dive: The Shadow DOM Strategy

When building a payment widget intended for external sites (merchants), you cannot control the host environment. If a merchant's site has a global style like `input { pointer-events: none; }`, it could silently break a standard payment form.

**The Solution:**
Instead of a heavy `iframe` (which causes sizing and mobile tap-target issues), Nexus uses the Shadow DOM.

```typescript
class NexusCheckout extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    // 🛡 The CSS/JS boundary is established here.
  }
}
```

This guarantees that **Vixel's UI remains pristine and operative**, regardless of the merchant's codebase quality, which is critical for maintaining high payment conversion rates.

---

## ⚖️ Design Decisions & Trade-offs

- **Locality of Behavior (HTMX)**: Chose HTMX over JSON/React for the dashboard. By putting `hx-get="/transactions"` directly on the button, the behavior is deeply obvious without needing to trace through Redux reducers or React `useEffect` hooks.
- **Vanilla Build System**: Used raw `tsc` (TypeScript Compiler) for the widget instead of Vite or Webpack. This enforces strict minimalism and ensures we don't accidentally bundle unneeded polyfills into our host-facing script.

---

## 📂 Architecture Layout

```
/vixel-nexus
  ├── /cmd/server          # Application Entrypoint (Orchestrator)
  ├── /internal
  │   ├── /handlers        # HTMX partials & Data routes
  │   ├── /models          # Type-safe structs (Transaction, Health)
  │   └── /components      # .templ views (Dashboard, StatCard, Table)
  ├── /scripts             # TypeScript source for Sentinel Widget
  └── /static              # Compiled nexus.js & Merchant Demo HTML
```

---

_Built for Vixel._
