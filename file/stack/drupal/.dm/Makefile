ENV_VARS = export COMPOSE_PROJECT_NAME=(({}.env._this._tag)); export APPSETTING_ENV=(({}.env._this._env)); export APPSETTING_UID=$(shell id -g); export APPSETTING_GID=$(shell id -g); export APPSETTING_USER=$(USER);

up:
	$(ENV_VARS) docker compose --env-file .env -f docker-compose.yml up -d --build
down:
	$(ENV_VARS) docker compose --env-file .env down
logs:
	$(ENV_VARS) docker compose logs -f -t
ps:
	$(ENV_VARS) docker ps --filter name=^/(({}.env._this._tag))