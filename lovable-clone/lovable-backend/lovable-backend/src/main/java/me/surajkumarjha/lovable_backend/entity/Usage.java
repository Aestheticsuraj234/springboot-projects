package me.surajkumarjha.lovable_backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "usage_records")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Usage {

    @Id
    @Column(name = "key")
    private String key;

    @Column(nullable = false)
    private Integer points;

    private Instant expire;
}
