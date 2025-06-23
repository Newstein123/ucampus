<?php

namespace App\Http\Controllers;

abstract class Controller
{
    protected function response($data, $message = null)
    {
        return response()->json([
            'data' => $data,
            'message' => $message,
        ], 200, [], JSON_UNESCAPED_UNICODE);
    }
}
