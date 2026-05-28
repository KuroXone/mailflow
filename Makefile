.PHONY: dev prod down logs migrate seed lint test setup

dev:
	docker compose up -d postgres redis minio
	@echo "✓ Infrastructure started. Run backend + frontend manually for hot-reload."

prod:
	docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

down:
	docker compose down

logs:
	docker compose logs -f

migrate:
	cd backend && npx prisma migrate dev

migrate-prod:
	cd backend && npx prisma migrate deploy

seed:
	cd backend && npx prisma db seed

studio:
	cd backend && npx prisma studio

lint:
	cd backend && npm run lint
	cd frontend && npm run lint

test:
	cd backend && npm run test

install:
	cd backend && npm install
	cd frontend && npm install

setup: install
	cp backend/.env.example backend/.env
	cp frontend/.env.example frontend/.env.local
	@echo "✓ Edit backend/.env and frontend/.env.local then run: make migrate && make seed"

reset-db:
	cd backend && npx prisma migrate reset --force
