<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\SellRequest;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\V1\SellRequestController;

class TestChatCustomer extends Command
{
    protected $signature = 'test:chat-customer';

    public function handle()
    {
        $sellReq = SellRequest::first();
        $customer = User::find($sellReq->user_id);

        $request = Request::create('/test', 'POST', ['body' => 'Hello from customer']);
        $request->setUserResolver(fn() => $customer);

        $controller = app(SellRequestController::class);
        
        try {
            $response = $controller->sendMessage($request, $sellReq->uuid);
            $this->info($response->getContent());
        } catch (\Exception $e) {
            $this->error($e->getMessage() . " at " . $e->getFile() . ":" . $e->getLine());
        }
    }
}
