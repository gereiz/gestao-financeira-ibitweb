<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->boolean('is_recurring')->default(false)->after('is_active');
            $table->string('mercadopago_plan_id')->nullable()->after('is_recurring');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('mercadopago_subscription_id')->nullable()->after('plan_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn(['is_recurring', 'mercadopago_plan_id']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('mercadopago_subscription_id');
        });
    }
};
