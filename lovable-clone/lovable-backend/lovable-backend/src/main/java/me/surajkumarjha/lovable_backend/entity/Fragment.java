package me.surajkumarjha.lovable_backend.entity;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import me.surajkumarjha.lovable_backend.util.IdGenerator;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "fragments")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Fragment extends AuditableEntity {

    @Id
    @Column(length = 36)
    private String id;

    @Column(name = "message_id", nullable = false, unique = true, insertable = false, updatable = false)
    private String messageId;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "message_id", nullable = false, unique = true)
    private Message message;

    @Column(name = "sandbox_url", nullable = false, length = 2048)
    private String sandboxUrl;

    @Column(nullable = false)
    private String title;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(nullable = false, columnDefinition = "jsonb")
    @Builder.Default
    private JsonNode files = JsonNodeFactory.instance.objectNode();

    @PrePersist
    void assignId() {
        if (id == null) {
            id = IdGenerator.nextId();
        }
    }
}
