UID = $(shell id -u)
GID = $(shell id -g)
USERNAME = $(USER)

up:
	export COMPOSE_PROJECT_NAME=(({}.env._this._tag)); export APPSETTING_ENV=(({}.env._this._env)); export APPSETTING_UID=$(UID); export APPSETTING_GID=$(GID); export APPSETTING_USER=$(USERNAME); export APPSETTING_ENV=(({}.env._this._env)); docker compose --env-file .env -f docker-compose.yml up -d --build