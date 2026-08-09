<?php

namespace App\Traits;

use App\Models\ActivityLog;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

trait LogsActivity
{
    public static function bootLogsActivity(): void
    {
        static::created(function ($model) {
            $model->logActivity('created', null, $model->toArray());
        });

        static::updated(function ($model) {
            $model->logActivity('updated', $model->getOriginal(), $model->getChanges());
        });

        static::deleted(function ($model) {
            $model->logActivity('deleted', $model->toArray(), null);
        });

        if (method_exists(static::class, 'restored')) {
            static::restored(function ($model) {
                $model->logActivity('restored', null, $model->toArray());
            });
        }
    }

    protected function logActivity(string $action, ?array $oldValues, ?array $newValues): void
    {
        ActivityLog::create([
            'user_id'      => Auth::id(),
            'action'       => $action,
            'subject_type' => get_class($this),
            'subject_id'   => $this->getKey(),
            'description'  => class_basename($this) . ' ' . $action,
            'old_values'   => $oldValues,
            'new_values'   => $newValues,
            'ip_address'   => Request::ip(),
            'user_agent'   => Request::userAgent(),
        ]);
    }
}
