<?php

namespace App\Models;

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
        'daily_journal_id',
        'prayer_type',
        'prayer_time',
        'location_name',
        'status',
    ];

    /**
     * Get the daily journal that owns the prayer log.
     */
    public function dailyJournal(): BelongsTo
    {
        return $this->belongsTo(DailyJournal::class);
    }
}
