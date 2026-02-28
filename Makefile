.PHONY: help install backend frontend dev seed test clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install: ## Install all dependencies
	cd backend && pip install -r requirements.txt
	cd frontend && npm install

backend: ## Run backend dev server
	cd backend && uvicorn app.main:app --reload --port 8000

frontend: ## Run frontend dev server
	cd frontend && npm run dev

dev: ## Run both backend and frontend (use 2 terminals instead)
	@echo "Run in separate terminals:"
	@echo "  make backend"
	@echo "  make frontend"

test: ## Run backend tests
	cd backend && python -m pytest tests/ -v

clean: ## Remove generated files
	rm -f backend/data/mami.db
	rm -rf backend/__pycache__ backend/app/__pycache__
	rm -rf frontend/node_modules frontend/dist
