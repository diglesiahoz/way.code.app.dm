<?php

/**
 * @file
 * Load environment variables from the .env file.
 */

use Symfony\Component\Dotenv\Dotenv;

try {
  (new Dotenv())->usePutenv()->bootEnv(DRUPAL_ROOT . '/../../.env', 'dev', ['test'], TRUE);
} catch (Exception $e) {
  if (isset($_ENV['APP_ENV']) && $_ENV['APP_ENV'] === 'dev') {
    error_log('Error cargando el archivo .env: ' . $e->getMessage());
  }
}
