<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>@yield('title', 'Shop Viotor')</title>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #111111; margin: 0; padding: 0; color: #f5f5f5; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #111111; padding-bottom: 40px; }
        .main { background-color: #1a1a1a; margin: 0 auto; width: 100%; max-width: 600px; border-spacing: 0; border-radius: 12px; overflow: hidden; margin-top: 40px; border: 1px solid #333333; }
        .header { background-color: #f5c000; padding: 30px; text-align: center; }
        .header img { max-width: 150px; height: auto; display: block; margin: 0 auto; }
        .content { padding: 40px 30px; line-height: 1.6; color: #eeeeee; }
        h1, h2, h3 { color: #f5c000; margin-top: 0; font-weight: 800; }
        p { margin: 0 0 16px 0; font-size: 16px; }
        .btn { display: inline-block; background-color: #f5c000; color: #1a1a1a; text-decoration: none; padding: 14px 28px; border-radius: 6px; font-weight: bold; font-size: 16px; margin: 20px 0; }
        .footer { background-color: #000000; padding: 20px 30px; text-align: center; font-size: 13px; color: #666666; }
        .footer a { color: #f5c000; text-decoration: none; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: #222222; border-radius: 8px; overflow: hidden; }
        .table th { background-color: #f5c000; color: #1a1a1a; padding: 14px; text-align: left; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
        .table td { padding: 14px; border-bottom: 1px solid #333333; font-size: 15px; color: #dddddd; }
        .table .total-row td { font-weight: bold; border-top: 2px solid #555555; border-bottom: none; color: #f5c000; font-size: 18px; }
        .highlight-box { background-color: #222222; border-left: 4px solid #f5c000; padding: 20px; margin-bottom: 20px; border-radius: 0 8px 8px 0; text-align: center;}
        .code { font-size: 32px; font-weight: 900; letter-spacing: 4px; color: #f5c000; display: block; margin: 10px 0; }
    </style>
</head>
<body>
    <center class="wrapper">
        <table class="main" width="100%">
            <tr>
                <td class="header">
                    <a href="{{ config('app.frontend_url') }}">
                        <img src="{{ config('app.frontend_url') }}/shopviotorlogo2.png" alt="Shop Viotor Logo">
                    </a>
                </td>
            </tr>
            <tr>
                <td class="content">
                    @yield('content')
                </td>
            </tr>
            <tr>
                <td class="footer">
                    <p>&copy; {{ date('Y') }} Shop Viotor. All rights reserved.</p>
                    <p>Accra Technical University, Ghana</p>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>