<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>403 - Akses Ditolak | Halo Smakmal</title>
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: 'Instrument Sans', sans-serif;
            background: linear-gradient(135deg, #07381d 0%, #0c4e28 50%, #126b38 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1.5rem;
            color: #1f2937;
        }
        .card {
            background: #ffffff;
            border-radius: 2rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
            max-width: 32rem;
            width: 100%;
            padding: 2.5rem 2rem;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        .card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 10rem;
            height: 4px;
            background: linear-gradient(90deg, transparent, #10b981, transparent);
        }
        .icon-box {
            width: 5rem;
            height: 5rem;
            border-radius: 1.5rem;
            background: #fef3c7;
            border: 1px solid #fde68a;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1.25rem;
            position: relative;
        }
        .icon-box svg {
            width: 2.5rem;
            height: 2.5rem;
            stroke: #d97706;
        }
        .badge {
            position: absolute;
            bottom: -0.5rem;
            right: -0.5rem;
            background: #111827;
            color: #ffffff;
            font-size: 0.75rem;
            font-weight: 800;
            padding: 0.2rem 0.6rem;
            border-radius: 9999px;
            font-family: monospace;
        }
        h1 {
            font-size: 1.65rem;
            font-weight: 800;
            color: #111827;
            letter-spacing: -0.02em;
        }
        p {
            margin-top: 0.75rem;
            font-size: 0.875rem;
            color: #4b5563;
            line-height: 1.5;
        }
        .user-box {
            margin-top: 1.5rem;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 1rem;
            padding: 0.85rem 1rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            text-align: left;
        }
        .user-name {
            font-weight: 700;
            font-size: 0.875rem;
            color: #111827;
        }
        .user-role {
            background: #d1fae5;
            color: #065f46;
            border: 1px solid #a7f3d0;
            font-size: 0.75rem;
            font-weight: 700;
            padding: 0.25rem 0.65rem;
            border-radius: 9999px;
            text-transform: capitalize;
        }
        .btn-group {
            margin-top: 2rem;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }
        @media (min-width: 640px) {
            .btn-group {
                flex-direction: row;
                justify-content: center;
            }
        }
        .btn-primary {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            background: #008953;
            color: #ffffff;
            text-decoration: none;
            font-weight: 700;
            font-size: 0.875rem;
            padding: 0.75rem 1.5rem;
            border-radius: 0.85rem;
            box-shadow: 0 4px 10px rgba(0, 137, 83, 0.25);
            transition: all 0.2s;
        }
        .btn-primary:hover {
            background: #007346;
        }
        .btn-secondary {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            background: transparent;
            color: #374151;
            text-decoration: none;
            font-weight: 600;
            font-size: 0.875rem;
            padding: 0.75rem 1.25rem;
            border-radius: 0.85rem;
            border: 1px solid #d1d5db;
            cursor: pointer;
            transition: all 0.2s;
        }
        .btn-secondary:hover {
            background: #f3f4f6;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon-box">
            <svg fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
            </svg>
            <span class="badge">403</span>
        </div>

        <h1>Akses Ditolak</h1>
        <p>{{ $exception->getMessage() ?: 'Maaf, akun Anda tidak memiliki izin untuk mengakses halaman ini. Silakan kembali ke dashboard yang sesuai.' }}</p>

        @auth
            <div class="user-box">
                <div>
                    <div class="user-name">{{ auth()->user()->nickname ?: auth()->user()->name }}</div>
                    <div style="font-size: 0.75rem; color: #6b7280; font-family: monospace;">{{ auth()->user()->email }}</div>
                </div>
                <div class="user-role">{{ str_replace('_', ' ', auth()->user()->role) }}</div>
            </div>
        @endauth

        <div class="btn-group">
            <a href="{{ route('dashboard') }}" class="btn-primary">
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                </svg>
                Kembali ke Dashboard
            </a>
            <button onclick="window.history.back()" class="btn-secondary">
                &larr; Halaman Sebelumnya
            </button>
        </div>
    </div>
</body>
</html>
