<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $repo = app('App\Repositories\ProductRepository');
    $repo->getAdminProducts(15, [], ['category', 'brand']);
    echo "Success\n";
} catch (\Throwable $e) {
    echo $e->getMessage() . "\n";
}
