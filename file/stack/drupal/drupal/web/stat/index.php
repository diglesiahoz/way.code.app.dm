<style>
body {
  text-align: center;
}
table {
  margin: 0 auto;
  font-family: monospace;
  font-size: 1.5em;
}
.success {
  background: #a0dba0;
  text-align: center;
}
.warning {
  background: #ffe215;
  text-align: center;
}
</style>
<?php


if (
  isset($_SERVER['APPSETTING_DB_HOST']) && 
  isset($_SERVER['APPSETTING_DB_USER']) && 
  isset($_SERVER['APPSETTING_DB_PASS']) && 
  isset($_SERVER['APPSETTING_DB_NAME'])
  ) {
  $con = mysqli_init();
  // mysqli_options($con, MYSQLI_INIT_COMMAND, "SET AUTOCOMMIT=0");
  // mysqli_options($con, MYSQLI_OPT_CONNECT_TIMEOUT, 5);
  try {
    mysqli_ssl_set($con, NULL, NULL, "../../deployment/core/recipes/azure.linux/azureCA/" . $_SERVER['DB_CERTNAME'], NULL, NULL);
    mysqli_real_connect($con, $_SERVER['APPSETTING_DB_HOST'], $_SERVER['APPSETTING_DB_USER'], $_SERVER['APPSETTING_DB_PASS'], $_SERVER['APPSETTING_DB_NAME'], 3306, MYSQLI_CLIENT_SSL);
    if (mysqli_connect_errno()) {
      $mysql_check = "<td colspan='2' class='warning'>Database connection failure: " . mysqli_connect_error() . "</td>";
    }
    $mysql_check = "<td colspan='2' class='success'>Successful database connection: " . mysqli_get_host_info($con) . "</td>";
    mysqli_close($con);
  } catch (Exception $e) {
    $mysql_check = "<td colspan='2' class='warning'>Database connection failure: " . $e->getMessage() . "</td>";
  }
}

echo '<h2>SUMMARY</h2>';
echo '<table>';
if (
  isset($_SERVER['APPSETTING_DB_HOST']) && 
  isset($_SERVER['APPSETTING_DB_USER']) && 
  isset($_SERVER['APPSETTING_DB_PASS']) && 
  isset($_SERVER['APPSETTING_DB_NAME'])
  ) {
  echo '<tr>' . $mysql_check . "</tr>";
}
$info_http_host = $_SERVER['HTTP_HOST'] ?? null;
echo '<tr><td class="e">HTTP_HOST</td><td class="v">' . $info_http_host . "</td></tr>";
$info_host_name = $_SERVER['HOST_NAME'] ?? null;
echo '<tr><td class="e">HOST_NAME</td><td class="v">' . $info_host_name . "</td></tr>";
$info_remote_addr = $_SERVER['REMOTE_ADDR'] ?? null;
echo '<tr><td class="e">REMOTE_ADDR</td><td class="v">' . $info_remote_addr . "</td></tr>";
$info_http_x_forwarded_for = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? null;
echo '<tr><td class="e">HTTP_X_FORWARDED_FOR</td class="v"><td class="v">' . $info_http_x_forwarded_for . "</td></tr>";
$info_http_x_forwarded_proto = $_SERVER['HTTP_X_FORWARDED_PROTO'] ?? null;
echo '<tr><td class="e">HTTP_X_FORWARDED_PROTO</td><td class="v">' . $info_http_x_forwarded_proto . "</td></tr>";
$info_http_x_forwarded_host = $_SERVER['HTTP_X_FORWARDED_HOST'] ?? null;
echo '<tr><td class="e">HTTP_X_FORWARDED_HOST</td><td class="v">' . $info_http_x_forwarded_host . "</td></tr>";
$info_server_addr = $_SERVER['SERVER_ADDR'] ?? null;
echo '<tr><td class="e">SERVER_ADDR</td><td class="v">' . $info_server_addr . "</td></tr>";
$info_server_port = $_SERVER['SERVER_PORT'] ?? null;
echo '<tr><td class="e">SERVER_PORT</td><td class="v">' . $info_server_port . "</td></tr>";

echo '</table>';
echo '<table>';
echo '<h2>$_SERVER</h2>';
ksort($_SERVER);
foreach ($_SERVER as $key => $value) {
  echo '</tr><td class="e">' . $key . '</td><td class="v">' . $value . '</td>';
}
echo '</table>';

echo '<h2>PHP INFO</h2>';
phpinfo();
?>