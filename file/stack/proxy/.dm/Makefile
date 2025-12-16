up:
	docker compose --env-file .env -f docker-compose.yml up --build
down:
	docker compose --env-file .env down
logs:
	docker compose --env-file .env logs -f -t
ps:
	docker ps --filter name=^/(({}.env._this._tag))