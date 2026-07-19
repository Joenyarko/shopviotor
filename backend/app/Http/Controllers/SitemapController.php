<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Response;

class SitemapController extends Controller
{
    public function index(): Response
    {
        $baseUrl = config('app.frontend_url', 'https://shopviotor.com');

        $staticPages = [
            ['loc' => $baseUrl, 'priority' => '1.0', 'changefreq' => 'daily'],
            ['loc' => $baseUrl . '/products', 'priority' => '0.9', 'changefreq' => 'daily'],
            ['loc' => $baseUrl . '/categories', 'priority' => '0.8', 'changefreq' => 'weekly'],
            ['loc' => $baseUrl . '/about', 'priority' => '0.5', 'changefreq' => 'monthly'],
            ['loc' => $baseUrl . '/contact', 'priority' => '0.5', 'changefreq' => 'monthly'],
            ['loc' => $baseUrl . '/faq', 'priority' => '0.4', 'changefreq' => 'monthly'],
            ['loc' => $baseUrl . '/privacy', 'priority' => '0.3', 'changefreq' => 'yearly'],
            ['loc' => $baseUrl . '/terms', 'priority' => '0.3', 'changefreq' => 'yearly'],
        ];

        $products = Product::where('status', 'active')
            ->select(['uuid', 'updated_at'])
            ->latest('updated_at')
            ->limit(5000)
            ->get();

        $categories = Category::where('is_active', true)
            ->select(['slug', 'updated_at'])
            ->get();

        $xml = view('sitemap', compact('staticPages', 'products', 'categories', 'baseUrl'))->render();

        return response($xml, 200, [
            'Content-Type' => 'application/xml',
            'Cache-Control' => 'public, max-age=86400',
        ]);
    }
}
