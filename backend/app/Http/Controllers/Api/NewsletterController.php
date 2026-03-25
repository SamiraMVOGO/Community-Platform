<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Newsletter;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class NewsletterController extends Controller
{
    public function subscribe(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|string|email|unique:newsletters',
        ]);

        $newsletter = Newsletter::create([
            'email' => $validated['email'],
            'subscribed_at' => now(),
            'is_active' => true,
        ]);

        return response()->json(['message' => 'Subscribed successfully'], 201);
    }

    public function unsubscribe(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
        ]);

        Newsletter::where('email', $request->email)->delete();

        return response()->json(['message' => 'Unsubscribed successfully']);
    }

    public function subscribers(Request $request)
    {
        $this->authorizeNewsletterAdmin($request);

        $query = Newsletter::query()->latest('subscribed_at');

        if ($request->query('is_active') !== null) {
            $query->where('is_active', filter_var($request->query('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        return response()->json($query->paginate((int) $request->query('per_page', 20)));
    }

    public function exportSubscribersCsv(Request $request): StreamedResponse
    {
        $this->authorizeNewsletterAdmin($request);

        $subscribers = Newsletter::query()->latest('subscribed_at')->get();

        return response()->streamDownload(function () use ($subscribers) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['id', 'email', 'is_active', 'subscribed_at', 'created_at']);

            foreach ($subscribers as $subscriber) {
                fputcsv($handle, [
                    $subscriber->id,
                    $subscriber->email,
                    $subscriber->is_active ? 'yes' : 'no',
                    optional($subscriber->subscribed_at)->toDateTimeString(),
                    optional($subscriber->created_at)->toDateTimeString(),
                ]);
            }

            fclose($handle);
        }, 'newsletter_subscribers_export.csv', ['Content-Type' => 'text/csv']);
    }

    private function authorizeNewsletterAdmin(Request $request): void
    {
        $role = $request->user()?->role;

        if (!in_array($role, ['super_admin', 'admin', 'mayor', 'agent_municipal'])) {
            abort(403, 'Unauthorized');
        }
    }
}
