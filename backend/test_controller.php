<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$user = App\Models\User::where("role", "admin")->first();
$request = Illuminate\Http\Request::create('/api/v1/admin/layaways', 'GET', ['page' => 1]);
$request->setUserResolver(function() use ($user) { return $user; });
// we need to act as api user to bypass auth middleware redirect?
// Actually just executing the controller directly is easier.

$controller = app()->make(\App\Http\Controllers\Api\V1\Admin\LayawayController::class);
$response = $controller->index($request);
echo $response->getContent();
