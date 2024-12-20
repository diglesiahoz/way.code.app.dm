<style>
body {
  background: #303030;
  font-family: sans-serif;
}
h1 {
  text-align: center;
  color: white;
}
</style>
<h1>It's works from <?php print getenv('APPSETTING_ENV'); ?>!</h1>
<?php
phpinfo();
?>
