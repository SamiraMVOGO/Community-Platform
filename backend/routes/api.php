<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\NewsController;
use App\Http\Controllers\Api\StatisticController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\MunicipalityController;
use App\Http\Controllers\Api\NewsletterController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Newsletter routes
Route::post('/newsletter/subscribe', [NewsletterController::class, 'subscribe']);
Route::post('/newsletter/unsubscribe', [NewsletterController::class, 'unsubscribe']);

// Public profile and news routes
Route::get('/profiles', [ProfileController::class, 'index']);
Route::get('/profiles/{id}', [ProfileController::class, 'show']);
Route::get('/documents/{id}/download', [ProfileController::class, 'downloadDocument']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{id}', [CategoryController::class, 'show']);
Route::get('/news', [NewsController::class, 'index']);
Route::get('/news/{id}', [NewsController::class, 'show']);
Route::get('/municipalities/public', [MunicipalityController::class, 'publicIndex']);

// Public statistics
Route::get('/statistics/dashboard', [StatisticController::class, 'dashboard']);
Route::get('/statistics/by-category', [StatisticController::class, 'profilesByCategory']);
Route::get('/statistics/by-sector', [StatisticController::class, 'profilesBySector']);
Route::get('/statistics/by-education', [StatisticController::class, 'profilesByEducation']);
Route::get('/statistics/monthly-growth', [StatisticController::class, 'monthlyGrowth']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth routes
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::get('/auth/login-history', [AuthController::class, 'loginHistory']);
    Route::post('/auth/register-by-agent', [AuthController::class, 'registerByAgent']);

    // Profile routes
    Route::get('/profiles/me', [ProfileController::class, 'me']);
    Route::post('/profiles', [ProfileController::class, 'store']);
    Route::put('/profiles/{id}', [ProfileController::class, 'update']);

    // News routes
    Route::post('/news', [NewsController::class, 'store']);
    Route::put('/news/{id}', [NewsController::class, 'update']);
    Route::delete('/news/{id}', [NewsController::class, 'destroy']);

    // Admin routes
    Route::prefix('admin')->group(function () {
        Route::get('/profiles/pending', [AdminController::class, 'pendingProfiles']);
        Route::put('/profiles/{id}/approve', [AdminController::class, 'approveProfile']);
        Route::put('/profiles/{id}/reject', [AdminController::class, 'rejectProfile']);
        Route::get('/users', [AdminController::class, 'users']);
        Route::put('/users/{id}/toggle-status', [AdminController::class, 'toggleUserStatus']);
        Route::get('/activity-logs', [AdminController::class, 'activityLogs']);
        Route::get('/newsletter/subscribers', [NewsletterController::class, 'subscribers']);
        Route::get('/exports/users', [AdminController::class, 'exportUsersCsv']);
        Route::get('/exports/profiles', [AdminController::class, 'exportProfilesCsv']);
        Route::get('/exports/newsletter-subscribers', [NewsletterController::class, 'exportSubscribersCsv']);
    });

    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{id}', [CategoryController::class, 'update']);
    Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

    // Municipality routes (Super Admin only)
    Route::prefix('municipalities')->group(function () {
        Route::get('/', [MunicipalityController::class, 'index']);
        Route::post('/', [MunicipalityController::class, 'store']);
        Route::get('/{id}', [MunicipalityController::class, 'show']);
        Route::put('/{id}', [MunicipalityController::class, 'update']);
        Route::delete('/{id}', [MunicipalityController::class, 'destroy']);
        
        // Mayor management
        Route::post('/{id}/mayor', [MunicipalityController::class, 'createMayor']);
        Route::delete('/{id}/mayor', [MunicipalityController::class, 'removeMayor']);
        
        // Agent management
        Route::post('/{id}/agents', [MunicipalityController::class, 'createAgent']);
        Route::get('/{id}/agents', [MunicipalityController::class, 'getMunicipalityAgents']);
        Route::delete('/agents/{agentId}', [MunicipalityController::class, 'removeAgent']);
    });

    Route::get('/users-by-role', [MunicipalityController::class, 'getUsersByRole']);
});
