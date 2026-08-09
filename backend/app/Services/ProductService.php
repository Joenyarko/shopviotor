<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductImage;
use App\Repositories\ProductRepository;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
class ProductService
{
    public function __construct(private ProductRepository $productRepo) {}

    public function create(int $userId, array $data): Product
    {
        return DB::transaction(function () use ($userId, $data) {
            $data['user_id'] = $userId;
            $data['slug']    = $this->generateSlug($data['name']);

            $images = $data['images'] ?? [];
            unset($data['images']);

            if (!empty($data['store_id'])) {
                $store = \App\Models\Store::find($data['store_id']);
                if ($store) {
                    if (!$store->can_offer_layaway && !empty($data['available_for_layaway'])) {
                        $data['available_for_layaway'] = false;
                        $data['is_layaway'] = false;
                    }
                    if (!$store->can_offer_hire_purchase && !empty($data['available_for_hire_purchase'])) {
                        $data['available_for_hire_purchase'] = false;
                    }
                    if (!$store->can_offer_preorders && !empty($data['available_for_preorder'])) {
                        $data['available_for_preorder'] = false;
                    }
                    if (!$store->can_offer_trades && !empty($data['available_for_trade'])) {
                        $data['available_for_trade'] = false;
                    }
                }
            }

            $isLayawayOnly = !empty($data['is_layaway']);
            $isAvailableForLayaway = $isLayawayOnly || !empty($data['available_for_layaway']);
            $data['is_layaway'] = $isLayawayOnly;
            $data['available_for_layaway'] = $isAvailableForLayaway;
            $boxes = $data['layaway_total_boxes'] ?? $data['layaway_boxes'] ?? null;
            if (!$isAvailableForLayaway || empty($boxes)) {
                $data['layaway_boxes'] = null;
                $data['layaway_total_boxes'] = null;
                $data['layaway_box_price'] = null;
            } else {
                $data['layaway_boxes'] = (int) $boxes;
                $data['layaway_total_boxes'] = (int) $boxes;
                $price = $data['price'] ?? 0;
                $data['layaway_box_price'] = $boxes > 0 ? round((float)$price / (int)$boxes, 2) : null;
            }

            if (empty($data['available_for_preorder'])) {
                $data['preorder_deposit_amount'] = null;
                $data['preorder_expected_date'] = null;
            }

            $variations = $data['variations'] ?? [];
            unset($data['variations']);

            $product = $this->productRepo->create($data);

            if (!empty($images)) {
                $this->handleImages($product, $images);
            }

            if (!empty($variations)) {
                $this->handleVariations($product, $variations);
            }

            return $product->load(['category', 'brand', 'images', 'variations.options']);
        });
    }

