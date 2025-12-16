<?php

# ----------
# Appsetting
# ----------
  $APPSETTING_KEY = (!empty(getenv('APPSETTING_KEY'))) ? getenv('APPSETTING_KEY') : '';
  $APPSETTING_ENV = (!empty(getenv('APPSETTING_ENV'))) ? getenv('APPSETTING_ENV') : ''; // local | pre | prod
  $APPSETTING_DEV = (!empty(getenv('APPSETTING_DEV'))) ? getenv('APPSETTING_DEV'): false; // true | false
  $APPSETTING_SERVICE_DB_NAME = (!empty(getenv('APPSETTING_SERVICE_DB_NAME'))) ? getenv('APPSETTING_SERVICE_DB_NAME') : '';
  $APPSETTING_SERVICE_DB_USER = (!empty(getenv('APPSETTING_SERVICE_DB_USER'))) ? getenv('APPSETTING_SERVICE_DB_USER') : '';
  $APPSETTING_SERVICE_DB_PASS = (!empty(getenv('APPSETTING_SERVICE_DB_PASS'))) ? getenv('APPSETTING_SERVICE_DB_PASS') : '';
  $APPSETTING_SERVICE_DB_HOST = (!empty(getenv('APPSETTING_SERVICE_DB_HOST'))) ? getenv('APPSETTING_SERVICE_DB_HOST') : '';
  $APPSETTING_SERVICE_WWW_DOMAIN = (!empty(getenv('APPSETTING_SERVICE_WWW_DOMAIN'))) ? getenv('APPSETTING_SERVICE_WWW_DOMAIN').";" : ''; // www.example.com;example.com;
  $APPSETTING_SERVICE_WWW_DRUPAL_FILE_SYSTEM_PUBLIC_PATH = (!empty(getenv('APPSETTING_SERVICE_WWW_DRUPAL_FILE_SYSTEM_PUBLIC_PATH'))) ? getenv('APPSETTING_SERVICE_WWW_DRUPAL_FILE_SYSTEM_PUBLIC_PATH') : '';
  $APPSETTING_SERVICE_WWW_DRUPAL_FILE_SYSTEM_PRIVATE_PATH = (!empty(getenv('APPSETTING_SERVICE_WWW_DRUPAL_FILE_SYSTEM_PRIVATE_PATH'))) ? getenv('APPSETTING_SERVICE_WWW_DRUPAL_FILE_SYSTEM_PRIVATE_PATH') : '';
  $APPSETTING_SERVICE_WWW_DRUPAL_FILE_SYSTEM_TEMP_PATH = (!empty(getenv('APPSETTING_SERVICE_WWW_DRUPAL_FILE_SYSTEM_TEMP_PATH'))) ? getenv('APPSETTING_SERVICE_WWW_DRUPAL_FILE_SYSTEM_TEMP_PATH') : '';
  $APPSETTING_SERVICE_WWW_DRUPAL_FILE_SYSTEM_CONFIG_PATH = (!empty(getenv('APPSETTING_SERVICE_WWW_DRUPAL_FILE_SYSTEM_CONFIG_PATH'))) ? getenv('APPSETTING_SERVICE_WWW_DRUPAL_FILE_SYSTEM_CONFIG_PATH') : '';
  $APPSETTING_SERVICE_MEMCACHED_HOST = (!empty(getenv('APPSETTING_SERVICE_MEMCACHED_HOST'))) ? getenv('APPSETTING_SERVICE_MEMCACHED_HOST') : '';
  $APPSETTING_SERVICE_REDIS_HOST = (!empty(getenv('APPSETTING_SERVICE_REDIS_HOST'))) ? getenv('APPSETTING_SERVICE_REDIS_HOST') : '';
  $APPSETTING_SERVICE_MAILHOG_HOST = (!empty(getenv('APPSETTING_SERVICE_MAILHOG_HOST'))) ? getenv('APPSETTING_SERVICE_MAILHOG_HOST') : '';
  $APPSETTING_SERVICE_SOLR_HOST = (!empty(getenv('APPSETTING_SERVICE_SOLR_HOST'))) ? getenv('APPSETTING_SERVICE_SOLR_HOST') : '';

