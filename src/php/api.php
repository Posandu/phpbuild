<?php
require_once("db.php");
header("Content-Type: application/json");

if (isset($_GET["getTodos"])) {
    $todos = DB::query("SELECT * FROM todos");

    echo json_encode(array(
        "todos" => $todos
    ));
}
/**
 * Get single todo
 */
elseif (isset($_GET["getTodo"])) {
    $id = $_GET["getTodo"];
    $todo = DB::queryFirstRow("SELECT * FROM todos WHERE id=%i", $id);

    echo json_encode(array(
        "todo" => $todo
    ));
}
/**
 * Add a todo
 */
elseif (isset($_GET["addTodo"]) && isset($_GET["title"])) {
    $title = $_GET["title"];
    $id = sha1(rand(0, 1000000) + time());

    DB::query("INSERT INTO todos (title,id) VALUES (%s,%s)", $title, $id);

    echo json_encode(array(
        "success" => true
    ));
}
/**
 * Delete a todo
 */
elseif (isset($_GET["deleteTodo"]) && isset($_GET["id"])) {
    $id = $_GET["id"];

    DB::query("DELETE FROM todos WHERE id=%s", $id);

    echo json_encode(array(
        "success" => true
    ));
}
/**
 * Update a todo
 */
elseif (
    isset($_GET["updateTodo"]) &&
    isset($_GET["id"]) &&
    isset($_GET["title"]) &&
    isset($_GET["done"])
) {
    $id = $_GET["id"];
    $title = $_GET["title"];

    DB::insertUpdate("todos", array(
        "id" => $id,
        "title" => $title,
        "done" => $_GET["done"]
    ));

    echo json_encode(array(
        "success" => true
    ));
}
/**
 * ¯\_(ツ)_/¯
 */
else {
    echo json_encode(array(
        "success" => false
    ));
}
