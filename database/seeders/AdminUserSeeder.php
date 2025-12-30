<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Administrador',
            'email' => 'georgie.a.reis@gmail.com',
            'password' => Hash::make('Enghaw1986**'),
            'is_admin' => true,
            'is_active' => true,
        ]);
    }
}