    public function update(Product $product, array $data): Product
    {
        return DB::transaction(function () use ($product, $data) {
            if (isset($data['name']) && $data['name'] !== $product->name) {
                $data['slug'] = $this->generateSlug($data['name'], $product->id);
            }

            $images = $data['images'] ?? [];
            unset($data['images']);

            $existingImages = $data['existing_images'] ?? [];
            unset($data['existing_images']);

            // Delete images that are not in the existing_images array
            $imagesToDelete = $product->images()->whereNotIn('id', $existingImages)->get();
            $imagesToDelete->each(function ($image) {
                Storage::disk('public')->delete($image->path);
                $image->delete();
            });

            if ($product->store_id) {
                $store = \App\Models\Store::find($product->store_id);
                if ($store) {
                    if (!$store->can_offer_layaway && !empty($data['available_for_layaway'])) {
                        $data['available_for_layaway'] = false;
                        $data['is_layaway'] = false;
                    }
                    if (!$store->can_offer_hire_purchase && !empty($data['available_for_hire_purchase'])) {
                        $data['available_for_hire_purchase'] = false;
                    }
                    if (!$store->can_offer_preorders && !empty($data['available_for_preorder'])) {
                        $data['available_for_preorder'] = false;
                    }
                    if (!$store->can_offer_trades && !empty($data['available_for_trade'])) {
                        $data['available_for_trade'] = false;
                    }
                }
            }

            if (isset($data['is_layaway']) || isset($data['available_for_layaway']) || isset($data['layaway_total_boxes']) || isset($data['layaway_boxes'])) {
                if (isset($data['is_layaway'])) {
                    $data['is_layaway'] = !empty($data['is_layaway']);
                }
                if (isset($data['available_for_layaway'])) {
                    $data['available_for_layaway'] = !empty($data['available_for_layaway']);
                }
                if (!empty($data['is_layaway'])) {
                    $data['available_for_layaway'] = true;
                }
                $isLayawayEligible = !empty($data['is_layaway']) || !empty($data['available_for_layaway']) || ($product->is_layaway && !isset($data['is_layaway'])) || ($product->available_for_layaway && !isset($data['available_for_layaway']));
                $boxes = $data['layaway_total_boxes'] ?? $data['layaway_boxes'] ?? $product->layaway_total_boxes ?? $product->layaway_boxes ?? null;
                if (!$isLayawayEligible || empty($boxes)) {
                    $data['layaway_boxes'] = null;
                    $data['layaway_total_boxes'] = null;
                    $data['layaway_box_price'] = null;
                } else {
                    $data['layaway_boxes'] = (int) $boxes;
                    $data['layaway_total_boxes'] = (int) $boxes;
                    $price = $data['price'] ?? $product->price ?? 0;
                    $data['layaway_box_price'] = $boxes > 0 ? round((float)$price / (int)$boxes, 2) : null;
                }
            }

            if (isset($data['available_for_preorder'])) {
                if (!$data['available_for_preorder']) {
                    $data['preorder_deposit_amount'] = null;
                    $data['preorder_expected_date'] = null;
                }
            }

            $variations = $data['variations'] ?? null;
            if (array_key_exists('variations', $data)) {
                unset($data['variations']);
            }

            $product->update($data);

            if (!empty($images)) {
                $this->handleImages($product, $images);
            }

            if ($variations !== null) {
                // If variations were provided, replace existing ones
                $product->variations()->delete();
                $this->handleVariations($product, $variations);
            }

            return $product->fresh(['category', 'brand', 'images', 'variations.options']);
        });
    }

    private function handleVariations(Product $product, array $variations): void
    {
        foreach ($variations as $varData) {
            if (empty($varData['name']) || empty($varData['options'])) continue;
            
            $variation = $product->variations()->create([
                'name' => $varData['name'],
            ]);

            foreach ($varData['options'] as $optData) {
                if (empty($optData['value'])) continue;
                $variation->options()->create([
                    'value' => $optData['value'],
                    'price_delta' => $optData['price_delta'] ?? 0,
                ]);
            }
        }
    }

    public function delete(Product $product): void
    {
        // Delete associated images from storage
        $product->images->each(function ($image) {
            Storage::disk('public')->delete($image->path);
        });

        $product->images()->delete();
        $product->delete();
    }

    private function handleImages(Product $product, array $images): void
    {
        $hasPrimary = $product->images()->where('is_primary', true)->exists();

        foreach ($images as $index => $file) {
            if (!($file instanceof UploadedFile)) continue;

            // Validate MIME
            if (!in_array($file->getMimeType(), ['image/jpeg', 'image/png', 'image/webp'])) {
                continue;
            }

            $path = $this->storeImage($file, $product->id);

            $product->images()->create([
                'path'       => $path,
                'alt_text'   => $product->name,
                'is_primary' => !$hasPrimary && $index === 0,
                'sort_order' => $index,
            ]);

            if (!$hasPrimary && $index === 0) {
                $hasPrimary = true;
            }
        }
    }

    private function storeImage(UploadedFile $file, int $productId): string
    {
        $filename  = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $directory = "products/{$productId}";

        $path = $file->storeAs($directory, $filename, 'public');

        return $path;
    }

    private function generateSlug(string $name, ?int $ignoreId = null): string
    {
        $slug = Str::slug($name);
        $originalSlug = $slug;
        $count = 1;

        while (Product::withTrashed()->where('slug', $slug)->where('id', '!=', $ignoreId)->exists()) {
            $slug = "{$originalSlug}-{$count}";
            $count++;
        }

        return $slug;
    }
}
