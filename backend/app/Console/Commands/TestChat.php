<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\SellRequest;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\V1\Admin\SellRequestController;

class TestChat extends Command
{
    protected $signature = 'test:chat';

    public function handle()
    {
        $admin = User::where('role', 'admin')->first();
        $sellReq = SellRequest::first();

        $request = Request::create('/test', 'POST', ['body' => 'Hello']);
        $request->setUserResolver(fn() => $admin);

        $controller = app(SellRequestController::class);
        
        try {
            $response = $controller->sendMessage($request, $sellReq->uuid);
            $this->info($response->getContent());
        } catch (\Exception $e) {
            $this->error($e->getMessage() . " at " . $e->getFile() . ":" . $e->getLine());
        }
    }
}
