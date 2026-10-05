<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDailyJournalRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'work_summary' => ['sometimes', 'required', 'string', 'min:20'],
            'obstacles' => ['nullable', 'string'],
            'work_photo' => ['nullable', 'image', 'mimes:jpeg,png,jpg', 'max:3072'],
            'prayers' => ['sometimes', 'required', 'array', 'size:2'],
            'prayers.*.prayer_type' => ['required_with:prayers', 'in:dzuhur,ashar'],
            'prayers.*.status' => ['required_with:prayers', 'in:berjamaah,munfarid,udzur'],
            'prayers.*.prayer_time' => ['required_unless:prayers.*.status,udzur', 'nullable', 'date_format:H:i'],
            'prayers.*.location_name' => ['required_unless:prayers.*.status,udzur', 'nullable', 'string', 'max:255'],
        ];
    }
}
