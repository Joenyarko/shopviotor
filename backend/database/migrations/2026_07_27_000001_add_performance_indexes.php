<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Returns existing index names for a given table from information_schema.
     */
    private function existingIndexes(string $table): array
    {
        $db      = config('database.connections.mysql.database');
        $results = DB::select(
            'SELECT INDEX_NAME FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?',
            [$db, $table]
        );
        return array_map(fn($r) => $r->INDEX_NAME, $results);
    }

    private function addIndexIfMissing(Blueprint $table, string $tableName, array|string $columns, string $indexName, bool $unique = false): void
    {
        if (in_array($indexName, $this->existingIndexes($tableName))) {
            return; // Already exists — skip
        }
        $cols = (array) $columns;
        $unique ? $table->unique($cols, $indexName) : $table->index($cols, $indexName);
    }

    public function up(): void
    {
        // ─── Products ─────────────────────────────────────────────────────────
        Schema::table('products', function (Blueprint $table) {
            $this->addIndexIfMissing($table, 'products', ['status', 'is_featured'], 'idx_products_status_featured');
            $this->addIndexIfMissing($table, 'products', ['category_id', 'status'],  'idx_products_category_status');
            $this->addIndexIfMissing($table, 'products', ['store_id', 'status'],     'idx_products_store_status');
            $this->addIndexIfMissing($table, 'products', 'price',                    'idx_products_price');
            $this->addIndexIfMissing($table, 'products', 'views_count',              'idx_products_views');
        });

        // ─── Orders ───────────────────────────────────────────────────────────
        Schema::table('orders', function (Blueprint $table) {
            $this->addIndexIfMissing($table, 'orders', 'paid_at', 'idx_orders_paid_at');
        });

        // ─── Layaway Cards ────────────────────────────────────────────────────
        if (Schema::hasTable('layaway_cards')) {
            Schema::table('layaway_cards', function (Blueprint $table) {
                $this->addIndexIfMissing($table, 'layaway_cards', ['user_id', 'status'], 'idx_layaway_cards_user_status');
                $this->addIndexIfMissing($table, 'layaway_cards', 'product_id',          'idx_layaway_cards_product');
            });
        }

        // ─── Layaway Payments — unique reference to prevent replay ────────────
        if (Schema::hasTable('layaway_payments') && Schema::hasColumn('layaway_payments', 'reference')) {
            Schema::table('layaway_payments', function (Blueprint $table) {
                $this->addIndexIfMissing($table, 'layaway_payments', 'reference', 'idx_layaway_payments_ref_unique', true);
            });
        }

        // ─── Hire Purchases ───────────────────────────────────────────────────
        if (Schema::hasTable('hire_purchases')) {
            Schema::table('hire_purchases', function (Blueprint $table) {
                $this->addIndexIfMissing($table, 'hire_purchases', ['user_id', 'status'], 'idx_hp_user_status');
                $this->addIndexIfMissing($table, 'hire_purchases', 'next_due_date',       'idx_hp_next_due');
            });
        }

        // ─── Pre Orders ───────────────────────────────────────────────────────
        if (Schema::hasTable('pre_orders')) {
            Schema::table('pre_orders', function (Blueprint $table) {
                $this->addIndexIfMissing($table, 'pre_orders', ['user_id', 'status'], 'idx_preorders_user_status');
                $this->addIndexIfMissing($table, 'pre_orders', 'expected_date',       'idx_preorders_expected_date');
            });
        }

        // ─── Raffle Tickets ───────────────────────────────────────────────────
        if (Schema::hasTable('raffle_tickets')) {
            Schema::table('raffle_tickets', function (Blueprint $table) {
                $this->addIndexIfMissing($table, 'raffle_tickets', ['raffle_id', 'user_id'], 'idx_raffle_tickets_raffle_user');
            });
        }

        // ─── Payments ─────────────────────────────────────────────────────────
        if (Schema::hasTable('payments')) {
            Schema::table('payments', function (Blueprint $table) {
                $this->addIndexIfMissing($table, 'payments', ['payable_type', 'payable_id'], 'idx_payments_payable');
                $this->addIndexIfMissing($table, 'payments', 'status',                       'idx_payments_status');
            });
        }
        // Note: reviews (product_id,status) and wishlist (user_id,product_id) unique
        // already exist from the original migration — no duplicates needed.
    }

    public function down(): void
    {
        $drops = [
            'products'       => ['idx_products_status_featured','idx_products_category_status','idx_products_store_status','idx_products_price','idx_products_views'],
            'orders'         => ['idx_orders_paid_at'],
            'layaway_cards'  => ['idx_layaway_cards_user_status','idx_layaway_cards_product'],
            'hire_purchases' => ['idx_hp_user_status','idx_hp_next_due'],
            'pre_orders'     => ['idx_preorders_user_status','idx_preorders_expected_date'],
            'raffle_tickets' => ['idx_raffle_tickets_raffle_user'],
            'payments'       => ['idx_payments_payable','idx_payments_status'],
        ];

        foreach ($drops as $tableName => $indexes) {
            if (!Schema::hasTable($tableName)) continue;
            $existing = $this->existingIndexes($tableName);
            Schema::table($tableName, function (Blueprint $table) use ($indexes, $existing) {
                foreach ($indexes as $idx) {
                    if (in_array($idx, $existing)) {
                        $table->dropIndex($idx);
                    }
                }
            });
        }

        if (Schema::hasTable('layaway_payments')) {
            $existing = $this->existingIndexes('layaway_payments');
            if (in_array('idx_layaway_payments_ref_unique', $existing)) {
                Schema::table('layaway_payments', fn(Blueprint $t) => $t->dropUnique('idx_layaway_payments_ref_unique'));
            }
        }
    }
};