# --------
# Database
# --------
  $databases['default']['default'] = [
    'database' => $APPSETTING_SERVICE_DB_NAME,
    'username' => $APPSETTING_SERVICE_DB_USER,
    'password' => $APPSETTING_SERVICE_DB_PASS,
    'prefix' => '',
    'host' => $APPSETTING_SERVICE_DB_HOST,
    'port' => '3306',
    'isolation_level' => 'READ COMMITTED',
    'driver' => 'mysql',
    'namespace' => 'Drupal\\mysql\\Driver\\Database\\mysql',
    'autoload' => 'core/modules/mysql/src/Driver/Database/mysql/',
  ];

# ----
# Path
# ----
  $base_path = $app_root . '/' . $site_path;
  $settings['file_public_path'] = $APPSETTING_SERVICE_WWW_DRUPAL_FILE_SYSTEM_PUBLIC_PATH;
  $settings['file_private_path'] = $APPSETTING_SERVICE_WWW_DRUPAL_FILE_SYSTEM_PRIVATE_PATH;
  $settings['file_temp_path'] = $APPSETTING_SERVICE_WWW_DRUPAL_FILE_SYSTEM_TEMP_PATH;
  $settings['config_sync_directory'] = $APPSETTING_SERVICE_WWW_DRUPAL_FILE_SYSTEM_CONFIG_PATH;

# -----------------
# Load env services
# -----------------
  $env_services = $base_path . '/services.' . $APPSETTING_ENV . '.php';
  if (file_exists($env_services)) {
    $settings['container_yamls'][] = $env_services;
  }

# -----------
# Site custom
# -----------
  $settings['hash_salt'] = 'xzVKFkjoGUynBdCznhqduwohsJIjcAEjoLfcxTCVhlnmzMilegReTIWWJwCvDgFR';
  $settings['update_free_access'] = FALSE;
  $settings['file_scan_ignore_directories'] = [
    'node_modules',
    'bower_components',
  ];
  $settings['entity_update_batch_size'] = 50;
  $settings['entity_update_backup'] = TRUE;
  $settings['migrate_node_migrate_type_classic'] = FALSE;
  $settings['skip_permissions_hardening'] = TRUE; # This will prevent Drupal from setting read-only permissions on sites/default.

# --------
# Cron key
# --------
  $settings['cron_key'] = 'NtAjOX5QlhMyqtrgcoQ5dTKebL1gwz8ufD5SMqFxLrE';
  $settings['encrypt_key_hash'] = '888a20820f2cd2e7fd64fd8f24b71608';

# ----------------------------------------------------------------------------------
# Trusted host patterns
#  · This will ensure the site can only be accessed through the intended host names.
#  · Additional host patterns can be added for custom configurations.
# ----------------------------------------------------------------------------------
  if (empty($APPSETTING_SERVICE_WWW_DOMAIN) || $APPSETTING_ENV == 'local') {
    $settings['trusted_host_patterns'] = ['.*'];
  } else {
    $trusted_host_patterns = [];
    $trusted = explode(";", $APPSETTING_SERVICE_WWW_DOMAIN);
    foreach ($trusted as $value) {
      $trusted_host_patterns[] = "^" . preg_replace('/\./', '\\.', $value) . "$";
    }
    $settings['trusted_host_patterns'] = $trusted_host_patterns;
  }

