<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Attendance extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'user_id',
        'company_id',
        'date',
        'check_in_time',
        'check_out_time',
        'check_in_lat',
        'check_in_long',
        'check_out_lat',
        'check_out_long',
        'selfie_path',
        'status',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'date' => 'date',
            'check_in_lat' => 'decimal:8',
            'check_in_long' => 'decimal:8',
            'check_out_lat' => 'decimal:8',
            'check_out_long' => 'decimal:8',
        ];
    }

    /**
     * Get the user that owns the attendance record.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the company associated with the attendance record.
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Get the daily journal linked to this attendance.
     */
    public function dailyJournal(): HasOne
    {
        return $this->hasOne(DailyJournal::class);
    }
}
