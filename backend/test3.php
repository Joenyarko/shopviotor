<?php

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $user = App\Models\User::first();
    $request = Illuminate\Http\Request::create('/api/v1/admin/products', 'GET');
    $request->setUserResolver(function () use ($user) {
        return $user;
    });
    
    $controller = app('App\Http\Controllers\Api\V1\Admin\ProductController');
    $response = $controller->index($request);
    echo $response->getContent();
} catch (\Throwable $e) {
    echo $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
