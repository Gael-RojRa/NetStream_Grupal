<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class TVDBController extends Controller
{
    // Este método solo devuelve el string del token
    private function getTokenValue()
    {
        if (Cache::has('tvdb_token')) {
            return Cache::get('tvdb_token');
        }

        $response = Http::withHeaders([
            'accept' => 'application/json',
            'Content-Type' => 'application/json',
        ])->post('https://api4.thetvdb.com/v4/login', [
            'apikey' => config('services.tvdb.api_key'),
            'pin' => config('services.tvdb.pin'),
        ]);

        $json = $response->json();

        if (!isset($json['data']['token'])) {
            return null;
        }

        $token = $json['data']['token'];
        Cache::put('tvdb_token', $token, now()->addHours(23));
        return $token;
    }

    // Si quieres exponer el token por API
    public function getToken()
    {
        $token = $this->getTokenValue();
        if (!$token) {
            return response()->json([
                'error' => 'No se pudo obtener el token de TVDB',
            ], 500);
        }
        return response()->json(['token' => $token]);
    }

    public function getMovies(Request $request)
    {
        $page = $request->query('page', 1); // Obtiene el parámetro 'page', por defecto 1

        $token = $this->getTokenValue();
        if (!$token) {
            return response()->json(['error' => 'No se pudo obtener el token de TVDB'], 500);
        }

        $response = Http::withToken($token)
            ->get('https://api4.thetvdb.com/v4/movies', [
                'page' => $page,
            ]);

        return response()->json($response->json());
    }

    public function getImage(Request $request)
    {
        $path = $request->query('path');
        if (!$path) {
            return response()->json(['error' => 'Falta el parámetro path'], 400);
        }

        $response = Http::get('https://artworks.thetvdb.com' . $path);

        if ($response->successful()) {
            return response($response->body(), 200)
                ->header('Content-Type', $response->header('Content-Type'));
        }

        return response()->json(['error' => 'No se pudo obtener la imagen'], 500);
    }
}
