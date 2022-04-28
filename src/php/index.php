<?php
require_once("db.php");
include "utils.php";


$todos = DB::query("SELECT * FROM todos");
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

    <h2>
        Todo app
    </h2>

    <div class="flex">
        <input type="text" class="input" id="title" placeholder="Todo title">
        <button id="add">
            Add todo
        </button>
    </div>

    <div id="todos"></div>

    <?php
    hot_reload();
    js_file("index");
    ?>
</body>

</html>