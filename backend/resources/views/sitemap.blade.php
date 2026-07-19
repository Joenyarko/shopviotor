<?php echo '<?xml version="1.0" encoding="UTF-8"?>'; ?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    {{-- Static Pages --}}
    @foreach($staticPages as $page)
    <url>
        <loc>{{ $page['loc'] }}</loc>
        <priority>{{ $page['priority'] }}</priority>
        <changefreq>{{ $page['changefreq'] }}</changefreq>
        <lastmod>{{ now()->toAtomString() }}</lastmod>
    </url>
    @endforeach

    {{-- Category Pages --}}
    @foreach($categories as $category)
    <url>
        <loc>{{ $baseUrl }}/products?category={{ $category->slug }}</loc>
        <priority>0.7</priority>
        <changefreq>weekly</changefreq>
        <lastmod>{{ $category->updated_at->toAtomString() }}</lastmod>
    </url>
    @endforeach

    {{-- Product Pages --}}
    @foreach($products as $product)
    <url>
        <loc>{{ $baseUrl }}/products/{{ $product->uuid }}</loc>
        <priority>0.8</priority>
        <changefreq>weekly</changefreq>
        <lastmod>{{ $product->updated_at->toAtomString() }}</lastmod>
    </url>
    @endforeach
</urlset>
