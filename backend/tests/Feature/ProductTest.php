<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\User;
use App\Models\Category;
use App\Enums\UserRole;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_can_view_active_products()
    {
        $category = Category::factory()->create();
        Product::factory()->count(3)->create([
            'category_id' => $category->id,
            'status'      => 'active',
        ]);

        $response = $this->getJson('/api/v1/products');

        $response->assertStatus(200)
                 ->assertJsonCount(3, 'data');
    }

    public function test_admin_can_create_product()
    {
        $admin = User::factory()->create(['role' => UserRole::Admin->value]);
        $category = Category::factory()->create();

        $response = $this->actingAs($admin)->postJson('/api/v1/admin/products', [
            'name'           => 'Test Product',
            'description'    => 'Test Description',
            'price'          => 100.00,
            'stock_quantity' => 10,
            'category_id'    => $category->id,
            'condition'      => 'new',
            'status'         => 'active',
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('products', ['name' => 'Test Product']);
    }

    public function test_customer_cannot_create_product()
    {
        $customer = User::factory()->create(['role' => UserRole::Customer->value]);
        $category = Category::factory()->create();

        $response = $this->actingAs($customer)->postJson('/api/v1/admin/products', [
            'name'           => 'Test Product',
            'description'    => 'Test Description',
            'price'          => 100.00,
            'stock_quantity' => 10,
            'category_id'    => $category->id,
            'condition'      => 'new',
            'status'         => 'active',
        ]);

        $response->assertStatus(403);
    }
}
