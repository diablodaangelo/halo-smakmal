<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PrayerLog extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'daily_journal_id',
        'date',
        'prayer_type',
        'prayer_time',
        'location_name',
        'status',
    ];

    protected $appends = [
        'prayer_name',
    ];

    protected function prayerName(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->attributes['prayer_type'] ?? null,
            set: fn ($value) => ['prayer_type' => $value],
        );
    }

    /**
     * Get the student user that owns the prayer log.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the daily journal that owns the prayer log.
     */
    public function dailyJournal(): BelongsTo
    {
        return $this->belongsTo(DailyJournal::class);
    }
}
