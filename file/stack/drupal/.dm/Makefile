up:
	[ ! -f ../.env ] && touch ../.env; export COMPOSE_BAKE=true; docker compose --env-file .env -f docker-compose.yml up --force-recreate --build -d
down:
	docker compose --env-file .env down
logs:
	docker compose --env-file .env logs -f -t
ps:
	docker ps -a --filter name=^/(({}.env._this._tag))
bash:
	docker exec -it (({}.env._this._tag))-www /bin/bash