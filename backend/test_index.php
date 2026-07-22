<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$user = App\Models\User::where("role", "admin")->first();
$request = Illuminate\Http\Request::create('/api/v1/admin/layaways', 'GET', ['page' => 1]);
$request->setUserResolver(function() use ($user) { return $user; });

$response = $kernel->handle($request);
echo $response->getContent();
