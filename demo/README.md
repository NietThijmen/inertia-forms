# Sign-in demo

A one-screen Laravel, Inertia, and Svelte app that renders `SignInForm` with `@nietthijmen/inertia-forms`.

The form has email and password fields. `POST /sign-in` runs `SignInForm::validate()`. Unknown credentials fail with “These credentials do not match our records.” The demo account `ada@example.com` / `password` redirects back with a success flash. There is no user database.

Requires PHP 8.3+, Composer, and Node.js 22+.

## Install and run

From this directory:

```bash
composer install
cp .env.example .env
php artisan key:generate
npm install
npm run build
php artisan serve
```

Open `http://127.0.0.1:8000`. Do not run migrations. Session, cache, and the queue use local files.

For frontend hot reload, run `npm run dev` in a second terminal and keep `php artisan serve` running.
