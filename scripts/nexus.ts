/**
 * Sentinel Widget: The Isolated Checkout Component
 * Zero-dependency | Shadow DOM Encapsulation | PCI-Mindset
 */

class NexusCheckout extends HTMLElement {
    private shadow: ShadowRoot;

    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    private render() {
        const amount = this.getAttribute('data-amount') || '0.00';
        const currency = this.getAttribute('data-currency') || 'USD';

        this.shadow.innerHTML = `
            <style>
                :host {
                    display: block;
                    font-family: 'Outfit', system-ui, sans-serif;
                }
                .nexus-btn {
                    background: #6366f1;
                    color: white;
                    border: none;
                    padding: 12px 24px;
                    border-radius: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);
                }
                .nexus-btn:hover {
                    background: #4f46e5;
                    transform: translateY(-2px);
                }
                .nexus-modal {
                    display: none;
                    position: fixed;
                    inset: 0;
                    background: rgba(2, 6, 23, 0.8);
                    backdrop-filter: blur(8px);
                    z-index: 10000;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }
                .nexus-modal.active {
                    display: flex;
                }
                .glass-panel {
                    background: #0f172a;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    width: 100%;
                    max-width: 400px;
                    border-radius: 24px;
                    padding: 32px;
                    color: white;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                }
                .field { margin-bottom: 20px; }
                label { display: block; font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.1em; }
                input {
                    width: 100%;
                    background: #1e293b;
                    border: 1px solid #334155;
                    border-radius: 12px;
                    padding: 12px;
                    color: white;
                    font-size: 16px;
                    box-sizing: border-box;
                }
                input:focus { outline: 2px solid #6366f1; border-color: transparent; }
                .pci-shield {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 10px;
                    color: #475569;
                    margin-top: 24px;
                    justify-content: center;
                }
            </style>

            <button class="nexus-btn" id="pay-button">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                Pay ${currency} ${amount} with Vixel
            </button>

            <div class="nexus-modal" id="modal">
                <div class="glass-panel">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 32px;">
                        <div>
                            <div style="background: #6366f1; color: white; width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-bottom: 8px;">V</div>
                            <h2 style="margin: 0; font-size: 20px;">Complete Payment</h2>
                        </div>
                        <button id="close-modal" style="background: none; border: none; color: #64748b; cursor: pointer;">✕</button>
                    </div>

                    <form id="payment-form">
                        <div class="field">
                            <label>HOLDER NAME</label>
                            <input type="text" placeholder="John Doe" required />
                        </div>
                        <div class="field">
                            <label>CARD NUMBER (MOUNTED)</label>
                            <input type="text" placeholder="•••• •••• •••• ••••" required />
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                            <div class="field">
                                <label>EXPIRY</label>
                                <input type="text" placeholder="MM / YY" required />
                            </div>
                            <div class="field">
                                <label>CVC</label>
                                <input type="password" placeholder="•••" required />
                            </div>
                        </div>
                        
                        <button type="submit" class="nexus-btn" style="width: 100%; justify-content: center; margin-top: 12px;" id="submit-btn">
                            Confirm Secure Payment
                        </button>
                    </form>

                    <div class="pci-shield">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        PCI-DSS LEVEL 1 COMPLIANT INFRASTRUCTURE
                    </div>
                </div>
            </div>
        `;

        this.setupEventListeners();
    }

    private setupEventListeners() {
        const payBtn = this.shadow.getElementById('pay-button');
        const modal = this.shadow.getElementById('modal');
        const closeBtn = this.shadow.getElementById('close-modal');
        const form = this.shadow.getElementById('payment-form');
        const submitBtn = this.shadow.getElementById('submit-btn');

        payBtn?.addEventListener('click', () => modal?.classList.add('active'));
        closeBtn?.addEventListener('click', () => modal?.classList.remove('active'));

        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            if (submitBtn) {
                submitBtn.textContent = 'Processing...';
                submitBtn.setAttribute('disabled', 'true');
                submitBtn.style.opacity = '0.5';
            }

            // Simulate the secure handshake with the Vixel Go API
            setTimeout(() => {
                alert('Success: Transaction captured on Vixel Nexus Orchestrator');
                modal?.classList.remove('active');
                if (submitBtn) {
                    submitBtn.textContent = 'Confirm Secure Payment';
                    submitBtn.removeAttribute('disabled');
                    submitBtn.style.opacity = '1';
                }
            }, 1500);
        });
    }
}

customElements.define('nexus-checkout', NexusCheckout);
