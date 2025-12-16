CREATE USER IF NOT EXISTS ((appsetting.service.sonardb.user)) WITH PASSWORD '((appsetting.service.sonardb.pass))';
CREATE DATABASE IF NOT EXISTS ((appsetting.service.sonardb.name)) OWNER ((appsetting.service.sonardb.user));
GRANT ALL PRIVILEGES ON DATABASE ((appsetting.service.sonardb.name)) TO ((appsetting.service.sonardb.user));
