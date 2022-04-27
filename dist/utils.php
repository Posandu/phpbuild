<?php /* 51b626a75598c87e2fad1e05cd81e311 */ ?> 
 <?php
function js_file($file)
{
    $file = "../src/js/$file.js";

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
    $file = "../src/scss/$file.scss";

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

/* @phpbuild remove */
function hot_reload()
{
    ob_start();
    $port = 5426;
?>
    <script>
        (_ => {
            let error = false;

            setInterval(() => {
                fetch("//localhost:<?= $port ?>")
                    .then(res => res.text())
                    .then(res => {
                        if (res != localStorage.getItem("_____hot_reload_data")) {
                            window.location.reload();
                        }

                        localStorage.setItem("_____hot_reload_data", res);
                    }).catch(err => {
                        if (!error) {
                            error = true;
                            alert("Hot reload failed. Please make sure you have a server running on port <?= $port ?>.");
                        }
                    });

            }, 1000);
        })()
    </script>
<?php
    $html = ob_get_clean();
    echo $html;
}
/* @phpbuild remove end */