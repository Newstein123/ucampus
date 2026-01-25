@php
    $changes = $get('changes') ?? ($changes ?? []);
    $contentKey = $changes['content_key'] ?? null;
    $oldValue = $changes['old_value'] ?? null;
    $newValue = $changes['new_value'] ?? null;

    // Helper function to format values
    $formatValue = function($value) {
        if (is_null($value)) {
            return '<em class="text-gray-400">(empty)</em>';
        }
        if (is_array($value) || is_object($value)) {
            return '<pre class="text-xs bg-gray-50 p-2 rounded">' . htmlspecialchars(json_encode($value, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) . '</pre>';
        }
        if (is_string($value) && (strlen($value) > 200 || strpos($value, "\n") !== false)) {
            return '<pre class="text-xs bg-gray-50 p-2 rounded whitespace-pre-wrap">' . htmlspecialchars($value) . '</pre>';
        }
        return htmlspecialchars($value);
    };
@endphp

<div class="space-y-4">
    @if($contentKey)
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p class="text-sm font-semibold text-blue-900 mb-1">Field Being Changed:</p>
            <p class="text-sm text-blue-700 font-mono">{{ $contentKey }}</p>
        </div>
    @endif

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Old Value -->
        <div class="border border-gray-300 rounded-lg overflow-hidden">
            <div class="bg-red-50 border-b border-red-200 px-4 py-2">
                <h3 class="text-sm font-semibold text-red-900 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    Current Value
                </h3>
            </div>
            <div class="p-4 bg-white min-h-[150px] max-h-[400px] overflow-auto">
                <div class="prose prose-sm max-w-none">
                    {!! $formatValue($oldValue) !!}
                </div>
            </div>
        </div>

        <!-- New Value -->
        <div class="border border-gray-300 rounded-lg overflow-hidden">
            <div class="bg-green-50 border-b border-green-200 px-4 py-2">
                <h3 class="text-sm font-semibold text-green-900 flex items-center gap-2">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    Proposed Value
                </h3>
            </div>
            <div class="p-4 bg-white min-h-[150px] max-h-[400px] overflow-auto">
                <div class="prose prose-sm max-w-none">
                    {!! $formatValue($newValue) !!}
                </div>
            </div>
        </div>
    </div>

    @if(empty($contentKey) && empty($oldValue) && empty($newValue))
        <div class="text-center py-8 text-gray-500">
            <p>No changes data available</p>
        </div>
    @endif
</div>

