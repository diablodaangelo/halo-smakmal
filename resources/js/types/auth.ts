export type User = {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'guru_pembimbing' | 'pembimbing_dudi' | 'siswa';
    nis_nip?: string | null;
    phone_number?: string | null;
    company_id?: number | null;
    mentor_teacher_id?: number | null;
    company?: {
        id: number;
        name: string;
        address: string;
        latitude: number;
        longitude: number;
        radius_meters: number;
        check_in_start: string;
        check_in_end: string;
        check_out_start: string;
    } | null;
    mentor_teacher?: {
        id: number;
        name: string;
        nis_nip?: string | null;
        email?: string;
    } | null;
    avatar?: string;
    email_verified_at: string | null;
    two_factor_enabled?: boolean;
    created_at: string;
    updated_at: string;
    [key: string]: unknown;
};

export type Auth = {
    user: User;
};

export type Passkey = {
    id: number;
    name: string;
    authenticator: string | null;
    created_at_diff: string;
    last_used_at_diff: string | null;
};

export type TwoFactorSetupData = {
    svg: string;
    url: string;
};

export type TwoFactorSecretKey = {
    secretKey: string;
};
