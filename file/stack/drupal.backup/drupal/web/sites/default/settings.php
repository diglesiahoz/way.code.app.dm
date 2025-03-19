<?php

###################################
######### Custom Settings #########
###################################

$databases['default']['default'] = [
  'database' => getenv('APPSETTING_SERVICE_DB_NAME'),
  'username' => getenv('APPSETTING_SERVICE_DB_USER'),
  'password' => getenv('APPSETTING_SERVICE_DB_PASS'),
  'prefix' => '',
  'host' => getenv('APPSETTING_SERVICE_DB_HOST_SV'),
  'port' => '3306',
  'isolation_level' => 'READ COMMITTED',
  'driver' => 'mysql',
  'namespace' => 'Drupal\\mysql\\Driver\\Database\\mysql',
  'autoload' => 'core/modules/mysql/src/Driver/Database/mysql/',
];

$settings['hash_salt'] = 'xzVKFkjoGUynBdCznhqduwohsJIjcAEjoLfcxTCVhlnmzMilegReTIWWJwCvDgFR';

// This will prevent Drupal from setting read-only permissions on sites/default.
$settings['skip_permissions_hardening'] = TRUE;

// This will ensure the site can only be accessed through the intended host
// names. Additional host patterns can be added for custom configurations.
$settings['trusted_host_patterns'] = ['.*'];

// Don't use Symfony's APCLoader. ddev includes APCu; Composer's APCu loader has
// better performance.
$settings['class_loader_auto_detect'] = FALSE;


# Path
  $base_path = $app_root . '/' . $site_path;
  $settings['file_public_path'] = getenv('APPSETTING_SERVICE_WWW_DRUPAL_FILE_SYSTEM_PUBLIC_PATH');
  $settings['file_private_path'] = getenv('APPSETTING_SERVICE_WWW_DRUPAL_FILE_SYSTEM_PRIVATE_PATH');
  $settings['file_temp_path'] = getenv('APPSETTING_SERVICE_WWW_DRUPAL_FILE_SYSTEM_TEMP_PATH');
  $settings['config_sync_directory'] = getenv('APPSETTING_SERVICE_WWW_DRUPAL_FILE_SYSTEM_CONFIG_PATH');

# Load env services
  $env_services = $base_path . '/services.' . getenv('APPSETTING_ENV') . '.php';
  if (file_exists($env_services)) {
    $settings['container_yamls'][] = $env_services;
  }

# Error level
  if (!empty(getenv('APPSETTING_SERVICE_WWW_DRUPAL_ERROR_LEVEL'))) {
    # error_level: hide, verbose, all
    $config['system.logging']['error_level'] = getenv('APPSETTING_SERVICE_WWW_DRUPAL_ERROR_LEVEL');
  }

# Extra
  // $settings['extension_discovery_scan_tests'] = FALSE;
  // $settings['rebuild_access'] = TRUE;
  // $settings['skip_permissions_hardening'] = TRUE;

# Debug
if (getenv('APPSETTING_DEV') == "true") {
  # Performance
    $config['system.performance']['css']['preprocess'] = FALSE;
    $config['system.performance']['js']['preprocess'] = FALSE;
  # Development services
    $env_development_services = $app_root . '/sites/development.services.' . getenv('APPSETTING_ENV') . '.yml';
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
}

