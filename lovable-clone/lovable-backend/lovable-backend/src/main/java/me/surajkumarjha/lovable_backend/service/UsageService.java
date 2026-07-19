package me.surajkumarjha.lovable_backend.service;

import lombok.RequiredArgsConstructor;
import me.surajkumarjha.lovable_backend.dto.request.UpsertUsageRequest;
import me.surajkumarjha.lovable_backend.dto.response.UsageResponse;
import me.surajkumarjha.lovable_backend.entity.Usage;
import me.surajkumarjha.lovable_backend.exception.ResourceNotFoundException;
import me.surajkumarjha.lovable_backend.repository.UsageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UsageService {

    private final UsageRepository usageRepository;

    @Transactional(readOnly = true)
    public UsageResponse getUsage(String key) {
        Usage usage = usageRepository.findById(key)
                .orElseThrow(() -> new ResourceNotFoundException("Usage record not found"));
        return UsageResponse.from(usage);
    }

    @Transactional
    public UsageResponse upsertUsage(UpsertUsageRequest request) {
        Usage usage = usageRepository.findById(request.key())
                .map(existing -> {
                    existing.setPoints(request.points());
                    existing.setExpire(request.expire());
                    return existing;
                })
                .orElseGet(() -> Usage.builder()
                        .key(request.key())
                        .points(request.points())
                        .expire(request.expire())
                        .build());

        return UsageResponse.from(usageRepository.save(usage));
    }
}
