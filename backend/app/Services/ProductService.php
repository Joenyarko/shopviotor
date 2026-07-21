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

            if (!empty($data['available_for_layaway']) && !empty($data['layaway_total_boxes'])) {
                $data['layaway_box_price'] = $data['price'] / $data['layaway_total_boxes'];
            } else {
                $data['layaway_box_price'] = null;
                $data['layaway_total_boxes'] = null;
            }

            if (empty($data['available_for_preorder'])) {
                $data['preorder_deposit_amount'] = null;
                $data['preorder_expected_date'] = null;
            }

            $product = $this->productRepo->create($data);

            if (!empty($images)) {
                $this->handleImages($product, $images);
            }

            return $product->load(['category', 'brand', 'images']);
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

            if (isset($data['available_for_layaway'])) {
                if ($data['available_for_layaway'] && !empty($data['layaway_total_boxes'])) {
                    $price = $data['price'] ?? $product->price;
                    $data['layaway_box_price'] = $price / $data['layaway_total_boxes'];
                } else {
                    $data['layaway_box_price'] = null;
                    $data['layaway_total_boxes'] = null;
                }
            }

            if (isset($data['available_for_preorder'])) {
                if (!$data['available_for_preorder']) {
                    $data['preorder_deposit_amount'] = null;
                    $data['preorder_expected_date'] = null;
                }
            }

            $product->update($data);

            if (!empty($images)) {
                $this->handleImages($product, $images);
            }

            return $product->fresh(['category', 'brand', 'images']);
        });
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