# Environment setting
  switch (getenv('APPSETTING_ENV')) {
    case 'local':
      # Environment indicator
        $config['environment_indicator.indicator']['fg_color'] = '#b8b8b8';
        $config['environment_indicator.indicator']['bg_color'] = '#006803';
      # OneTrust
        $config['gdpr_onetrust.settings']['gdpr_onetrust_compliance_uuid'] = '';
        $config['gdpr_onetrust.settings']['gdpr_onetrust_compliance_environment'] = '';
        $config['gdpr_onetrust.settings']['gdpr_onetrust_compliance_opt_out'] = '';
      # Mailhog
        $config['symfony_mailer_lite.settings']['default_transport'] = 'smtp';
        $config['symfony_mailer_lite.symfony_mailer_lite_transport.smtp']['configuration']['user'] = '';
        $config['symfony_mailer_lite.symfony_mailer_lite_transport.smtp']['configuration']['pass'] = '';
        $config['symfony_mailer_lite.symfony_mailer_lite_transport.smtp']['configuration']['host'] = getenv('APPSETTING_SERVICE_MAILHOG_HOST_SV');
        $config['symfony_mailer_lite.symfony_mailer_lite_transport.smtp']['configuration']['port'] = '1025';
      # File system
        # $config['system.file']['default_scheme'] = 'public';
        # $config['system.file']['file_default_scheme'] = 'windowsazurestorage';
      # # PHP
      #   ini_set('memory_limit', '6096M');
      #   ini_set('max_execution_time', 300);
      #   ini_set('max_input_vars', '2000');
      # # Memcache
      #   $settings['memcache']['debug'] = FALSE;
      #   $settings['memcache']['key_prefix'] = 'memora_'.getenv('APPSETTING_ENV'); 
      #   $settings['memcache']['servers'] = ['memora-memcached:11211' => 'default']; // ['127.0.0.1:11211' => 'default']
      #   $settings['memcache']['bins'] = ['default' => 'default'];
      #   $settings['cache']['default'] = 'cache.backend.memcache';
      # APCu
        $settings['cache']['bins']['bootstrap'] = 'cache.backend.chainedfast';
        $settings['cache']['bins']['discovery'] = 'cache.backend.chainedfast';
      break;
    case 'pre':
    case 'prod':
      /*
      # Trusted host patterns
        $trusted_host_patterns = [];
        $trusted = explode(";", getenv('APPSETTING_HOST_NAME'));
        foreach ($trusted as $value) {
          $trusted_host_patterns[] = "^" . preg_replace('/\./', '\\.', $value) . "$";
        }
        $settings['trusted_host_patterns'] = $trusted_host_patterns;
      # Database
        $databases['default']['default'] = [
          'database' =>  getenv('APPSETTING_SERVICE_DB_NAME'),
          'username' => getenv('APPSETTING_SERVICE_DB_USER'),
          'password' => getenv('APPSETTING_SERVICE_DB_PASS'),
          'prefix' => getenv('APPSETTING_SERVICE_DB_PREFIX'),
          'host' => getenv('APPSETTING_SERVICE_DB_HOST'),
          'port' => getenv('APPSETTING_SERVICE_DB_PORT'),
          'namespace' => 'Drupal\\Core\\Database\\Driver\\mysql',
          'driver' => 'mysql',
          'pdo' => [
            PDO::MYSQL_ATTR_SSL_CA => 'sites/default/azureCA.pem', 
          ],
          'init_commands' => [
            'isolation_level' => 'SET SESSION TRANSACTION ISOLATION LEVEL READ COMMITTED',
          ],
        ];
      # Environment indicator
        if ($env == "pre") {
            $config['environment_indicator.indicator']['fg_color'] = '#b8b8b8';
            $config['environment_indicator.indicator']['bg_color'] = '#4B0085';
        }
        if ($env == "prod") {
            $config['environment_indicator.indicator']['fg_color'] = '#b8b8b8';
            $config['environment_indicator.indicator']['bg_color'] = '#850e00';
        }
      # File system
        # $config['system.file']['default_scheme'] = 'public';
        # $config['system.file']['file_default_scheme'] = 'windowsazurestorage';
      # OneTrust
        $config['gdpr_onetrust.settings']['gdpr_onetrust_compliance_uuid'] = '';
        $config['gdpr_onetrust.settings']['gdpr_onetrust_compliance_environment'] = '';
        $config['gdpr_onetrust.settings']['gdpr_onetrust_compliance_opt_out'] = '';
      # Performance
        $config['system.performance']['css']['preprocess'] = TRUE;
        $config['system.performance']['js']['preprocess'] = TRUE;
      # PHP
        ini_set('memory_limit', '1024M');
        ini_set('max_execution_time', 300);
        ini_set('max_input_vars', '2000');
      # Redis
        #  if (getenv('APPSETTING_SERVICE_REDIS_APP_ENABLED') && extension_loaded('redis')) {
        #    $class_loader->addPsr4('Drupal\\redis\\', 'modules/contrib/redis/src');
        #    //$settings['redis.connection']['ssl'] = ['cafile' => 'sites/default/azureCA.pem', 'verify_peer' => false];
        #    $settings['redis.connection']['interface'] = getenv('APPSETTING_SERVICE_REDIS_APP_INTERFACE') ?: 'Predis';
        #    $settings['redis.connection']['scheme']    = getenv('APPSETTING_SERVICE_REDIS_APP_SCHEME') ?: 'tcp';
        #    $settings['redis.connection']['host']      = getenv('APPSETTING_SERVICE_REDIS_APP_HOST') ?: 'localhost';
        #    $settings['redis.connection']['port']      = getenv('APPSETTING_SERVICE_REDIS_APP_PORT') ?: 6379;
        #    $settings['redis.connection']['password']  = getenv('APPSETTING_SERVICE_REDIS_APP_KEY') ?: NULL;
        #    $settings['redis.connection']['persistent'] = TRUE;
        #    $settings['cache_prefix'] = getenv('APPSETTING_SERVICE_REDIS_APP_PREFIX').'_';
        #    //print "<pre>" . print_r($settings['redis.connection']) . print "</pre>";
        #
        #    $settings['redis_flush_mode'] = 1;
        #    //$settings['redis_perm_ttl'] = '1 day';
        #    //$settings['redis_perm_ttl_cache_field'] = 86400; // 24 horas
        #    $settings['redis.settings']['perm_ttl'] = 1209600; // 14 dias
        #    $settings['redis.settings']['perm_ttl_cache_field'] = 1209600; // 24 horas
        #    
        #    $settings['container_yamls'][] = 'modules/contrib/redis/example.services.yml';
        #    $settings['container_yamls'][] = 'modules/contrib/redis/redis.services.yml'; 
        #
        #    $settings['cache']['bins']['form'] = 'cache.backend.database';
        #    $settings['cache']['bins']['entity'] = 'cache.backend.database';
        #    $settings['cache']['bins']['data'] = 'cache.backend.database';
        #    $settings['cache']['bins']['dynamic_page_cache'] = 'cache.backend.redis';      
        #    $settings['cache']['bins']['render'] = 'cache.backend.redis';      
        #    $settings['cache']['bins']['page'] = 'cache.backend.redis';
        #  }
      */
      break;
  }

