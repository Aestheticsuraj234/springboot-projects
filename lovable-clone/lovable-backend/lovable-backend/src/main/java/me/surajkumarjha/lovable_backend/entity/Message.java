package me.surajkumarjha.lovable_backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import me.surajkumarjha.lovable_backend.enums.MessageRole;
import me.surajkumarjha.lovable_backend.enums.MessageType;
import me.surajkumarjha.lovable_backend.util.IdGenerator;

@Entity
@Table(name = "messages")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Message extends AuditableEntity {

    @Id
    @Column(length = 36)
    private String id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MessageRole role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MessageType type;

    @Column(name = "project_id", nullable = false, insertable = false, updatable = false)
    private String projectId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @OneToOne(mappedBy = "message", fetch = FetchType.LAZY)
    private Fragment fragment;

    @PrePersist
    void assignId() {
        if (id == null) {
            id = IdGenerator.nextId();
        }
    }
}
