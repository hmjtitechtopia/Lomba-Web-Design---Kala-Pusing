// Controller UI & interaksi chatbot 3D Kala

import { CHATBOT_CONFIG, getChatbotResponse } from "./chatbot-data.js";
import { Chatbot3D } from "./chatbot-3d.js";

class ChatbotController {
  constructor() {
    this.isOpen = false;
    this.chatbot3D = null;
    this.init();
  }

  init() {
    this.injectWidgetHTML();
    this.cacheDOMElements();
    this.bindEvents();
    this.setupGreetingBubble();
    this.addBotMessage(CHATBOT_CONFIG.welcomeMessage);
    this.init3DModel();
  }

  async init3DModel() {
    if (!this.chatbot3D && this.canvas3D) {
      this.chatbot3D = new Chatbot3D(this.canvas3D);
      await this.chatbot3D.init();
    }
  }

  // Render markup widget ke dalam DOM body
  injectWidgetHTML() {
    if (document.querySelector(".sekala-chat-widget")) return;

    const chipsHTML = CHATBOT_CONFIG.quickChips
      .map(
        (chip) =>
          `<button type="button" class="chat-chip-btn" data-query="${chip}">${chip}</button>`,
      )
      .join("");

    const widgetHTML = `
      <div class="sekala-chat-widget" id="sekala-chat-widget">
        <div class="chat-greeting-bubble" id="chat-greeting-bubble" role="status">
          <span>Ada yang ingin ditanyakan seputar tradisi Bali? <strong>Tanya Kala</strong></span>
          <button type="button" class="chat-greeting-close" id="chat-greeting-close" aria-label="Tutup sapaan">
            <span class="material-symbols-outlined" style="font-size: 16px;">close</span>
          </button>
        </div>

        <button type="button" class="chat-launcher-btn" id="chat-launcher-btn" aria-label="Buka Chatbot Budaya Kala" aria-expanded="false" aria-controls="sekala-chat-panel">
          <div class="chat-launcher-3d-wrap" id="chat-launcher-3d-wrap">
            <canvas class="chat-launcher-3d-canvas" id="chat-3d-canvas" width="96" height="96"></canvas>
          </div>
          <span class="chat-launcher-badge" aria-hidden="true" title="Kala Online"></span>
        </button>

        <section class="sekala-chat-panel" id="sekala-chat-panel" role="dialog" aria-labelledby="chat-bot-name" aria-hidden="true" data-lenis-prevent>
          <header class="chat-panel-header">
            <div class="chat-header-profile">
              <div class="chat-header-avatar-badge" aria-hidden="true">
                <span class="material-symbols-outlined" style="font-size: 22px;">smart_toy</span>
              </div>
              <div class="chat-header-info">
                <div class="chat-header-title">
                  <span id="chat-bot-name">${CHATBOT_CONFIG.botName}</span>
                  <span class="chat-header-badge">AI Asisten</span>
                </div>
                <div class="chat-header-status">
                  <span class="chat-status-dot" aria-hidden="true"></span>
                  <span>Status Aktif</span>
                </div>
              </div>
            </div>
            <button type="button" class="chat-header-close" id="chat-header-close" aria-label="Tutup panel chat">
              <span class="material-symbols-outlined" style="font-size: 20px;">close</span>
            </button>
          </header>

          <div class="chat-panel-feed" id="chat-feed" role="log" aria-live="polite"></div>

          <div class="chat-quick-chips" id="chat-quick-chips" aria-label="Saran pertanyaan kilat">
            ${chipsHTML}
          </div>

          <form class="chat-panel-composer" id="chat-composer">
            <input
              type="text"
              class="chat-input-text"
              id="chat-input"
              placeholder="Tanya tradisi, wilayah, atau seni Bali..."
              autocomplete="off"
              aria-label="Pesan Anda"
            />
            <button type="submit" class="chat-send-btn" id="chat-send" aria-label="Kirim pertanyaan">
              <span class="material-symbols-outlined" style="font-size: 20px;">send</span>
            </button>
          </form>
        </section>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", widgetHTML);
  }

  cacheDOMElements() {
    this.widgetEl = document.getElementById("sekala-chat-widget");
    this.launcherBtn = document.getElementById("chat-launcher-btn");
    this.panelEl = document.getElementById("sekala-chat-panel");
    this.closeBtn = document.getElementById("chat-header-close");
    this.feedEl = document.getElementById("chat-feed");
    this.chipsContainer = document.getElementById("chat-quick-chips");
    this.composerForm = document.getElementById("chat-composer");
    this.inputEl = document.getElementById("chat-input");
    this.sendBtn = document.getElementById("chat-send");
    this.greetingBubble = document.getElementById("chat-greeting-bubble");
    this.greetingCloseBtn = document.getElementById("chat-greeting-close");
    this.canvas3D = document.getElementById("chat-3d-canvas");
  }

  bindEvents() {
    this.launcherBtn.addEventListener("click", () => this.togglePanel());
    this.closeBtn.addEventListener("click", () => this.closePanel());

    this.composerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleUserSubmit();
    });

    this.chipsContainer.addEventListener("click", (e) => {
      const chip = e.target.closest(".chat-chip-btn");
      if (chip && chip.dataset.query) {
        this.inputEl.value = chip.dataset.query;
        this.handleUserSubmit();
      }
    });

    if (this.greetingCloseBtn) {
      this.greetingCloseBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.hideGreetingBubble();
      });
    }

    if (this.greetingBubble) {
      this.greetingBubble.addEventListener("click", () => {
        this.openPanel();
      });
    }

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen) {
        this.closePanel();
      }
    });

    // Kunci scroll biar nggak tembus (scroll chaining) ke halaman utama pas kursor di dalam panel
    this.panelEl.addEventListener(
      "wheel",
      (e) => {
        if (!this.isOpen) return;

        const feed = this.feedEl;
        if (!feed) return;

        // Tetap izinkan scroll horizontal pas user geser chips pertanyaan
        if (
          e.target.closest("#chat-quick-chips") &&
          (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey)
        ) {
          return;
        }

        const isFeed = Boolean(e.target.closest("#chat-feed"));
        const isAtTop = feed.scrollTop <= 0 && e.deltaY < 0;
        const isAtBottom =
          feed.scrollTop + feed.clientHeight >= feed.scrollHeight - 1 &&
          e.deltaY > 0;

        if (isFeed) {
          // Kalau scroll feed udah mentok atas/bawah, cegah body ikut kegulung
          if (isAtTop || isAtBottom) {
            e.preventDefault();
          }
        } else {
          // Scroll di area non-feed (header/composer) dioverride ke feed chat
          feed.scrollBy({ top: e.deltaY, behavior: "auto" });
          e.preventDefault();
        }
      },
      { passive: false },
    );

    // Cegah scroll tembus pada layar sentuh di area non-feed
    this.panelEl.addEventListener(
      "touchmove",
      (e) => {
        if (!this.isOpen) return;
        if (
          !e.target.closest("#chat-feed") &&
          !e.target.closest("#chat-quick-chips")
        ) {
          e.preventDefault();
        }
      },
      { passive: false },
    );
  }

  setupGreetingBubble() {
    // Delay munculin bubble sapaan biar nggak mengagetkan user
    setTimeout(() => {
      if (!this.isOpen && this.greetingBubble) {
        this.greetingBubble.classList.add("is-visible");
      }
    }, 2200);

    // Auto-dismiss bubble setelah 12 detik kalau diabaikan
    setTimeout(() => {
      this.hideGreetingBubble();
    }, 12000);
  }

  hideGreetingBubble() {
    if (this.greetingBubble) {
      this.greetingBubble.classList.remove("is-visible");
    }
  }

  togglePanel() {
    if (this.isOpen) {
      this.closePanel();
    } else {
      this.openPanel();
    }
  }

  openPanel() {
    this.isOpen = true;
    this.hideGreetingBubble();
    this.panelEl.classList.add("is-open");
    this.launcherBtn.classList.add("is-active");
    this.panelEl.setAttribute("aria-hidden", "false");
    this.launcherBtn.setAttribute("aria-expanded", "true");

    setTimeout(() => {
      this.inputEl.focus();
    }, 200);
  }

  closePanel() {
    this.isOpen = false;
    this.panelEl.classList.remove("is-open");
    this.launcherBtn.classList.remove("is-active");
    this.panelEl.setAttribute("aria-hidden", "true");
    this.launcherBtn.setAttribute("aria-expanded", "false");
  }

  handleUserSubmit() {
    const text = this.inputEl.value.trim();
    if (!text) return;

    this.addUserMessage(text);
    this.inputEl.value = "";

    this.showTypingIndicator();

    // Animasi nod bot merespons submit user
    if (this.chatbot3D) {
      this.chatbot3D.nod();
    }

    // Simulasi delay 550ms biar terasa natural sebelum bot membalas
    setTimeout(() => {
      this.removeTypingIndicator();
      const answer = getChatbotResponse(text);
      this.addBotMessage(answer);

      // Bot ngangguk lagi tanda selesai merespons
      if (this.chatbot3D) {
        this.chatbot3D.nod();
      }
    }, 550);
  }

  addUserMessage(text) {
    const bubble = document.createElement("div");
    bubble.className = "chat-bubble chat-bubble-user";
    bubble.innerHTML = `<p>${this.escapeHTML(text)}</p>`;
    this.feedEl.appendChild(bubble);
    this.scrollToBottom();
  }

  addBotMessage(htmlContent) {
    const bubble = document.createElement("div");
    bubble.className = "chat-bubble chat-bubble-bot";
    bubble.innerHTML = htmlContent;
    this.feedEl.appendChild(bubble);
    this.scrollToBottom();
  }

  showTypingIndicator() {
    if (document.getElementById("chat-typing")) return;

    const indicator = document.createElement("div");
    indicator.className = "chat-typing-indicator";
    indicator.id = "chat-typing";
    indicator.innerHTML = `
      <span class="chat-typing-dot"></span>
      <span class="chat-typing-dot"></span>
      <span class="chat-typing-dot"></span>
    `;
    this.feedEl.appendChild(indicator);
    this.scrollToBottom();
  }

  removeTypingIndicator() {
    const indicator = document.getElementById("chat-typing");
    if (indicator) {
      indicator.remove();
    }
  }

  scrollToBottom() {
    this.feedEl.scrollTop = this.feedEl.scrollHeight;
  }

  escapeHTML(str) {
    const div = document.createElement("div");
    div.innerText = str;
    return div.innerHTML;
  }
}

// Auto-init controller saat DOM siap
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    window.__sekalaChatbot = new ChatbotController();
  });
} else {
  window.__sekalaChatbot = new ChatbotController();
}
