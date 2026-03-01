ROOT_DIR := $(shell pwd)
API_DIR  := $(ROOT_DIR)/api
WEB_DIR  := $(ROOT_DIR)/web

API_KEY  := $(shell openssl rand -hex 16)
KEY      := eqm-$(API_KEY)

.PHONY: setup setup-api setup-web dev dev-api dev-web stop env clean

# ── Full setup ────────────────────────────────────────────────────────────────

setup: setup-api setup-web env
	@echo ""
	@echo "✅ Setup complete. Run 'make dev' to start."

# ── API setup ─────────────────────────────────────────────────────────────────

setup-api:
	@echo "==> Setting up API..."
	cd $(API_DIR) && python3 -m venv venv
	cd $(API_DIR) && . venv/bin/activate && pip install -q -r requirements.txt

# ── Web setup ─────────────────────────────────────────────────────────────────

setup-web:
	@echo "==> Setting up Web..."
	@if [ -f $(WEB_DIR)/pnpm-lock.yaml ]; then \
		cd $(WEB_DIR) && pnpm install; \
	else \
		cd $(WEB_DIR) && npm install; \
	fi

# ── Generate .env files with shared key ──────────────────────────────────────

env:
	@echo "==> Generating .env files with shared API key..."
	@echo 'EQUAMOTION_API_KEY="$(KEY)"' > $(API_DIR)/.env
	@echo 'VIDEO_API_URL=http://localhost:8000' > $(WEB_DIR)/.env.local
	@echo 'VIDEO_API_KEY=$(KEY)' >> $(WEB_DIR)/.env.local
	@echo "    API key: $(KEY)"

# ── Dev (start both) ─────────────────────────────────────────────────────────

dev: dev-api dev-web
	@echo ""
	@echo "🚀 API  → http://localhost:8000"
	@echo "🚀 Web  → http://localhost:3000"
	@echo ""
	@echo "Run 'make stop' to stop both."

dev-api:
	@echo "==> Starting API..."
	cd $(API_DIR) && . venv/bin/activate && python main.py &

dev-web:
	@echo "==> Starting Web..."
	cd $(WEB_DIR) && npm run dev &

# ── Stop ──────────────────────────────────────────────────────────────────────

stop:
	@echo "==> Stopping services..."
	@-pkill -f "uvicorn main:app" 2>/dev/null || true
	@-pkill -f "next dev" 2>/dev/null || true
	@echo "    Stopped."

# ── Clean ─────────────────────────────────────────────────────────────────────

clean:
	@echo "==> Cleaning..."
	rm -rf $(API_DIR)/venv $(API_DIR)/.env
	rm -rf $(WEB_DIR)/node_modules $(WEB_DIR)/.env.local $(WEB_DIR)/.next
	@echo "    Cleaned."
