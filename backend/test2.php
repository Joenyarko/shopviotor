<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $repo = app('App\Repositories\ProductRepository');
    $products = $repo->getAdminProducts(15, [], ['category', 'brand']);
    $data = App\Http\Resources\ProductResource::collection($products)->response()->getData(true);
    echo "Success\n";
} catch (\Throwable $e) {
    echo $e->getMessage() . "\n";
}
