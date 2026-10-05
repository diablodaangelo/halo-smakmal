<?php

namespace App\Services;

class GeofenceService
{
    /**
     * Earth's mean radius in meters.
     */
    private const EARTH_RADIUS_METERS = 6371000;

    /**
     * Calculate distance between two GPS coordinates using the Haversine Formula.
     *
     * @param  float  $userLat
     * @param  float  $userLong
     * @param  float  $companyLat
     * @param  float  $companyLong
     * @return float Distance in meters
     */
    public static function calculateDistance(
        float $userLat,
        float $userLong,
        float $companyLat,
        float $companyLong
    ): float {
        $latFrom = deg2rad($userLat);
        $lonFrom = deg2rad($userLong);
        $latTo = deg2rad($companyLat);
        $lonTo = deg2rad($companyLong);

        $latDelta = $latTo - $latFrom;
        $lonDelta = $lonTo - $lonFrom;

        $a = sin($latDelta / 2) * sin($latDelta / 2) +
            cos($latFrom) * cos($latTo) *
            sin($lonDelta / 2) * sin($lonDelta / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return self::EARTH_RADIUS_METERS * $c;
    }
}