# # Windows Azure Storage
#   $config['windows_azure_storage.settings']['account'] = getenv('APPSETTING_WINDOWS_AZURE_STORAGE_ACCOUNT');
#   $config['windows_azure_storage.settings']['primary_key'] = getenv('APPSETTING_WINDOWS_AZURE_STORAGE_PRIMARY_KEY');
#   $config['windows_azure_storage.settings']['blob_container'] = getenv('APPSETTING_WINDOWS_AZURE_STORAGE_BLOB_CONTAINER');
#   $config['windows_azure_storage.settings']['use_cdn'] = getenv('APPSETTING_WINDOWS_AZURE_STORAGE_USE_CDN');
#   $config['windows_azure_storage.settings']['cdn_url'] = getenv('APPSETTING_WINDOWS_AZURE_STORAGE_CDN_URL');

# Load settings local
  $env_settings = $base_path . '/settings.' . getenv('APPSETTING_ENV') . '.php';
  if (file_exists($env_settings)) {
    include $env_settings;
  }

# Permissions-Policy header is added by default to disable a method of browser-based user tracking
# Ver: https://www.drupal.org/project/drupal/issues/3209628
# Para quitar warning en consola de navegador (Error with Permissions-Policy header: Unrecognized feature: 'interest-cohort'.) 
# Aplicar: $settings['block_interest_cohort'] = FALSE;

$settings['state_cache'] = TRUE;