# -------------------------------------------------------------------------------
# Solr config
#  · Configuration: https://www.youtube.com/watch?v=m0cF_XbC8ek
#  · Drush: 
#     - way drush cget search_api.server.solr --include-overridden
#     - way drush cget search_api.server.solr backend_config --include-overridden
#  · Drupal (solr): /config/search/search-api/server/solr/edit
#  · Drupal (index): /admin/config/search/search-api/index/index
# -------------------------------------------------------------------------------
$config['search_api.server.solr'] = [
  'backend_config' => [
    'connector_config' => [
      'scheme' => 'http',
      'host' => $APPSETTING_SERVICE_SOLR_HOST,
      'path' => '/',
      'core' => $APPSETTING_SERVICE_SOLR_HOST,
      'port' => '8983',
    ],
  ],
];

# ----------
# Perfomance
# ----------
  if ($APPSETTING_DEV == "true") {
    # Performance
      $config['system.performance']['css']['preprocess'] = FALSE;
      $config['system.performance']['js']['preprocess'] = FALSE;
    # Advagg
      $config['advagg.settings']['enabled'] = FALSE;
    # Development services
      $env_development_services = $app_root . '/sites/development.services.' . $APPSETTING_ENV . '.yml';
      if (file_exists($env_development_services)) {
        $settings['container_yamls'][] = $env_development_services;
        # Cache
          $cache_bins = [
            'bootstrap',
            'config',
            'data',
            'default',
            'discovery',
            'dynamic_page_cache',
            'entity',
            'menu',
            'migrate',
            'page',
            'render',
            'rest',
            'static',
            'toolbar'
          ];
          foreach ($cache_bins as $bin) {
            $settings['cache']['bins'][$bin] = 'cache.backend.null';
          }
          $settings['cache']['bins']['discovery_migration'] = 'cache.backend.memory';
      }
  } else {
    # ---------------------
    # Redis – Bins críticos
    # ---------------------
    if (!empty($APPSETTING_SERVICE_REDIS_HOST)) {
      # Redis conection
      $settings['redis.connection']['interface'] = 'PhpRedis';
      $settings['redis.connection']['host'] = $APPSETTING_SERVICE_REDIS_HOST;
      $settings['redis.connection']['port'] = 6379;
      # -----------------------------------
      # Load services from the Redis module
      # -----------------------------------
      if (file_exists(DRUPAL_ROOT . '/modules/contrib/redis/redis.services.yml')) {
        $settings['container_yamls'][] = DRUPAL_ROOT . '/modules/contrib/redis/redis.services.yml';
      }
      if (file_exists(DRUPAL_ROOT . '/sites/default/redis.services.yml')) {
        $settings['container_yamls'][] = DRUPAL_ROOT . '/sites/default/redis.services.yml';
      }
      # ----------------------
      # Critical bins in Redis
      # ----------------------
      $settings['cache']['bins']['config'] = 'cache.backend.redis';
      $settings['cache']['bins']['discovery'] = 'cache.backend.redis';
      $settings['cache']['bins']['render'] = 'cache.backend.redis';
      $settings['cache']['bins']['entity'] = 'cache.backend.redis';
      # ----------
      # Key prefix
      # ----------
      $settings['cache_prefix']['default'] = "$APPSETTING_KEY:";
      $settings['cache_prefix']['bins'] = [
        'default' => "$APPSETTING_KEY:",
        'bootstrap' => "$APPSETTING_KEY:bootstrap:",
        'config' => "$APPSETTING_KEY:config:",
      ];
      # -------------------------
      # Enable cache tag checksum
      # -------------------------
      $settings['cache']['redis']['cache_tags_checksum'] = TRUE;
    }
    # -----------------------------------
    # Memcached – Bins volátiles (página)
    # -----------------------------------
    if (!empty($APPSETTING_SERVICE_MEMCACHED_HOST)) {
      # -------------------
      # Memcached conection
      # -------------------
      $settings['memcache']['servers'] = [ $APPSETTING_SERVICE_MEMCACHED_HOST . ':11211' => 'default' ];
      $settings['memcache']['key_prefix'] = $APPSETTING_KEY . '_' . $APPSETTING_ENV;
      $settings['memcache']['stampede_protection'] = TRUE;
      # ------------------
      # Volatile bins only
      # ------------------
      $settings['cache']['bins']['dynamic_page_cache'] = 'cache.backend.memcache';
      $settings['cache']['bins']['page'] = 'cache.backend.memcache';
      # -----------------------
      # Load Memcached services
      # -----------------------
      if (file_exists(DRUPAL_ROOT . '/modules/contrib/memcache/memcache.services.yml')) {
        $settings['container_yamls'][] = DRUPAL_ROOT . '/modules/contrib/memcache/memcache.services.yml';
      }
    }
    # ---------------------------
    # APCu – cache local opcional
    # ---------------------------
    if (extension_loaded('apcu') && ini_get('apc.enabled')) {
      $settings['cache']['bins']['bootstrap'] = 'cache.backend.chainedfast';
    }
    # -------------
    # Cache default
    # -------------
    if (!empty($APPSETTING_SERVICE_REDIS_HOST)) {
      $settings['cache']['default'] = 'cache.backend.redis';
    } else {
      $settings['cache']['default'] = 'cache.backend.database';
    }
    # --------------------------
    # Opcional: logging de cache
    # --------------------------
    # $settings['cache']['bins']['cache_log'] = 'cache.backend.database';
  }

