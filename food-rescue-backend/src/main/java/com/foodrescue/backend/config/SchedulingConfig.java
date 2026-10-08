package com.foodrescue.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Turns on @Scheduled jobs (used by the donation expiry job).
 */
@Configuration
@EnableScheduling
public class SchedulingConfig {
}