package me.surajkumarjha.lovable_backend.util;

import com.github.f4b6a3.uuid.UuidCreator;

public final class IdGenerator {

    private IdGenerator() {
    }

    public static String nextId() {
        return UuidCreator.getTimeOrderedEpoch().toString();
    }
}
