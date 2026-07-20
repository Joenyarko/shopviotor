<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$user = App\Models\User::where('role', 'admin')->first();
$req = App\Models\SellRequest::first();

if(!$req) { echo "No request"; exit; }

$request = Illuminate\Http\Request::create('/api/v1/admin/sell-requests/' . $req->uuid . '/messages', 'POST', [
    'body' => 'Test message from admin',
]);
$request->headers->set('Accept', 'application/json');
$request->setUserResolver(function() use ($user) { return $user; });

$response = $kernel->handle($request);
echo "STATUS: " . $response->getStatusCode() . "\n";
echo $response->getContent() . "\n";
