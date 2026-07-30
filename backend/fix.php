<?php
$files = glob(__DIR__ . "/app/Models/*.php");
foreach ($files as $file) {
    $content = file_get_contents($file);
    $content = preg_replace("/asset\(\x27storage\/\x27 \. \\$this->([a-zA-Z0-9_]+)\)/", "(\Illuminate\Support\Str::startsWith(\$this->$1, [\x27http://\x27, \x27https://\x27]) ? \$this->$1 : asset(\x27storage/\x27 . \$this->$1))", $content);
    $content = preg_replace("/asset\(\x27storage\/\x27 \. \\$primary->path\)/", "(\Illuminate\Support\Str::startsWith(\$primary->path, [\x27http://\x27, \x27https://\x27]) ? \$primary->path : asset(\x27storage/\x27 . \$primary->path))", $content);
    $content = preg_replace("/asset\(\x27storage\/\x27 \. \\$path\)/", "(\Illuminate\Support\Str::startsWith(\$path, [\x27http://\x27, \x27https://\x27]) ? \$path : asset(\x27storage/\x27 . \$path))", $content);
    file_put_contents($file, $content);
}
$files = glob(__DIR__ . "/app/Http/Resources/*.php");
foreach ($files as $file) {
    $content = file_get_contents($file);
    $content = preg_replace("/asset\(\x27storage\/\x27 \. \\$path\)/", "(\Illuminate\Support\Str::startsWith(\$path, [\x27http://\x27, \x27https://\x27]) ? \$path : asset(\x27storage/\x27 . \$path))", $content);
    file_put_contents($file, $content);
}
echo "Done!\n";

