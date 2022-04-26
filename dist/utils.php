<?php /* 83ea97dfef229e10f975b9cf00739f3b */ ?>
 <?php
    function js_file($file)
    {
        $file = "../js/$file.js";

        if (file_exists($file)) {
            // If file starts with _ or does not end with .scss, throw exception.
            if (substr($file, 0, 1) == "_" || substr($file, -3) != ".js") {
                throw new Exception("Invalid file name: $file");
            }

            $hash = md5_file($file);
            $hash = substr($hash, 0, 8);

            echo "<script src=\"$hash.js\" data-src=\"$file\"></script>";
        } else {
            throw new Exception("File not found: $file");
        }
    }

    function scss_file($file)
    {
        $file = "../scss/$file.scss";

        if (file_exists($file)) {
            // If file starts with _ or does not end with .scss, throw exception.
            if (substr($file, 0, 1) == "_" || substr($file, -5) != ".scss") {
                throw new Exception("Invalid file name: $file");
            }

            $hash = md5_file($file);
            $hash = substr($hash, 0, 8);

            echo "<link rel=\"stylesheet\" href=\"$hash.css\" data-src=\"$file\">";
        } else {
            throw new Exception("File not found: $file");
        }
    }
