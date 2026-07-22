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

            if (empty($data['is_layaway']) || empty($data['layaway_boxes'])) {
                $data['is_layaway'] = false;
                $data['layaway_boxes'] = null;
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
                $data['slug'] = $this->generateSlug($data['name']);
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

            if (isset($data['is_layaway'])) {
                if (!$data['is_layaway'] || empty($data['layaway_boxes'])) {
                    $data['layaway_boxes'] = null;
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

    private function generateSlug(string $name): string
    {
        $slug = Str::slug($name);
        $count = Product::where('slug', 'like', "{$slug}%")->count();
        return $count ? "{$slug}-{$count}" : $slug;
    }
}
