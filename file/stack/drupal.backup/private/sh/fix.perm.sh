if [ ! -d ./drupal/web ]
then
    echo "[error] Not found ./drupal/web"
    exit
fi

echo "Fix perm..."

# echo "750 ./drupal/web -type d";
# find ./drupal/web -type d -not -perm 750 -not -path './drupal/web/sites/*/files/*' -exec chmod 750 '{}' \;
# 
# echo "640 ./drupal/web -type f";
# find ./drupal/web -type f -not -perm 640 -not -path './drupal/web/sites/*/files/*' -exec chmod 640 '{}' \;
# 
# echo "770 ./drupal/web/sites/*/files -type d";
# find ./drupal/web/sites/*/files -type d -not -perm 770 -exec chmod 770 '{}' \;
# 
# echo "660 ./drupal/web/sites/*/files -type f";
# find ./drupal/web/sites/*/files -type f -not -perm 660 -exec chmod 660 '{}' \;

echo "440 ./drupal/web/sites/* -type f settings.php";
find ./drupal/web/sites/* -type f -name "settings.php" -not -perm 440 -exec chmod 440 '{}' \;

echo "440 ./drupal/web/sites/* -type f settings.local.php";
find ./drupal/web/sites/* -type f -name "settings.local.php" -not -perm 440 -exec chmod 440 '{}' \;

echo "Done!"
