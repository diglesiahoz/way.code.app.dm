CREATE DATABASE IF NOT EXISTS `((appsetting.service.db.name))` CHARACTER SET utf8 COLLATE utf8_unicode_ci;

CREATE USER IF NOT EXISTS '((appsetting.service.db.user))'@'localhost' IDENTIFIED BY '((appsetting.service.db.pass))';
GRANT ALL PRIVILEGES ON *.* TO '((appsetting.service.db.user))'@'localhost' WITH GRANT OPTION;
FLUSH PRIVILEGES;

CREATE USER IF NOT EXISTS '((appsetting.service.db.user))'@'%' IDENTIFIED BY '((appsetting.service.db.pass))';
GRANT ALL PRIVILEGES ON *.* TO '((appsetting.service.db.user))'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;

GRANT ALL PRIVILEGES on *.* TO 'root'@'localhost' WITH GRANT OPTION;
GRANT ALL PRIVILEGES on *.* TO 'root'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;




