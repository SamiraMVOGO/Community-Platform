<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Newsletter;
use Illuminate\Http\Request;

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
}
