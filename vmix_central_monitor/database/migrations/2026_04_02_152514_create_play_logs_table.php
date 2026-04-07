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
        Schema::create('play_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('device_id')->index();
            $table->integer('input_number');
            $table->string('input_name');
            $table->string('input_type')->nullable();
            $table->timestamp('played_at');
            $table->integer('duration_ms');
            $table->integer('position_ms')->nullable();
            $table->string('screenshot_path')->nullable();
            $table->string('source')->nullable();
            $table->timestamps();

            $table->foreign('device_id')->references('id')->on('devices')->onDelete('cascade');
            $table->unique(['device_id', 'played_at', 'input_number'], 'play_logs_unique_constraint');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('play_logs');
    }
};
