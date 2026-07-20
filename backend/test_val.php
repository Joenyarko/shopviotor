<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$user = App\Models\User::first();
$cat = App\Models\Category::first();

$request = Illuminate\Http\Request::create('/api/v1/sell-requests', 'POST', [
    'category_id' => $cat->uuid,
    'item_name' => 'Test',
    'description' => 'Test description',
    'condition' => 'new',
    'asking_price' => 100,
]);
$request->headers->set('Accept', 'application/json');
$request->setUserResolver(function() use ($user) { return $user; });

$response = $kernel->handle($request);
echo "STATUS: " . $response->getStatusCode() . "\n";
echo $response->getContent() . "\n";