# -------------------
# Environment setting
# -------------------
  switch ($APPSETTING_ENV) {
    case 'local':
      # ---------------------
      # Environment indicator
      # ---------------------
        $config['environment_indicator.indicator']['fg_color'] = '#b8b8b8';
        $config['environment_indicator.indicator']['bg_color'] = '#006803';
      # --------
      # OneTrust
      # --------
        $config['gdpr_onetrust.settings']['gdpr_onetrust_compliance_uuid'] = '';
        $config['gdpr_onetrust.settings']['gdpr_onetrust_compliance_environment'] = '';
        $config['gdpr_onetrust.settings']['gdpr_onetrust_compliance_opt_out'] = '';
      # -------
      # Mailhog
      # -------
        $config['symfony_mailer_lite.settings']['default_transport'] = 'smtp';
        $config['symfony_mailer_lite.symfony_mailer_lite_transport.smtp']['configuration']['user'] = '';
        $config['symfony_mailer_lite.symfony_mailer_lite_transport.smtp']['configuration']['pass'] = '';
        $config['symfony_mailer_lite.symfony_mailer_lite_transport.smtp']['configuration']['host'] = $APPSETTING_SERVICE_MAILHOG_HOST;
        $config['symfony_mailer_lite.symfony_mailer_lite_transport.smtp']['configuration']['port'] = '1025';
      break;
    case 'pre':
      # ---------------------
      # Environment indicator
      # ---------------------
        $config['environment_indicator.indicator']['fg_color'] = '#b8b8b8';
        $config['environment_indicator.indicator']['bg_color'] = '#4B0085';
      break;
    case 'prod':
      # ---------------------
      # Environment indicator
      # ---------------------
        $config['environment_indicator.indicator']['fg_color'] = '#b8b8b8';
        $config['environment_indicator.indicator']['bg_color'] = '#850e00';
      break;
  }

# -----------------
# Load env settings
# -----------------
  $env_settings = $base_path . '/settings.' . $APPSETTING_ENV . '.php';
  if (file_exists($env_settings)) {
    include $env_settings;
  }

# ----------------------------------------------------------------------------------------------------------------------------
# Permissions-Policy header is added by default to disable a method of browser-based user tracking
# See: https://www.drupal.org/project/drupal/issues/3209628
# Para quitar warning en consola de navegador (Error with Permissions-Policy header: Unrecognized feature: 'interest-cohort'.) 
# Apply: $settings['block_interest_cohort'] = FALSE;
# ----------------------------------------------------------------------------------------------------------------------------
  $settings['state_cache'] = TRUE;