<?php 
include "utils.php";
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <?= scss_file("styles"); ?>
</head>

<body>
    <h1>
        Welcome to PHPbuild!
    </h1>
    <p>
        Edit <code>src/php/index.php</code> and see the changes reflected here.
    </p>

    <button id="test">
        Click me!
    </button>
    
    <?php
    hot_reload();
    js_file("index");
    ?>
</body>

</html>