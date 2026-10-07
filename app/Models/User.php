<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements PasskeyUser
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'slug',
        'nickname',
        'email',
        'password',
        'role',
        'nis_nip',
        'company_id',
        'mentor_teacher_id',
        'phone',
        'avatar',
    ];

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::saving(function (User $user) {
            if (empty($user->slug) && !empty($user->name)) {
                $baseSlug = \Illuminate\Support\Str::slug($user->name);
                $slug = $baseSlug;
                $counter = 1;
                while (static::where('slug', $slug)->where('id', '!=', $user->id ?? 0)->exists()) {
                    $slug = $baseSlug . '-' . ($user->nis_nip ? \Illuminate\Support\Str::slug($user->nis_nip) : $counter);
                    $counter++;
                }
                $user->slug = $slug;
            }
        });
    }

    /**
     * The accessors to append to the model's array form.
     *
     * @var list<string>
     */
    protected $appends = [
        'phone_number',
        'avatar_url',
    ];

    /**
     * Get avatar_url accessor.
     */
    public function getAvatarUrlAttribute(): ?string
    {
        return $this->avatar ? asset('storage/' . $this->avatar) : null;
    }

    /**
     * Get phone_number accessor alias for phone.
     */
    public function getPhoneNumberAttribute(): ?string
    {
        return $this->attributes['phone'] ?? null;
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    /**
     * Get the company where the user is assigned.
     */
    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    /**
     * Get the mentor teacher assigned to this student.
     */
    public function mentorTeacher(): BelongsTo
    {
        return $this->belongsTo(User::class, 'mentor_teacher_id');
    }

    /**
     * Get the students guided by this teacher.
     */
    public function guidedStudents(): HasMany
    {
        return $this->hasMany(User::class, 'mentor_teacher_id');
    }

    /**
     * Alias for guidedStudents.
     */
    public function mentoredStudents(): HasMany
    {
        return $this->hasMany(User::class, 'mentor_teacher_id');
    }

    /**
     * Get the attendances for the user.
     */
    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class);
    }

    /**
     * Get the daily journals for the user.
     */
    public function dailyJournals(): HasMany
    {
        return $this->hasMany(DailyJournal::class);
    }

    /**
     * Get the prayer logs for the user.
     */
    public function prayerLogs(): HasMany
    {
        return $this->hasMany(PrayerLog::class);
    }
}
